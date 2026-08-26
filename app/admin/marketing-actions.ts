"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "../lib/supabase/server";
import { runMarketingSnapshot, type SnapshotResult } from "../lib/social/snapshot";
import { runMetaAdsSync, type AdsSyncResult } from "../lib/social/ads-snapshot";

/**
 * Same runMarketingSnapshot() the daily cron calls, just invoked with the
 * signed-in admin's normal RLS-scoped client instead of the service-role
 * one — lets you capture a snapshot on demand (first data point right after
 * setup, or a spot-check) without waiting for the next scheduled run.
 */
export async function triggerMarketingSnapshot(): Promise<SnapshotResult[]> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const results = await runMarketingSnapshot(supabase);

  revalidatePath("/admin/marketing/overview");
  revalidatePath("/admin/marketing/organic");
  return results;
}

/**
 * Same shape as triggerMarketingSnapshot(), for Meta Ads. Attempts the real
 * sync with the admin's session client and returns exactly what Meta said —
 * including a permissionMissing flag when the token lacks ads_read, so the
 * Paid Ads page can show the precise reason rather than a generic failure.
 */
export async function triggerMetaAdsSync(): Promise<AdsSyncResult> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const result = await runMetaAdsSync(supabase);

  revalidatePath("/admin/marketing/overview");
  revalidatePath("/admin/marketing/paid");
  return result;
}
