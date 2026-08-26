import { supabaseServer } from "../../../../lib/supabase/server";
import { resolveRange, percentChange } from "../dateRange";
import { RangePicker } from "../RangePicker";
import { KpiCard } from "../KpiCard";
import { CaptureAdsSyncButton } from "../CaptureAdsSyncButton";
import { PaidTrendChart } from "../charts/PaidTrendChart";
import { CampaignComparisonChart } from "../charts/CampaignComparisonChart";
import { SpendToLeadsChart } from "../charts/SpendToLeadsChart";
import { paidTotals, paidDailySeries, campaignPerformance, adPerformance } from "../data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(n: number | undefined): string {
  return n === undefined ? "—" : n.toLocaleString("en-IN");
}
function fmtCurrency(n: number | undefined): string {
  return n === undefined ? "—" : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default async function PaidAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const supabase = await supabaseServer();

  const adAccountConfigured = !!(process.env.META_AD_ACCOUNT_ID && process.env.META_PAGE_ACCESS_TOKEN);
  const { data: metaAccount } = await supabase.from("ad_accounts").select("id, name").eq("platform", "meta").maybeSingle();

  const [totals, totalsPrev, daily, campaigns, ads] = await Promise.all([
    paidTotals(supabase, range.start, range.end),
    paidTotals(supabase, range.prevStart, range.prevEnd),
    paidDailySeries(supabase, range.start, range.end),
    campaignPerformance(supabase, range.start, range.end),
    adPerformance(supabase, range.start, range.end),
  ]);

  const ctr = totals.impressions ? Number(((totals.clicks ?? 0) / totals.impressions * 100).toFixed(2)) : undefined;
  const cpc = totals.clicks ? Number(((totals.spend ?? 0) / totals.clicks).toFixed(2)) : undefined;
  const cpm = totals.impressions ? Number((((totals.spend ?? 0) / totals.impressions) * 1000).toFixed(2)) : undefined;
  const cpl = totals.leads ? Number(((totals.spend ?? 0) / totals.leads).toFixed(2)) : undefined;

  const best = campaigns.length ? [...campaigns].sort((a, b) => (a.costPerLead ?? Infinity) - (b.costPerLead ?? Infinity))[0] : null;
  const worst = campaigns.length ? [...campaigns].sort((a, b) => (b.costPerLead ?? -1) - (a.costPerLead ?? -1))[0] : null;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Paid Ads</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            Meta Ads and Google Ads, in one platform-neutral model — monitoring only, no campaign creation here.
          </p>
        </div>
        <CaptureAdsSyncButton />
      </div>

      <RangePicker basePath="/admin/marketing/paid" active={range} />

      {!adAccountConfigured ? (
        <div className="panel">
          <h2>Meta Ads</h2>
          <p className="note">
            Not connected — <code>META_AD_ACCOUNT_ID</code> isn&apos;t set. The current token also does not have the{" "}
            <code>ads_read</code> permission (confirmed via Graph API Explorer&apos;s Access Token Debugger) — both are
            needed before this can pull real data. No API calls are attempted until then.
          </p>
        </div>
      ) : !metaAccount ? (
        <div className="panel">
          <h2>Meta Ads</h2>
          <p className="note">
            Configured, but never successfully synced yet. Click &ldquo;Sync Meta Ads now&rdquo; above — if the token
            is still missing <code>ads_read</code>, the exact error Meta returns will show there.
          </p>
        </div>
      ) : null}

      <div className="stat-grid">
        <KpiCard label="Spend" value={fmtCurrency(totals.spend)} deltaPct={percentChange(totals.spend, totalsPrev.spend)} />
        <KpiCard label="Reach" value={fmt(totals.reach)} deltaPct={percentChange(totals.reach, totalsPrev.reach)} />
        <KpiCard label="Impressions" value={fmt(totals.impressions)} deltaPct={percentChange(totals.impressions, totalsPrev.impressions)} />
        <KpiCard label="Clicks" value={fmt(totals.clicks)} deltaPct={percentChange(totals.clicks, totalsPrev.clicks)} />
        <KpiCard label="CTR" value={ctr !== undefined ? `${ctr}%` : "—"} />
        <KpiCard label="CPC" value={fmtCurrency(cpc)} />
        <KpiCard label="CPM" value={fmtCurrency(cpm)} />
        <KpiCard label="Leads" value={fmt(totals.leads)} deltaPct={percentChange(totals.leads, totalsPrev.leads)} />
        <KpiCard label="Cost per lead" value={fmtCurrency(cpl)} />
      </div>

      <div className="panel">
        <h2>Spend over time</h2>
        <PaidTrendChart data={daily} dataKey="spend" label="Spend" valueFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="panel">
          <h2>Impressions</h2>
          <PaidTrendChart data={daily} dataKey="impressions" label="Impressions" color="var(--mint)" />
        </div>
        <div className="panel">
          <h2>Clicks</h2>
          <PaidTrendChart data={daily} dataKey="clicks" label="Clicks" color="#d6c37a" />
        </div>
      </div>

      <div className="panel">
        <h2>Spend → leads → cost per lead</h2>
        <SpendToLeadsChart data={daily} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="panel">
          <h2>Campaign comparison (spend)</h2>
          <CampaignComparisonChart campaigns={campaigns} />
        </div>
        <div className="panel">
          <h2>Best / worst by cost per lead</h2>
          {best && worst ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span className="badge badge--won">Best</span>
                <p style={{ margin: "6px 0 0", fontSize: 14 }}>{best.name}</p>
                <p className="note">{best.costPerLead !== null ? `₹${best.costPerLead}/lead` : "No leads yet"}</p>
              </div>
              <div>
                <span className="badge badge--lost">Worst</span>
                <p style={{ margin: "6px 0 0", fontSize: 14 }}>{worst.name}</p>
                <p className="note">{worst.costPerLead !== null ? `₹${worst.costPerLead}/lead` : "No leads yet"}</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">No campaigns with spend in this period yet.</div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Campaign performance</h2>
        {campaigns.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr><th>Campaign</th><th>Spend</th><th>Reach</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CPC</th><th>Leads</th><th>Cost/lead</th></tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}{c.status && <div className="note" style={{ textTransform: "capitalize" }}>{c.status.toLowerCase()}</div>}</td>
                  <td>₹{c.spend.toLocaleString("en-IN")}</td>
                  <td>{c.reach.toLocaleString("en-IN")}</td>
                  <td>{c.impressions.toLocaleString("en-IN")}</td>
                  <td>{c.clicks.toLocaleString("en-IN")}</td>
                  <td>{c.ctr !== null ? `${c.ctr}%` : "—"}</td>
                  <td>{c.cpc !== null ? `₹${c.cpc}` : "—"}</td>
                  <td>{c.leads}</td>
                  <td>{c.costPerLead !== null ? `₹${c.costPerLead}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No campaign performance data for this period yet.</div>
        )}
      </div>

      <div className="panel">
        <h2>Ad performance</h2>
        {ads.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ads.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 6, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--line)", flex: "none" }}>
                  {a.creativePreviewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.creativePreviewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                  <p className="note">Spend ₹{a.spend.toLocaleString("en-IN")} · {a.clicks} clicks · {a.leads} leads{a.costPerLead !== null ? ` · ₹${a.costPerLead}/lead` : ""}</p>
                </div>
                {a.creativeLinkUrl && (
                  <a href={a.creativeLinkUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, flex: "none" }}>View ↗</a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No ad-level performance data for this period yet.</div>
        )}
      </div>

      <div className="panel">
        <h2>Google Ads</h2>
        <p className="note">
          Not connected — needs a Google Ads API developer token and OAuth credentials, not yet configured. Uses the
          same platform-neutral ad_accounts/ad_campaigns/ad_sets/ads/ad_metric_snapshots tables as Meta Ads above, so
          it will appear in every chart and table on this page once wired, not a separate view.
        </p>
      </div>
    </>
  );
}
