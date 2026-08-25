import { supabaseServer } from "./supabase/server";

/**
 * Auth guard for plain API routes (as opposed to server actions, which have
 * their own requireAdmin() in app/admin/actions.ts). Same check — signed in
 * via the cookie-bound Supabase session, and present in admin_users — just
 * returning null instead of throwing, since a route handler needs to shape
 * its own HTTP response rather than let Next's error boundary catch it.
 */
export async function requireAdminApi() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return admin ? { supabase, userId: user.id } : null;
}
