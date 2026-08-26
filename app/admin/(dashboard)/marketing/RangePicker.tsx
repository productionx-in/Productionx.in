import Link from "next/link";
import type { ResolvedRange } from "./dateRange";

const PRESETS: { key: string; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
];

export function RangePicker({ basePath, active }: { basePath: string; active: ResolvedRange }) {
  return (
    <div className="toolbar" style={{ marginBottom: 20, alignItems: "center" }}>
      {PRESETS.map((p) => (
        <Link
          key={p.key}
          href={`${basePath}?range=${p.key}`}
          className={`btn ${active.key === p.key ? "" : "btn--ghost"}`}
        >
          {p.label}
        </Link>
      ))}
      <form action={basePath} method="get" style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="hidden" name="range" value="custom" />
        <input type="date" name="from" defaultValue={active.key === "custom" ? active.start : undefined} required />
        <span className="note">to</span>
        <input type="date" name="to" defaultValue={active.key === "custom" ? active.end : undefined} required />
        <button className={`btn ${active.key === "custom" ? "" : "btn--ghost"}`} type="submit">
          Custom
        </button>
      </form>
      <span className="note" style={{ marginLeft: "auto" }}>{active.label}</span>
    </div>
  );
}
