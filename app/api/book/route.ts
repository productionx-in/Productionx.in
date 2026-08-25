import { NextResponse } from "next/server";
import { supabaseServer } from "../../lib/supabase/server";

interface BookingPayload {
  name: string;
  brand: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  budget: string;
}

export async function POST(request: Request) {
  const data = (await request.json()) as Partial<BookingPayload>;

  if (!data.name || !data.phone || !data.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("leads").insert({
    name: data.name,
    brand: data.brand || null,
    phone: data.phone,
    email: data.email,
    service: data.service || null,
    message: data.message || null,
    budget: data.budget || null,
    source: "website",
  });

  if (error) {
    console.error("Failed to store booking lead:", error.message, data);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
