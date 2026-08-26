export type AccountInsightSnapshot = {
  reach?: number;
  impressions?: number;
  engagement?: number;
  engagementRate?: number;
  followers?: number;
  followerGrowth?: number;
  profileVisits?: number;
  websiteClicks?: number;
  videoViews?: number;
  raw: Record<string, unknown>;
};

export type ContentInsight = {
  externalId: string;
  reach?: number;
  impressions?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  videoViews?: number;
  raw: Record<string, unknown>;
};

/**
 * Pulls a numeric value out of an Insights API metric row by name. A metric
 * fetched with the default (time-series) response shape carries its value
 * in `values[].value`; one fetched with `metric_type=total_value` (required
 * for several account-level "day"-period metrics) carries it in
 * `total_value.value` instead — a different shape for the same kind of
 * number, so both are checked here rather than in every caller.
 */
export function metricValue(
  data: { name: string; values?: { value: unknown }[]; total_value?: { value: unknown } }[],
  name: string
): number | undefined {
  const row = data.find((d) => d.name === name);
  if (!row) return undefined;
  const v = row.total_value?.value ?? row.values?.[row.values.length - 1]?.value;
  return typeof v === "number" ? v : undefined;
}
