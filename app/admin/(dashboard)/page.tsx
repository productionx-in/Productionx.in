import Link from "next/link";
import { supabaseServer } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardHome() {
  const supabase = await supabaseServer();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const liveThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const [
    leadsWeek,
    leadsNew,
    contacts,
    posts,
    quotesOpen,
    recentLeads,
    liveNow,
    viewsToday,
    viewsWeek,
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("quotations").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase.from("leads").select("id, name, service, status, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("analytics_sessions").select("session_id", { count: "exact", head: true }).gte("last_seen", liveThreshold),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
    supabase.from("analytics_events").select("path").gte("created_at", weekAgo),
  ]);

  const pathCounts = new Map<string, number>();
  for (const row of viewsWeek.data || []) {
    pathCounts.set(row.path, (pathCounts.get(row.path) || 0) + 1);
  }
  const top = [...pathCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxTop = top[0]?.[1] || 1;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="admin-main__sub">Sales, marketing and site traffic in one view.</p>

      <div className="panel" style={{ borderColor: "var(--mint)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div className="stat-card__value" style={{ color: "var(--mint)" }}>
              ● {liveNow.count ?? 0}
            </div>
            <div className="stat-card__label">Live on the site right now</div>
          </div>
          <div>
            <div className="stat-card__value">{viewsToday.count ?? 0}</div>
            <div className="stat-card__label">Pageviews, last 24h</div>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__value">{leadsWeek.count ?? 0}</div>
          <div className="stat-card__label">Leads this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{leadsNew.count ?? 0}</div>
          <div className="stat-card__label">Unactioned leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{contacts.count ?? 0}</div>
          <div className="stat-card__label">Contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{posts.count ?? 0}</div>
          <div className="stat-card__label">Published posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{quotesOpen.count ?? 0}</div>
          <div className="stat-card__label">Open quotes/invoices</div>
        </div>
      </div>

      <div className="panel">
        <h2>Top pages, last 7 days</h2>
        {top.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top.map(([path, count]) => (
              <div key={path} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{path}</span>
                <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${(count / maxTop) * 100}%`, background: "var(--mint)", height: 8, borderRadius: 4 }} />
                </div>
                <span style={{ color: "var(--ash)", width: 32, textAlign: "right" }}>{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="note">No traffic recorded yet.</p>
        )}
      </div>

      <div className="panel">
        <h2>Recent leads</h2>
        {recentLeads.data && recentLeads.data.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Service</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.data.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/admin/leads/${l.id}`}>{l.name}</Link>
                  </td>
                  <td>{l.service || "—"}</td>
                  <td>
                    <span className={`badge badge--${l.status}`}>{l.status.replace("_", " ")}</span>
                  </td>
                  <td>{new Date(l.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No leads yet — they&apos;ll land here from the site&apos;s booking form.</div>
        )}
      </div>
    </>
  );
}
