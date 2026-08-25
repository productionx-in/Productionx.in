import { NextResponse } from "next/server";
import { supabaseServer } from "../../lib/supabase/server";

export async function POST(request: Request) {
  let body: { sessionId?: string; path?: string; referrer?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { sessionId, path, referrer } = body;
  if (!sessionId || !path) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await supabaseServer();
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from("analytics_events").insert({ session_id: sessionId, path, referrer: referrer || null }),
    supabase
      .from("analytics_sessions")
      .upsert({ session_id: sessionId, path, last_seen: now }, { onConflict: "session_id" }),
  ]);

  return NextResponse.json({ ok: true });
}
