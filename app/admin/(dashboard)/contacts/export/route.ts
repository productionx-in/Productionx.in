import { supabaseServer } from "../../../../lib/supabase/server";

function csvEscape(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const supabase = await supabaseServer();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("name, company, email, phone, city, tags, notes, source, created_at")
    .order("created_at", { ascending: false });

  const header = ["name", "company", "email", "phone", "city", "tags", "notes", "source", "created_at"];
  const rows = (contacts || []).map((c) =>
    [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.city,
      (c.tags || []).join("|"),
      c.notes,
      c.source,
      c.created_at,
    ]
      .map(csvEscape)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="productionx-contacts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
