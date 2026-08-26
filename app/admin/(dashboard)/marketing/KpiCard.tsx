export function KpiCard({
  label,
  value,
  deltaPct,
  note,
}: {
  label: string;
  value: string;
  deltaPct?: number;
  note?: string;
}) {
  const deltaColor = deltaPct === undefined ? "var(--slate)" : deltaPct >= 0 ? "#7fe08f" : "var(--ember)";
  const deltaLabel =
    deltaPct === undefined ? "vs previous period: —" : `${deltaPct >= 0 ? "▲" : "▼"} ${Math.abs(deltaPct)}% vs previous period`;

  return (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      <div style={{ marginTop: 6, fontSize: 12, color: deltaColor }}>{deltaLabel}</div>
      {note && <div className="note" style={{ marginTop: 2 }}>{note}</div>}
    </div>
  );
}
