import Link from "next/link";
import { supabaseServer } from "../../../../lib/supabase/server";
import { resolveRange, percentChange } from "../dateRange";
import { RangePicker } from "../RangePicker";
import { KpiCard } from "../KpiCard";
import { TopContentList } from "../TopContentList";
import { CaptureSnapshotButton } from "../CaptureSnapshotButton";
import { MetricGrowthChart, type GrowthPoint } from "../charts/MetricGrowthChart";
import { platformTotals, platformDailySeries, topContent } from "../data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
];

function fmt(n: number | undefined): string {
  return n === undefined ? "—" : n.toLocaleString("en-IN");
}

export default async function MarketingOrganicPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; platform?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const active = params.platform === "instagram" ? "instagram" : "facebook";
  const supabase = await supabaseServer();

  const [totals, totalsPrev, daily, content] = await Promise.all([
    platformTotals(supabase, active, range.start, range.end),
    platformTotals(supabase, active, range.prevStart, range.prevEnd),
    platformDailySeries(supabase, active, range.start, range.end),
    topContent(supabase, range.start, range.end, 8, active),
  ]);

  // MetricGrowthChart expects both platforms; feeding zeros for the inactive
  // one keeps the single-platform view honest (its line is simply flat at
  // zero, not fabricated) while reusing the same chart component rather
  // than building a second single-line variant.
  const series: GrowthPoint[] = daily.map((d) => ({
    date: d.date,
    facebook: active === "facebook" ? d.reach : 0,
    instagram: active === "instagram" ? d.reach : 0,
  }));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Organic</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>Facebook and Instagram performance, compared separately.</p>
        </div>
        <CaptureSnapshotButton />
      </div>

      <nav className="admin-tabs">
        {PLATFORMS.map((p) => (
          <Link
            key={p.key}
            href={`/admin/marketing/organic?platform=${p.key}&range=${range.key}${range.key === "custom" ? `&from=${range.start}&to=${range.end}` : ""}`}
            className={`admin-tab${p.key === active ? " admin-tab--active" : ""}`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <RangePicker basePath={`/admin/marketing/organic?platform=${active}`} active={range} />

      <div className="stat-grid">
        <KpiCard label="Reach" value={fmt(totals.reach)} deltaPct={percentChange(totals.reach, totalsPrev.reach)} />
        <KpiCard label="Engagement" value={fmt(totals.engagement)} deltaPct={percentChange(totals.engagement, totalsPrev.engagement)} />
        <KpiCard
          label="Followers"
          value={fmt(totals.followers)}
          note={totals.followerGrowth !== undefined ? `${totals.followerGrowth >= 0 ? "+" : ""}${totals.followerGrowth} this period` : undefined}
        />
        <KpiCard label="Profile visits" value={fmt(totals.profileVisits)} deltaPct={percentChange(totals.profileVisits, totalsPrev.profileVisits)} />
        <KpiCard label="Website clicks" value={fmt(totals.websiteClicks)} deltaPct={percentChange(totals.websiteClicks, totalsPrev.websiteClicks)} />
        <KpiCard label="Video views" value={fmt(totals.videoViews)} deltaPct={percentChange(totals.videoViews, totalsPrev.videoViews)} />
      </div>

      {!totals.hasData && (
        <div className="empty-state" style={{ marginBottom: 20 }}>
          No snapshots captured yet for {PLATFORMS.find((p) => p.key === active)?.label} — click &ldquo;Capture snapshot now&rdquo; above, or
          wait for tomorrow&apos;s scheduled run.
        </div>
      )}

      <div className="panel">
        <h2>Reach over time</h2>
        <MetricGrowthChart data={series} title="Reach" />
      </div>

      <div className="panel">
        <h2>Content</h2>
        <TopContentList items={content} />
      </div>
    </>
  );
}
