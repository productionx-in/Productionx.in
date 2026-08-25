import Link from "next/link";
import { supabaseServer } from "../../lib/supabase/server";

export default async function DashboardHome() {
  const supabase = await supabaseServer();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [leadsWeek, leadsNew, contacts, posts, quotesOpen, recentLeads] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("quotations")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "sent"]),
    supabase
      .from("leads")
      .select("id, name, service, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <>
      <h1>Dashboard</h1>
      <p className="admin-main__sub">A snapshot of leads, contacts, content and paperwork.</p>

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
