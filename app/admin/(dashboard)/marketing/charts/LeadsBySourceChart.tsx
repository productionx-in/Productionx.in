"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS, tooltipStyle, axisTickStyle } from "./chartTheme";

const BAR_COLORS = [CHART_COLORS.ember, CHART_COLORS.mint, "#d6c37a", CHART_COLORS.ash, CHART_COLORS.slate];

export function LeadsBySourceChart({ data }: { data: { source: string; count: number }[] }) {
  if (data.length === 0) {
    return <div className="empty-state">No leads recorded in this period.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.line} horizontal={false} />
        <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="source" tick={axisTickStyle} axisLine={false} tickLine={false} width={90} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: CHART_COLORS.surface2 }} />
        <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
