import Link from "next/link";
import { supabaseServer } from "../../../lib/supabase/server";
import { createLead } from "../../actions";

const STATUSES = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await supabaseServer();

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: leads } = await query;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Leads</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            Everything that comes through the booking form, plus anything added by hand.
          </p>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <Link href="/admin/leads" className={`btn btn--ghost`}>
          All
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/leads?status=${s}`} className="btn btn--ghost">
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <details className="panel">
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>+ Add a lead manually</summary>
        <form action={createLead} className="form-grid" style={{ marginTop: 14, border: "none", padding: 0 }}>
          <div className="field">
            <label>Name</label>
            <input name="name" required />
          </div>
          <div className="field">
            <label>Brand</label>
            <input name="brand" />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" />
          </div>
          <div className="field">
            <label>Service</label>
            <input name="service" />
          </div>
          <div className="field">
            <label>Budget</label>
            <input name="budget" />
          </div>
          <div className="field field--full">
            <label>Message</label>
            <textarea name="message" rows={3} />
          </div>
          <div className="field--full">
            <button className="btn" type="submit">Add lead</button>
          </div>
        </form>
      </details>

      {leads && leads.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Service</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link href={`/admin/leads/${l.id}`}>{l.name}</Link>
                  {l.brand ? <div style={{ color: "var(--slate)", fontSize: 12 }}>{l.brand}</div> : null}
                </td>
                <td>
                  {l.email || "—"}
                  {l.phone ? <div style={{ color: "var(--slate)", fontSize: 12 }}>{l.phone}</div> : null}
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
        <div className="empty-state">No leads match this filter.</div>
      )}
    </>
  );
}
