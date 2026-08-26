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

/** Pulls a numeric value out of an Insights API metric row by name. */
export function metricValue(
  data: { name: string; values?: { value: unknown }[] }[],
  name: string
): number | undefined {
  const row = data.find((d) => d.name === name);
  const v = row?.values?.[row.values.length - 1]?.value;
  return typeof v === "number" ? v : undefined;
}
