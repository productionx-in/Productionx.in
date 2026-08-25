import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client, cookie-backed so it always reflects the
 * signed-in admin's session. Every /admin server action and page reads
 * through this — never the anon key directly — so RLS policies (which key
 * off auth.uid()) apply exactly as they do to a browser session.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render, where cookies are
            // read-only — middleware refreshes the session instead.
          }
        },
      },
    }
  );
}
