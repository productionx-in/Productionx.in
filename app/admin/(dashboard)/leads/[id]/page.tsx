import { notFound } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabase/server";
import { StatusControl, ConvertButton, NoteForm, EmailForm } from "./LeadClient";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single();
  if (!lead) notFound();

  const { data: activity } = await supabase
    .from("lead_activity")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>{lead.name}</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            {lead.brand || "No brand given"} · {lead.service || "Service not specified"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <StatusControl lead={lead} />
          <ConvertButton leadId={lead.id} hasContact={!!lead.contact_id} />
        </div>
      </div>

      <div className="panel">
        <h2>Details</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>
          <strong>Email:</strong> {lead.email || "—"}
          <br />
          <strong>Phone:</strong> {lead.phone || "—"}
          <br />
          <strong>Budget:</strong> {lead.budget || "—"}
          <br />
          <strong>Source:</strong> {lead.source}
          <br />
          <strong>Received:</strong> {new Date(lead.created_at).toLocaleString("en-IN")}
        </p>
        {lead.message && (
          <>
            <h2 style={{ marginTop: 18 }}>Message</h2>
            <p style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{lead.message}</p>
          </>
        )}
      </div>

      <div className="panel">
        <h2>Send an email</h2>
        <EmailForm leadId={lead.id} email={lead.email} name={lead.name} />
        <p className="note" style={{ marginTop: 10 }}>
          Sends from the studio&apos;s connected mailbox and logs to this lead&apos;s activity.
        </p>
      </div>

      <div className="panel">
        <h2>Activity</h2>
        <NoteForm leadId={lead.id} />
        <div style={{ marginTop: 14 }}>
          {activity && activity.length > 0 ? (
            activity.map((a) => (
              <div key={a.id} className="activity-item">
                <time>{new Date(a.created_at).toLocaleString("en-IN")} · {a.kind.replace("_", " ")}</time>
                {a.body}
              </div>
            ))
          ) : (
            <p className="note">No activity yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
