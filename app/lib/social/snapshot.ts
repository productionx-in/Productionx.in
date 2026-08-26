import type { SupabaseClient } from "@supabase/supabase-js";
import { facebookAdapter } from "./adapters/facebook";
import { instagramAdapter } from "./adapters/instagram";
import { fetchFacebookAccountInsights, fetchFacebookContentInsights } from "./insights/facebook-insights";
import { fetchInstagramAccountInsights, fetchInstagramContentInsights } from "./insights/instagram-insights";
import type { AccountInsightSnapshot, ContentInsight } from "./insights/types";

export type SnapshotResult = {
  platform: string;
  ok: boolean;
  contentCount: number;
  error?: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

async function writeAccountSnapshot(
  supabase: SupabaseClient,
  platform: string,
  accountRef: string,
  snapshot: AccountInsightSnapshot
) {
  // Follower growth = delta from the most recent prior snapshot, not
  // something Meta returns directly — computed here so it lives in the row
  // once rather than being recalculated by every chart that reads it.
  const { data: prior } = await supabase
    .from("social_metric_snapshots")
    .select("followers")
    .eq("platform", platform)
    .eq("account_ref", accountRef)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const followerGrowth =
    snapshot.followers !== undefined && prior?.followers != null ? snapshot.followers - prior.followers : undefined;

  const today = todayIso();
  await supabase.from("social_metric_snapshots").insert({
    platform,
    account_ref: accountRef,
    period_start: today,
    period_end: today,
    reach: snapshot.reach ?? null,
    impressions: snapshot.impressions ?? null,
    engagement: snapshot.engagement ?? null,
    engagement_rate: snapshot.engagementRate ?? null,
    followers: snapshot.followers ?? null,
    follower_growth: followerGrowth ?? null,
    profile_visits: snapshot.profileVisits ?? null,
    website_clicks: snapshot.websiteClicks ?? null,
    video_views: snapshot.videoViews ?? null,
    raw: snapshot.raw,
  });
}

async function upsertContentAndSnapshot(
  supabase: SupabaseClient,
  platform: string,
  post: { id: string; message?: string; createdAt: string; permalinkUrl?: string; media?: { kind: string; previewUrl: string }[] },
  insight: ContentInsight
) {
  const { data: content } = await supabase
    .from("social_content")
    .upsert(
      {
        platform,
        external_id: post.id,
        permalink: post.permalinkUrl,
        caption: post.message,
        media_preview_url: post.media?.[0]?.previewUrl,
        media_kind: post.media?.[0]?.kind,
        published_at: post.createdAt,
      },
      { onConflict: "platform,external_id" }
    )
    .select("id")
    .single();

  if (!content) return;

  const engagement =
    insight.engagement ??
    ((insight.likes ?? 0) + (insight.comments ?? 0) + (insight.shares ?? 0) + (insight.saves ?? 0) || undefined);

  await supabase.from("social_content_metric_snapshots").insert({
    content_id: content.id,
    reach: insight.reach ?? null,
    impressions: insight.impressions ?? null,
    engagement: engagement ?? null,
    likes: insight.likes ?? null,
    comments: insight.comments ?? null,
    shares: insight.shares ?? null,
    saves: insight.saves ?? null,
    video_views: insight.videoViews ?? null,
    raw: insight.raw,
  });
}

/**
 * Captures one snapshot for Facebook and one for Instagram: account-level
 * metrics, plus per-content metrics for every post/media item the existing
 * (untouched) content adapters currently return. Called by the daily cron
 * with a service-role client, or by an admin's manual "capture now" action
 * with their normal session-scoped client — same function either way.
 *
 * Each platform is isolated: a failure fetching Instagram doesn't stop the
 * Facebook snapshot from being written, and vice versa.
 */
export async function runMarketingSnapshot(supabase: SupabaseClient): Promise<SnapshotResult[]> {
  const results: SnapshotResult[] = [];

  if (facebookAdapter.isConfigured()) {
    try {
      const [account, posts] = await Promise.all([fetchFacebookAccountInsights(), facebookAdapter.fetchPosts()]);
      await writeAccountSnapshot(supabase, "facebook", process.env.META_PAGE_ID!, account);

      for (const post of posts) {
        const insight = await fetchFacebookContentInsights(post.id).catch(
          (): ContentInsight => ({ externalId: post.id, raw: {} })
        );
        await upsertContentAndSnapshot(supabase, "facebook", post, insight);
      }
      results.push({ platform: "facebook", ok: true, contentCount: posts.length });
    } catch (err) {
      results.push({ platform: "facebook", ok: false, contentCount: 0, error: err instanceof Error ? err.message : "Unknown error" });
    }
  } else {
    results.push({ platform: "facebook", ok: false, contentCount: 0, error: "Not configured." });
  }

  if (instagramAdapter.isConfigured()) {
    try {
      const [account, media] = await Promise.all([fetchInstagramAccountInsights(), instagramAdapter.fetchPosts()]);
      await writeAccountSnapshot(supabase, "instagram", process.env.META_IG_USER_ID!, account);

      for (const post of media) {
        const insight = await fetchInstagramContentInsights(post.id).catch(
          (): ContentInsight => ({ externalId: post.id, raw: {} })
        );
        await upsertContentAndSnapshot(supabase, "instagram", post, insight);
      }
      results.push({ platform: "instagram", ok: true, contentCount: media.length });
    } catch (err) {
      results.push({ platform: "instagram", ok: false, contentCount: 0, error: err instanceof Error ? err.message : "Unknown error" });
    }
  } else {
    results.push({ platform: "instagram", ok: false, contentCount: 0, error: "Not configured." });
  }

  return results;
}
