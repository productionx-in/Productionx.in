export type FacebookPost = {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
};

export class FacebookApiError extends Error {
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
 * Fetches the connected Page's recent posts server-side. Shared by the
 * /api/social/facebook/posts route (for external/JS consumers) and the
 * /admin/social page (a Server Component, which calls this directly rather
 * than round-tripping through our own API route).
 */
export async function fetchFacebookPagePosts(): Promise<{ posts: FacebookPost[]; paging: unknown }> {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    throw new FacebookApiError(
      "Facebook integration is not configured — META_PAGE_ID and/or META_PAGE_ACCESS_TOKEN are missing from the environment.",
      503
    );
  }

  const url = new URL(`https://graph.facebook.com/v21.0/${pageId}/posts`);
  url.searchParams.set("fields", "id,message,created_time,permalink_url");
  url.searchParams.set("access_token", token);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new FacebookApiError("Could not reach the Meta Graph API.", 502);
  }

  const body = await res.json().catch(() => null);

  if (!res.ok || body?.error) {
    const metaError = body?.error as { message?: string; code?: number; error_subcode?: number } | undefined;
    if (metaError?.code === 190) {
      throw new FacebookApiError(
        "The Facebook Page access token is expired or invalid. Generate a new token in Meta Graph API Explorer and update META_PAGE_ACCESS_TOKEN.",
        401,
        metaError.code,
        metaError.error_subcode
      );
    }
    throw new FacebookApiError(
      metaError?.message || "The Meta Graph API returned an error.",
      res.status >= 400 ? res.status : 502,
      metaError?.code,
      metaError?.error_subcode
    );
  }

  return { posts: body?.data ?? [], paging: body?.paging ?? null };
}
