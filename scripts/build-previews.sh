#!/usr/bin/env bash
#
# Turn a raw screen recording of a live build into the web assets the
# "Interactive & AI" cards expect: a short muted loop (WebM + MP4) plus a
# poster frame.
#
# Usage:
#   scripts/build-previews.sh <input.mp4> <slug> <start> <duration>
#
#   <slug>      output name, e.g. sky-villa
#   <start>     where the loop begins, ffmpeg time (e.g. 00:00:12 or 12)
#   <duration>  loop length in seconds — 8-12 reads best
#
# Example:
#   scripts/build-previews.sh ~/Downloads/skyvilla.mp4 sky-villa 00:00:14 10
#
# Writes public/builds/<slug>.webm, .mp4 and .jpg, then wire them up in
# app/components/Site.tsx:
#   video:  "/builds/<slug>.webm"
#   poster: "/builds/<slug>.jpg"
# (the component swaps the .webm extension for .mp4 on the fallback source)

set -euo pipefail

if [ "$#" -ne 4 ]; then
  sed -n '2,26p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

INPUT="$1"
SLUG="$2"
START="$3"
DUR="$4"

if [ ! -f "$INPUT" ]; then
  echo "error: no such file: $INPUT" >&2
  exit 1
fi

# Prefer a full ffmpeg build; the one Playwright bundles is VP8/WebM-only and
# cannot decode an MP4 screen recording.
FFMPEG="${FFMPEG:-$(command -v ffmpeg || true)}"
if [ -z "$FFMPEG" ]; then
  echo "error: ffmpeg not found. Install it, or: npm i -D ffmpeg-static" >&2
  echo "       then: FFMPEG=\$(node -p \"require('ffmpeg-static')\") $0 ..." >&2
  exit 1
fi

OUTDIR="$(cd "$(dirname "$0")/.." && pwd)/public/builds"
mkdir -p "$OUTDIR"

# 1000px wide is comfortably retina for a half-width card and keeps the loops
# small enough to commit. 24fps is plenty for a scroll capture. Audio dropped.
COMMON=(-ss "$START" -t "$DUR" -an -vf "scale=1000:-2,fps=24")

echo "→ ${SLUG}.webm"
"$FFMPEG" -y -loglevel error -i "$INPUT" "${COMMON[@]}" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -deadline good -cpu-used 2 -row-mt 1 \
  "$OUTDIR/$SLUG.webm"

echo "→ ${SLUG}.mp4"
"$FFMPEG" -y -loglevel error -i "$INPUT" "${COMMON[@]}" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart \
  "$OUTDIR/$SLUG.mp4"

echo "→ ${SLUG}.jpg"
"$FFMPEG" -y -loglevel error -ss "$START" -i "$INPUT" -frames:v 1 \
  -vf "scale=1000:-2" -q:v 4 "$OUTDIR/$SLUG.jpg"

echo
ls -lh "$OUTDIR/$SLUG".{webm,mp4,jpg} | awk '{print "   " $9 "  " $5}'
echo
echo "Done. Keep each loop under ~2MB; lower crf raises quality and size."
