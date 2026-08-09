# Productionx.in

Official site for **Production X Creative** — a cinematic content studio in Hyderabad, serving automotive, hospitality, fashion and lifestyle brands across Hyderabad, Vizag and all India.

Next.js 15 (App Router) + TypeScript, deployed on Vercel at [productionx.in](https://productionx.in).

## Stack

- Next.js 15 / React 19 / TypeScript
- GSAP + ScrollTrigger for scroll-driven motion
- `next/image` for optimized portfolio/hero imagery
- `next/font` for Cormorant Garamond + Montserrat

## Structure

- `app/layout.tsx` — fonts, metadata (title/description/OG/Twitter), root shell
- `app/page.tsx` — renders the home page
- `app/components/Site.tsx` — the full page: nav, hero, ticker, services, portfolio, case study, about, process, booking, footer, video modal
- `app/api/book/route.ts` — booking form submission endpoint
- `app/globals.css` — design tokens (color, type) and all page styling
- `legacy/` — retired GitHub Pages artifacts (`CNAME`, `DEPLOYMENT_GUIDE.md`, `brief.html`) kept for reference only, not part of the build

## Booking form

Submits to `/api/book`, which validates and logs the lead server-side (so a submission is never lost even if a visitor's WhatsApp client fails to open). The WhatsApp deep link remains as a secondary contact channel throughout the page.

To wire up real email delivery, add a `RESEND_API_KEY` (or similar) environment variable in the Vercel project and extend `app/api/book/route.ts`.

## Local development

```bash
npm install
npm run dev
```

## Deploy

Connect this repo to a Vercel project (framework preset: Next.js) and set the production domain to `productionx.in` in Vercel's Domains settings. Every push to `main` deploys to production; other branches get preview deployments.
