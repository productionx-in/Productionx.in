"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CHART_COLORS, tooltipStyle } from "./chartTheme";
import type { EngagementBreakdown } from "../data";

const SLICE_COLORS = [CHART_COLORS.ember, CHART_COLORS.mint, "#d6c37a", CHART_COLORS.ash];

export function EngagementDonut({ data }: { data: EngagementBreakdown | null }) {
  if (!data) {
    return <div className="empty-state">No content engagement recorded for this period yet.</div>;
  }

  const rows = [
    { name: "Likes", value: data.likes },
    { name: "Comments", value: data.comments },
    { name: "Shares", value: data.shares },
    { name: "Saves", value: data.saves },
  ].filter((r) => r.value > 0);

  if (rows.length === 0) {
    return <div className="empty-state">No content engagement recorded for this period yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {rows.map((_, i) => (
            <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} stroke={CHART_COLORS.surface} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.ash }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
