/**
 * Shared low-level fetch helper for the new Insights modules only —
 * app/lib/social/facebook.ts and instagram.ts (the existing, working
 * content adapters) each keep their own self-contained copy of this same
 * pattern and are not touched or made to depend on this file.
 */

export class MetaInsightsError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function metaGet(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) throw new MetaInsightsError("META_PAGE_ACCESS_TOKEN is missing from the environment.", 503);

  const url = new URL(`https://graph.facebook.com/v21.0/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", token);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new MetaInsightsError("Could not reach the Meta Graph API.", 502);
  }

  const body = (await res.json().catch(() => null)) as
    | { error?: { message?: string; code?: number; error_user_msg?: string } }
    | Record<string, unknown>
    | null;

  if (!res.ok || (body as { error?: unknown })?.error) {
    const err = (body as { error?: { message?: string; code?: number } })?.error;
    throw new MetaInsightsError(err?.message || "The Meta Graph API returned an error.", res.status >= 400 ? res.status : 502, err?.code);
  }

  return (body ?? {}) as Record<string, unknown>;
}

/**
 * Insights metric names get deprecated/renamed by Meta more often than the
 * rest of the Graph API, and Meta's rejection messages for an invalid or
 * misconfigured metric don't follow one consistent, parseable format (a
 * generic "must be a valid insights metric" for some, a "should be
 * specified with parameter metric_type=..." for others). Rather than try to
 * parse the message, this requests each candidate metric individually and
 * keeps whatever Meta actually accepts — one bad or misconfigured metric
 * just doesn't appear in the result, instead of failing the whole snapshot.
 */
export async function fetchMetricsWithFallback(
  path: string,
  candidateMetrics: string[],
  extraParams: Record<string, string> = {}
): Promise<{ data: { name: string; values?: { value: unknown }[] }[] }> {
  const results: { name: string; values?: { value: unknown }[] }[] = [];

  for (const metric of candidateMetrics) {
    try {
      const body = await metaGet(path, { metric, ...extraParams });
      const rows = (body as { data?: typeof results }).data ?? [];
      results.push(...rows);
    } catch {
      // Not valid for this account/media type/period combination — skip it.
    }
  }

  return { data: results };
}
