import { supabaseServer } from "../../../lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await supabaseServer();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const startIso = monthStart.toISOString();

  const [leads, won, contacts, posts, quotesSent, quotesPaid] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startIso),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "won").gte("created_at", startIso),
    supabase.from("contacts").select("id", { count: "exact", head: true }).gte("created_at", startIso),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published").gte("published_at", startIso),
    supabase.from("quotations").select("id", { count: "exact", head: true }).gte("created_at", startIso),
    supabase.from("quotations").select("total").eq("status", "paid").gte("issued_at", startIso.slice(0, 10)),
  ]);
  const revenueTotal = (quotesPaid.data || []).reduce((s, q) => s + Number(q.total), 0);

  const { data: admins } = await supabase.from("admin_users").select("email, full_name, role, created_at");
  const smtpConfigured = !!process.env.SMTP_HOST;

  return (
    <>
      <h1>Settings &amp; this month&apos;s report</h1>
      <p className="admin-main__sub">Month-to-date numbers, connection status, and who has admin access.</p>

      <div className="panel no-print">
        <h2>{monthStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" })} so far</h2>
        <div className="stat-grid" style={{ marginBottom: 0 }}>
          <div className="stat-card">
            <div className="stat-card__value">{leads.count ?? 0}</div>
            <div className="stat-card__label">New leads</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{won.count ?? 0}</div>
            <div className="stat-card__label">Leads won</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{contacts.count ?? 0}</div>
            <div className="stat-card__label">New contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{posts.count ?? 0}</div>
            <div className="stat-card__label">Posts published</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{quotesSent.count ?? 0}</div>
            <div className="stat-card__label">Quotes/invoices raised</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">₹{revenueTotal.toLocaleString("en-IN")}</div>
            <div className="stat-card__label">Marked paid</div>
          </div>
        </div>
        <p className="note no-print" style={{ marginTop: 16 }}>
          Use your browser&apos;s Print → Save as PDF on this page for a shareable monthly report.
        </p>
      </div>

      <div className="panel">
        <h2>Email sending</h2>
        <p className="note">
          {smtpConfigured
            ? "SMTP is configured — leads and quotations can be emailed directly from the dashboard."
            : "Not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (your info@productionx.in Hostinger mailbox credentials) and SMTP_FROM to the project's environment variables in Vercel, then redeploy."}
        </p>
      </div>

      <div className="panel">
        <h2>Social media</h2>
        <p className="note">
          Not wired up yet — each platform (Instagram, Facebook, LinkedIn, Google Business Profile) needs its own
          API app review and access token, which only the account owner can approve. Once you approve API access
          per platform, this panel becomes a live feed of comments, DMs and post performance instead of a set of
          links. For now:
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <a className="btn btn--ghost" href="https://instagram.com/productionx.in" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a className="btn btn--ghost" href="https://business.facebook.com" target="_blank" rel="noreferrer">Meta Business Suite ↗</a>
          <a className="btn btn--ghost" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a className="btn btn--ghost" href="https://business.google.com" target="_blank" rel="noreferrer">Google Business Profile ↗</a>
        </div>
      </div>

      <div className="panel">
        <h2>Admin users</h2>
        {admins && admins.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr><th>Email</th><th>Name</th><th>Role</th><th>Added</th></tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.email}>
                  <td>{a.email}</td>
                  <td>{a.full_name || "—"}</td>
                  <td>{a.role}</td>
                  <td>{new Date(a.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="note">No admin users found.</p>
        )}
        <p className="note" style={{ marginTop: 12 }}>
          To add someone: create their login in the Supabase project&apos;s Authentication tab, then add a matching row
          to the <code>admin_users</code> table with their user id.
        </p>
      </div>
    </>
  );
}
