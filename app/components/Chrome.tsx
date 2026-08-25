"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { GRAIN_URI, Arrow, Mark } from "./graphics";
import { initGsap, revealAll, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

const LINKS = [
  { href: "/#capabilities", label: "Services" },
  { href: "/#work", label: "Work" },
  { href: "/#web", label: "Websites" },
  { href: "/#about", label: "About" },
  { href: "/blog", label: "Blog" },
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
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
      if (!a) return;
      let href = a.getAttribute("href")!;
      // "/#section" links work from any page (a real navigation lands on the
      // homepage then jumps to the hash). Only intercept them for Lenis when
      // we're already on that page — otherwise let the browser navigate.
      if (href.startsWith("/#")) {
        if (window.location.pathname !== "/") return;
        href = href.slice(1);
      }
      if (href === "#") return;
      const target = document.querySelector(href);
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
        <Link href="/" className="nav__mark" aria-label="ProductionX, back to top">
          <Mark size={19} className="nav__mark-svg" />
          <span className="nav__word">ProductionX</span>
        </Link>

        <div className="nav__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>

        <div className="nav__cta">
          <Link href="/#contact" className="btn">
            Book a call
            <Arrow className="arrow" />
          </Link>
        </div>
      </nav>
    </>
  );
}
