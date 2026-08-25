"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "../lib/supabase/server";
import { sendMail } from "../lib/mailer";

async function requireAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, userId: user.id };
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ---------------------------------- Leads --------------------------------- */

export async function updateLeadStatus(id: string, status: string) {
  const { supabase, userId } = await requireAdmin();
  await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("lead_activity").insert({
    lead_id: id,
    actor: userId,
    kind: "status_change",
    body: `Status changed to ${status}`,
  });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
}

export async function addLeadNote(leadId: string, body: string) {
  if (!body.trim()) return;
  const { supabase, userId } = await requireAdmin();
  await supabase.from("lead_activity").insert({ lead_id: leadId, actor: userId, kind: "note", body });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function createLead(formData: FormData) {
  const { supabase } = await requireAdmin();
  const payload = {
    name: String(formData.get("name") || ""),
    brand: String(formData.get("brand") || "") || null,
    email: String(formData.get("email") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    service: String(formData.get("service") || "") || null,
    message: String(formData.get("message") || "") || null,
    budget: String(formData.get("budget") || "") || null,
    source: "manual",
  };
  await supabase.from("leads").insert(payload);
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function convertLeadToContact(leadId: string) {
  const { supabase } = await requireAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single();
  if (!lead) return;

  const { data: contact } = await supabase
    .from("contacts")
    .insert({
      name: lead.name,
      company: lead.brand,
      email: lead.email,
      phone: lead.phone,
      notes: lead.message,
      source: "lead",
    })
    .select("id")
    .single();

  if (contact) {
    await supabase.from("leads").update({ contact_id: contact.id }).eq("id", leadId);
  }
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/contacts");
}

export async function sendLeadEmail(leadId: string, to: string, subject: string, html: string) {
  const { supabase, userId } = await requireAdmin();
  const result = await sendMail({ to, subject, html });

  await supabase.from("email_log").insert({
    lead_id: leadId,
    to_email: to,
    subject,
    body_html: html,
    status: result.ok ? "sent" : "failed",
    error: result.ok ? null : result.error,
    sent_by: userId,
  });

  if (result.ok) {
    await supabase.from("lead_activity").insert({
      lead_id: leadId,
      actor: userId,
      kind: "email_sent",
      body: `Sent: "${subject}"`,
    });
  }

  revalidatePath(`/admin/leads/${leadId}`);
  return result;
}

/* --------------------------------- Contacts -------------------------------- */

export async function upsertContact(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const tagsRaw = String(formData.get("tags") || "");
  const payload = {
    name: String(formData.get("name") || ""),
    company: String(formData.get("company") || "") || null,
    email: String(formData.get("email") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    city: String(formData.get("city") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("contacts").update(payload).eq("id", id);
  } else {
    await supabase.from("contacts").insert(payload);
  }
  revalidatePath("/admin/contacts");
}

export async function deleteContact(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("contacts").delete().eq("id", id);
  revalidatePath("/admin/contacts");
}

export async function bulkImportContacts(rows: Record<string, string>[]) {
  const { supabase } = await requireAdmin();
  const payload = rows
    .map((r) => ({
      name: r.name || r.Name || "",
      company: r.company || r.Company || null,
      email: r.email || r.Email || null,
      phone: r.phone || r.Phone || null,
      city: r.city || r.City || null,
      tags: (r.tags || r.Tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      source: "csv_import",
    }))
    .filter((r) => r.name);

  if (!payload.length) return { inserted: 0 };
  const { error } = await supabase.from("contacts").insert(payload);
  revalidatePath("/admin/contacts");
  return { inserted: error ? 0 : payload.length, error: error?.message };
}

/* ---------------------------------- Blog ----------------------------------- */

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createBlogDraft() {
  const { supabase, userId } = await requireAdmin();
  const title = "Untitled post";
  const slug = `${slugify(title)}-${Date.now().toString(36)}`;
  const { data } = await supabase
    .from("blog_posts")
    .insert({ title, slug, created_by: userId })
    .select("id")
    .single();
  revalidatePath("/admin/blog");
  if (data) redirect(`/admin/blog/${data.id}`);
}

export async function updateBlogPost(id: string, patch: {
  title?: string;
  slug?: string;
  excerpt?: string;
  content_html?: string;
  cover_image_url?: string;
  cover_video_url?: string;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  status?: "draft" | "published";
}) {
  const { supabase } = await requireAdmin();
  const update: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (patch.status === "published") update.published_at = new Date().toISOString();
  await supabase.from("blog_posts").update(update).eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  if (patch.slug) revalidatePath(`/blog/${patch.slug}`);
}

export async function deleteBlogPost(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

/* ------------------------------- Quotations -------------------------------- */

export type QuoteItem = { description: string; qty: number; rate: number };

async function nextDocNumber(kind: "quotation" | "invoice") {
  const { supabase } = await requireAdmin();
  const prefix = kind === "invoice" ? "INV" : "QTN";
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("quotations")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind);
  const n = (count || 0) + 1;
  return `${prefix}-${year}-${String(n).padStart(4, "0")}`;
}

export async function createQuotation(kind: "quotation" | "invoice") {
  const { supabase, userId } = await requireAdmin();
  const number = await nextDocNumber(kind);
  const { data } = await supabase
    .from("quotations")
    .insert({ kind, number, client_name: "New client", created_by: userId })
    .select("id")
    .single();
  revalidatePath("/admin/quotations");
  if (data) redirect(`/admin/quotations/${data.id}`);
}

export async function updateQuotation(id: string, patch: {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  items?: QuoteItem[];
  tax_percent?: number;
  currency?: string;
  status?: string;
  notes?: string;
  due_at?: string | null;
}) {
  const { supabase } = await requireAdmin();
  const items = patch.items;
  const update: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };

  if (items) {
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
    const taxPercent = patch.tax_percent ?? 0;
    update.subtotal = subtotal;
    update.total = subtotal + (subtotal * taxPercent) / 100;
  }

  await supabase.from("quotations").update(update).eq("id", id);
  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${id}`);
}

export async function deleteQuotation(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("quotations").delete().eq("id", id);
  revalidatePath("/admin/quotations");
}

export async function sendQuotationEmail(id: string) {
  const { supabase, userId } = await requireAdmin();
  const { data: q } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!q || !q.client_email) return { ok: false, error: "No client email on file." };

  const items = (q.items as QuoteItem[]) || [];
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${i.description}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${q.currency} ${i.rate.toFixed(2)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${q.currency} ${(i.qty * i.rate).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2>${q.kind === "invoice" ? "Invoice" : "Quotation"} ${q.number}</h2>
      <p>Hi ${q.client_name},</p>
      <p>Please find the ${q.kind} below from ProductionX.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr><th style="text-align:left;padding:6px 10px">Item</th><th style="padding:6px 10px">Qty</th><th style="text-align:right;padding:6px 10px">Rate</th><th style="text-align:right;padding:6px 10px">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-weight:bold;margin-top:12px">Total: ${q.currency} ${Number(q.total).toFixed(2)}</p>
      ${q.notes ? `<p>${q.notes}</p>` : ""}
      <p>— ProductionX · info@productionx.in · +91 93919 26846</p>
    </div>`;

  const result = await sendMail({
    to: q.client_email,
    subject: `${q.kind === "invoice" ? "Invoice" : "Quotation"} ${q.number} from ProductionX`,
    html,
  });

  await supabase.from("email_log").insert({
    contact_id: q.contact_id,
    to_email: q.client_email,
    subject: `${q.kind} ${q.number}`,
    body_html: html,
    status: result.ok ? "sent" : "failed",
    error: result.ok ? null : result.error,
    sent_by: userId,
  });

  if (result.ok && q.status === "draft") {
    await supabase.from("quotations").update({ status: "sent" }).eq("id", id);
  }
  revalidatePath(`/admin/quotations/${id}`);
  return result;
}

/* -------------------------------- Campaigns -------------------------------- */

export async function createCampaign(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  await supabase.from("campaigns").insert({
    name: String(formData.get("name") || "Untitled campaign"),
    channel: String(formData.get("channel") || "whatsapp"),
    message: String(formData.get("message") || ""),
    audience_tag: String(formData.get("audience_tag") || "") || null,
    created_by: userId,
  });
  revalidatePath("/admin/campaigns");
}

export async function deleteCampaign(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("campaigns").delete().eq("id", id);
  revalidatePath("/admin/campaigns");
}
