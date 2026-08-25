import { supabaseServer } from "../../../lib/supabase/server";
import { createCampaign, deleteCampaign } from "../../actions";

export default async function CampaignsPage() {
  const supabase = await supabaseServer();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Campaigns</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            WhatsApp and email blasts to a tagged slice of your contacts.
          </p>
        </div>
      </div>

      <div className="panel">
        <p className="note" style={{ marginBottom: 14 }}>
          <strong style={{ color: "var(--bone)" }}>WhatsApp sending isn&apos;t connected yet</strong> — Meta&apos;s WhatsApp
          Business API (or a provider like Interakt, Twilio or 360dialog) needs its own approved account, which
          only you can set up. Draft campaigns here now; once you share the provider&apos;s API key and phone number
          ID, wiring the actual send is a small change to <code>app/admin/actions.ts</code>. Email campaigns send
          immediately using the studio&apos;s connected mailbox.
        </p>
        <form action={createCampaign} className="form-grid">
          <div className="field">
            <label>Campaign name</label>
            <input name="name" required />
          </div>
          <div className="field">
            <label>Channel</label>
            <select name="channel">
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="field">
            <label>Audience tag (matches a contact tag)</label>
            <input name="audience_tag" placeholder="e.g. hospitality" />
          </div>
          <div className="field field--full">
            <label>Message</label>
            <textarea name="message" rows={4} required />
          </div>
          <div className="field--full">
            <button className="btn" type="submit">Save as draft</button>
          </div>
        </form>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Channel</th>
              <th>Audience</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ textTransform: "capitalize" }}>{c.channel}</td>
                <td>{c.audience_tag || "everyone"}</td>
                <td>
                  <span className={`badge badge--${c.status}`}>{c.status}</span>
                </td>
                <td>
                  <form action={deleteCampaign.bind(null, c.id)}>
                    <button className="btn btn--danger">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">No campaigns drafted yet.</div>
      )}
    </>
  );
}
