import { supabaseServer } from "../../../lib/supabase/server";
import { AccountForm } from "./AccountClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("admin_users").select("full_name").eq("id", user!.id).maybeSingle();

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

      <AccountForm email={user!.email!} fullName={me?.full_name ?? null} />

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
          Facebook is connected and live. Instagram, LinkedIn and Google Business Profile still need their own
          app setup and, for LinkedIn&apos;s Company Page and Google Business Profile, a manual approval from
          that platform first.
        </p>
        <a className="btn" href="/admin/social" style={{ marginTop: 10, display: "inline-block" }}>
          Open Social media →
        </a>
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
