import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-api";
import { fetchFacebookPagePosts, FacebookApiError } from "../../../../lib/social/facebook";

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

  try {
    const { posts, paging } = await fetchFacebookPagePosts();
    return NextResponse.json({ posts, paging });
  } catch (err) {
    if (err instanceof FacebookApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code, subcode: err.subcode },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Unexpected error fetching Facebook posts." }, { status: 500 });
  }
}
