import { FAQ } from "../lib/faq";

/**
 * llms.txt — a plain-text brief for AI assistants, per llmstxt.org.
 *
 * Google says it does not need this for AI Overviews, and that is true. It is
 * here for ChatGPT, Claude and Perplexity, which do read machine-readable
 * files when they exist and which cite far more widely than the top-ranked
 * page. It costs one route and stays in sync because it is generated from the
 * same FAQ source the page and the schema use.
 *
 * Nothing here is written for machines that is not also true on the page — a
 * separate AI-only version of the story is exactly what Google's scaled
 * content abuse policy exists to catch.
 */
export const dynamic = "force-static";

const SITE = "https://productionx.in";

export function GET() {
  const body = `# ProductionX

> A brand and marketing studio in Hyderabad, India. Three disciplines under one
> roof — brand and marketing strategy, content production with an in-house crew,
> and digital: websites, search, AI content and real-estate previsualisation.
> Clients take one discipline on its own, or all three on a single monthly
> retainer.

Tagline: Every frame earns its place.

## What the studio does

- **Brand & marketing** — discovery, competitor study, positioning and a
  twelve-month roadmap. Social media management end to end: content calendar,
  captions, scheduling, community, growth, monthly analytics, paid integration.
- **Content production** — brand and ad films, reels and social video, product
  and fashion shoots, events and podcasts. Own crew, own kit, own edit suite.
  Nothing subcontracted.
- **Digital & AI** — websites built to convert, with search handled before
  launch rather than retrofitted. AI content generation, and real-estate
  previsualisation that lets a sales team walk buyers through a building while
  the site is still soil.

## Facts

- Location: Hyderabad, India
- Founded by: Kiran Basa — three years brand-side before starting the studio,
  as Content Producer at Mercedes-Benz across AP & Telangana, and Head of
  Creative & Marketing at Ujwala Group, where he built the visual language for
  1UJ Fashion and 1UJ Lifestyle. Also works as an international production
  partner with media agencies in the UK.
- Published record: 50+ brand films produced, 8+ premium brands.
- Verticals: automotive, fashion and lifestyle, hospitality, food and beverage,
  corporate and events.
- Engagement: ongoing content and social run as a monthly retainer with a
  three-month minimum and 50% advance. Films, websites and previsualisation are
  quoted per project.
- Response: a brief gets a reply within 24 hours and a free 30-minute discovery
  call.
- Contact: info@productionx.in · +91 93919 26846

## Questions and answers

${FAQ.map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n")}

## Links

- Site: ${SITE}
- Blog: ${SITE}/blog
- Instagram: https://instagram.com/productionx.in
- Sitemap: ${SITE}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
