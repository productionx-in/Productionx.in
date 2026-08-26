import { metaGet } from "./meta-fetch";

export class MetaAdsError extends Error {
  status: number;
  code?: number;
  /** True when Meta's response indicates the token lacks ads_read/
   *  ads_management — distinct from "not configured" (no account id) or a
   *  generic API failure, so the UI can say exactly what's missing. */
  permissionMissing: boolean;

  constructor(message: string, status: number, code?: number, permissionMissing = false) {
    super(message);
    this.status = status;
    this.code = code;
    this.permissionMissing = permissionMissing;
  }
}

async function adsGet(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  try {
    return await metaGet(path, params);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = (err as { code?: number }).code;
    // Meta's wording for a missing ads_read/ads_management permission
    // varies, but consistently mentions the permission by name or says the
    // token lacks a role on the ad account — checked as a substring match
    // rather than one exact string, the same lesson learned from the
    // Insights metric-name failures.
    const permissionMissing =
      /ads_read|ads_management|does not have (the )?permission|must have a role/i.test(message) || code === 200 || code === 10;
    throw new MetaAdsError(message, (err as { status?: number }).status ?? 502, code, permissionMissing);
  }
}

export type MetaCampaign = { id: string; name: string; objective?: string; status?: string };
export type MetaAdSet = { id: string; campaignId: string; name: string; status?: string };
export type MetaAd = {
  id: string;
  adSetId: string;
  name: string;
  status?: string;
  creativePreviewUrl?: string;
  creativeLinkUrl?: string;
};

export type MetaInsightRow = {
  scopeId: string; // campaign_id / adset_id / ad_id depending on level
  date: string; // YYYY-MM-DD — one row per day, per time_increment=1 below
  spend?: number;
  reach?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  leads?: number;
  conversions?: number;
  raw: Record<string, unknown>;
};

function requireConfig() {
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!adAccountId || !token) {
    throw new MetaAdsError(
      "Meta Ads is not configured — META_AD_ACCOUNT_ID is missing from the environment (META_PAGE_ACCESS_TOKEN is reused from the existing Facebook/Instagram setup).",
      503
    );
  }
  return adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
}

export async function fetchMetaAdAccountInfo(): Promise<{ id: string; name?: string; currency?: string }> {
  const accountId = requireConfig();
  const body = await adsGet(accountId, { fields: "name,currency" });
  return { id: accountId, name: body.name as string | undefined, currency: body.currency as string | undefined };
}

export async function fetchMetaCampaigns(): Promise<MetaCampaign[]> {
  const accountId = requireConfig();
  const body = await adsGet(`${accountId}/campaigns`, { fields: "id,name,objective,status", limit: "200" });
  const data = (body.data as { id: string; name: string; objective?: string; status?: string }[]) ?? [];
  return data.map((c) => ({ id: c.id, name: c.name, objective: c.objective, status: c.status }));
}

export async function fetchMetaAdSets(): Promise<MetaAdSet[]> {
  const accountId = requireConfig();
  const body = await adsGet(`${accountId}/adsets`, { fields: "id,name,campaign_id,status", limit: "200" });
  const data = (body.data as { id: string; name: string; campaign_id: string; status?: string }[]) ?? [];
  return data.map((a) => ({ id: a.id, campaignId: a.campaign_id, name: a.name, status: a.status }));
}

export async function fetchMetaAds(): Promise<MetaAd[]> {
  const accountId = requireConfig();
  const body = await adsGet(`${accountId}/ads`, {
    fields: "id,name,adset_id,status,creative{thumbnail_url,effective_object_story_id}",
    limit: "200",
  });
  type RawAd = {
    id: string;
    name: string;
    adset_id: string;
    status?: string;
    creative?: { thumbnail_url?: string; effective_object_story_id?: string };
  };
  const data = (body.data as RawAd[]) ?? [];
  return data.map((a) => ({
    id: a.id,
    adSetId: a.adset_id,
    name: a.name,
    status: a.status,
    creativePreviewUrl: a.creative?.thumbnail_url,
    creativeLinkUrl: a.creative?.effective_object_story_id
      ? `https://www.facebook.com/${a.creative.effective_object_story_id}`
      : undefined,
  }));
}

/** Extracts a named action's count from Meta's "actions" array — e.g. Meta
 *  reports leads as an action_type of "lead" (or "onsite_conversion.lead_grouped"
 *  for some campaign setups); only a real match is returned, nothing guessed. */
function actionCount(actions: unknown, ...types: string[]): number | undefined {
  if (!Array.isArray(actions)) return undefined;
  const row = actions.find((a) => types.includes((a as { action_type?: string }).action_type ?? ""));
  const v = (row as { value?: string })?.value;
  return v !== undefined ? Number(v) : undefined;
}

/**
 * time_increment=1 asks Meta for one row per day per object instead of one
 * aggregated row for the whole range — that's what makes a real "spend over
 * time" / "previous period" comparison possible from stored snapshots,
 * rather than only ever having a single rolled-up total.
 */
async function fetchInsightsAtLevel(
  level: "campaign" | "adset" | "ad",
  since: string,
  until: string
): Promise<MetaInsightRow[]> {
  const accountId = requireConfig();
  const idField = level === "campaign" ? "campaign_id" : level === "adset" ? "adset_id" : "ad_id";
  const body = await adsGet(`${accountId}/insights`, {
    level,
    fields: `${idField},spend,reach,impressions,clicks,ctr,cpc,actions`,
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
    limit: "500",
  });

  type RawRow = Record<string, unknown>;
  const data = (body.data as RawRow[]) ?? [];

  return data.map((row) => {
    const spend = row.spend !== undefined ? Number(row.spend) : undefined;
    const clicks = row.clicks !== undefined ? Number(row.clicks) : undefined;
    const leads = actionCount(row.actions, "lead", "onsite_conversion.lead_grouped");
    const conversions = actionCount(row.actions, "offsite_conversion.fb_pixel_purchase", "purchase", "onsite_conversion.purchase");
    return {
      scopeId: row[idField] as string,
      date: (row.date_start as string) ?? since,
      spend,
      reach: row.reach !== undefined ? Number(row.reach) : undefined,
      impressions: row.impressions !== undefined ? Number(row.impressions) : undefined,
      clicks,
      ctr: row.ctr !== undefined ? Number(row.ctr) : undefined,
      cpc: row.cpc !== undefined ? Number(row.cpc) : undefined,
      leads,
      conversions,
      raw: row,
    };
  });
}

export async function fetchMetaCampaignInsights(since: string, until: string) {
  return fetchInsightsAtLevel("campaign", since, until);
}
export async function fetchMetaAdSetInsights(since: string, until: string) {
  return fetchInsightsAtLevel("adset", since, until);
}
export async function fetchMetaAdInsights(since: string, until: string) {
  return fetchInsightsAtLevel("ad", since, until);
}
