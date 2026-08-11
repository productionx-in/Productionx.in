"use client";

import { useEffect, useRef } from "react";
import { PillarBrand, PillarProduction, PillarDigital, Icon, Arrow } from "./graphics";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

type Pillar = {
  key: string;
  n: string;
  title: string;
  line: string;
  services: { icon: string; name: string; detail: string }[];
  cta: { href: string; label: string };
  Mark: (p: { className?: string }) => React.JSX.Element;
};

/**
 * Three disciplines, kept apart on purpose.
 *
 * Listing strategy, filming and web build as one undifferentiated run of
 * services makes a visitor work out for themselves which of the three we are —
 * and a confused visitor picks a specialist instead. Each pillar owns a colour
 * that follows it through the rest of the page, so the answer to "who does my
 * kind of job here" is visible before a word is read.
 */
const PILLARS: Pillar[] = [
  {
    key: "brand",
    n: "01",
    title: "Brand & marketing",
    line: "The thinking. Where the brand stands, who it talks to, and how it stays in front of them.",
    services: [
      { icon: "strategy", name: "Brand strategy", detail: "Discovery, competitor study, positioning, twelve-month roadmap" },
      { icon: "social", name: "Social media management", detail: "Calendar, captions, scheduling, community, growth" },
      { icon: "paid", name: "Paid & performance", detail: "Ad integration across Meta and Google, tied to the content" },
      { icon: "analytics", name: "Reporting", detail: "Monthly analytics, competitor tracking, what to do next" },
    ],
    cta: { href: "#process", label: "How it runs" },
    Mark: PillarBrand,
  },
  {
    key: "production",
    n: "02",
    title: "Content production",
    line: "The making. A full crew, our own kit, and an edit suite — nothing subcontracted.",
    services: [
      { icon: "film", name: "Brand & ad films", detail: "Two to five minutes, concept through grade" },
      { icon: "reel", name: "Reels & social video", detail: "Verticals cut for the platform, not resized for it" },
      { icon: "shoot", name: "Product & fashion shoots", detail: "Stills and motion from the same day" },
      { icon: "event", name: "Events & podcasts", detail: "Multi-camera coverage with same-night delivery" },
    ],
    cta: { href: "#work", label: "See the work" },
    Mark: PillarProduction,
  },
  {
    key: "digital",
    n: "03",
    title: "Digital & AI",
    line: "The destination. Where the audience lands, and the pipeline that fills it when a camera cannot.",
    services: [
      { icon: "website", name: "Website design & build", detail: "Built to convert the audience the content earns" },
      { icon: "search", name: "Search & local ranking", detail: "Keywords, Google Business Profile, technical SEO" },
      { icon: "ai", name: "AI content", detail: "Generated footage, product scenes, concept frames" },
      { icon: "previz", name: "Real-estate previz", detail: "Walkthroughs of property that is still a drawing" },
    ],
    cta: { href: "#web", label: "See the sites" },
    Mark: PillarDigital,
  },
];

export default function Capabilities() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Each pillar mark draws itself in as its column arrives, so the symbol
      // reads as being made rather than placed.
      gsap.utils.toArray<HTMLElement>(".pillar").forEach((col) => {
        const paths = col.querySelectorAll<SVGGeometryElement>(".pillar__mark path, .pillar__mark circle, .pillar__mark rect");
        paths.forEach((el) => {
          const len = el.getTotalLength?.() || 0;
          if (!len) return;
          gsap.fromTo(
            el,
            { strokeDasharray: len, strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              duration: 1.4,
              ease: "power2.out",
              scrollTrigger: { trigger: col, start: "top 78%", once: true },
            }
          );
        });

        gsap.from(col.querySelectorAll(".pillar__svc"), {
          opacity: 0,
          y: 14,
          duration: 0.7,
          stagger: 0.05,
          scrollTrigger: { trigger: col, start: "top 74%", once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="band" id="capabilities" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">01 — What we do</span>
          <h2>Three disciplines. One team. No handoffs.</h2>
        </header>

        <p className="lead" data-reveal style={{ marginBottom: "var(--s7)" }}>
          Most brands buy these from three suppliers and spend their time
          translating between them. Here they sit in one studio, on one retainer
          — and you can buy any one of them on its own.
        </p>

        <div className="pillars">
          {PILLARS.map((p) => (
            <article className={`pillar pillar--${p.key}`} key={p.key}>
              <p.Mark className="pillar__mark" />

              <div className="pillar__head">
                <span className="label pillar__n">{p.n}</span>
                <h3>{p.title}</h3>
              </div>
              <p className="pillar__line">{p.line}</p>

              <ul className="pillar__svcs">
                {p.services.map((s) => (
                  <li className="pillar__svc" key={s.name}>
                    <Icon name={s.icon} className="pillar__ico" />
                    <span>
                      <strong>{s.name}</strong>
                      <span className="pillar__detail">{s.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <a className="ulink pillar__cta" href={p.cta.href}>
                {p.cta.label} <Arrow />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
