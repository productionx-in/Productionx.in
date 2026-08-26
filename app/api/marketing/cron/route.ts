import { NextResponse } from "next/server";
import { supabaseServiceRole } from "../../../lib/supabase/service";
import { runMarketingSnapshot } from "../../../lib/social/snapshot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron target — fires once daily (see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET` automatically for scheduled
 * invocations when CRON_SECRET is set as an env var; anything else is
 * rejected, so this can't be triggered by a random request even though the
 * route itself has no admin session to check against (cron runs have none).
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runMarketingSnapshot(supabaseServiceRole());
  return NextResponse.json({ results });
}
