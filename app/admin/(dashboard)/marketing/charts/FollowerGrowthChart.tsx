"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CHART_COLORS, PLATFORM_COLOR, tooltipStyle, axisTickStyle } from "./chartTheme";

export type FollowerPoint = { date: string; facebook: number | null; instagram: number | null };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDateLabel(d: React.ReactNode) {
  return typeof d === "string" ? formatDate(d) : "";
}

export function FollowerGrowthChart({ data }: { data: FollowerPoint[] }) {
  const hasData = data.some((d) => d.facebook != null || d.instagram != null);
  if (data.length < 2 || !hasData) {
    return <div className="empty-state">Follower history builds up one snapshot at a time — check back after a few days.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={axisTickStyle} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDateLabel} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.ash }} />
        <Line type="monotone" dataKey="facebook" name="Facebook" stroke={PLATFORM_COLOR.facebook} strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="instagram" name="Instagram" stroke={PLATFORM_COLOR.instagram} strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
