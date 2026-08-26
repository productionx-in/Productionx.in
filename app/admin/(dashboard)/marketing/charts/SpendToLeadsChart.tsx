"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CHART_COLORS, tooltipStyle, axisTickStyle } from "./chartTheme";
import type { PaidDailyPoint } from "../data";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function formatDateLabel(d: React.ReactNode) {
  return typeof d === "string" ? formatDate(d) : "";
}

/** Spend (bars) against cost-per-lead (line) over time — the one chart that
 *  answers "are we paying more per lead as spend changes." CPL is only
 *  plotted for days that actually had at least one lead; days with zero
 *  leads show a spend bar and no CPL point, not a fabricated zero or a
 *  divide-by-zero spike. */
export function SpendToLeadsChart({ data }: { data: PaidDailyPoint[] }) {
  if (data.length < 2) {
    return <div className="empty-state">Not enough history yet to chart spend against cost per lead.</div>;
  }

  const chartData = data.map((d) => ({
    date: d.date,
    spend: d.spend,
    leads: d.leads,
    cpl: d.leads > 0 ? Number((d.spend / d.leads).toFixed(2)) : undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={axisTickStyle} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
        <YAxis yAxisId="spend" tick={axisTickStyle} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `₹${v}`} />
        <YAxis yAxisId="cpl" orientation="right" tick={axisTickStyle} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `₹${v}`} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDateLabel} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.ash }} />
        <Bar yAxisId="spend" dataKey="spend" name="Spend" fill={CHART_COLORS.mint} radius={[4, 4, 0, 0]} />
        <Line yAxisId="cpl" type="monotone" dataKey="cpl" name="Cost per lead" stroke={CHART_COLORS.ember} strokeWidth={2} dot connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
