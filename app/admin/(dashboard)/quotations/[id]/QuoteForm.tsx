"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuotation, deleteQuotation, sendQuotationEmail, type QuoteItem } from "../../../actions";

type Quote = {
  id: string;
  number: string;
  kind: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  items: QuoteItem[];
  tax_percent: number;
  currency: string;
  status: string;
  notes: string | null;
  total: number;
};

export function QuoteForm({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [clientName, setClientName] = useState(quote.client_name);
  const [clientEmail, setClientEmail] = useState(quote.client_email ?? "");
  const [clientPhone, setClientPhone] = useState(quote.client_phone ?? "");
  const [clientAddress, setClientAddress] = useState(quote.client_address ?? "");
  const [items, setItems] = useState<QuoteItem[]>(
    quote.items && quote.items.length ? quote.items : [{ description: "", qty: 1, rate: 0 }]
  );
  const [taxPercent, setTaxPercent] = useState(quote.tax_percent || 0);
  const [notes, setNotes] = useState(quote.notes ?? "");
  const [status, setStatus] = useState(quote.status);
  const [pending, start] = useTransition();
  const [sendResult, setSendResult] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const total = subtotal + (subtotal * taxPercent) / 100;

  function setItem(i: number, patch: Partial<QuoteItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function persist() {
    await updateQuotation(quote.id, {
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_address: clientAddress,
      items,
      tax_percent: Number(taxPercent),
      status,
      notes,
    });
  }

  return (
    <>
      <div className="admin-topbar no-print">
        <div>
          <h1>{quote.number}</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0, textTransform: "capitalize" }}>{quote.kind}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {["draft", "sent", "paid", "overdue", "void"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn btn--ghost" disabled={pending} onClick={() => start(persist)}>
            {pending ? "Saving…" : "Save"}
          </button>
          <button className="btn btn--ghost" onClick={() => window.print()}>
            Download / Print
          </button>
          <button
            className="btn btn--mint"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await persist();
                const r = await sendQuotationEmail(quote.id);
                setSendResult(r.ok ? "Sent." : r.error || "Failed.");
              })
            }
          >
            Email to client
          </button>
          <button
            className="btn btn--danger"
            onClick={() => {
              if (confirm("Delete this document?")) {
                start(async () => {
                  await deleteQuotation(quote.id);
                  router.push("/admin/quotations");
                });
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {sendResult && <p className="note no-print">{sendResult}</p>}

      <div className="panel">
        <h2 className="no-print">Client</h2>
        <div className="form-grid no-print">
          <div className="field">
            <label>Name</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Tax %</label>
            <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} />
          </div>
          <div className="field field--full">
            <label>Address</label>
            <textarea rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <h2>Bill To: {clientName}</h2>
          {clientAddress && <p style={{ whiteSpace: "pre-wrap", color: "var(--ash)" }}>{clientAddress}</p>}
        </div>

        <table className="admin-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ width: 90 }}>Qty</th>
              <th style={{ width: 140 }}>Rate ({quote.currency})</th>
              <th style={{ width: 140 }}>Amount</th>
              <th className="no-print" style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>
                  <input
                    value={it.description}
                    onChange={(e) => setItem(i, { description: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={it.rate}
                    onChange={(e) => setItem(i, { rate: Number(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </td>
                <td>{quote.currency} {(it.qty * it.rate).toFixed(2)}</td>
                <td className="no-print">
                  <button
                    className="btn btn--danger"
                    onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn--ghost no-print"
          style={{ marginTop: 10 }}
          onClick={() => setItems((prev) => [...prev, { description: "", qty: 1, rate: 0 }])}
        >
          + Add line item
        </button>

        <p style={{ textAlign: "right", marginTop: 16, fontSize: 15 }}>
          Subtotal: {quote.currency} {subtotal.toFixed(2)}
          <br />
          Tax ({taxPercent}%): {quote.currency} {(subtotal * taxPercent / 100).toFixed(2)}
          <br />
          <strong style={{ fontSize: 18 }}>Total: {quote.currency} {total.toFixed(2)}</strong>
        </p>

        <div className="field field--full" style={{ marginTop: 12 }}>
          <label className="no-print">Notes (shown on the document)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <p style={{ marginTop: 30, color: "var(--ash)", fontSize: 13 }}>
          ProductionX · Hyderabad, India · info@productionx.in · +91 93919 26846
        </p>
      </div>
    </>
  );
}
