# ProductionX — brand assets

Everything here is generated from one definition. Edit `build.mjs`, run the two
commands below, and the logo, the icons, the social card and the print-ready
business card all move together. Nothing is hand-tweaked downstream, so nothing
drifts.

```bash
npm run build          # required first — the font files come from the Next build
node brand/build.mjs   # SVG masters
node brand/export.mjs  # PNG / ICO / PDF, and the files in /public
```

---

## The palette

Seven values. Nothing anywhere uses a colour that is not on this list.
Definitions and contrast ratios live in `palette.css`.

| | Hex | Role |
| --- | --- | --- |
| **Ink** | `#0B0A0C` | primary ground |
| **Surface** | `#141216` | raised panels |
| **Bone** | `#F4F1EC` | primary text, and the logo's chevron |
| **Ember** | `#FF5C29` | **the** brand accent — logo counterform, CTAs, marketing |
| **Mint** | `#7FE0CF` | second accent, digital and AI work only |
| **Ash** | `#A9A39B` | secondary text |
| **Slate** | `#8B8592` | labels and metadata |

Ember and Mint are outside CMYK gamut and will print duller than they look on
screen. Use a spot colour where the budget allows; `palette.css` carries the
CMYK builds and the nearest Pantone references.

### The one decision worth arguing about

**The mark's gold is now Ember.** The silhouette has not changed — the geometry
in these files was traced from the original artwork, not redrawn — but the
counterform has moved from gold to the accent the rest of the brand runs on.

Gold-on-black was the exact register the studio moved away from. Keeping it in
the logo while everything the logo sits on used Ember would have meant two
accents competing on every page, every slide and every card. One accent, used
everywhere, is what makes an identity feel deliberate.

If there is existing printed stock, signage or vehicle livery in gold, run it
down rather than reprinting at once — but do not order more.

---

## Files

### Logo
| File | Use |
| --- | --- |
| `logo-horizontal.svg` | default lockup, dark backgrounds |
| `logo-horizontal-light-bg.svg` | default lockup, light backgrounds |
| `logo-stacked.svg` / `-light-bg.svg` | square crops, narrow columns |
| `mark.svg` / `mark-light-bg.svg` | icon only — avatars, app icons, watermarks |
| `mark-mono-bone.svg` / `mark-mono-ink.svg` | one colour: embroidery, foil, stamps, etching |
| `logo-horizontal-2400.png` | raster, for anything that will not take SVG |

Every SVG has its fonts embedded, so it renders identically in a browser, in
Illustrator, and at a print bureau with nothing installed.

### Business card
| File | Use |
| --- | --- |
| `card-print.pdf` | **give this to the printer.** 2 pages, 96 × 60 mm, bleed included |
| `card-front.svg` / `card-back.svg` | editable masters |
| `card-*-300dpi.png` | proofs and previews |

90 × 54 mm trim, 3 mm bleed on every edge, 5 mm safe margin.

**The QR is a slot, not a code.** This environment cannot verify that a
generated QR actually decodes, and a card that fails to scan is worse than a
card with no code at all. Drop the studio's existing code in as `brand/qr.png`
and re-run `node brand/export.mjs` — it will be embedded, framed and sized
automatically.

### Written into `/public` by the export
`favicon.ico` · `mark.svg` · `logo.png` · `apple-touch-icon.png` · `og-image.jpg`

---

## Rules

**Clear space.** Keep the mark's own width free on every side of the lockup.
Nothing sits inside it.

**Minimum size.** Full lockup: 120 px wide on screen, 30 mm in print. Below
that, use the mark alone — it holds down to 16 px.

**Never** re-space the mark and the wordmark, recolour the chevron to anything
but Bone or Ink, add a shadow, gradient, outline or bevel, place the lockup on
a busy photograph without a scrim, or set the wordmark in a different face.

**On photography**, use `mark-mono-bone.svg` over a dark scrim rather than the
two-colour mark — Ember on an unpredictable image is unreadable.
