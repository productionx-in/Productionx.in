import { fetchFacebookPagePosts, FacebookApiError } from "../facebook";
import type { PlatformAdapter, SocialPost } from "../types";
import { PlatformApiError } from "../types";

/**
 * Wraps the existing, working app/lib/social/facebook.ts — that file's
 * request logic, env var names and error handling are untouched. This
 * adapter only adapts its shape to the shared PlatformAdapter interface.
 */
export const facebookAdapter: PlatformAdapter = {
  key: "facebook",
  label: "Facebook",

  isConfigured() {
    return !!(process.env.META_PAGE_ID && process.env.META_PAGE_ACCESS_TOKEN);
  },

  notConnectedReason() {
    return "Add META_PAGE_ID and META_PAGE_ACCESS_TOKEN in Vercel, then redeploy.";
  },

  async fetchPosts(): Promise<SocialPost[]> {
    try {
      const { posts } = await fetchFacebookPagePosts();
      return posts.map((p) => ({
        id: p.id,
        message: p.message,
        createdAt: p.created_time,
        permalinkUrl: p.permalink_url,
        media: p.media.map((m) => ({ kind: m.kind, previewUrl: m.previewUrl, sourceUrl: m.sourceUrl })),
      }));
    } catch (err) {
      if (err instanceof FacebookApiError) {
        throw new PlatformApiError(err.message, err.status, err.tokenExpired);
      }
      throw new PlatformApiError("Unexpected error fetching Facebook posts.", 500);
    }
  },
};
