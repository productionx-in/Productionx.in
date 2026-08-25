import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "../../lib/supabase/server";
import { signOut } from "../actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/quotations", label: "Quotations & invoices" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    // Signed in with Supabase, but not on the admin allow-list. Kick them
    // out rather than leaving a blank dashboard that RLS quietly empties.
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav no-print">
        <div className="admin-nav__brand">ProductionX — Admin</div>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <div className="admin-nav__footer">
          {admin.full_name || admin.email}
          <form action={signOut}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                color: "var(--ash)",
                cursor: "pointer",
                padding: 0,
                marginTop: 8,
                fontSize: 12,
                textDecoration: "underline",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
