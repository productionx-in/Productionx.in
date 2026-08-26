import { supabaseServer } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  const supabase = await supabaseServer();
  const { data: reports } = await supabase
    .from("marketing_reports")
    .select("kind, period_start, period_end, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Reports</h1>
      <p className="admin-main__sub">Monthly, campaign, social, sales and combined reports — generation and PDF/email delivery are a later phase.</p>

      <div className="panel">
        <h2>What&apos;s ready now</h2>
        <p className="note">
          The <code>marketing_reports</code> table exists and tracks a report&apos;s kind, period, status and (once built)
          a PDF URL and who it was emailed to. Nothing generates a report yet — this page is here so the architecture
          doesn&apos;t need to change when that phase starts.
        </p>
      </div>

      <div className="panel">
        <h2>Report history</h2>
        {reports && reports.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr><th>Kind</th><th>Period</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td style={{ textTransform: "capitalize" }}>{r.kind}</td>
                  <td>{r.period_start} – {r.period_end}</td>
                  <td><span className={`badge badge--${r.status}`}>{r.status}</span></td>
                  <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No reports generated yet.</div>
        )}
      </div>
    </>
  );
}
