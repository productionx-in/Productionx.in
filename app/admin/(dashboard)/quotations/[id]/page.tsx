import { notFound } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabase/server";
import { QuoteForm } from "./QuoteForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const [{ data: quote }, { data: contacts }, { data: leads }] = await Promise.all([
    supabase.from("quotations").select("*").eq("id", id).single(),
    supabase.from("contacts").select("id, name, email, phone, company").order("name"),
    supabase.from("leads").select("id, name, email, phone, brand").order("name"),
  ]);
  if (!quote) notFound();

  return <QuoteForm quote={quote} contacts={contacts || []} leads={leads || []} />;
}
