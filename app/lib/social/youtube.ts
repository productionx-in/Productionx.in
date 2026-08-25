export type YouTubeMedia = {
  kind: "image" | "video" | "other";
  previewUrl: string;
  sourceUrl?: string;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
  url: string;
  media: YouTubeMedia[];
};

type YouTubeThumbnails = {
  maxres?: { url: string };
  standard?: { url: string };
  high?: { url: string };
  medium?: { url: string };
  default?: { url: string };
};

/**
 * Highest-resolution thumbnail available. YouTube doesn't guarantee every
 * size for every video (maxres in particular is often missing on older or
 * lower-resolution uploads) — fall through in quality order, and return
 * undefined only if the API genuinely returned none, so a missing thumbnail
 * degrades to the existing text-only card instead of a broken image.
 */
function bestThumbnail(thumbnails: YouTubeThumbnails | undefined): string | undefined {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url
  );
}

export class YouTubeApiError extends Error {
  status: number;
  reason?: string;

  constructor(message: string, status: number, reason?: string) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

type YouTubeErrorBody = { error?: { code?: number; message?: string; errors?: { reason?: string }[] } };

async function youtubeGet(path: string, params: Record<string, string>): Promise<unknown> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Callers check isConfigured() first, but guard here too in case this
    // is ever called directly.
    throw new YouTubeApiError("YOUTUBE_API_KEY is missing from the environment.", 503);
  }

  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("key", apiKey);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new YouTubeApiError("Could not reach the YouTube Data API.", 502);
  }

  const body = (await res.json().catch(() => null)) as YouTubeErrorBody | null;

  if (!res.ok || body?.error) {
    const reason = body?.error?.errors?.[0]?.reason;
    const message =
      reason === "keyInvalid" || reason === "forbidden"
        ? "The YouTube API key is invalid or restricted. Check it in Google Cloud Console and update YOUTUBE_API_KEY."
        : reason === "quotaExceeded"
          ? "The YouTube Data API quota has been exceeded for today. It resets on Google's daily schedule."
          : body?.error?.message || "The YouTube Data API returned an error.";
    throw new YouTubeApiError(message, res.status >= 400 ? res.status : 502, reason);
  }

  return body;
}

/**
 * Fetches the channel's recent uploads server-side, same call pattern as
 * fetchFacebookPagePosts()/fetchInstagramMedia(). Uses a plain API key
 * rather than OAuth: channel uploads are public data, so a key scoped to the
 * YouTube Data API — kept server-side only, never sent to the browser — is
 * sufficient for read-only listing. Publishing later will need real OAuth;
 * this endpoint doesn't need it.
 *
 * Two calls: channels.list resolves the channel's "uploads" playlist id,
 * then playlistItems.list lists its videos — far cheaper on quota than
 * search.list for the same result.
 */
export async function fetchYouTubeVideos(): Promise<{ videos: YouTubeVideo[] }> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!channelId || !apiKey) {
    throw new YouTubeApiError(
      "YouTube integration is not configured — YOUTUBE_CHANNEL_ID and/or YOUTUBE_API_KEY are missing from the environment.",
      503
    );
  }

  const channelBody = (await youtubeGet("channels", {
    part: "contentDetails",
    id: channelId,
  })) as { items?: { contentDetails?: { relatedPlaylists?: { uploads?: string } } }[] };

  const uploadsPlaylistId = channelBody.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new YouTubeApiError("No channel found for the configured YOUTUBE_CHANNEL_ID.", 404);
  }

  const playlistBody = (await youtubeGet("playlistItems", {
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: "12",
  })) as {
    items?: {
      snippet?: {
        resourceId?: { videoId?: string };
        title?: string;
        description?: string;
        publishedAt?: string;
        thumbnails?: YouTubeThumbnails;
      };
    }[];
  };

  const videos: YouTubeVideo[] = [];
  for (const item of playlistBody.items ?? []) {
    const videoId = item.snippet?.resourceId?.videoId;
    if (!videoId) continue;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const previewUrl = bestThumbnail(item.snippet?.thumbnails);
    videos.push({
      id: videoId,
      title: item.snippet?.title || "(untitled)",
      description: item.snippet?.description || undefined,
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      url,
      media: previewUrl ? [{ kind: "video", previewUrl, sourceUrl: url }] : [],
    });
  }

  return { videos };
}
