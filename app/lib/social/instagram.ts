export type InstagramMedia = {
  kind: "image" | "video" | "other";
  previewUrl: string;
  sourceUrl?: string;
};

export type InstagramPost = {
  id: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  mediaType: string; // IMAGE | VIDEO | CAROUSEL_ALBUM, as returned by Graph API
  media: InstagramMedia[];
};

// Shape of one entry in /media's own fields, and of each item under
// children.data for a CAROUSEL_ALBUM — only the fields we actually read.
type RawIgMedia = {
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

function mediaKind(mediaType: string | undefined): InstagramMedia["kind"] {
  if (mediaType === "VIDEO") return "video";
  if (mediaType === "IMAGE" || mediaType === "CAROUSEL_ALBUM") return "image";
  return "other";
}

/**
 * A video item's playable file (media_url) isn't image-renderable, so — same
 * approach as the Facebook adapter — video previews use thumbnail_url and
 * link out to the permalink to actually watch, rather than embedding
 * playback. Reels come through as media_type VIDEO, so this covers them too
 * without special-casing.
 */
function previewFor(item: RawIgMedia): string | undefined {
  if (item.media_type === "VIDEO") return item.thumbnail_url || item.media_url;
  return item.media_url;
}

/**
 * A CAROUSEL_ALBUM post has no usable media_url of its own — each slide is
 * one entry under children.data, requested as a nested field in the same
 * call (mirroring how the Facebook adapter flattens subattachments).
 */
function extractMedia(raw: RawIgMedia & { children?: { data?: RawIgMedia[] } }, permalink: string): InstagramMedia[] {
  const items: RawIgMedia[] = raw.media_type === "CAROUSEL_ALBUM" ? raw.children?.data ?? [] : [raw];
  const media: InstagramMedia[] = [];
  for (const item of items) {
    const previewUrl = previewFor(item);
    if (!previewUrl) continue;
    media.push({ kind: mediaKind(item.media_type), previewUrl, sourceUrl: permalink });
  }
  return media;
}

export class InstagramApiError extends Error {
  status: number;
  code?: number;
  subcode?: number;
  tokenExpired: boolean;

  constructor(message: string, status: number, code?: number, subcode?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.subcode = subcode;
    this.tokenExpired = code === 190;
  }
}

/**
 * Fetches the connected Instagram Business/Creator account's recent media
 * server-side. Same shape and call pattern as fetchFacebookPagePosts() —
 * shared by the /admin/social page and (if added later) an API route.
 *
 * Reuses META_PAGE_ACCESS_TOKEN: the same Page token already used for
 * Facebook also authorizes Instagram Graph API calls for the Instagram
 * account linked to that Page, provided it was generated with the
 * instagram_basic permission — no second token to manage.
 */
export async function fetchInstagramMedia(): Promise<{ posts: InstagramPost[]; paging: unknown }> {
  const igUserId = process.env.META_IG_USER_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!igUserId || !token) {
    throw new InstagramApiError(
      "Instagram integration is not configured — META_IG_USER_ID and/or META_PAGE_ACCESS_TOKEN are missing from the environment.",
      503
    );
  }

  const url = new URL(`https://graph.facebook.com/v21.0/${igUserId}/media`);
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}"
  );
  url.searchParams.set("access_token", token);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new InstagramApiError("Could not reach the Meta Graph API.", 502);
  }

  const body = await res.json().catch(() => null);

  if (!res.ok || body?.error) {
    const metaError = body?.error as { message?: string; code?: number; error_subcode?: number } | undefined;
    if (metaError?.code === 190) {
      throw new InstagramApiError(
        "The Instagram access token is expired or invalid. Generate a new token in Meta Graph API Explorer (with instagram_basic granted) and update META_PAGE_ACCESS_TOKEN.",
        401,
        metaError.code,
        metaError.error_subcode
      );
    }
    throw new InstagramApiError(
      metaError?.message || "The Meta Graph API returned an error.",
      res.status >= 400 ? res.status : 502,
      metaError?.code,
      metaError?.error_subcode
    );
  }

  type RawPost = RawIgMedia & {
    id: string;
    caption?: string;
    permalink: string;
    timestamp: string;
    children?: { data?: RawIgMedia[] };
  };

  const posts: InstagramPost[] = (body?.data ?? []).map((raw: RawPost) => ({
    id: raw.id,
    caption: raw.caption,
    timestamp: raw.timestamp,
    permalink: raw.permalink,
    mediaType: raw.media_type ?? "IMAGE",
    media: extractMedia(raw, raw.permalink),
  }));

  return { posts, paging: body?.paging ?? null };
}
