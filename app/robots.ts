import type { MetadataRoute } from "next";

/**
 * Everything is allowed, including the AI crawlers — stated explicitly rather
 * than left to the wildcard.
 *
 * The distinction worth knowing: GPTBot, ClaudeBot, PerplexityBot and
 * Google-Extended are the bots that let those assistants *cite* the studio when
 * someone asks them for a content studio in Hyderabad. Blocking them does not
 * protect anything here; it only removes the site from the answer. Naming them
 * means a future edit to this file is a deliberate decision rather than an
 * accident of a broad rule.
 */
export default function robots(): MetadataRoute.Robots {
  const crawlers = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-User",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "meta-externalagent",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...crawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: "https://productionx.in/sitemap.xml",
    host: "https://productionx.in",
  };
}
