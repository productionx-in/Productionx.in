"use client";

import { useEffect, useRef, useState } from "react";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

type Cap = {
  title: string;
  body: string;
  meta: string;
  poster: string;
  video?: string;
};

/**
 * Five services, ordered the way a client buys them — the thinking first, the
 * filming in the middle. The studio is hired for brand building and marketing,
 * not for camera hire, so production sits inside that story rather than being
 * the whole of it.
 */
const CAPS: Cap[] = [
  {
    title: "Brand strategy",
    body: "Discovery, competitor study, positioning and a twelve-month roadmap. We agree what success looks like — enquiries, rankings, recognition — before anyone books a camera.",
    meta: "Discovery · Positioning · Roadmap",
    poster: "/thumb-event.jpg",
  },
  {
    title: "Content production",
    body: "Brand films, reels, product and fashion shoots, events and podcasts. Planned, shot, directed and edited in house — every frame earns its place.",
    meta: "Film · Direction · Post",
    poster: "/thumb-mercedes.jpg",
  },
  {
    title: "Social media management",
    body: "We own the presence end to end: content calendar, captions, scheduling, growth, competitor analysis, monthly analytics and paid integration.",
    meta: "Calendar · Growth · Paid",
    poster: "/thumb-fashion.jpg",
  },
  {
    title: "Website & search",
    body: "Sites built to convert the audience the content earns, plus the search work behind them — keywords, Google Business Profile, local ranking.",
    meta: "Design · Build · SEO",
    poster: "/builds/mahati.jpg",
    video: "/builds/mahati",
  },
  {
    title: "AI content & previz",
    body: "Generated footage for work with no budget for a unit, and walkthroughs of property that is still a drawing — so sales can start before the slab is poured.",
    meta: "Generative · Architectural",
    poster: "/builds/ai-03.jpg",
    video: "/builds/ai-03",
  },
];

export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      // On desktop the stage is sticky, so scroll position picks the entry.
      // Below that the stage sits above the list and the taps drive it.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1001px)", () => {
        const caps = gsap.utils.toArray<HTMLElement>(".cap");
        const triggers = caps.map((el, i) =>
          ScrollTrigger.create({
            trigger: el,
            start: "top 62%",
            end: "bottom 62%",
            onToggle: (self) => self.isActive && setActive(i),
          })
        );
        return () => triggers.forEach((t) => t.kill());
      });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  // Crossfade the stage whenever the active entry changes.
  useEffect(() => {
    const figures = root.current?.querySelectorAll<HTMLElement>(".caps__stage figure");
    if (!figures) return;
    figures.forEach((fig, i) => {
      const on = i === active;
      gsap.to(fig, { opacity: on ? 1 : 0, duration: 0.55, overwrite: "auto" });
      gsap.to(fig.querySelector("img, video"), {
        scale: on ? 1 : 1.06,
        duration: 1.1,
        overwrite: "auto",
      });
      // Only the visible clip decodes; the rest stay paused.
      const v = fig.querySelector("video");
      if (!v) return;
      if (on) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  return (
    <section className="band" id="capabilities" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">01 — What we do</span>
          <h2>Five services. One studio. One retainer.</h2>
        </header>

        <div className="caps__layout">
          <div className="caps__list">
            {CAPS.map((c, i) => (
              <button
                type="button"
                key={c.title}
                className={`cap${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={i === active}
              >
                <span className="cap__num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <h3>{c.title}</h3>
                  <span className="cap__body">
                    <span>
                      <span style={{ display: "block", paddingTop: 2 }}>{c.body}</span>
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="caps__stage">
            <span className="bracket tl" aria-hidden="true" />
            <span className="bracket br" aria-hidden="true" />
            {CAPS.map((c, i) => (
              <figure key={c.title} style={{ opacity: i === 0 ? 1 : 0 }}>
                {c.video ? (
                  <video
                    poster={c.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden="true"
                  >
                    {/* WebM first — it is the smaller encode for every clip here. */}
                    <source src={`${c.video}.webm`} type="video/webm" />
                    <source src={`${c.video}.mp4`} type="video/mp4" />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.poster} alt={`${c.title} — still frame`} loading="lazy" />
                )}
              </figure>
            ))}
            <span className="caps__meta">{CAPS[active].meta}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
