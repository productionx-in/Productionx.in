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

/**
 * The ProductionX mark.
 *
 * Geometry traced from the original artwork, so this is the same silhouette
 * the studio has always used — only the counterform's colour has moved from
 * gold to ember, to sit with the rest of the palette. Masters and print files
 * live in /brand.
 */
export function Mark({ className, size = 20 }: P & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path fill="currentColor" d="M16.2 16.8 H38.4 L61.8 53.6 L37.1 90.8 H8.7 L32.7 47.9 Z" />
      <path fill="var(--ember)" d="M57.0 3.5 H93.1 L65.4 47.6 L48.8 21.4 Z" />
      <path fill="var(--ember)" d="M66.2 59.8 L80.0 82.0 H51.7 Z" />
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


/* ==========================================================================
   Pillar marks
   --------------------------------------------------------------------------
   One large symbol per discipline, so a visitor can tell the three apart
   before reading a word. Each is line work in its pillar's colour, and each
   path is drawable — the stroke is animated on when the section arrives.
   ========================================================================== */

/** Brand & marketing — a position found, then amplified. */
export function PillarBrand({ className }: P) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <g {...stroke} strokeWidth={1.5}>
        <circle cx="78" cy="80" r="46" />
        <circle cx="78" cy="80" r="30" opacity="0.65" />
        <circle cx="78" cy="80" r="14" opacity="0.4" />
        <circle cx="90" cy="66" r="4.5" fill="currentColor" stroke="none" />
        <path d="M90 66 L150 26" />
        <path d="M150 26 l-14 2 M150 26 l-2 14" />
        <path d="M138 92c9 0 17-4 22-11" opacity="0.55" />
        <path d="M148 104c14 0 26-7 33-18" opacity="0.35" />
      </g>
    </svg>
  );
}

/** Content production — a body, a lens, a slate. */
export function PillarProduction({ className }: P) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <g {...stroke} strokeWidth={1.5}>
        <rect x="20" y="54" width="96" height="62" rx="5" />
        <path d="M20 46 L112 32 L116 50 L24 64 Z" />
        <path d="M44 42 l4 18 M68 38 l4 18 M92 34 l4 18" opacity="0.6" />
        <circle cx="152" cy="86" r="28" />
        <circle cx="152" cy="86" r="15" opacity="0.6" />
        <path d="M152 58 v56 M124 86 h56" opacity="0.3" />
        <path d="M116 72 l18 -8 v44 l-18 -8 Z" opacity="0.5" />
      </g>
    </svg>
  );
}

/** Digital & AI — a viewport, and a pipeline feeding it. */
export function PillarDigital({ className }: P) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <g {...stroke} strokeWidth={1.5}>
        <rect x="76" y="34" width="106" height="80" rx="5" />
        <path d="M76 52 h106" opacity="0.6" />
        <circle cx="88" cy="43" r="2.5" opacity="0.6" />
        <circle cx="97" cy="43" r="2.5" opacity="0.6" />
        <path d="M92 68 h58 M92 82 h74 M92 96 h40" opacity="0.45" />
        <path d="M18 60 L48 46 M18 60 L48 74 M18 60 L44 96 M48 46 L76 56 M48 74 L76 74 M44 96 L76 90" opacity="0.5" />
        <circle cx="18" cy="60" r="6" />
        <circle cx="48" cy="46" r="4" />
        <circle cx="48" cy="74" r="4" />
        <circle cx="44" cy="96" r="4" />
      </g>
    </svg>
  );
}

/* ==========================================================================
   Service and vertical icons
   --------------------------------------------------------------------------
   One family, one stroke weight, one 24-unit box, so they sit together
   wherever they appear. Named rather than exported individually — the call
   sites read better as <Icon name="film" />.
   ========================================================================== */

const PATHS: Record<string, React.ReactNode> = {
  // Brand & marketing
  strategy: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  social: <><rect x="3" y="4" width="18" height="14" rx="2.5" /><path d="M7.5 20l2.5-2M3 8.5h18" /></>,
  paid: <><path d="M3.5 19h17" /><path d="M6.5 19v-5M11 19v-9M15.5 19v-6M20 19V6" /></>,
  analytics: <><path d="M3.5 19h17" /><path d="M4.5 15l4.5-5 3.5 3L20 5" /><path d="M20 5h-4M20 5v4" /></>,

  // Content production
  film: <><rect x="3" y="9" width="15" height="10" rx="1.5" /><path d="M3 7.5L17 5l1 3.5" /><path d="M7.5 6.7L8.4 9M11.5 6L12.4 8.4" /><path d="M18 12l3.5-2v8l-3.5-2z" /></>,
  reel: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10.5 9.5l4.5 2.5-4.5 2.5z" /></>,
  shoot: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v8.5M19.4 16.2L12 12M4.6 16.2L12 12" /></>,
  event: <><rect x="9.5" y="2.5" width="5" height="10" rx="2.5" /><path d="M6 11a6 6 0 0012 0M12 17v4.5M9 21.5h6" /></>,

  // Digital & AI
  website: <><rect x="2.5" y="4" width="19" height="16" rx="2.5" /><path d="M2.5 8.5h19" /><circle cx="6" cy="6.2" r="0.9" fill="currentColor" stroke="none" /><path d="M6 12.5h7M6 16h11" opacity="0.7" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.4 15.4L20.5 20.5" /><path d="M8 12l2-2.5 2 1.5 2-3.5" /></>,
  ai: <><circle cx="5" cy="12" r="2.5" /><circle cx="14" cy="6.5" r="2" /><circle cx="14" cy="17.5" r="2" /><circle cx="20.5" cy="12" r="2" /><path d="M7.4 10.9L12 7.6M7.4 13.1L12 16.4M15.7 7.8l3 2.7M15.7 16.2l3-2.7" opacity="0.7" /></>,
  previz: <><path d="M2.5 17c5-1.5 7-6 12-6s5.5 2 7 1.5" /><path d="M4 13c4.5-1.5 6.5-5 11-5" opacity="0.6" /><path d="M7 9.5c3.5-1 5-3 8.5-3" opacity="0.4" /><path d="M12 5.5V2M12 2l2 1.5M12 2l-2 1.5" /></>,

  // Verticals
  automotive: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 3.5v6M5.4 15.8l5.2-2.6M18.6 15.8l-5.2-2.6" /></>,
  fashion: <><path d="M12 3.5a2 2 0 102 2c0 1.2-2 1.4-2 2.6" /><path d="M12 8.1L3 15.5c-1 .8-.5 2.4.8 2.4h16.4c1.3 0 1.8-1.6.8-2.4z" /></>,
  hospitality: <><path d="M4 17.5h16" /><path d="M5.5 17.5V13a6.5 6.5 0 0113 0v4.5" /><path d="M12 6.5V4.5" /><path d="M3 20.5h18" opacity="0.6" /></>,
  food: <><path d="M5 4.5h11v6a5.5 5.5 0 01-11 0z" /><path d="M16 6h1.8a2.6 2.6 0 010 5.2H16" /><path d="M3.5 19.5h14" /></>,
  corporate: <><rect x="3.5" y="8.5" width="17" height="11" rx="1.5" /><path d="M8.5 8.5v-2a2 2 0 012-2h3a2 2 0 012 2v2" /><path d="M3.5 13h17" opacity="0.6" /></>,
};

export function Icon({ name, className, size = 20 }: P & { name: keyof typeof PATHS | string; size?: number }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

/**
 * Film grain, generated once as an inline SVG data URI and painted by CSS.
 * A static texture costs one composite; an animated one costs every frame.
 */
export const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";
