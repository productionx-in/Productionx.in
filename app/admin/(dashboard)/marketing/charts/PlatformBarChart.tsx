"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CHART_COLORS, PLATFORM_COLOR, tooltipStyle, axisTickStyle } from "./chartTheme";

export type ComparisonRow = { metric: string; facebook: number; instagram: number };

export function PlatformBarChart({ data }: { data: ComparisonRow[] }) {
  const hasData = data.some((d) => d.facebook > 0 || d.instagram > 0);
  if (!hasData) {
    return <div className="empty-state">No comparable data yet — appears once both platforms have at least one snapshot.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
        <XAxis dataKey="metric" tick={axisTickStyle} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: CHART_COLORS.surface2 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.ash }} />
        <Bar dataKey="facebook" name="Facebook" fill={PLATFORM_COLOR.facebook} radius={[4, 4, 0, 0]} />
        <Bar dataKey="instagram" name="Instagram" fill={PLATFORM_COLOR.instagram} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
