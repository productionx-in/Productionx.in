import type { SupabaseClient } from "@supabase/supabase-js";

export type PlatformTotals = {
  reach?: number;
  engagement?: number;
  followers?: number;
  followerGrowth?: number;
  profileVisits?: number;
  websiteClicks?: number;
  videoViews?: number;
  hasData: boolean;
};

export type DailyPoint = { date: string; reach: number; engagement: number };

function sumIfAny(rows: Record<string, unknown>[], key: string): number | undefined {
  let has = false;
  let total = 0;
  for (const r of rows) {
    const v = r[key];
    if (typeof v === "number") {
      has = true;
      total += v;
    }
  }
  return has ? total : undefined;
}

/** Aggregate totals for one platform over a period, from stored daily snapshots. */
export async function platformTotals(
  supabase: SupabaseClient,
  platform: string,
  start: string,
  end: string
): Promise<PlatformTotals> {
  const { data } = await supabase
    .from("social_metric_snapshots")
    .select("*")
    .eq("platform", platform)
    .gte("period_start", start)
    .lte("period_end", end)
    .order("period_start", { ascending: true });

  const rows = data ?? [];
  if (rows.length === 0) return { hasData: false };

  const first = rows[0] as Record<string, unknown>;
  const last = rows[rows.length - 1] as Record<string, unknown>;
  const firstFollowers = first.followers as number | null;
  const lastFollowers = last.followers as number | null;

  return {
    reach: sumIfAny(rows, "reach"),
    engagement: sumIfAny(rows, "engagement"),
    followers: lastFollowers ?? undefined,
    followerGrowth: firstFollowers != null && lastFollowers != null ? lastFollowers - firstFollowers : undefined,
    profileVisits: sumIfAny(rows, "profile_visits"),
    websiteClicks: sumIfAny(rows, "website_clicks"),
    videoViews: sumIfAny(rows, "video_views"),
    hasData: true,
  };
}

/** Daily reach+engagement series for one platform, for the line/area chart. */
export async function platformDailySeries(
  supabase: SupabaseClient,
  platform: string,
  start: string,
  end: string
): Promise<DailyPoint[]> {
  const { data } = await supabase
    .from("social_metric_snapshots")
    .select("period_start, reach, engagement")
    .eq("platform", platform)
    .gte("period_start", start)
    .lte("period_end", end)
    .order("period_start", { ascending: true });

  return (data ?? []).map((r) => ({
    date: r.period_start as string,
    reach: (r.reach as number) ?? 0,
    engagement: (r.engagement as number) ?? 0,
  }));
}

export async function platformFollowerSeries(
  supabase: SupabaseClient,
  platform: string,
  start: string,
  end: string
): Promise<{ date: string; followers: number | null }[]> {
  const { data } = await supabase
    .from("social_metric_snapshots")
    .select("period_start, followers")
    .eq("platform", platform)
    .gte("period_start", start)
    .lte("period_end", end)
    .order("period_start", { ascending: true });

  return (data ?? []).map((r) => ({ date: r.period_start as string, followers: r.followers as number | null }));
}

/** Merges two per-platform daily series (reach/engagement or followers) into
 *  one array keyed by date, for the two-line/area chart components. */
export function mergeDailySeries<T extends { date: string }>(
  facebook: T[],
  instagram: T[],
  pick: (row: T) => number
): { date: string; facebook: number; instagram: number }[] {
  const dates = [...new Set([...facebook.map((r) => r.date), ...instagram.map((r) => r.date)])].sort();
  const fbByDate = new Map(facebook.map((r) => [r.date, pick(r)]));
  const igByDate = new Map(instagram.map((r) => [r.date, pick(r)]));
  return dates.map((date) => ({ date, facebook: fbByDate.get(date) ?? 0, instagram: igByDate.get(date) ?? 0 }));
}

/** Same idea as mergeDailySeries, but preserves null (no snapshot that day)
 *  rather than coercing to 0 — a follower count chart must never dip to
 *  zero just because a day's snapshot is missing. */
export function mergeFollowerSeries(
  facebook: { date: string; followers: number | null }[],
  instagram: { date: string; followers: number | null }[]
): { date: string; facebook: number | null; instagram: number | null }[] {
  const dates = [...new Set([...facebook.map((r) => r.date), ...instagram.map((r) => r.date)])].sort();
  const fbByDate = new Map(facebook.map((r) => [r.date, r.followers]));
  const igByDate = new Map(instagram.map((r) => [r.date, r.followers]));
  return dates.map((date) => ({ date, facebook: fbByDate.get(date) ?? null, instagram: igByDate.get(date) ?? null }));
}

export type ContentItem = {
  id: string;
  platform: string;
  permalink: string | null;
  caption: string | null;
  mediaPreviewUrl: string | null;
  mediaKind: string | null;
  publishedAt: string | null;
  reach?: number;
  engagement?: number;
  engagementRate?: number;
};

/** Top content in a period, ranked by reach + engagement, latest snapshot per item. */
export async function topContent(
  supabase: SupabaseClient,
  start: string,
  end: string,
  limit = 8,
  platform?: string
): Promise<ContentItem[]> {
  let query = supabase
    .from("social_content")
    .select("id, platform, permalink, caption, media_preview_url, media_kind, published_at")
    .gte("published_at", start)
    .lte("published_at", `${end}T23:59:59`);
  if (platform) query = query.eq("platform", platform);
  const { data: content } = await query;

  if (!content || content.length === 0) return [];

  const ids = content.map((c) => c.id);
  const { data: snaps } = await supabase
    .from("social_content_metric_snapshots")
    .select("content_id, reach, engagement, captured_at")
    .in("content_id", ids)
    .order("captured_at", { ascending: false });

  const latest = new Map<string, { reach: number | null; engagement: number | null }>();
  for (const s of snaps ?? []) {
    if (!latest.has(s.content_id)) latest.set(s.content_id, { reach: s.reach, engagement: s.engagement });
  }

  const items: ContentItem[] = content.map((c) => {
    const m = latest.get(c.id);
    const reach = m?.reach ?? undefined;
    const engagement = m?.engagement ?? undefined;
    return {
      id: c.id,
      platform: c.platform,
      permalink: c.permalink,
      caption: c.caption,
      mediaPreviewUrl: c.media_preview_url,
      mediaKind: c.media_kind,
      publishedAt: c.published_at,
      reach,
      engagement,
      engagementRate: engagement !== undefined && reach ? Number(((engagement / reach) * 100).toFixed(1)) : undefined,
    };
  });

  items.sort((a, b) => (b.reach ?? 0) + (b.engagement ?? 0) - ((a.reach ?? 0) + (a.engagement ?? 0)));
  return items.slice(0, limit);
}

export type LeadFunnelData = {
  total: number;
  qualified: number;
  won: number;
  bySource: { source: string; count: number }[];
};

export async function leadFunnel(supabase: SupabaseClient, start: string, end: string): Promise<LeadFunnelData> {
  const { data } = await supabase
    .from("leads")
    .select("status, source")
    .gte("created_at", start)
    .lte("created_at", `${end}T23:59:59`);

  const rows = data ?? [];
  const qualifiedStatuses = new Set(["qualified", "proposal_sent", "won"]);
  const bySourceMap = new Map<string, number>();
  for (const r of rows) {
    const key = r.source || "unknown";
    bySourceMap.set(key, (bySourceMap.get(key) ?? 0) + 1);
  }

  return {
    total: rows.length,
    qualified: rows.filter((r) => qualifiedStatuses.has(r.status)).length,
    won: rows.filter((r) => r.status === "won").length,
    bySource: [...bySourceMap.entries()].map(([source, count]) => ({ source, count })),
  };
}

/** Paid invoices actually collected in the period — a real number, but not
 *  the same claim as "revenue attributed to marketing," since lead-to-quote
 *  attribution (UTM capture) isn't wired yet. Labelled accordingly in the UI. */
export async function paidRevenue(supabase: SupabaseClient, start: string, end: string): Promise<number> {
  const { data } = await supabase
    .from("quotations")
    .select("total")
    .eq("status", "paid")
    .gte("issued_at", start)
    .lte("issued_at", end);
  return (data ?? []).reduce((sum, q) => sum + Number(q.total), 0);
}

export type EngagementBreakdown = { likes: number; comments: number; shares: number; saves: number };

/** Sums likes/comments/shares/saves across the latest snapshot of every
 *  content item published in the period — feeds the engagement-composition
 *  donut. Returns null (not zeros) when there's simply no content yet, so
 *  the chart can show "no data" instead of an all-zero donut. */
export async function engagementBreakdown(
  supabase: SupabaseClient,
  start: string,
  end: string
): Promise<EngagementBreakdown | null> {
  const { data: content } = await supabase
    .from("social_content")
    .select("id")
    .gte("published_at", start)
    .lte("published_at", `${end}T23:59:59`);

  if (!content || content.length === 0) return null;
  const ids = content.map((c) => c.id);

  const { data: snaps } = await supabase
    .from("social_content_metric_snapshots")
    .select("content_id, likes, comments, shares, saves, captured_at")
    .in("content_id", ids)
    .order("captured_at", { ascending: false });

  const seen = new Set<string>();
  const totals: EngagementBreakdown = { likes: 0, comments: 0, shares: 0, saves: 0 };
  let any = false;
  for (const s of snaps ?? []) {
    if (seen.has(s.content_id)) continue;
    seen.add(s.content_id);
    if (s.likes || s.comments || s.shares || s.saves) any = true;
    totals.likes += s.likes ?? 0;
    totals.comments += s.comments ?? 0;
    totals.shares += s.shares ?? 0;
    totals.saves += s.saves ?? 0;
  }
  return any ? totals : null;
}

export type PaidTotals = {
  spend?: number;
  leads?: number;
  conversions?: number;
  revenue?: number;
  clicks?: number;
  impressions?: number;
  reach?: number;
  hasData: boolean;
};

/** Empty today (no ad account connected yet) — real query, real "no data" state. */
export async function paidTotals(supabase: SupabaseClient, start: string, end: string): Promise<PaidTotals> {
  const { data } = await supabase
    .from("ad_metric_snapshots")
    .select("spend, leads, conversions, revenue, clicks, impressions, reach")
    .eq("scope", "campaign")
    .gte("period_start", start)
    .lte("period_end", end);

  const rows = data ?? [];
  if (rows.length === 0) return { hasData: false };

  return {
    spend: sumIfAny(rows, "spend"),
    leads: sumIfAny(rows, "leads"),
    conversions: sumIfAny(rows, "conversions"),
    revenue: sumIfAny(rows, "revenue"),
    clicks: sumIfAny(rows, "clicks"),
    impressions: sumIfAny(rows, "impressions"),
    reach: sumIfAny(rows, "reach"),
    hasData: true,
  };
}

export type PaidDailyPoint = { date: string; spend: number; impressions: number; clicks: number; leads: number };

/** Account-wide daily totals (summed across every campaign) for the Paid
 *  Ads spend/impressions/clicks/leads-over-time charts. */
export async function paidDailySeries(supabase: SupabaseClient, start: string, end: string): Promise<PaidDailyPoint[]> {
  const { data } = await supabase
    .from("ad_metric_snapshots")
    .select("period_start, spend, impressions, clicks, leads")
    .eq("scope", "campaign")
    .gte("period_start", start)
    .lte("period_end", end)
    .order("period_start", { ascending: true });

  const byDate = new Map<string, PaidDailyPoint>();
  for (const r of data ?? []) {
    const key = r.period_start as string;
    const existing = byDate.get(key) ?? { date: key, spend: 0, impressions: 0, clicks: 0, leads: 0 };
    existing.spend += r.spend ?? 0;
    existing.impressions += r.impressions ?? 0;
    existing.clicks += r.clicks ?? 0;
    existing.leads += r.leads ?? 0;
    byDate.set(key, existing);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type CampaignPerformance = {
  id: string;
  name: string;
  status: string | null;
  spend: number;
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  leads: number;
  costPerLead: number | null;
};

/** Per-campaign totals for the period — feeds the campaign table, the
 *  campaign-comparison bar chart, and best/worst-performer callouts. */
export async function campaignPerformance(supabase: SupabaseClient, start: string, end: string): Promise<CampaignPerformance[]> {
  const { data: campaigns } = await supabase.from("ad_campaigns").select("id, name, status");
  if (!campaigns || campaigns.length === 0) return [];

  const { data: rows } = await supabase
    .from("ad_metric_snapshots")
    .select("scope_id, spend, reach, impressions, clicks, leads")
    .eq("scope", "campaign")
    .gte("period_start", start)
    .lte("period_end", end);

  const totals = new Map<string, { spend: number; reach: number; impressions: number; clicks: number; leads: number }>();
  for (const r of rows ?? []) {
    const t = totals.get(r.scope_id) ?? { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 };
    t.spend += r.spend ?? 0;
    t.reach += r.reach ?? 0;
    t.impressions += r.impressions ?? 0;
    t.clicks += r.clicks ?? 0;
    t.leads += r.leads ?? 0;
    totals.set(r.scope_id, t);
  }

  return campaigns
    .map((c) => {
      const t = totals.get(c.id) ?? { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 };
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        spend: t.spend,
        reach: t.reach,
        impressions: t.impressions,
        clicks: t.clicks,
        ctr: t.impressions > 0 ? Number(((t.clicks / t.impressions) * 100).toFixed(2)) : null,
        cpc: t.clicks > 0 ? Number((t.spend / t.clicks).toFixed(2)) : null,
        leads: t.leads,
        costPerLead: t.leads > 0 ? Number((t.spend / t.leads).toFixed(2)) : null,
      };
    })
    .filter((c) => c.spend > 0 || c.impressions > 0 || c.clicks > 0);
}

export type AdPerformance = CampaignPerformance & {
  creativePreviewUrl: string | null;
  creativeLinkUrl: string | null;
};

/** Same shape as campaignPerformance, at the individual ad level, with the
 *  creative thumbnail and link Meta provides — feeds the ad table and the
 *  best/worst-performer callouts. */
export async function adPerformance(supabase: SupabaseClient, start: string, end: string): Promise<AdPerformance[]> {
  const { data: ads } = await supabase.from("ads").select("id, name, status, creative_preview_url, creative_link_url");
  if (!ads || ads.length === 0) return [];

  const { data: rows } = await supabase
    .from("ad_metric_snapshots")
    .select("scope_id, spend, reach, impressions, clicks, leads")
    .eq("scope", "ad")
    .gte("period_start", start)
    .lte("period_end", end);

  const totals = new Map<string, { spend: number; reach: number; impressions: number; clicks: number; leads: number }>();
  for (const r of rows ?? []) {
    const t = totals.get(r.scope_id) ?? { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 };
    t.spend += r.spend ?? 0;
    t.reach += r.reach ?? 0;
    t.impressions += r.impressions ?? 0;
    t.clicks += r.clicks ?? 0;
    t.leads += r.leads ?? 0;
    totals.set(r.scope_id, t);
  }

  return ads
    .map((a) => {
      const t = totals.get(a.id) ?? { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 };
      return {
        id: a.id,
        name: a.name,
        status: a.status,
        spend: t.spend,
        reach: t.reach,
        impressions: t.impressions,
        clicks: t.clicks,
        ctr: t.impressions > 0 ? Number(((t.clicks / t.impressions) * 100).toFixed(2)) : null,
        cpc: t.clicks > 0 ? Number((t.spend / t.clicks).toFixed(2)) : null,
        leads: t.leads,
        costPerLead: t.leads > 0 ? Number((t.spend / t.leads).toFixed(2)) : null,
        creativePreviewUrl: a.creative_preview_url,
        creativeLinkUrl: a.creative_link_url,
      };
    })
    .filter((a) => a.spend > 0 || a.impressions > 0 || a.clicks > 0);
}
