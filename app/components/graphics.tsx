/**
 * The house graphic language, drawn rather than sourced.
 *
 * Everything here is line work on the film-set theme — a slate, a lens iris,
 * a node graph for the AI pipeline, contour lines for previsualisation. Using
 * SVG instead of stock art means nothing repeats, nothing needs licensing, and
 * every mark inherits the palette through `currentColor`.
 */

type P = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Clapperboard — discovery / pre-production. */
export function ArtSlate({ className }: P) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...stroke}>
        <rect x="18" y="42" width="164" height="62" rx="4" />
        <path d="M18 34 L176 18 L182 38 L24 54 Z" />
        <path d="M46 30 L52 50 M74 26 L80 46 M102 22 L108 42 M130 18 L136 38" />
        <path d="M34 62h60M34 76h96M34 90h44" opacity="0.55" />
      </g>
    </svg>
  );
}

/** Lens iris — direction / capture. */
export function ArtLens({ className }: P) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...stroke}>
        <circle cx="100" cy="60" r="42" />
        <circle cx="100" cy="60" r="24" opacity="0.6" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path
            key={a}
            d="M100 60 L100 18"
            transform={`rotate(${a} 100 60)`}
            opacity="0.5"
          />
        ))}
        <path d="M14 60h34M152 60h34" opacity="0.4" />
      </g>
    </svg>
  );
}

/** Node graph — the AI generation and iteration pass. */
export function ArtNodes({ className }: P) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...stroke}>
        <path d="M40 60 L86 32 M40 60 L86 88 M86 32 L138 46 M86 88 L138 74 M138 46 L138 74" opacity="0.55" />
        <circle cx="40" cy="60" r="7" />
        <circle cx="86" cy="32" r="5" />
        <circle cx="86" cy="88" r="5" />
        <circle cx="138" cy="46" r="5" />
        <circle cx="138" cy="74" r="5" />
        <rect x="160" y="46" width="24" height="28" rx="3" />
      </g>
    </svg>
  );
}

/** Waveform — edit, sound, grade. */
export function ArtWave({ className }: P) {
  const bars = [14, 30, 20, 48, 34, 62, 40, 26, 54, 18, 38, 24, 46, 16, 28];
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...stroke}>
        {bars.map((h, i) => (
          <path key={i} d={`M${20 + i * 11} ${60 - h / 2} L${20 + i * 11} ${60 + h / 2}`} />
        ))}
        <path d="M10 60h180" opacity="0.3" />
      </g>
    </svg>
  );
}

/** Contours — previsualisation, terrain, site massing. */
export function ArtTopo({ className }: P) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...stroke}>
        <path d="M8 96c30-8 44-30 70-30s44 20 74 12" opacity="0.4" />
        <path d="M12 80c28-10 44-26 68-26s46 16 72 8" opacity="0.55" />
        <path d="M20 66c24-10 42-22 62-22s42 12 66 6" opacity="0.7" />
        <path d="M34 52c18-8 32-16 48-16s32 8 52 4" />
        <path d="M62 40c10-5 18-8 26-8s16 3 26 2" />
        <path d="M96 26v-12M96 14l8 4-8 4" opacity="0.8" />
      </g>
    </svg>
  );
}

/** Delivery — export, formats, handover. */
export function ArtDeliver({ className }: P) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...stroke}>
        <rect x="30" y="30" width="76" height="52" rx="4" />
        <rect x="52" y="46" width="76" height="52" rx="4" opacity="0.7" />
        <rect x="74" y="26" width="76" height="52" rx="4" opacity="0.45" />
        <path d="M168 52v28M168 80l-8-8M168 80l8-8" />
      </g>
    </svg>
  );
}

/** Small inline tick used in bullet lists. */
export function Tick({ className }: P) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path d="M1 6.5 L4.5 10 L11 2" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

/** Arrow used on buttons and links. */
export function Arrow({ className }: P) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className={className} aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

/**
 * Film grain, generated once as an inline SVG data URI and painted by CSS.
 * A static texture costs one composite; an animated one costs every frame.
 */
export const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";
