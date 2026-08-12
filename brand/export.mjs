/**
 * Renders the SVG masters into the raster and print files everything else
 * consumes: favicon, app icon, social card, and a press-ready card PDF.
 *
 *   node brand/export.mjs   (run after brand/build.mjs)
 */

import { chromium } from "../node_modules/playwright-core/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FONT_CSS } from "./fonts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PUB = path.join(ROOT, "public");

const INK = "#0B0A0C";
const BONE = "#F4F1EC";
const EMBER = "#FF5C29";

const uri = (f) => "data:image/svg+xml;base64," + readFileSync(path.join(HERE, f)).toString("base64");

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});

/**
 * Rasterise one SVG at a target width, deriving the height from the artwork's
 * own aspect ratio.
 *
 * Fixing both dimensions was wrong twice over: `max-width` cannot scale an SVG
 * *up* past its intrinsic size, so a 345-unit-wide logo came out 345 px inside
 * a 2400 px canvas; and forcing a ratio the artwork does not have crops it.
 */
function aspect(svgFile) {
  const head = readFileSync(path.join(HERE, svgFile), "utf8").slice(0, 400);
  const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(head);
  if (!m) throw new Error(`no viewBox in ${svgFile}`);
  return { w: parseFloat(m[1]), h: parseFloat(m[2]) };
}

async function png(svgFile, targetW, out, { bg = null, pad = 0 } = {}) {
  const a = aspect(svgFile);
  const innerW = targetW - pad * 2;
  const h = Math.round((innerW * a.h) / a.w) + pad * 2;
  const p = await browser.newPage({ viewport: { width: targetW, height: h } });
  await p.setContent(
    `<body style="margin:0;width:${targetW}px;height:${h}px;background:${bg ?? "transparent"};
      padding:${pad}px;box-sizing:border-box">
      <img src="${uri(svgFile)}" style="width:100%;height:100%;display:block">
    </body>`
  );
  const w = targetW;
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(250);
  const buf = await p.screenshot({ omitBackground: !bg });
  writeFileSync(out, buf);
  await p.close();
  console.log("png", path.relative(ROOT, out), `${w}x${h}`);
  return buf;
}

/**
 * Wraps a 32px PNG in an ICO container. Every browser in use reads PNG-in-ICO,
 * and it keeps the favicon on the same master as everything else rather than
 * leaving the old gold mark behind in a file nobody remembers to update.
 */
function ico(pngBuf, out) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  const dir = Buffer.alloc(16);
  dir.writeUInt8(32, 0); // width
  dir.writeUInt8(32, 1); // height
  dir.writeUInt8(0, 2); // palette
  dir.writeUInt8(0, 3); // reserved
  dir.writeUInt16LE(1, 4); // colour planes
  dir.writeUInt16LE(32, 6); // bits per pixel
  dir.writeUInt32LE(pngBuf.length, 8);
  dir.writeUInt32LE(22, 12); // offset past header + directory
  writeFileSync(out, Buffer.concat([head, dir, pngBuf]));
  console.log("ico", path.relative(ROOT, out));
}

/* --- The logo matrix, rastered ---------------------------------------------
 * A PNG beside every SVG. Plenty of places still refuse an SVG — WhatsApp
 * profiles, older Office, most print shops' web uploaders, several directory
 * listings — and the answer to "just send a PNG" should already be in the
 * folder.
 * -------------------------------------------------------------------------- */
const PNG_DIR = path.join(HERE, "png");
mkdirSync(PNG_DIR, { recursive: true });

for (const theme of ["on-dark", "on-light"]) {
  for (const fill of ["", "-filled"]) {
    // Transparent variants get a little breathing room and keep their alpha;
    // filled ones already carry their own ground and padding.
    const opts = fill ? {} : { pad: 40 };
    await png(`px-horizontal-${theme}${fill}.svg`, 2400, path.join(PNG_DIR, `px-horizontal-${theme}${fill}.png`), opts);
    await png(`px-square-${theme}${fill}.svg`, 1024, path.join(PNG_DIR, `px-square-${theme}${fill}.png`), fill ? {} : { pad: 24 });
    await png(`px-mark-${theme}${fill}.svg`, 1024, path.join(PNG_DIR, `px-mark-${theme}${fill}.png`), {});
  }
}
await png("px-mark-mono-bone.svg", 1024, path.join(PNG_DIR, "px-mark-mono-bone.png"), { pad: 110 });
await png("px-mark-mono-ink.svg", 1024, path.join(PNG_DIR, "px-mark-mono-ink.png"), { pad: 110 });

/* --- Web icons -------------------------------------------------------------- */
await png("mark.svg", 512, path.join(PUB, "logo.png"), { pad: 48 });

// The favicon needs a solid ground: the mark is bone-on-nothing, which
// disappears against a light browser chrome.
const fav = await png("mark.svg", 32, path.join(HERE, "favicon-32.png"), { bg: INK, pad: 3 });
ico(fav, path.join(PUB, "favicon.ico"));
await png("mark.svg", 180, path.join(PUB, "apple-touch-icon.png"), { bg: INK, pad: 22 });

/* --- Business card, at 300 dpi and as a press-ready PDF -------------------- */
// 96 x 60 mm including bleed -> 1134 px wide at 300 dpi.
await png("card-front.svg", 1134, path.join(HERE, "card-front-300dpi.png"));
await png("card-back.svg", 1134, path.join(HERE, "card-back-300dpi.png"));

{
  const p = await browser.newPage();
  await p.setContent(
    `<style>@page{size:96mm 60mm;margin:0}
      html,body{margin:0;padding:0;background:${INK}}
      img{width:96mm;height:60mm;display:block;page-break-after:always}
      img:last-child{page-break-after:auto}</style>
     <img src="${uri("card-front.svg")}"><img src="${uri("card-back.svg")}">`
  );
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.pdf({
    path: path.join(HERE, "card-print.pdf"),
    width: "96mm",
    height: "60mm",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  await p.close();
  console.log("pdf brand/card-print.pdf  (2 pages, 96x60mm, bleed included)");
}

/* --- Social card ----------------------------------------------------------- */
// The whole project began with Google showing a stock photo of strangers at a
// laptop. This is the image it will show instead.
{
  const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<style>${FONT_CSS}</style>
    <body style="margin:0;width:1200px;height:630px;background:${INK};position:relative;
      display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
      <img src="${uri("px-horizontal-on-dark.svg")}" style="width:500px;display:block;margin-bottom:44px">
      <div style="font-family:PXDisplay,serif;color:${BONE};font-size:64px;line-height:1.18;
                  letter-spacing:-0.01em;max-width:950px">
        Marketing that <i style="color:${EMBER}">thinks</i>.<br>
        Content that <i>performs</i>.<br>
        Sites that <i style="color:#7FE0CF">convert</i>.
      </div>
      <div style="font-family:PXMono,monospace;color:#A9A39B;font-size:17px;margin-top:36px;
                  letter-spacing:0.16em;text-transform:uppercase">
        Brand &middot; Content &middot; Digital &nbsp;·&nbsp; Hyderabad
      </div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:7px;background:${EMBER}"></div>
    </body>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  writeFileSync(path.join(PUB, "og-image.jpg"), await p.screenshot({ type: "jpeg", quality: 92 }));
  await p.close();
  console.log("jpg public/og-image.jpg 1200x630");
}

await browser.close();
