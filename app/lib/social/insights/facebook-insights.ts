import { metaGet, fetchMetricsWithFallback, MetaInsightsError } from "./meta-fetch";
import { metricValue, type AccountInsightSnapshot, type ContentInsight } from "./types";

// Meta renames/deprecates Page Insights metrics periodically — this is the
// candidate list as of the API version this app targets; fetchMetricsWithFallback
// drops anything Meta no longer accepts rather than failing the snapshot.
const PAGE_METRICS = ["page_impressions_unique", "page_impressions", "page_post_engagements", "page_views_total"];
const POST_METRICS = ["post_impressions", "post_impressions_unique", "post_engaged_users"];

export async function fetchFacebookAccountInsights(): Promise<AccountInsightSnapshot> {
  const pageId = process.env.META_PAGE_ID;
  if (!pageId) throw new MetaInsightsError("META_PAGE_ID is missing from the environment.", 503);

  const [fields, insights] = await Promise.all([
    metaGet(pageId, { fields: "fan_count,followers_count" }),
    fetchMetricsWithFallback(`${pageId}/insights`, PAGE_METRICS, { period: "day" }),
  ]);

  const followers = (fields.followers_count as number) ?? (fields.fan_count as number);
  const reach = metricValue(insights.data, "page_impressions_unique");
  const impressions = metricValue(insights.data, "page_impressions");
  const engagement = metricValue(insights.data, "page_post_engagements");
  const profileVisits = metricValue(insights.data, "page_views_total");

  return {
    reach,
    impressions,
    engagement,
    engagementRate: engagement && followers ? Number(((engagement / followers) * 100).toFixed(2)) : undefined,
    followers,
    profileVisits,
    raw: { fields, insights: insights.data },
  };
}

/**
 * Per-post metrics. Likes/comments/shares come from plain object fields
 * (near-guaranteed to work under the granted scopes); reach/impressions come
 * from the post-level insights edge (more likely to partially fail —
 * handled the same fallback way as account-level metrics).
 */
export async function fetchFacebookContentInsights(postId: string): Promise<ContentInsight> {
  const [fields, insights] = await Promise.all([
    metaGet(postId, { fields: "likes.summary(true),comments.summary(true),shares" }).catch(() => ({})),
    fetchMetricsWithFallback(`${postId}/insights`, POST_METRICS).catch(() => ({ data: [] })),
  ]);

  const likes = (fields as { likes?: { summary?: { total_count?: number } } }).likes?.summary?.total_count;
  const comments = (fields as { comments?: { summary?: { total_count?: number } } }).comments?.summary?.total_count;
  const shares = (fields as { shares?: { count?: number } }).shares?.count;
  const reach = metricValue(insights.data, "post_impressions_unique");
  const impressions = metricValue(insights.data, "post_impressions");
  const engagement = metricValue(insights.data, "post_engaged_users");

  return {
    externalId: postId,
    reach,
    impressions,
    engagement,
    likes,
    comments,
    shares,
    raw: { fields, insights: insights.data },
  };
}
