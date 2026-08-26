import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Used in exactly one place:
 * the marketing snapshot cron (app/api/marketing/cron/route.ts), which runs
 * on a schedule with no signed-in admin session to bind an RLS-scoped
 * client to. Every other server-side read/write in this app goes through
 * app/lib/supabase/server.ts's cookie-bound anon client instead, so RLS
 * still applies normally everywhere else.
 *
 * Never imported into anything that runs in the browser, and the key it
 * reads (SUPABASE_SERVICE_ROLE_KEY) is never exposed via NEXT_PUBLIC_.
 */
export function supabaseServiceRole() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
