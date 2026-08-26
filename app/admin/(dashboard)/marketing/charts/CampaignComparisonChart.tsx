"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS, tooltipStyle, axisTickStyle } from "./chartTheme";
import type { CampaignPerformance } from "../data";

const BAR_COLORS = [CHART_COLORS.ember, CHART_COLORS.mint, "#d6c37a", CHART_COLORS.ash, CHART_COLORS.slate];

export function CampaignComparisonChart({ campaigns }: { campaigns: CampaignPerformance[] }) {
  if (campaigns.length === 0) {
    return <div className="empty-state">No campaign spend recorded for this period yet.</div>;
  }

  const data = [...campaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8)
    .map((c) => ({ name: c.name.length > 18 ? `${c.name.slice(0, 18)}…` : c.name, spend: c.spend }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.line} horizontal={false} />
        <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
        <YAxis type="category" dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} width={130} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: CHART_COLORS.surface2 }}
          formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Spend"]}
        />
        <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
