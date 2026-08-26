import { supabaseServer } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AttributionPage() {
  const supabase = await supabaseServer();

  const [{ count: totalLeads }, { count: attributedLeads }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).not("utm_source", "is", null),
  ]);

  return (
    <>
      <h1>Attribution</h1>
      <p className="admin-main__sub">Connecting marketing source to CRM leads, qualified leads, customers and revenue.</p>

      <div className="panel">
        <h2>Current status</h2>
        <p style={{ fontSize: 14 }}>
          <strong style={{ color: "var(--bone)" }}>{attributedLeads ?? 0}</strong> of{" "}
          <strong style={{ color: "var(--bone)" }}>{totalLeads ?? 0}</strong> leads have campaign attribution data.
        </p>
        <p className="note" style={{ marginTop: 8 }}>
          The <code>leads</code> table now has <code>utm_source</code>, <code>utm_medium</code>, <code>utm_campaign</code>,{" "}
          <code>utm_content</code>, <code>utm_term</code>, <code>landing_page</code>, <code>ad_campaign_id</code> and{" "}
          <code>ad_id</code> columns, but nothing populates them yet — the booking form on the public site doesn&apos;t
          currently capture UTM parameters from the URL before submitting to <code>/api/book</code>. That&apos;s a small,
          separate website change, not part of this build.
        </p>
      </div>

      <div className="panel">
        <h2>Once attribution data exists, this page will show</h2>
        <ul style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ash)" }}>
          <li>Campaign → Lead → Qualified Lead → Customer, broken down by UTM source/campaign</li>
          <li>Cost per lead and cost per qualified lead, once Paid Ads spend data exists</li>
          <li>Cost per customer and revenue attributed back to the campaign that produced the lead</li>
        </ul>
        <p className="note">Nothing here is estimated or invented in the meantime — it simply won&apos;t appear until the underlying data does.</p>
      </div>
    </>
  );
}
