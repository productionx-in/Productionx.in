import { metaGet, fetchMetricsWithFallback, MetaInsightsError } from "./meta-fetch";
import { metricValue, type AccountInsightSnapshot, type ContentInsight } from "./types";

// "impressions" was removed from the account-level Instagram Insights
// metric set in 2023 — reach is the closest still-supported equivalent, so
// it isn't requested here at all rather than requesting-and-dropping.
const ACCOUNT_METRICS = ["reach", "profile_views", "website_clicks"];
// media_product_type-dependent (FEED vs REELS vs STORY) — the fallback
// helper narrows this per media item since not every metric applies to
// every type. Both "views" and "plays" are requested for video view count:
// live testing against real Reels showed "plays" consistently rejected on
// the current API version (Meta's 2024 Insights update replaced it with a
// unified "views" metric for IMAGE/VIDEO/CAROUSEL_ALBUM) — kept as a
// fallback rather than removed outright in case an older media item still
// only supports it.
const MEDIA_METRICS = ["reach", "saved", "shares", "total_interactions", "views", "plays"];

export async function fetchInstagramAccountInsights(): Promise<AccountInsightSnapshot> {
  const igUserId = process.env.META_IG_USER_ID;
  if (!igUserId) throw new MetaInsightsError("META_IG_USER_ID is missing from the environment.", 503);

  const [fields, insights] = await Promise.all([
    metaGet(igUserId, { fields: "followers_count" }),
    // metric_type=total_value is required by Meta's current API for these
    // account-level "day"-period metrics — omitting it is what produced
    // "should be specified with parameter metric_type=total_value".
    fetchMetricsWithFallback(`${igUserId}/insights`, ACCOUNT_METRICS, { period: "day", metric_type: "total_value" }),
  ]);

  const followers = fields.followers_count as number | undefined;
  const reach = metricValue(insights.data, "reach");
  const profileVisits = metricValue(insights.data, "profile_views");
  const websiteClicks = metricValue(insights.data, "website_clicks");

  return {
    reach,
    followers,
    profileVisits,
    websiteClicks,
    raw: { fields, insights: insights.data },
  };
}

/**
 * Likes/comments come from plain media fields (guaranteed under
 * instagram_basic, already granted); reach/saves/shares/plays come from the
 * per-media insights edge and vary by media_product_type, handled by the
 * same fallback narrowing as the account-level call.
 */
export async function fetchInstagramContentInsights(mediaId: string): Promise<ContentInsight> {
  const [fields, insights] = await Promise.all([
    metaGet(mediaId, { fields: "like_count,comments_count" }).catch(() => ({})),
    fetchMetricsWithFallback(`${mediaId}/insights`, MEDIA_METRICS).catch(() => ({ data: [] })),
  ]);

  const likes = (fields as { like_count?: number }).like_count;
  const comments = (fields as { comments_count?: number }).comments_count;
  const reach = metricValue(insights.data, "reach");
  const saves = metricValue(insights.data, "saved");
  const shares = metricValue(insights.data, "shares");
  const totalInteractions = metricValue(insights.data, "total_interactions");
  const videoViews = metricValue(insights.data, "views") ?? metricValue(insights.data, "plays");

  return {
    externalId: mediaId,
    reach,
    engagement: totalInteractions,
    likes,
    comments,
    shares,
    saves,
    videoViews,
    raw: { fields, insights: insights.data },
  };
}
