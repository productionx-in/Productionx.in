import { supabaseServer } from "../../../../lib/supabase/server";
import { resolveRange, percentChange } from "../dateRange";
import { RangePicker } from "../RangePicker";
import { KpiCard } from "../KpiCard";
import { TopContentList } from "../TopContentList";
import { CaptureSnapshotButton } from "../CaptureSnapshotButton";
import { MetricGrowthChart } from "../charts/MetricGrowthChart";
import { PlatformBarChart } from "../charts/PlatformBarChart";
import { FollowerGrowthChart } from "../charts/FollowerGrowthChart";
import { EngagementDonut } from "../charts/EngagementDonut";
import { LeadsBySourceChart } from "../charts/LeadsBySourceChart";
import { Funnel } from "../charts/Funnel";
import {
  platformTotals,
  platformDailySeries,
  platformFollowerSeries,
  mergeDailySeries,
  mergeFollowerSeries,
  topContent,
  leadFunnel,
  paidRevenue,
  paidTotals,
  engagementBreakdown,
} from "../data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString("en-IN");
}

function fmtCurrency(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default async function MarketingOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const supabase = await supabaseServer();

  const [
    fbTotals,
    igTotals,
    fbTotalsPrev,
    igTotalsPrev,
    fbDaily,
    igDaily,
    fbFollowers,
    igFollowers,
    content,
    funnel,
    funnelPrev,
    revenue,
    paid,
    breakdown,
    contentCount,
  ] = await Promise.all([
    platformTotals(supabase, "facebook", range.start, range.end),
    platformTotals(supabase, "instagram", range.start, range.end),
    platformTotals(supabase, "facebook", range.prevStart, range.prevEnd),
    platformTotals(supabase, "instagram", range.prevStart, range.prevEnd),
    platformDailySeries(supabase, "facebook", range.start, range.end),
    platformDailySeries(supabase, "instagram", range.start, range.end),
    platformFollowerSeries(supabase, "facebook", range.start, range.end),
    platformFollowerSeries(supabase, "instagram", range.start, range.end),
    topContent(supabase, range.start, range.end, 6),
    leadFunnel(supabase, range.start, range.end),
    leadFunnel(supabase, range.prevStart, range.prevEnd),
    paidRevenue(supabase, range.start, range.end),
    paidTotals(supabase, range.start, range.end),
    engagementBreakdown(supabase, range.start, range.end),
    supabase
      .from("social_content")
      .select("id", { count: "exact", head: true })
      .gte("published_at", range.start)
      .lte("published_at", `${range.end}T23:59:59`),
  ]);

  const totalReach = fbTotals.reach !== undefined || igTotals.reach !== undefined ? (fbTotals.reach ?? 0) + (igTotals.reach ?? 0) : undefined;
  const totalReachPrev =
    fbTotalsPrev.reach !== undefined || igTotalsPrev.reach !== undefined ? (fbTotalsPrev.reach ?? 0) + (igTotalsPrev.reach ?? 0) : undefined;
  const totalEngagement =
    fbTotals.engagement !== undefined || igTotals.engagement !== undefined ? (fbTotals.engagement ?? 0) + (igTotals.engagement ?? 0) : undefined;
  const totalEngagementPrev =
    fbTotalsPrev.engagement !== undefined || igTotalsPrev.engagement !== undefined
      ? (fbTotalsPrev.engagement ?? 0) + (igTotalsPrev.engagement ?? 0)
      : undefined;
  const totalFollowers =
    fbTotals.followers !== undefined || igTotals.followers !== undefined ? (fbTotals.followers ?? 0) + (igTotals.followers ?? 0) : undefined;

  const costPerLead = paid.hasData && paid.spend !== undefined && funnel.total > 0 ? paid.spend / funnel.total : undefined;
  const roas = paid.hasData && paid.spend ? revenue / paid.spend : undefined;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Marketing Overview</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            Reach, engagement, leads and revenue in one place — not a copy of Meta Business Suite.
          </p>
        </div>
        <CaptureSnapshotButton />
      </div>

      <RangePicker basePath="/admin/marketing/overview" active={range} />

      <div className="stat-grid">
        <KpiCard label="Total reach" value={fmt(totalReach)} deltaPct={percentChange(totalReach, totalReachPrev)} />
        <KpiCard label="Engagement" value={fmt(totalEngagement)} deltaPct={percentChange(totalEngagement, totalEngagementPrev)} />
        <KpiCard
          label="Followers"
          value={fmt(totalFollowers)}
          note={
            fbTotals.followerGrowth !== undefined || igTotals.followerGrowth !== undefined
              ? `+${(fbTotals.followerGrowth ?? 0) + (igTotals.followerGrowth ?? 0)} this period`
              : undefined
          }
        />
        <KpiCard label="Leads" value={fmt(funnel.total)} deltaPct={percentChange(funnel.total, funnelPrev.total)} />
        <KpiCard label="Ad spend" value={paid.hasData ? fmtCurrency(paid.spend ?? 0) : "—"} note={paid.hasData ? undefined : "No paid data yet"} />
        <KpiCard label="Revenue (paid invoices)" value={fmtCurrency(revenue)} note="Not yet attributed to a specific campaign" />
        <KpiCard label="Cost per lead" value={costPerLead !== undefined ? fmtCurrency(costPerLead) : "—"} note={paid.hasData ? undefined : "No paid data yet"} />
        <KpiCard label="ROAS" value={roas !== undefined ? `${roas.toFixed(2)}×` : "—"} note={paid.hasData ? undefined : "No paid data yet"} />
      </div>

      <div className="panel">
        <h2>Reach over time</h2>
        <MetricGrowthChart data={mergeDailySeries(fbDaily, igDaily, (r) => r.reach)} title="Reach" />
      </div>

      <div className="panel">
        <h2>Engagement over time</h2>
        <MetricGrowthChart data={mergeDailySeries(fbDaily, igDaily, (r) => r.engagement)} title="Engagement" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="panel">
          <h2>Facebook vs Instagram</h2>
          <PlatformBarChart
            data={[
              { metric: "Reach", facebook: fbTotals.reach ?? 0, instagram: igTotals.reach ?? 0 },
              { metric: "Engagement", facebook: fbTotals.engagement ?? 0, instagram: igTotals.engagement ?? 0 },
              { metric: "Followers", facebook: fbTotals.followers ?? 0, instagram: igTotals.followers ?? 0 },
            ]}
          />
        </div>
        <div className="panel">
          <h2>Engagement breakdown</h2>
          <EngagementDonut data={breakdown} />
        </div>
      </div>

      <div className="panel">
        <h2>Follower growth</h2>
        <FollowerGrowthChart data={mergeFollowerSeries(fbFollowers, igFollowers)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="panel">
          <h2>Leads by source</h2>
          <LeadsBySourceChart data={funnel.bySource} />
        </div>
        <div className="panel">
          <h2>Marketing → Sales funnel</h2>
          <Funnel
            stages={[
              { label: "Reach", value: totalReach },
              { label: "Engagement", value: totalEngagement },
              { label: "Leads", value: funnel.total },
              { label: "Qualified", value: funnel.qualified },
              { label: "Customers", value: funnel.won },
            ]}
          />
        </div>
      </div>

      <div className="panel">
        <div className="admin-topbar" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Top-performing content</h2>
          <span className="note">{contentCount.count ?? 0} pieces this period</span>
        </div>
        <TopContentList items={content} />
      </div>
    </>
  );
}
