import Link from "next/link";
import { supabaseServer } from "../../../lib/supabase/server";
import { createQuotation } from "../../actions";

export default async function QuotationsPage() {
  const supabase = await supabaseServer();
  const { data: docs } = await supabase
    .from("quotations")
    .select("id, number, kind, client_name, total, currency, status, issued_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Quotations & invoices</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            Build, send by email, or print to PDF from the browser&apos;s print dialog.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <form action={createQuotation.bind(null, "quotation")}>
            <button className="btn btn--ghost">+ New quotation</button>
          </form>
          <form action={createQuotation.bind(null, "invoice")}>
            <button className="btn">+ New invoice</button>
          </form>
        </div>
      </div>

      {docs && docs.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
              <th>Issued</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>
                  <Link href={`/admin/quotations/${d.id}`}>{d.number}</Link>
                  <div style={{ color: "var(--slate)", fontSize: 12, textTransform: "capitalize" }}>{d.kind}</div>
                </td>
                <td>{d.client_name}</td>
                <td>{d.currency} {Number(d.total).toLocaleString("en-IN")}</td>
                <td>
                  <span className={`badge badge--${d.status}`}>{d.status}</span>
                </td>
                <td>{new Date(d.issued_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">No quotations or invoices yet.</div>
      )}
    </>
  );
}
