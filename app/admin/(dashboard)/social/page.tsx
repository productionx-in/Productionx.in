import { cache } from "react";
import Link from "next/link";
import { PLATFORM_REGISTRY, getPlatform } from "../../../lib/social/registry";
import { PlatformApiError, type PlatformKey, type SocialPost } from "../../../lib/social/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Status =
  | { state: "not_connected"; reason: string }
  | { state: "connected" }
  | { state: "token_expired"; reason: string }
  | { state: "error"; reason: string };

// Deduped per request: the overview panel and the active tab's detail panel
// both want a connected platform's status, but this ensures only one live
// call ever reaches that platform's API per page load.
const fetchPostsCached = cache(async (key: PlatformKey): Promise<SocialPost[]> => {
  const adapter = getPlatform(key);
  if (!adapter) throw new Error(`Unknown platform: ${key}`);
  return adapter.fetchPosts();
});

async function getStatus(key: PlatformKey): Promise<Status> {
  const adapter = getPlatform(key);
  if (!adapter) return { state: "error", reason: "Unknown platform." };
  if (!adapter.isConfigured()) return { state: "not_connected", reason: adapter.notConnectedReason() };

  try {
    await fetchPostsCached(key);
    return { state: "connected" };
  } catch (err) {
    if (err instanceof PlatformApiError) {
      return err.tokenExpired
        ? { state: "token_expired", reason: err.message }
        : { state: "error", reason: err.message };
    }
    return { state: "error", reason: "Unexpected error." };
  }
}

function statusBadge(status: Status) {
  const map = {
    connected: { cls: "badge--won", label: "Connected" },
    not_connected: { cls: "", label: "Not connected" },
    token_expired: { cls: "badge--lost", label: "Token expired" },
    error: { cls: "badge--lost", label: "Error" },
  } as const;
  const s = map[status.state];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const { platform: platformParam } = await searchParams;
  const active = getPlatform(platformParam || "") ? (platformParam as PlatformKey) : "facebook";

  const statuses = await Promise.all(PLATFORM_REGISTRY.map(async (p) => [p.key, await getStatus(p.key)] as const));
  const statusByKey = new Map(statuses);
  const activeStatus = statusByKey.get(active)!;
  const activeAdapter = getPlatform(active)!;

  let posts: SocialPost[] = [];
  if (activeStatus.state === "connected") {
    posts = await fetchPostsCached(active);
  }

  return (
    <>
      <h1>Social media</h1>
      <p className="admin-main__sub">One place for every connected platform — status, posts and, later, engagement and analytics.</p>

      <div className="panel">
        <h2>Platforms</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_REGISTRY.map((p) => {
              const s = statusByKey.get(p.key)!;
              return (
                <tr key={p.key}>
                  <td>{p.label}</td>
                  <td>{statusBadge(s)}</td>
                  <td>
                    {s.state !== "connected" && <span className="note">{s.reason}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <nav className="admin-tabs">
        {PLATFORM_REGISTRY.map((p) => {
          const s = statusByKey.get(p.key)!;
          const dotClass =
            s.state === "connected" ? "admin-tab__dot--connected" : s.state === "not_connected" ? "" : "admin-tab__dot--issue";
          return (
            <Link
              key={p.key}
              href={`/admin/social?platform=${p.key}`}
              className={`admin-tab${p.key === active ? " admin-tab--active" : ""}`}
            >
              <span className={`admin-tab__dot ${dotClass}`} />
              {p.label}
            </Link>
          );
        })}
      </nav>

      <div className="panel">
        <div className="admin-topbar" style={{ marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0 }}>{activeAdapter.label}</h2>
            {activeStatus.state === "connected" && (
              <p className="note">Recent posts, fetched live from {activeAdapter.label}.</p>
            )}
          </div>
          {statusBadge(activeStatus)}
        </div>

        {activeStatus.state === "not_connected" && (
          <div className="empty-state">
            {activeAdapter.label} isn&apos;t connected yet.
            <p className="note" style={{ marginTop: 8 }}>{activeStatus.reason}</p>
          </div>
        )}

        {(activeStatus.state === "token_expired" || activeStatus.state === "error") && (
          <div className="empty-state">
            {activeStatus.reason}
          </div>
        )}

        {activeStatus.state === "connected" &&
          (posts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.map((post) => (
                <div key={post.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
                  {post.media && post.media.length > 0 && (
                    <div className="social-media-grid">
                      {post.media.slice(0, 4).map((m, i) => {
                        const overflow = post.media!.length - 4;
                        const showOverflow = i === 3 && overflow > 0;
                        return (
                          <a
                            key={i}
                            href={m.sourceUrl || post.permalinkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="social-media-thumb"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.previewUrl} alt="" loading="lazy" />
                            {m.kind === "video" && <span className="social-media-thumb__play">▶</span>}
                            {showOverflow && <span className="social-media-thumb__more">+{overflow}</span>}
                          </a>
                        );
                      })}
                    </div>
                  )}
                  <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap", margin: "0 0 6px", maxHeight: 90, overflow: "hidden" }}>
                    {post.message || <em style={{ color: "var(--slate)" }}>(no caption)</em>}
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span className="note">{timeAgo(post.createdAt)}</span>
                    {post.permalinkUrl && (
                      <a href={post.permalinkUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5 }}>
                        View on {activeAdapter.label} ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No posts found yet.</div>
          ))}
      </div>
    </>
  );
}
