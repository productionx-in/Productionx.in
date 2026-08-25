import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * Fetches the connected Facebook Page's recent posts via the Graph API.
 *
 * The Page access token lives only in server environment variables
 * (META_PAGE_ACCESS_TOKEN) and is never included in the JSON returned to the
 * browser — only the fields the frontend actually needs (id, message,
 * created_time, permalink_url) pass through.
 *
 * Admin-gated: this calls out on the studio's own Meta app quota and returns
 * business data, so it follows the same signed-in-admin check as every other
 * /admin data source, not the public pattern used by /api/book or /api/track.
 */
export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    return NextResponse.json(
      {
        error:
          "Facebook integration is not configured — META_PAGE_ID and/or META_PAGE_ACCESS_TOKEN are missing from the environment.",
      },
      { status: 503 }
    );
  }

  const url = new URL(`https://graph.facebook.com/v21.0/${pageId}/posts`);
  url.searchParams.set("fields", "id,message,created_time,permalink_url");
  url.searchParams.set("access_token", token);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Could not reach the Meta Graph API." }, { status: 502 });
  }

  const body = await res.json().catch(() => null);

  if (!res.ok || body?.error) {
    const metaError = body?.error as { message?: string; code?: number; error_subcode?: number } | undefined;

    // 190 is Meta's OAuthException — an expired, revoked or otherwise
    // invalid token. Flagged distinctly so the UI can prompt for a fresh
    // token specifically, rather than a generic failure message.
    if (metaError?.code === 190) {
      return NextResponse.json(
        {
          error:
            "The Facebook Page access token is expired or invalid. Generate a new token in Meta Graph API Explorer and update META_PAGE_ACCESS_TOKEN.",
          code: metaError.code,
          subcode: metaError.error_subcode,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: metaError?.message || "The Meta Graph API returned an error.",
        code: metaError?.code,
        subcode: metaError?.error_subcode,
      },
      { status: res.status >= 400 ? res.status : 502 }
    );
  }

  return NextResponse.json({ posts: body?.data ?? [], paging: body?.paging ?? null });
}
