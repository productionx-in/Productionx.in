import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchMetaAdAccountInfo,
  fetchMetaCampaigns,
  fetchMetaAdSets,
  fetchMetaAds,
  fetchMetaCampaignInsights,
  fetchMetaAdSetInsights,
  fetchMetaAdInsights,
  MetaAdsError,
  type MetaInsightRow,
} from "./insights/meta-ads";

export type AdsSyncResult = {
  platform: "meta";
  ok: boolean;
  campaignCount: number;
  error?: string;
  permissionMissing?: boolean;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

async function writeInsightRows(
  supabase: SupabaseClient,
  scope: "campaign" | "ad_set" | "ad",
  rows: MetaInsightRow[],
  externalToInternalId: Map<string, string>
) {
  for (const row of rows) {
    const scopeId = externalToInternalId.get(row.scopeId);
    if (!scopeId) continue; // insights returned for an object we didn't just sync — skip rather than guess

    const costPerLead = row.leads && row.leads > 0 && row.spend !== undefined ? row.spend / row.leads : undefined;
    const costPerConversion =
      row.conversions && row.conversions > 0 && row.spend !== undefined ? row.spend / row.conversions : undefined;

    // One row per day (row.date, from time_increment=1) — upserted, since a
    // re-sync refetching an already-captured day should correct that day's
    // numbers in place, not add a duplicate that double-counts every sum.
    await supabase.from("ad_metric_snapshots").upsert(
      {
        scope,
        scope_id: scopeId,
        period_start: row.date,
        period_end: row.date,
        spend: row.spend ?? null,
        reach: row.reach ?? null,
        impressions: row.impressions ?? null,
        clicks: row.clicks ?? null,
        ctr: row.ctr ?? null,
        cpc: row.cpc ?? null,
        leads: row.leads ?? null,
        conversions: row.conversions ?? null,
        cost_per_lead: costPerLead ?? null,
        cost_per_conversion: costPerConversion ?? null,
        raw: row.raw,
      },
      { onConflict: "scope,scope_id,period_start" }
    );
  }
}

/**
 * Syncs Meta Ads structure (account/campaigns/ad sets/ads) and the last
 * `lookbackDays` of performance into the existing platform-neutral
 * ad_accounts/ad_campaigns/ad_sets/ads/ad_metric_snapshots tables — same
 * tables Google Ads will use later, nothing Meta-specific in the schema.
 *
 * Every call goes through fetch functions that throw MetaAdsError with a
 * permissionMissing flag when the token lacks ads_read — that failure is
 * caught here and returned as a clear, honest result rather than retried,
 * faked, or allowed to crash the caller (the daily cron or a manual click).
 */
export async function runMetaAdsSync(supabase: SupabaseClient, lookbackDays = 30): Promise<AdsSyncResult> {
  try {
    const account = await fetchMetaAdAccountInfo();

    const { data: accountRow } = await supabase
      .from("ad_accounts")
      .upsert({ platform: "meta", external_id: account.id, name: account.name, currency: account.currency }, { onConflict: "platform,external_id" })
      .select("id")
      .single();
    if (!accountRow) throw new Error("Failed to upsert ad_accounts row.");

    const campaigns = await fetchMetaCampaigns();
    const campaignIdMap = new Map<string, string>();
    for (const c of campaigns) {
      const { data } = await supabase
        .from("ad_campaigns")
        .upsert(
          { ad_account_id: accountRow.id, external_id: c.id, name: c.name, objective: c.objective, status: c.status },
          { onConflict: "ad_account_id,external_id" }
        )
        .select("id")
        .single();
      if (data) campaignIdMap.set(c.id, data.id);
    }

    const adSets = await fetchMetaAdSets();
    const adSetIdMap = new Map<string, string>();
    for (const s of adSets) {
      const campaignId = campaignIdMap.get(s.campaignId);
      if (!campaignId) continue;
      const { data } = await supabase
        .from("ad_sets")
        .upsert({ campaign_id: campaignId, external_id: s.id, name: s.name, status: s.status }, { onConflict: "campaign_id,external_id" })
        .select("id")
        .single();
      if (data) adSetIdMap.set(s.id, data.id);
    }

    const ads = await fetchMetaAds();
    const adIdMap = new Map<string, string>();
    for (const a of ads) {
      const adSetId = adSetIdMap.get(a.adSetId);
      if (!adSetId) continue;
      const { data } = await supabase
        .from("ads")
        .upsert(
          {
            ad_set_id: adSetId,
            external_id: a.id,
            name: a.name,
            status: a.status,
            creative_preview_url: a.creativePreviewUrl,
            creative_link_url: a.creativeLinkUrl,
          },
          { onConflict: "ad_set_id,external_id" }
        )
        .select("id")
        .single();
      if (data) adIdMap.set(a.id, data.id);
    }

    const end = todayIso();
    const start = new Date(Date.now() - lookbackDays * 86_400_000).toISOString().slice(0, 10);

    const [campaignInsights, adSetInsights, adInsights] = await Promise.all([
      fetchMetaCampaignInsights(start, end),
      fetchMetaAdSetInsights(start, end),
      fetchMetaAdInsights(start, end),
    ]);

    await writeInsightRows(supabase, "campaign", campaignInsights, campaignIdMap);
    await writeInsightRows(supabase, "ad_set", adSetInsights, adSetIdMap);
    await writeInsightRows(supabase, "ad", adInsights, adIdMap);

    return { platform: "meta", ok: true, campaignCount: campaigns.length };
  } catch (err) {
    if (err instanceof MetaAdsError) {
      return { platform: "meta", ok: false, campaignCount: 0, error: err.message, permissionMissing: err.permissionMissing };
    }
    return { platform: "meta", ok: false, campaignCount: 0, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
