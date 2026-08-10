"use client";

import { useEffect, useRef } from "react";
import { Arrow } from "./graphics";
import { initGsap, prefersReducedMotion } from "../lib/motion";

type Site = {
  name: string;
  role: string;
  note: string;
  slug: string;
  href?: string;
};

/**
 * Websites live in their own section rather than inside the film gallery.
 * They are a different purchase, judged on different things — conversion,
 * search, structure — and mixing them into the showreel made both harder to
 * read. These are published live, so they are credited by name.
 */
const SITES: Site[] = [
  {
    name: "Mahati Bhikshu",
    role: "Artist portfolio",
    note: "Kuchipudi artist, actor and educator. Film, gallery, teaching and press in one narrative scroll.",
    slug: "mahati",
  },
  {
    name: "Aruna Bhikshu",
    role: "Practitioner site",
    note: "Built around repertoire, teaching and enquiry, with a structure that keeps decades of work navigable.",
    slug: "aruna",
  },
  {
    name: "Sattva Amora",
    role: "Property launch",
    note: "Launch microsite for a residential project — narrative scroll, floor plans, enquiry capture.",
    slug: "sattva-amora",
  },
];

export default function WebWork() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();

    // Touch has no hover, so each walkthrough plays while it is on screen.
    if (!window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && !prefersReducedMotion()) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.5 }
    );
    root.current?.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <section className="band webwork" id="web" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">04 — Websites</span>
          <h2>The site the content points to.</h2>
        </header>

        <p className="lead" data-reveal style={{ marginBottom: "var(--s6)" }}>
          Reach is wasted on a page that cannot hold it. We design and build the
          site in the same studio that makes the content, so the campaign and the
          landing page are one piece of work — and the search side is handled
          before launch, not after.
        </p>

        <div className="sites" data-reveal data-reveal-group>
          {SITES.map((s) => (
            <article className="site" key={s.slug}>
              <div className="site__frame">
                <span className="site__chrome" aria-hidden="true">
                  <i /><i /><i />
                </span>
                <video
                  poster={`/builds/${s.slug}.jpg`}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label={`${s.name} — website walkthrough`}
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                >
                  <source src={`/builds/${s.slug}.webm`} type="video/webm" />
                  <source src={`/builds/${s.slug}.mp4`} type="video/mp4" />
                </video>
              </div>

              <div className="site__meta">
                <span className="label">{s.role}</span>
                <h3>{s.name}</h3>
                <p>{s.note}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="webwork__foot" data-reveal>
          <span className="label">Also: search, Google Business Profile, local ranking</span>
          <a href="#contact" className="btn btn--ghost">
            Talk about a site
            <Arrow className="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
