import type { ContentItem } from "./data";

export function TopContentList({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return <div className="empty-state">No content performance data for this period yet.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "8px 0",
            borderBottom: i === items.length - 1 ? "none" : "1px solid var(--line)",
          }}
        >
          <span style={{ width: 20, textAlign: "center", color: "var(--slate)", fontSize: 13, flex: "none" }}>{i + 1}</span>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 6,
              overflow: "hidden",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              flex: "none",
            }}
          >
            {item.mediaPreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.mediaPreviewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={`badge`} style={{ textTransform: "capitalize" }}>{item.platform}</span>
              {item.publishedAt && (
                <span className="note">{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              )}
            </div>
            <p
              style={{
                fontSize: 13,
                margin: "4px 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--ash)",
              }}
            >
              {item.caption || <em>(no caption)</em>}
            </p>
          </div>
          <div style={{ textAlign: "right", flex: "none", fontSize: 12.5 }}>
            <div>Reach: <strong style={{ color: "var(--bone)" }}>{item.reach?.toLocaleString("en-IN") ?? "—"}</strong></div>
            <div>Engagement: <strong style={{ color: "var(--bone)" }}>{item.engagement?.toLocaleString("en-IN") ?? "—"}</strong></div>
          </div>
          {item.permalink && (
            <a href={item.permalink} target="_blank" rel="noreferrer" style={{ fontSize: 12, flex: "none" }}>
              View ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
