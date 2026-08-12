/**
 * Pulls the latin woff2 files Next.js self-hosts at build time and returns them
 * as an @font-face block with the bytes inlined.
 *
 * Embedding rather than linking is what lets every generated SVG render the
 * same in a browser, in Illustrator, and at a print bureau — and it means the
 * brand files have no network dependency at all.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function latinWoff2(family, weight, style = "normal") {
  const cssDir = path.join(ROOT, ".next", "static", "css");
  let css = "";
  for (const f of readdirSync(cssDir)) css += readFileSync(path.join(cssDir, f), "utf8");
  for (const m of css.matchAll(/@font-face\{([^}]*)\}/g)) {
    const blk = m[1];
    if (!blk.includes(family)) continue;
    if (!blk.includes(`font-weight:${weight}`)) continue;
    if (!blk.includes(`font-style:${style}`)) continue;
    const src = /url\(([^)]*)\)/.exec(blk);
    if (!src) continue;
    const name = path.basename(src[1]);
    // ".p." is the primary (latin) subset; the others are cyrillic/greek/vietnamese.
    if (!name.includes(".p.")) continue;
    const p = path.join(ROOT, ".next", "static", "media", name);
    if (existsSync(p)) return readFileSync(p);
  }
  throw new Error(`no latin woff2 for ${family} ${weight} ${style} — run \`npm run build\` first`);
}

const face = (name, weight, bytes, style = "normal") =>
  `@font-face{font-family:'${name}';font-style:${style};font-weight:${weight};` +
  `src:url(data:font/woff2;base64,${bytes.toString("base64")}) format('woff2')}`;

/** PXSans (Inter), PXMono (JetBrains Mono), PXDisplay (Instrument Serif). */
export const FONT_CSS =
  face("PXSans", 400, latinWoff2("Inter", "400")) +
  face("PXMono", 500, latinWoff2("JetBrains Mono", "500")) +
  face("PXDisplay", 400, latinWoff2("Instrument Serif", "400"));
