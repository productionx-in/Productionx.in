import { supabaseServer } from "../../../lib/supabase/server";
import { CsvImport, ContactForm, ContactRow } from "./ContactsClient";

export default async function ContactsPage() {
  const supabase = await supabaseServer();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Contacts</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            The studio&apos;s database — bring your existing list in as a CSV, or add people one at a time.
          </p>
        </div>
        <CsvImport />
      </div>

      <details className="panel">
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>+ Add a contact</summary>
        <div style={{ marginTop: 14 }}>
          <ContactForm />
        </div>
      </details>

      {contacts && contacts.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>City</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          No contacts yet. Import a CSV with columns name, company, email, phone, city, tags — or add one above.
        </div>
      )}
    </>
  );
}
