import { fetchFacebookPagePosts, FacebookApiError, type FacebookPost } from "../../../lib/social/facebook";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

async function FacebookPanel() {
  let posts: FacebookPost[] = [];
  let error: { message: string; status: number; tokenExpired: boolean } | null = null;

  try {
    const result = await fetchFacebookPagePosts();
    posts = result.posts;
  } catch (err) {
    if (err instanceof FacebookApiError) {
      error = { message: err.message, status: err.status, tokenExpired: err.tokenExpired };
    } else {
      error = { message: "Unexpected error fetching Facebook posts.", status: 500, tokenExpired: false };
    }
  }

  return (
    <div className="panel">
      <div className="admin-topbar" style={{ marginBottom: error || posts.length ? 18 : 0 }}>
        <div>
          <h2 style={{ margin: 0 }}>Facebook — Production X Creative</h2>
          <p className="note">Recent posts from the connected Page, via the Meta Graph API.</p>
        </div>
        <span className={`badge ${error ? "badge--lost" : "badge--won"}`}>
          {error ? (error.status === 503 ? "Not configured" : error.tokenExpired ? "Token expired" : "Error") : "Connected"}
        </span>
      </div>

      {error ? (
        <div className="empty-state">
          {error.message}
          {error.status === 503 && (
            <p className="note" style={{ marginTop: 8 }}>
              Add <code>META_PAGE_ID</code> and <code>META_PAGE_ACCESS_TOKEN</code> in Vercel → Settings →
              Environment Variables, then redeploy.
            </p>
          )}
          {error.tokenExpired && (
            <p className="note" style={{ marginTop: 8 }}>
              Generate a fresh token in{" "}
              <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer">
                Meta Graph API Explorer
              </a>{" "}
              and update <code>META_PAGE_ACCESS_TOKEN</code> in Vercel, then redeploy.
            </p>
          )}
        </div>
      ) : posts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((p) => (
            <div key={p.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
              <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap", margin: "0 0 6px", maxHeight: 90, overflow: "hidden" }}>
                {p.message || <em style={{ color: "var(--slate)" }}>(no caption)</em>}
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="note">{timeAgo(p.created_time)}</span>
                <a href={p.permalink_url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5 }}>
                  View on Facebook ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No posts found on this Page yet.</div>
      )}
    </div>
  );
}

export default function SocialPage() {
  return (
    <>
      <h1>Social media</h1>
      <p className="admin-main__sub">Connected platforms and their recent activity.</p>

      <FacebookPanel />

      <div className="panel">
        <h2>Instagram, LinkedIn, Google Business Profile</h2>
        <p className="note">
          Not connected yet — each needs its own app setup and, for LinkedIn&apos;s Company Page and Google
          Business Profile, a manual approval from that platform before it can go live. See the connections
          architecture notes for what&apos;s needed per platform.
        </p>
      </div>
    </>
  );
}
