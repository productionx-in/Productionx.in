"use client";

import { useRef, useState, useTransition } from "react";
import Papa from "papaparse";
import { bulkImportContacts, upsertContact, deleteContact } from "../../actions";

type Contact = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  tags: string[] | null;
  notes: string | null;
};

export function CsvImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        start(async () => {
          const r = await bulkImportContacts(res.data);
          setResult(r.error ? `Failed: ${r.error}` : `Imported ${r.inserted} contact(s).`);
        });
      },
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <label className="btn btn--ghost" style={{ cursor: "pointer" }}>
        {pending ? "Importing…" : "Import CSV"}
        <input ref={fileRef} type="file" accept=".csv" onChange={onFile} hidden />
      </label>
      <a className="btn btn--ghost" href="/admin/contacts/export">
        Export CSV
      </a>
      {result && <span className="note">{result}</span>}
    </div>
  );
}

export function ContactForm({ contact, onDone }: { contact?: Contact; onDone?: () => void }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) =>
        start(async () => {
          await upsertContact(fd);
          onDone?.();
        })
      }
      className="form-grid"
    >
      <input type="hidden" name="id" defaultValue={contact?.id} />
      <div className="field">
        <label>Name</label>
        <input name="name" defaultValue={contact?.name} required />
      </div>
      <div className="field">
        <label>Company</label>
        <input name="company" defaultValue={contact?.company ?? ""} />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" defaultValue={contact?.email ?? ""} />
      </div>
      <div className="field">
        <label>Phone</label>
        <input name="phone" defaultValue={contact?.phone ?? ""} />
      </div>
      <div className="field">
        <label>City</label>
        <input name="city" defaultValue={contact?.city ?? ""} />
      </div>
      <div className="field">
        <label>Tags (comma separated)</label>
        <input name="tags" defaultValue={contact?.tags?.join(", ") ?? ""} />
      </div>
      <div className="field field--full">
        <label>Notes</label>
        <textarea name="notes" rows={2} defaultValue={contact?.notes ?? ""} />
      </div>
      <div className="field--full">
        <button className="btn" disabled={pending}>
          {pending ? "Saving…" : contact ? "Save changes" : "Add contact"}
        </button>
      </div>
    </form>
  );
}

export function ContactRow({ contact }: { contact: Contact }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <tr>
        <td colSpan={5}>
          <ContactForm contact={contact} onDone={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        {contact.name}
        {contact.company ? <div style={{ color: "var(--slate)", fontSize: 12 }}>{contact.company}</div> : null}
      </td>
      <td>
        {contact.email || "—"}
        {contact.phone ? <div style={{ color: "var(--slate)", fontSize: 12 }}>{contact.phone}</div> : null}
      </td>
      <td>{contact.city || "—"}</td>
      <td>{(contact.tags || []).join(", ") || "—"}</td>
      <td style={{ display: "flex", gap: 8 }}>
        <button className="btn btn--ghost" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          className="btn btn--danger"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete ${contact.name}?`)) start(() => deleteContact(contact.id));
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
