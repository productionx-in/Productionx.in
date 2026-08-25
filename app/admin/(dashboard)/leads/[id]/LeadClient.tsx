"use client";

import { useState, useTransition } from "react";
import {
  updateLeadStatus,
  addLeadNote,
  convertLeadToContact,
  sendLeadEmail,
} from "../../../actions";

type Lead = {
  id: string;
  name: string;
  brand: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  message: string | null;
  budget: string | null;
  status: string;
  contact_id: string | null;
};

const STATUSES = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"];

export function StatusControl({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState(lead.status);
  const [pending, start] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        setStatus(e.target.value);
        start(() => updateLeadStatus(lead.id, e.target.value));
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}

export function ConvertButton({ leadId, hasContact }: { leadId: string; hasContact: boolean }) {
  const [pending, start] = useTransition();
  if (hasContact) return <span className="note">Already in contacts.</span>;
  return (
    <button
      className="btn btn--ghost"
      disabled={pending}
      onClick={() => start(() => convertLeadToContact(leadId))}
    >
      {pending ? "Adding…" : "Add to contacts"}
    </button>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await addLeadNote(leadId, body);
          setBody("");
        });
      }}
      style={{ display: "flex", gap: 8, marginTop: 12 }}
    >
      <input
        placeholder="Add a note…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ flex: 1 }}
      />
      <button className="btn btn--ghost" disabled={pending || !body.trim()}>
        {pending ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}

export function EmailForm({ leadId, email, name }: { leadId: string; email: string | null; name: string }) {
  const [subject, setSubject] = useState(`Re: your enquiry with ProductionX`);
  const [body, setBody] = useState(
    `Hi ${name},\n\nThanks for reaching out to ProductionX. `
  );
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  if (!email) return <p className="note">No email on file for this lead.</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const html = body.split("\n").map((l) => `<p>${l || "&nbsp;"}</p>`).join("");
          const res = await sendLeadEmail(leadId, email, subject, html);
          setResult(res);
        });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div className="field">
        <label>To</label>
        <input value={email} disabled />
      </div>
      <div className="field">
        <label>Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="field">
        <label>Message</label>
        <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div>
        <button className="btn" disabled={pending}>
          {pending ? "Sending…" : "Send email"}
        </button>
        {result && (
          <span style={{ marginLeft: 12, fontSize: 13, color: result.ok ? "var(--mint)" : "var(--ember)" }}>
            {result.ok ? "Sent." : result.error}
          </span>
        )}
      </div>
    </form>
  );
}
