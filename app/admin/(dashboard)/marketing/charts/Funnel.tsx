export type FunnelStage = { label: string; value: number | undefined };

/**
 * A clean step funnel, not a Recharts FunnelChart — bar width proportional
 * to each stage's share of the first stage, with the conversion rate to the
 * next stage called out. Simpler to read at a glance than a generic funnel
 * chart component, and matches the rest of the dashboard's plain-CSS bars
 * (the leads-by-source-style visuals) rather than introducing a different
 * charting idiom just for this one visualization.
 */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const known = stages.filter((s) => s.value !== undefined) as { label: string; value: number }[];
  if (known.length === 0) {
    return <div className="empty-state">No funnel data yet for this period.</div>;
  }

  const max = Math.max(...known.map((s) => s.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {stages.map((stage, i) => {
        const prev = stages[i - 1];
        const conversion =
          prev?.value !== undefined && prev.value > 0 && stage.value !== undefined
            ? Math.round((stage.value / prev.value) * 100)
            : null;
        const widthPct = stage.value !== undefined ? Math.max((stage.value / max) * 100, 4) : 0;

        return (
          <div key={stage.label}>
            {conversion !== null && (
              <div className="note" style={{ marginBottom: 4, marginLeft: 4 }}>
                ↓ {conversion}% converted
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 100, fontSize: 13, color: "var(--bone)" }}>{stage.label}</span>
              <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 6, height: 26, position: "relative" }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    borderRadius: 6,
                    background: "linear-gradient(90deg, var(--ember), var(--mint))",
                    opacity: stage.value === undefined ? 0.15 : 0.85,
                  }}
                />
              </div>
              <span style={{ width: 70, textAlign: "right", fontSize: 13.5, fontWeight: 600, color: "var(--bone)" }}>
                {stage.value !== undefined ? stage.value.toLocaleString("en-IN") : "—"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
