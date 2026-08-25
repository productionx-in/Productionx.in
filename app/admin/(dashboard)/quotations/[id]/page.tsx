import { notFound } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabase/server";
import { QuoteForm } from "./QuoteForm";

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: quote } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!quote) notFound();
  return <QuoteForm quote={quote} />;
}
