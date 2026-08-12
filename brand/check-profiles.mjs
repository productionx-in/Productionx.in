/**
 * Checks every block of profile copy against the character limit declared
 * beside it.
 *
 *   node brand/check-profiles.mjs
 *
 * This exists because the first pass measured only the fields I had bothered
 * to look up a limit for, marked two of them "no limit" without checking, and
 * reported that everything fit. Facebook's short About caps at 255 and mine was
 * 749; LinkedIn's Specialties field caps at 256 across the whole string and
 * mine was 277. Both would have been silently truncated or rejected on paste.
 *
 * So the document now declares its own limits — every field label carries an
 * "(N max)" — and this script enforces them. An assertion nobody can run is
 * just a claim.
 */

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(HERE, "social-profiles.md"), "utf8");

/**
 * Pair each fenced block with the nearest "(N max" declared above it. Limits
 * are written as 1,000 or 1000 depending on how they read in prose, so commas
 * are stripped before parsing.
 */
const lines = src.split("\n");
const fields = [];
let label = null;
let limit = null;
let inBlock = false;
let buf = [];

for (const line of lines) {
  if (line.startsWith("```")) {
    if (inBlock) {
      fields.push({ label, limit, text: buf.join("\n") });
      buf = [];
      label = null;
      limit = null;
    }
    inBlock = !inBlock;
    continue;
  }
  if (inBlock) {
    buf.push(line);
    continue;
  }
  const m = /\(([\d,]+)\s*max/.exec(line);
  if (m) {
    limit = parseInt(m[1].replace(/,/g, ""), 10);
    const l = /\*\*(.+?)\*\*/.exec(line) || /^\*(.+?):?\*/.exec(line);
    label = l ? l[1].replace(/\*/g, "").trim() : line.slice(0, 40).trim();
  }
}

let failed = 0;
let unchecked = 0;
let warned = 0;

console.log(`${"field".padEnd(34)}${"chars".padStart(6)}${"limit".padStart(7)}   status`);
console.log("-".repeat(62));

for (const f of fields) {
  const n = f.text.length;
  if (f.limit === null) {
    unchecked++;
    console.log(`${"(no limit declared)".padEnd(34)}${String(n).padStart(6)}${"?".padStart(7)}   UNCHECKED`);
    continue;
  }
  const over = n - f.limit;
  const pct = Math.round((n / f.limit) * 100);
  /* Headroom only matters where overrunning is silent. A 30-character name
     field stops accepting input as you type, so 97% of it is fine. A 2,000
     character About box pasted from a document can lose its last sentence
     without saying so — platforms disagree on whether a line break counts as
     one character or two — so long fields get flagged well before the edge. */
  const tight = over <= 0 && f.limit >= 200 && pct >= 94;
  const status = over > 0 ? `OVER by ${over}` : tight ? `TIGHT ${pct}% — leave headroom` : `ok  ${pct}%`;
  if (over > 0) failed++;
  if (tight) warned++;
  console.log(`${f.label.slice(0, 33).padEnd(34)}${String(n).padStart(6)}${String(f.limit).padStart(7)}   ${status}`);
}

/**
 * Google rejects Business Profile descriptions containing URLs, phone numbers
 * or prices. Catching it here beats finding out when the listing is suspended.
 */
const gbp = fields.find((f) => f.limit === 750);
if (gbp) {
  const bad = gbp.text.match(/(https?:\/\/|www\.|\.in\b|\.com\b|\+91|\d{5}\s?\d{5}|₹)/g);
  console.log("-".repeat(62));
  console.log(`Google Business description — forbidden patterns: ${bad ? bad.join(", ") : "none"}`);
  if (bad) failed++;
}

console.log("-".repeat(62));
console.log(`${fields.length} fields · ${failed} over limit · ${warned} tight · ${unchecked} with no limit declared`);

if (failed || unchecked) process.exit(1);
console.log("all fields fit their platform limit");
