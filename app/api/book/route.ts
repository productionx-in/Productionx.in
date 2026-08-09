import { NextResponse } from "next/server";

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

  // TODO: wire up email delivery (e.g. Resend) once RESEND_API_KEY is set in
  // the Vercel project. Until then, bookings are logged server-side so no
  // lead is lost even if a visitor's WhatsApp client fails to open.
  console.log("New booking request:", data);

  return NextResponse.json({ ok: true });
}
