"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { GRAIN_URI, Arrow } from "./graphics";
import { initGsap, revealAll, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#previz", label: "Previz" },
  { href: "#process", label: "Process" },
];

/**
 * Page chrome and the single scroll authority.
 *
 * Lenis drives inertia scrolling from GSAP's ticker so there is exactly one
 * rAF loop on the page — running Lenis on its own loop while ScrollTrigger
 * runs on another is the usual cause of a half-frame lag between pinned
 * content and the scrollbar.
 */
export default function Chrome() {
  const [stuck, setStuck] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();

    const reduced = prefersReducedMotion();
    let lenis: Lenis | undefined;
    let tick: ((t: number) => void) | undefined;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.5,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor links have to go through Lenis, otherwise native smooth scrolling
    // fights the inertia loop and the page jitters to a stop.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -72 });
      else target.scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", onClick);

    const st = ScrollTrigger.create({
      start: 40,
      onUpdate: (self) => setStuck(self.scroll() > 40),
      onToggle: (self) => setStuck(self.isActive),
    });

    revealAll();
    // Sections mount their own triggers; one refresh after layout settles
    // keeps every start/end measured against final positions.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      st.kill();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <div className="grain" style={{ ["--grain-src" as string]: GRAIN_URI }} aria-hidden="true" />

      <nav ref={navRef} className={`nav${stuck ? " is-stuck" : ""}`} aria-label="Primary">
        <a href="#top" className="nav__mark" aria-label="ProductionX, back to top">
          <span className="nav__dot" aria-hidden="true" />
          <span className="nav__word">ProductionX</span>
        </a>

        <div className="nav__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>

        <div className="nav__cta">
          <a href="#contact" className="btn">
            Start a project
            <Arrow className="arrow" />
          </a>
        </div>
      </nav>
    </>
  );
}
