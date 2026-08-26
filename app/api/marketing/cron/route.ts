import { NextResponse } from "next/server";
import { supabaseServiceRole } from "../../../lib/supabase/service";
import { runMarketingSnapshot } from "../../../lib/social/snapshot";
import { runMetaAdsSync } from "../../../lib/social/ads-snapshot";

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

  const supabase = supabaseServiceRole();
  const results = await runMarketingSnapshot(supabase);
  // Runs unconditionally, same as the organic snapshot — if Meta Ads isn't
  // configured or the token lacks ads_read yet, runMetaAdsSync reports that
  // clearly instead of throwing, so it costs nothing to attempt daily and
  // starts working the moment the permission is added, with no code change.
  const adsResult = await runMetaAdsSync(supabase);
  return NextResponse.json({ results: [...results, adsResult] });
}
