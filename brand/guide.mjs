/**
 * Renders the two-page brand guide (PDF + PNG preview) from the same palette
 * and the same SVG masters as everything else, so the guide can never describe
 * a version of the identity that no longer exists.
 *
 *   node brand/guide.mjs   (run after build.mjs)
 */

import { chromium } from "../node_modules/playwright-core/index.mjs";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FONT_CSS } from "./fonts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const uri = (f) => "data:image/svg+xml;base64," + readFileSync(path.join(HERE, f)).toString("base64");

const INK = "#0B0A0C", SURFACE = "#141216", BONE = "#F4F1EC";
const ASH = "#A9A39B", SLATE = "#8B8592", EMBER = "#FF5C29", MINT = "#7FE0CF";

const SWATCHES = [
  ["Ink", INK, "Primary ground", "—"],
  ["Surface", SURFACE, "Raised panels", "—"],
  ["Bone", BONE, "Primary text · logo chevron", "17.5:1"],
  ["Ember", EMBER, "THE accent · logo · CTAs", "6.4:1"],
  ["Mint", MINT, "Digital & AI only", "12.7:1"],
  ["Ash", ASH, "Secondary text", "7.9:1"],
  ["Slate", SLATE, "Labels & metadata", "5.0:1"],
];

const swatch = ([name, hex, role, ratio]) => `
  <div style="display:flex;gap:13px;align-items:center;padding:6px 0;border-top:1px solid rgba(244,241,236,.1)">
    <div style="width:38px;height:38px;border-radius:5px;background:${hex};
                border:1px solid rgba(244,241,236,.16);flex:none"></div>
    <div style="flex:1">
      <div style="font-family:PXSans;font-size:12px;color:${BONE}">${name}</div>
      <div style="font-family:PXMono;font-size:9px;color:${SLATE};letter-spacing:.08em;margin-top:2px">${role}</div>
    </div>
    <div style="text-align:right">
      <div style="font-family:PXMono;font-size:11px;color:${BONE}">${hex}</div>
      <div style="font-family:PXMono;font-size:8.5px;color:${SLATE};margin-top:2px">${ratio} on ink</div>
    </div>
  </div>`;

const rule = (t) => `<li style="margin-bottom:6px">${t}</li>`;

const page = (n, title, body) => `
<section style="width:210mm;height:297mm;background:${INK};box-sizing:border-box;padding:18mm;
                position:relative;page-break-after:always;overflow:hidden">
  <div style="display:flex;justify-content:space-between;align-items:baseline;
              border-bottom:1px solid rgba(244,241,236,.14);padding-bottom:8mm;margin-bottom:10mm">
    <img src="${uri("logo-horizontal.svg")}" style="height:11mm">
    <div style="font-family:PXMono;font-size:8.5px;letter-spacing:.2em;color:${SLATE};text-transform:uppercase">
      ${title} · ${n}
    </div>
  </div>
  ${body}
  <div style="position:absolute;left:18mm;right:18mm;bottom:12mm;display:flex;justify-content:space-between;
              font-family:PXMono;font-size:8px;letter-spacing:.16em;color:${SLATE};text-transform:uppercase">
    <span>ProductionX · Brand guide</span><span>productionx.in</span>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:3mm;background:${EMBER}"></div>
</section>`;

const h = (t) => `<h2 style="font-family:PXDisplay,serif;font-weight:400;font-size:26px;color:${BONE};
  margin:0 0 5mm;letter-spacing:-.01em">${t}</h2>`;
const lbl = (t) => `<div style="font-family:PXMono;font-size:8.5px;letter-spacing:.2em;color:${EMBER};
  text-transform:uppercase;margin:0 0 3mm">${t}</div>`;
const note = (t) => `<p style="font-family:PXSans;font-size:11px;line-height:1.65;color:${ASH};
  margin:0 0 5mm;max-width:150mm">${t}</p>`;

const P1 = page(
  "01",
  "Colour & type",
  `
  ${h("The palette")}
  ${note(
    "Seven values. Nothing on the website, in print, on social or on signage uses a colour that is not on this list. " +
    "Contrast ratios are stated so they can be re-checked rather than trusted — every text role clears WCAG AA on ink."
  )}
  <div style="margin-bottom:7mm">${SWATCHES.map(swatch).join("")}
    <div style="border-top:1px solid rgba(244,241,236,.1)"></div>
  </div>

  ${lbl("In print")}
  ${note(
    "Ember and Mint fall outside CMYK gamut and print duller than they look on screen — use a spot colour where the " +
    "budget allows. Ink must be a rich black (60/40/40/100); 0/0/0/100 prints thin and grey. Ember 0/76/88/0, " +
    "nearest spot Pantone Orange 021 C. Mint 45/0/25/0, nearest spot Pantone 3248 C. Both Pantone references are the " +
    "closest match by eye — check a physical guide before a run."
  )}

  ${h("Typography")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8mm">
    <div>
      ${lbl("Display")}
      <div style="font-family:PXDisplay,serif;font-size:34px;color:${BONE};line-height:1.05">Aa</div>
      <div style="font-family:PXMono;font-size:9px;color:${SLATE};margin-top:3mm;line-height:1.6">
        Instrument Serif<br>Headlines only. Never body.</div>
    </div>
    <div>
      ${lbl("Text")}
      <div style="font-family:PXSans;font-size:34px;color:${BONE};line-height:1.05">Aa</div>
      <div style="font-family:PXMono;font-size:9px;color:${SLATE};margin-top:3mm;line-height:1.6">
        Inter<br>Everything a person reads.</div>
    </div>
    <div>
      ${lbl("Metadata")}
      <div style="font-family:PXMono;font-size:30px;color:${BONE};line-height:1.05">Aa</div>
      <div style="font-family:PXMono;font-size:9px;color:${SLATE};margin-top:3mm;line-height:1.6">
        JetBrains Mono<br>Labels, codes, figures. Tabular.</div>
    </div>
  </div>`
);

const P2 = page(
  "02",
  "The mark",
  `
  ${h("Lockups")}
  ${note(
    "The silhouette is unchanged — its geometry was traced from the original artwork, not redrawn. What moved is the " +
    "counterform: gold became Ember, so the mark runs on the same accent as every surface it sits on."
  )}

  <div style="background:${SURFACE};border-radius:6px;padding:9mm;margin-bottom:6mm">
    <img src="${uri("logo-horizontal.svg")}" style="height:16mm;display:block;margin-bottom:8mm">
    <div style="display:flex;gap:12mm;align-items:flex-end">
      <img src="${uri("logo-stacked.svg")}" style="height:24mm">
      <img src="${uri("mark.svg")}" style="height:16mm">
      <img src="${uri("mark-mono-bone.svg")}" style="height:16mm">
      <img src="${uri("mark.svg")}" style="height:8mm">
      <img src="${uri("mark.svg")}" style="height:5mm">
    </div>
  </div>
  <div style="background:${BONE};border-radius:6px;padding:9mm;margin-bottom:8mm;display:flex;
              gap:12mm;align-items:center">
    <img src="${uri("logo-horizontal-light-bg.svg")}" style="height:14mm">
    <img src="${uri("mark-light-bg.svg")}" style="height:14mm">
    <img src="${uri("mark-mono-ink.svg")}" style="height:14mm">
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10mm">
    <div>
      ${lbl("Rules")}
      <ul style="font-family:PXSans;font-size:10.5px;line-height:1.6;color:${ASH};margin:0;padding-left:14px">
        ${rule("Keep the mark's own width clear on every side. Nothing sits inside it.")}
        ${rule("Minimum: 120 px wide on screen, 30 mm in print. Below that use the mark alone — it holds to 16 px.")}
        ${rule("Over photography use the one-colour mark on a scrim. Ember on an unpredictable image is unreadable.")}
        ${rule("The chevron is Bone on dark, Ink on light. Never anything else.")}
      </ul>
    </div>
    <div>
      ${lbl("Never")}
      <ul style="font-family:PXSans;font-size:10.5px;line-height:1.6;color:${ASH};margin:0;padding-left:14px">
        ${rule("Re-space the mark and the wordmark.")}
        ${rule("Add a shadow, gradient, outline or bevel.")}
        ${rule("Set the wordmark in another typeface.")}
        ${rule("Rotate, stretch or recolour the counterform.")}
        ${rule("Reintroduce gold. Run existing stock down; do not reorder.")}
      </ul>
    </div>
  </div>`
);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const p = await browser.newPage();
await p.setContent(
  `<style>${FONT_CSS}@page{size:A4;margin:0}html,body{margin:0;padding:0;background:${INK}}
   section:last-child{page-break-after:auto}</style>${P1}${P2}`
);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
await p.pdf({
  path: path.join(HERE, "brand-guide.pdf"),
  format: "A4",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
});
console.log("pdf brand/brand-guide.pdf (2 pages, A4)");

// A PNG of page one, for previewing without opening the PDF.
const pv = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await pv.setContent(`<style>${FONT_CSS}html,body{margin:0;background:${INK}}
  section{width:794px!important;height:1123px!important;padding:68px!important}</style>${P1}`);
await pv.evaluate(() => document.fonts.ready);
await pv.waitForTimeout(600);
writeFileSync(path.join(HERE, "brand-guide-p1.png"), await pv.screenshot());
console.log("png brand/brand-guide-p1.png");

await browser.close();
