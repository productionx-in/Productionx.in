"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "../lib/supabase/server";
import { runMarketingSnapshot, type SnapshotResult } from "../lib/social/snapshot";

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
