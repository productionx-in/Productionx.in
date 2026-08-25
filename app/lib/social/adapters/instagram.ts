import { fetchInstagramMedia, InstagramApiError } from "../instagram";
import type { PlatformAdapter, SocialPost } from "../types";
import { PlatformApiError } from "../types";

/**
 * Wraps app/lib/social/instagram.ts into the shared PlatformAdapter
 * interface — same pattern as adapters/facebook.ts. isConfigured() flips to
 * true the moment META_IG_USER_ID and META_PAGE_ACCESS_TOKEN both exist in
 * the environment, which is what turns Instagram from "Not connected" to
 * "Connected" on /admin/social — no other change needed there.
 */
export const instagramAdapter: PlatformAdapter = {
  key: "instagram",
  label: "Instagram",

  isConfigured() {
    return !!(process.env.META_IG_USER_ID && process.env.META_PAGE_ACCESS_TOKEN);
  },

  notConnectedReason() {
    return "Add META_IG_USER_ID (the Instagram Business Account ID) in Vercel, then redeploy. Reuses the existing META_PAGE_ACCESS_TOKEN — no second token needed.";
  },

  async fetchPosts(): Promise<SocialPost[]> {
    try {
      const { posts } = await fetchInstagramMedia();
      return posts.map((p) => ({
        id: p.id,
        message: p.caption,
        createdAt: p.timestamp,
        permalinkUrl: p.permalink,
        media: p.media.map((m) => ({ kind: m.kind, previewUrl: m.previewUrl, sourceUrl: m.sourceUrl })),
      }));
    } catch (err) {
      if (err instanceof InstagramApiError) {
        throw new PlatformApiError(err.message, err.status, err.tokenExpired);
      }
      throw new PlatformApiError("Unexpected error fetching Instagram media.", 500);
    }
  },
};
