# Productionx.in

Official site for **Production X Creative** — a cinematic content studio in Hyderabad, serving automotive, hospitality, fashion and lifestyle brands across Hyderabad, Vizag and all India.

Static HTML/CSS/JS, hosted on GitHub Pages at [productionx.in](https://productionx.in) (see `CNAME`).

## Files

- `index.html`, `style.css`, `script.js` — the live site
- `index_backup.html` — prior version, kept for rollback
- `brief.html` — internal creative brief, not part of the deployed site
- `CNAME` — custom domain binding for GitHub Pages
- `DEPLOYMENT_GUIDE.md` — full step-by-step GitHub Pages + GoDaddy DNS setup

## Booking form

No backend — the contact form collects details client-side and opens WhatsApp with a pre-filled message (see `script.js`, `wa.me/919391926846`).

## Deploy

Push to `main`. GitHub Pages rebuilds from the branch root automatically (1–5 min). Full setup steps, including DNS, are in [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md).
