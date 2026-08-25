import { fetchYouTubeVideos, YouTubeApiError } from "../youtube";
import type { PlatformAdapter, SocialPost } from "../types";
import { PlatformApiError } from "../types";

/**
 * Wraps app/lib/social/youtube.ts into the shared PlatformAdapter interface
 * — same pattern as adapters/facebook.ts and adapters/instagram.ts.
 * isConfigured() flips to true once YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY
 * both exist, which is what turns YouTube from "Not connected" to
 * "Connected" on /admin/social.
 */
export const youtubeAdapter: PlatformAdapter = {
  key: "youtube",
  label: "YouTube",

  isConfigured() {
    return !!(process.env.YOUTUBE_CHANNEL_ID && process.env.YOUTUBE_API_KEY);
  },

  notConnectedReason() {
    return "Add YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY in Vercel, then redeploy.";
  },

  async fetchPosts(): Promise<SocialPost[]> {
    try {
      const { videos } = await fetchYouTubeVideos();
      return videos.map((v) => ({
        id: v.id,
        // Title and description are the two distinct text fields the brief
        // asks for; SocialPost only carries one text field (message, same
        // as a caption on Facebook/Instagram), so they're combined here
        // rather than widening the shared type for one platform.
        message: v.description ? `${v.title}\n\n${v.description}` : v.title,
        createdAt: v.publishedAt,
        permalinkUrl: v.url,
        media: v.media,
      }));
    } catch (err) {
      if (err instanceof YouTubeApiError) {
        throw new PlatformApiError(err.message, err.status, false);
      }
      throw new PlatformApiError("Unexpected error fetching YouTube videos.", 500);
    }
  },
};
