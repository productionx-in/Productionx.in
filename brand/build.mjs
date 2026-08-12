/**
 * Generates every logo lockup and the business-card artwork from one definition.
 *
 * The mark's geometry was traced from public/logo.png rather than redrawn by
 * eye, so these files carry the original silhouette exactly — only the colour
 * has changed. Text is measured in a real browser before the canvas is sized,
 * because a guessed viewBox clips the wordmark and a guessed rule never lines
 * up with the letters above it.
 *
 * Fonts are embedded as base64 woff2, so each SVG renders identically in a
 * browser, in Illustrator, or at a print bureau with nothing installed.
 *
 *   node brand/build.mjs
 */

import { chromium } from "../node_modules/playwright-core/index.mjs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FONT_CSS } from "./fonts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = HERE;

/* --- Palette -------------------------------------------------------------- */
const INK = "#0B0A0C";
const BONE = "#F4F1EC";
const ASH = "#A9A39B";
const EMBER = "#FF5C29";

/* --- Mark geometry, traced from the original artwork ---------------------- */
const CHEVRON = "M16.2 16.8 H38.4 L61.8 53.6 L37.1 90.8 H8.7 L32.7 47.9 Z";
const WEDGE = "M57.0 3.5 H93.1 L65.4 47.6 L48.8 21.4 Z";
const TRIANGLE = "M66.2 59.8 L80.0 82.0 H51.7 Z";
const MARK = 100;

/* --- Measurement ---------------------------------------------------------- */
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setContent(`<style>${FONT_CSS}</style><body></body>`);
await page.evaluate(() => document.fonts.ready);

/** Advance width of a string, excluding the trailing letter-space. */
async function measure(text, family, size, tracking) {
  return page.evaluate(
    ({ text, family, size, tracking }) => {
      const s = document.createElement("span");
      s.style.cssText = `position:absolute;white-space:pre;font-family:${family};font-size:${size}px;letter-spacing:${tracking}px`;
      s.textContent = text;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width - tracking;
      s.remove();
      return w;
    },
    { text, family, size, tracking }
  );
}

/* --- Builders ------------------------------------------------------------- */
const mark = (chev, accent, x = 0, y = 0, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  `<path fill="${chev}" d="${CHEVRON}"/>` +
  `<path fill="${accent}" d="${WEDGE}"/>` +
  `<path fill="${accent}" d="${TRIANGLE}"/></g>`;

/**
 * Only files that actually set type carry the embedded fonts. The icon-only
 * marks have no text at all, and shipping 127 kB of woff2 inside a favicon is
 * a real cost paid on every page load for nothing.
 */
const svg = (w, h, body, { bg, fonts = true } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}">` +
  (fonts ? `<style>${FONT_CSS}</style>` : "") +
  (bg ? `<rect width="${r(w)}" height="${r(h)}" fill="${bg}"/>` : "") +
  `${body}</svg>`;

const r = (n) => Math.round(n * 100) / 100;

/**
 * The lockup, built from measurements rather than assumptions.
 *
 * The rule is set to the exact width of PRODUCTION X, and CREATIVE STUDIO is
 * tracked until it spans that same width — which is what makes the block read
 * as one object instead of three stacked pieces.
 */
async function lockup({ markH, ink, accent, align }) {
  const sizeA = markH * 0.215;
  const trackA = sizeA * 0.2;
  const wA = await measure("PRODUCTION X", "PXSans", sizeA, trackA);

  const sizeB = markH * 0.112;
  // Solve the tracking that makes the sub-label span the rule exactly.
  const bare = await measure("CREATIVE STUDIO", "PXSans", sizeB, 0);
  const trackB = (wA - bare) / ("CREATIVE STUDIO".length - 1);
  const wB = await measure("CREATIVE STUDIO", "PXSans", sizeB, trackB);

  return { sizeA, trackA, wA, sizeB, trackB, wB, align, ink, accent };
}

function wordmarkSvg(L, x, baseline) {
  const anchor = L.align === "middle" ? "middle" : "start";
  const ruleX = L.align === "middle" ? x - L.wA / 2 : x;
  const ruleY = baseline + L.sizeA * 0.42;
  return (
    `<text x="${r(x)}" y="${r(baseline)}" text-anchor="${anchor}" fill="${L.ink}" font-family="PXSans" ` +
    `font-size="${r(L.sizeA)}" letter-spacing="${r(L.trackA)}">PRODUCTION X</text>` +
    `<rect x="${r(ruleX)}" y="${r(ruleY)}" width="${r(L.wA)}" height="${r(L.sizeA * 0.045)}" fill="${L.accent}" opacity="0.8"/>` +
    `<text x="${r(x)}" y="${r(ruleY + L.sizeB * 1.95)}" text-anchor="${anchor}" fill="${L.accent}" font-family="PXSans" ` +
    `font-size="${r(L.sizeB)}" letter-spacing="${r(L.trackB)}">CREATIVE STUDIO</text>`
  );
}

/* --- The logo matrix -------------------------------------------------------
 * Three shapes x two themes x transparent or filled.
 *
 * The naming says where a file is meant to GO, not what colour it is, because
 * "logo-light" is the single most misread filename in any brand folder — half
 * the world reads it as "the light-coloured logo" and puts white on white.
 *
 *   -on-dark    artwork in Bone. Place it on a dark surface.
 *   -on-light   artwork in Ink.  Place it on a light surface.
 *   -filled     the matching background is baked in, for surfaces you do not
 *               control — a partner's deck, a marketplace listing, a WhatsApp
 *               profile that shows white behind a transparent PNG.
 * -------------------------------------------------------------------------- */
const THEMES = [
  { key: "on-dark", ink: BONE, ground: INK },
  { key: "on-light", ink: INK, ground: BONE },
];

async function buildLogos() {
  const written = [];
  const put = (name, data) => {
    writeFileSync(path.join(OUT, `${name}.svg`), data);
    written.push(name);
  };

  for (const t of THEMES) {
    /* Horizontal — the default. Mark and wordmark on one line. */
    {
      const H = 100;
      const gap = H * 0.38;
      const L = await lockup({ markH: H, ink: t.ink, accent: EMBER, align: "start" });
      const x = MARK + gap;
      const pad = H * 0.22;
      const w = x + L.wA + L.sizeA * 0.16;
      const body = mark(t.ink, EMBER) + wordmarkSvg(L, x, H * 0.5);
      put(`px-horizontal-${t.key}`, svg(w, H, body));
      // Filled needs breathing room, or the artwork runs into the trim.
      put(
        `px-horizontal-${t.key}-filled`,
        svg(w + pad * 2, H + pad * 2, `<g transform="translate(${r(pad)} ${r(pad)})">${body}</g>`, { bg: t.ground })
      );
    }

    /* Square — social posts, thumbnails, anywhere the frame is 1:1. */
    {
      const S = 1000;
      const mh = 300;
      const s = mh / MARK;
      const L = await lockup({ markH: 250, ink: t.ink, accent: EMBER, align: "middle" });
      const blockH = mh + 74 + L.sizeA * 0.42 + L.sizeB * 2.6;
      const top = (S - blockH) / 2;
      const body =
        mark(t.ink, EMBER, S / 2 - (MARK * s) / 2, top, s) + wordmarkSvg(L, S / 2, top + mh + 74);
      put(`px-square-${t.key}`, svg(S, S, body));
      put(`px-square-${t.key}-filled`, svg(S, S, body, { bg: t.ground }));
    }

    /* Mark alone — avatars and app icons. Padded so a circular crop, which is
       what most platforms apply, never clips the artwork. */
    {
      const S = 1000;
      const ms = 640;
      const s = ms / MARK;
      const off = (S - ms) / 2;
      const body = mark(t.ink, EMBER, off, off, s);
      put(`px-mark-${t.key}`, svg(S, S, body, { fonts: false }));
      put(`px-mark-${t.key}-filled`, svg(S, S, body, { bg: t.ground, fonts: false }));
    }
  }

  /* One colour, for embroidery, foil, etching and single-ink print. */
  put("px-mark-mono-bone", svg(100, 100, mark(BONE, BONE), { fonts: false }));
  put("px-mark-mono-ink", svg(100, 100, mark(INK, INK), { fonts: false }));

  /* The favicon and the in-app mark, tight to the artwork with no padding. */
  writeFileSync(path.join(OUT, "mark.svg"), svg(100, 100, mark(BONE, EMBER), { fonts: false }));

  console.log(`logos written (${written.length} + mark.svg)`);
}

/* --- Business card --------------------------------------------------------- */
// 90 x 54 mm — the Indian standard — plus 3 mm bleed on every edge. Authored in
// millimetres so it can go straight to a printer without rescaling.
const CARD_W = 90, CARD_H = 54, BLEED = 3, SAFE = 5;
const FW = CARD_W + BLEED * 2, FH = CARD_H + BLEED * 2;

function brackets(inset, len, colour, opacity) {
  const o = inset;
  return [
    [o, o, 1, 1], [FW - o, o, -1, 1], [o, FH - o, 1, -1], [FW - o, FH - o, -1, -1],
  ]
    .map(([bx, by, dx, dy]) =>
      `<path d="M${r(bx)} ${r(by + dy * len)} V${r(by)} H${r(bx + dx * len)}" stroke="${colour}" ` +
      `stroke-opacity="${opacity}" stroke-width="0.3" fill="none"/>`)
    .join("");
}

async function cardFront() {
  const markH = 15;
  const s = markH / MARK;
  const cx = FW / 2;
  const L = await lockup({ markH: 19.5, ink: BONE, accent: EMBER, align: "middle" });
  const top = FH / 2 - markH - 3.2;
  const body =
    `<rect width="${FW}" height="${FH}" fill="${INK}"/>` +
    mark(BONE, EMBER, cx - (MARK * s) / 2, top, s) +
    wordmarkSvg(L, cx, FH / 2 + 5.4) +
    brackets(BLEED + SAFE - 1.5, 4, BONE, 0.22);
  return svg(FW, FH, body);
}

const GLYPH = {
  phone: '<path d="M1.1 1.5c0 2 1.6 3.6 3.6 3.6l.5-1-1.3-.6-.5.5c-.6-.3-1.1-.8-1.4-1.4l.5-.5-.6-1.3z"/>',
  globe: '<circle cx="2.8" cy="2.8" r="2.3"/><path d="M.5 2.8h4.6M2.8.5c1.2 1.3 1.2 3.3 0 4.6M2.8.5C1.6 1.8 1.6 3.8 2.8 5.1"/>',
  mail: '<rect x="0.5" y="1" width="4.6" height="3.6" rx="0.5"/><path d="M0.7 1.4l2.1 1.7 2.1-1.7"/>',
  pin: '<path d="M2.8.6a2 2 0 00-2 2c0 1.5 2 3.4 2 3.4s2-1.9 2-3.4a2 2 0 00-2-2z"/><circle cx="2.8" cy="2.6" r="0.7"/>',
};
const glyph = (x, y, k) =>
  `<g transform="translate(${r(x)} ${r(y)})" fill="none" stroke="${EMBER}" stroke-width="0.26" ` +
  `stroke-linecap="round" stroke-linejoin="round">${GLYPH[k]}</g>`;

async function cardBack() {
  const left = BLEED + SAFE + 1;
  const qrSize = 25;
  const qx = FW - BLEED - SAFE - qrSize;
  const qy = FH / 2 - qrSize / 2 - 2;

  const L = await lockup({ markH: 17.5, ink: BONE, accent: EMBER, align: "start" });
  const body = [`<rect width="${FW}" height="${FH}" fill="${INK}"/>`, wordmarkSvg(L, left, BLEED + 12.5)];

  const rows = [
    ["+91 93919 26846", "phone"],
    ["www.productionx.in", "globe"],
    ["info@productionx.in", "mail"],
    ["Kondapur, Hyderabad", "pin"],
  ];
  let y = BLEED + 27.5;
  for (const [text, kind] of rows) {
    body.push(glyph(left, y - 1.95, kind));
    body.push(
      `<text x="${r(left + 7)}" y="${r(y)}" fill="${BONE}" font-family="PXMono" font-size="2.45">${text}</text>`
    );
    y += 6.3;
  }

  body.push(`<rect x="${r(qx - 6)}" y="${BLEED + 8}" width="0.26" height="${CARD_H - 16}" fill="${EMBER}" opacity="0.45"/>`);

  const qrFile = path.join(OUT, "qr.png");
  if (existsSync(qrFile)) {
    const uri = "data:image/png;base64," + readFileSync(qrFile).toString("base64");
    body.push(`<rect x="${r(qx - 1.4)}" y="${r(qy - 1.4)}" width="${qrSize + 2.8}" height="${qrSize + 2.8}" rx="1.6" fill="${BONE}"/>`);
    body.push(`<image x="${r(qx)}" y="${r(qy)}" width="${qrSize}" height="${qrSize}" href="${uri}"/>`);
  } else {
    // A QR that does not scan is worse than no QR, and this environment has no
    // way to verify one decodes. The slot is drawn to final size and position —
    // drop the studio's existing code in as brand/qr.png and re-run.
    body.push(
      `<rect x="${r(qx)}" y="${r(qy)}" width="${qrSize}" height="${qrSize}" rx="1.4" fill="none" ` +
      `stroke="${EMBER}" stroke-width="0.3" stroke-dasharray="1.6 1.2"/>`,
      `<text x="${r(qx + qrSize / 2)}" y="${r(qy + qrSize / 2 - 0.6)}" text-anchor="middle" fill="${ASH}" ` +
      `font-family="PXMono" font-size="1.9">QR SLOT</text>`,
      `<text x="${r(qx + qrSize / 2)}" y="${r(qy + qrSize / 2 + 2.6)}" text-anchor="middle" fill="${ASH}" ` +
      `font-family="PXMono" font-size="1.5">brand/qr.png</text>`
    );
  }
  body.push(
    `<text x="${r(qx + qrSize / 2)}" y="${r(qy + qrSize + 4.4)}" text-anchor="middle" fill="${EMBER}" ` +
    `font-family="PXMono" font-size="1.85" letter-spacing="0.34">SCAN TO VISIT</text>`
  );
  return svg(FW, FH, body.join(""));
}

await buildLogos();
writeFileSync(path.join(OUT, "card-front.svg"), await cardFront());
writeFileSync(path.join(OUT, "card-back.svg"), await cardBack());
console.log("cards written —", existsSync(path.join(OUT, "qr.png")) ? "QR embedded" : "QR slot left empty");

await browser.close();
