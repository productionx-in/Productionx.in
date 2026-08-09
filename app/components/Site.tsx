"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

const WA_NUMBER = "919391926846";
const WA_INTRO_TEXT =
  "Hi Kiran, I came across Production X and I'm interested in discussing content production for my brand. Could we schedule a call?";
const WA_INTRO_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_INTRO_TEXT)}`;

const TICKER_BRANDS = [
  "Mercedes-Benz",
  "Everest Abercorn",
  "Pit Stop Group",
  "Hole in the Wall",
  "Tanishq",
  "Krishna Motors",
  "European Wellness",
  "Coastal Star",
  "IRDAI",
  "1UJ Fashion",
  "Ujwala Group",
  "1UJ Lifestyle",
  "Silver Star Hyderabad",
];

const PORTFOLIO_ITEMS = [
  {
    cat: "automotive",
    tag: "Automotive",
    img: "/thumb-mercedes.jpg",
    videoId: "PmRJ8ydIvGw",
    alt: "Mercedes-Benz Maybach Delivery Reel",
    duration: "1:24",
    title: "Mercedes-Benz — Silver Star, Hyderabad",
  },
  {
    cat: "automotive",
    tag: "Automotive",
    img: "/thumb-bmw.jpg",
    videoId: "ZrH5rOXm8io",
    alt: "BMW Showroom Content",
    duration: "0:58",
    title: "BMW — Showroom Content",
  },
  {
    cat: "hospitality",
    tag: "Hospitality",
    img: "/thumb-hotel.jpg",
    videoId: "cdKx1Zv3YKs",
    alt: "Hotel Brand Film",
    duration: "2:10",
    title: "Hotel Brand Film",
  },
  {
    cat: "hospitality",
    tag: "Hospitality",
    img: "/thumb-cafe.jpg",
    videoId: "Xub8As6vhxY",
    alt: "Premium Cafe Ambiance Reel",
    duration: "0:45",
    title: "Premium Cafe — Jubilee Hills",
  },
  {
    cat: "fashion",
    tag: "Fashion",
    img: "/thumb-fashion.jpg",
    videoId: "tx80zK9QKDU",
    alt: "1UJ Fashion Brand Film",
    duration: "1:45",
    title: "1UJ Fashion — Brand Film",
  },
  {
    cat: "corporate",
    tag: "Corporate",
    img: "/thumb-event.jpg",
    videoId: "G1N693k3PJA",
    alt: "Brand Launch Event Coverage",
    duration: "3:20",
    title: "Brand Launch — Event Coverage",
  },
] as const;

const FILTERS = ["all", "automotive", "hospitality", "fashion", "corporate"] as const;

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function Site() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroTaglineRef = useRef<HTMLParagraphElement>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("all");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const openModal = (videoId: string) => {
    const iframe = modalIframeRef.current;
    const modal = modalRef.current;
    if (!iframe || !modal) return;
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    gsap.from(modal.querySelector(".modal-content"), {
      scale: 0.92,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const closeModal = () => {
    const iframe = modalIframeRef.current;
    const modal = modalRef.current;
    if (!iframe || !modal) return;
    iframe.src = "";
    modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  // ── One-time client effects: cursor, canvas particles, nav scroll,
  //    scroll progress, hero entrance, reveals, counters, process line,
  //    magnetic buttons. Ported 1:1 from the original inline <script>.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
    let extraCleanup = () => {};
    const ctx = gsap.context(() => {
      // Scroll progress
      const progressBar = progressRef.current;
      const onScroll = () => {
        if (!progressBar) return;
        const pct =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = `${pct}%`;
      };
      window.addEventListener("scroll", onScroll);

      // Custom cursor
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      let mx = 0,
        my = 0,
        rx = 0,
        ry = 0;
      let raf = 0;
      const onMouseMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        if (dot) {
          dot.style.left = `${mx}px`;
          dot.style.top = `${my}px`;
        }
      };
      document.addEventListener("mousemove", onMouseMove);
      const animRing = () => {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        if (ring) {
          ring.style.left = `${rx}px`;
          ring.style.top = `${ry}px`;
        }
        raf = requestAnimationFrame(animRing);
      };
      raf = requestAnimationFrame(animRing);

      const hoverTargets = document.querySelectorAll(
        "a,button,.portfolio-item,.service-card,.brand-branch"
      );
      const onEnter = () => document.body.classList.add("cursor-hover");
      const onLeave = () => document.body.classList.remove("cursor-hover");
      hoverTargets.forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });

      // Nav scroll state
      const nav = navRef.current;
      const onNavScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 60);
      window.addEventListener("scroll", onNavScroll);

      // Hero entrance
      const tl = gsap.timeline({ delay: 0.3 });
      if (heroHeadlineRef.current) {
        tl.from(heroHeadlineRef.current, { opacity: 0, y: 40, duration: 0.9, ease: "power4.out" }, "-=0.3");
      }
      tl.to(".hero-sub", { opacity: 1, duration: 0.7, ease: "power2.out" }, "-=0.4");
      tl.to(".hero-ctas", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");
      tl.to(".scroll-indicator", { opacity: 1, duration: 0.6 }, "-=0.2");
      if (heroTaglineRef.current) {
        tl.to(heroTaglineRef.current, { opacity: 1, duration: 0.1 }, "-=0.1");
        tl.to(heroTaglineRef.current, {
          duration: 2,
          text: { value: "Every frame earns its place.", delimiter: "" },
          ease: "none",
        });
      }

      // Scroll reveals
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".reveal-left").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -36 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".reveal-right").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 36 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".reveal-scale").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.94, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });

      // Counters
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseInt(el.getAttribute("data-count") || "0", 10);
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target,
              duration: 2,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${Math.round(counter.val)}+`;
              },
            });
          },
        });
      });

      const enquiryEl = document.getElementById("enquiry-count");
      if (enquiryEl) {
        ScrollTrigger.create({
          trigger: enquiryEl,
          start: "top 80%",
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: 300,
              duration: 2.2,
              ease: "power2.out",
              onUpdate: () => {
                enquiryEl.textContent = `${Math.round(counter.val)}+`;
              },
            });
          },
        });
      }

      // Process line draw
      document.querySelectorAll<HTMLElement>(".process-step").forEach((step, i) => {
        const fill = step.querySelector<HTMLElement>(".process-line-fill");
        ScrollTrigger.create({
          trigger: step,
          start: "top 75%",
          onEnter: () => {
            step.classList.add("active");
            if (fill) {
              gsap.to(fill, { width: "100%", duration: 1.2, delay: i * 0.15, ease: "power2.inOut" });
            }
          },
        });
      });

      // Magnetic buttons
      document.querySelectorAll<HTMLElement>(".btn-primary, .nav-cta").forEach((btn) => {
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(btn, { x: x * 0.18, y: y * 0.18, duration: 0.3, ease: "power2.out" });
        };
        const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.5)" });
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
      });

      extraCleanup = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("scroll", onNavScroll);
        document.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(raf);
        hoverTargets.forEach((el) => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      };
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      ctx.revert();
      extraCleanup();
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name")?.toString() ?? "",
      brand: data.get("brand")?.toString() ?? "",
      phone: data.get("phone")?.toString() ?? "",
      email: data.get("email")?.toString() ?? "",
      service: data.get("service")?.toString() ?? "",
      message: data.get("message")?.toString() ?? "",
      budget: data.get("budget")?.toString() ?? "",
    };

    setFormStatus("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <>
      <div id="scroll-progress" ref={progressRef} />
      <div id="cursor-dot" ref={cursorDotRef} />
      <div id="cursor-ring" ref={cursorRingRef} />

      {/* ── NAV ─────────────────────────────────────── */}
      <nav id="main-nav" ref={navRef}>
        <a href="#hero" className="nav-logo">
          <Image src="/logo.png" alt="Production X" width={120} height={36} style={{ height: 36, width: "auto" }} priority />
          <div className="nav-logo-text">
            <span className="nav-logo-name">Production X</span>
            <span className="nav-logo-sub">Cinematic Studio</span>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#reel">Our Work</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <a href="#book" className="nav-cta"><span>Book a Call</span></a>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section id="hero">
        <div className="hero-video-bg">
          <video autoPlay muted loop playsInline>
            <source src="/showreel-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1 className="hero-headline" ref={heroHeadlineRef}>
            We make brands&nbsp;<br /><em>impossible to&nbsp;<br />scroll past.</em>
          </h1>
          <p className="hero-sub">
            Cinematic Content Production &amp; Social Media Management<br />
            for premium brands across Hyderabad, Vizag &amp; all India.
          </p>
          <div className="hero-ctas">
            <a href="#reel" className="btn-primary"><span>Watch Our Work</span></a>
            <a href="#book" className="btn-secondary">Book a Free Call</a>
          </div>
          <p className="hero-tagline" ref={heroTaglineRef} />
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line" />
          <span className="scroll-text">Scroll</span>
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────── */}
      <div className="ticker-section">
        <p className="ticker-label">Trusted by</p>
        <div className="ticker-track">
          {[...TICKER_BRANDS, ...TICKER_BRANDS].map((brand, i) => (
            <span key={`${brand}-${i}`}>
              <span className="ticker-item">{brand}</span>
              <span className="ticker-dot">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── SERVICES ────────────────────────────────── */}
      <section id="services">
        <div className="services-intro">
          <span className="section-eyebrow reveal">What We Do</span>
          <h2 className="section-title reveal">Three services.<br /><em>One studio.</em></h2>
          <p className="services-motto reveal">
            Production X is the only studio in Hyderabad that produces cinematic content,
            manages your social media presence, and builds premium websites — all under one roof.
            <br /><br />
            Great content without strategy is wasted. Strategy without great content is invisible.
            We deliver both — and the website to convert it all.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card reveal-scale">
            <div className="service-shimmer" />
            <div className="service-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="28" height="20" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
                <polygon points="30,12 38,10 38,30 30,28" stroke="#E4B94F" strokeWidth="1.2" fill="none" />
                <circle cx="12" cy="18" r="4" stroke="#F2EFE9" strokeWidth="0.8" />
              </svg>
            </div>
            <span className="service-num">01</span>
            <h3 className="service-title">Cinematic Content Production</h3>
            <p className="service-desc">We plan, shoot, direct, and edit content that makes your brand impossible to scroll past. Every frame is intentional. Every deliverable is premium.</p>
            <ul className="service-list">
              <li>Brand Films</li>
              <li>Commercial Ad Films</li>
              <li>Delivery &amp; Event Reels</li>
              <li>Product &amp; Fashion Shoots</li>
              <li>Podcast Production</li>
              <li>Event Coverage</li>
              <li>YouTube &amp; Shorts Content</li>
            </ul>
          </div>

          <div className="service-card reveal-scale">
            <div className="service-shimmer" />
            <div className="service-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="32" height="24" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
                <line x1="4" y1="34" x2="36" y2="34" stroke="#F2EFE9" strokeWidth="0.8" />
                <circle cx="12" cy="16" r="4" stroke="#E4B94F" strokeWidth="0.8" />
                <circle cx="28" cy="16" r="4" stroke="#E4B94F" strokeWidth="0.8" />
                <path d="M16 16 Q20 12 24 16" stroke="#F2EFE9" strokeWidth="0.8" fill="none" />
              </svg>
            </div>
            <span className="service-num">02</span>
            <h3 className="service-title">Social Media Management</h3>
            <p className="service-desc">We own your social media presence end-to-end. Content calendar, captions, scheduling, growth strategy, and paid ads — your brand stays consistent and growing.</p>
            <ul className="service-list">
              <li>Monthly Content Calendar</li>
              <li>Caption Writing &amp; Scheduling</li>
              <li>Instagram &amp; YouTube Growth</li>
              <li>Google &amp; Meta Ad Management</li>
              <li>Performance Analytics</li>
              <li>Competitor Analysis</li>
              <li>Paid Ads Integration</li>
            </ul>
          </div>

          <div className="service-card reveal-scale">
            <div className="service-shimmer" />
            <div className="service-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="36" height="24" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
                <line x1="14" y1="30" x2="26" y2="30" stroke="#F2EFE9" strokeWidth="0.8" />
                <line x1="20" y1="30" x2="20" y2="36" stroke="#F2EFE9" strokeWidth="0.8" />
                <polyline points="8,20 14,14 20,18 26,12 34,16" stroke="#E4B94F" strokeWidth="1" fill="none" />
              </svg>
            </div>
            <span className="service-num">03</span>
            <h3 className="service-title">Website Development</h3>
            <p className="service-desc">We build cinematic, conversion-focused websites for premium brands — static, dynamic, or full e-commerce. Fast, mobile-first, and delivered on schedule.</p>
            <ul className="service-list">
              <li>Static &amp; Business Websites</li>
              <li>Dynamic Websites (CMS)</li>
              <li>E-Commerce Stores</li>
              <li>WhatsApp &amp; Booking Integration</li>
              <li>Full SEO Setup</li>
              <li>Google Analytics Integration</li>
              <li>Domain Connection &amp; Deployment</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ───────────────────────────────── */}
      <section id="reel">
        <div className="portfolio-header">
          <div>
            <span className="section-eyebrow reveal">Our Work</span>
            <h2 className="section-title reveal">Cinematic content<br /><em>that converts.</em></h2>
          </div>
          <div className="portfolio-stats">
            <div className="pstat">
              <span className="pstat-num" data-count="250">0</span>
              <span className="pstat-label">Brand Films Produced</span>
            </div>
            <div className="pstat">
              <span className="pstat-num" data-count="50">0</span>
              <span className="pstat-label">Premium Brands</span>
            </div>
            <div className="pstat">
              <span className="pstat-num" data-count="6">0</span>
              <span className="pstat-label">Years Industry Exp.</span>
            </div>
          </div>
        </div>

        <div className="portfolio-filter reveal">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="showreel-wrap reveal" onClick={() => openModal("JSwBhWSN5tE")}>
          <Image src="/reel-poster.jpg" alt="Production X Showreel 2026" fill sizes="100vw" style={{ objectFit: "cover" }} />
          <div className="showreel-overlay">
            <div className="play-btn">
              <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
            </div>
            <span className="showreel-meta">Production X — Showreel 2026 &nbsp;·&nbsp; 2 min &nbsp;·&nbsp; Automotive · Hospitality · Fashion · Lifestyle</span>
          </div>
        </div>

        <div className="portfolio-grid">
          {PORTFOLIO_ITEMS.map((item) => (
            <div
              key={item.videoId}
              className="portfolio-item reveal-scale"
              style={{ display: activeFilter === "all" || activeFilter === item.cat ? undefined : "none" }}
              onClick={() => openModal(item.videoId)}
            >
              <Image src={item.img} alt={item.alt} fill sizes="(max-width: 900px) 50vw, 33vw" style={{ objectFit: "cover" }} />
              <div className="portfolio-item-overlay">
                <span className="portfolio-item-tag">{item.tag}</span>
                <div className="portfolio-item-play">
                  <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
                <div className="portfolio-item-info">
                  <span className="portfolio-item-duration">{item.duration}</span>
                  <span className="portfolio-item-title">{item.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="portfolio-cta reveal">
          <a href="https://instagram.com/productionx.in" target="_blank" rel="noopener noreferrer">View Full Portfolio on Instagram ↗</a>
        </div>
      </section>

      {/* ── CASE STUDY ──────────────────────────────── */}
      <section id="case-study">
        <span className="section-eyebrow reveal">Case Study</span>
        <div className="cs-header">
          <div>
            <span className="cs-badge">End-to-End Brand Build</span>
            <h2 className="section-title reveal" style={{ marginBottom: 16 }}>From Zero to Brand.<br /><em>The Ujwala Group Story.</em></h2>
            <p className="section-sub reveal" style={{ marginBottom: 32 }}>
              Ujwala Group came to Production X with three brands, zero digital presence, and a vision.
              We built everything from the ground up — brand identity, digital infrastructure, cinematic production, campaigns, and e-commerce. Here&rsquo;s what that looked like.
            </p>
            <span className="cs-result-highlight reveal" id="enquiry-count">0</span>
            <span className="cs-result-label reveal">enquiries and walk-ins per month<br />generated from zero — through organic social, campaigns &amp; e-commerce</span>
          </div>
          <div className="cs-right-text reveal">
            <strong>What Production X delivered:</strong>
            Every brand asset, every digital property, every piece of content — conceived, designed, produced, and launched by Production X. Logo to e-commerce. Idea to execution. Zero to 300 enquiries a month.
            <br /><br />
            This is what a full brand build looks like. Not a rebrand. Not a refresh.
            A complete brand built from an idea.
          </div>
        </div>

        <div className="brand-tree reveal">
          <div className="brand-tree-root">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
              <line x1="10" y1="6" x2="10" y2="14" stroke="#E4B94F" strokeWidth="1" />
              <line x1="6" y1="10" x2="14" y2="10" stroke="#E4B94F" strokeWidth="1" />
            </svg>
            <span>Ujwala Group</span>
          </div>
          <div className="brand-tree-branches">
            <div className="brand-branch">
              <span className="brand-branch-name">
                <a href="https://1ujfashion.com" target="_blank" rel="noopener noreferrer" className="brand-branch-link">1UJ Fashion</a>
              </span>
              <span className="brand-branch-type">Fashion &amp; Apparel · 1ujfashion.com</span>
            </div>
            <div className="brand-branch">
              <span className="brand-branch-name">1UJ Lifestyle &amp; Luxury</span>
              <span className="brand-branch-type">Lifestyle &amp; Luxury</span>
            </div>
            <div className="brand-branch">
              <span className="brand-branch-name">
                <a href="https://oneuj.com" target="_blank" rel="noopener noreferrer" className="brand-branch-link">Smart Living OneUJ</a>
              </span>
              <span className="brand-branch-type">E-Commerce · oneuj.com</span>
            </div>
          </div>
        </div>

        <div className="cs-deliverables">
          <div className="cs-card reveal-scale">
            <span className="cs-card-num">01</span>
            <div className="cs-card-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="14" stroke="#E4B94F" strokeWidth="1.2" />
                <text x="18" y="23" textAnchor="middle" fontSize="14" fill="#E4B94F" fontFamily="serif">X</text>
              </svg>
            </div>
            <h4 className="cs-card-title">Logo &amp; Brand Kit</h4>
            <p className="cs-card-desc">Complete visual identity — logo design, colour palette, typography system, and full brand guidelines for all three brands under the Ujwala Group tree. Built from a blank canvas.</p>
            <div className="cs-card-check">
              <svg viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>
          <div className="cs-card reveal-scale">
            <span className="cs-card-num">02</span>
            <div className="cs-card-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <rect x="4" y="4" width="28" height="20" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
                <line x1="4" y1="30" x2="32" y2="30" stroke="#F2EFE9" strokeWidth="0.8" />
              </svg>
            </div>
            <h4 className="cs-card-title">Brand Bible</h4>
            <p className="cs-card-desc">Comprehensive brand bible covering voice, tone, visual rules, messaging hierarchy, and usage guidelines — ensuring every touchpoint speaks with one consistent identity.</p>
            <div className="cs-card-check">
              <svg viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>
          <div className="cs-card reveal-scale">
            <span className="cs-card-num">03</span>
            <div className="cs-card-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="8" stroke="#E4B94F" strokeWidth="1.2" />
                <path d="M6 32 Q18 24 30 32" stroke="#E4B94F" strokeWidth="1.2" fill="none" />
              </svg>
            </div>
            <h4 className="cs-card-title">Social Media Presence</h4>
            <p className="cs-card-desc">Built Instagram and Facebook from zero followers — full content strategy, cinematic reels, captions, scheduling, and organic growth. Every post concepted, shot, and managed by Production X.</p>
            <div className="cs-card-check">
              <svg viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>
          <div className="cs-card reveal-scale">
            <span className="cs-card-num">04</span>
            <div className="cs-card-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="12" stroke="#E4B94F" strokeWidth="1.2" />
                <path d="M6 18 Q12 10 18 18 Q24 26 30 18" stroke="#F2EFE9" strokeWidth="0.8" fill="none" />
              </svg>
            </div>
            <h4 className="cs-card-title">Google Business &amp; SEO</h4>
            <p className="cs-card-desc">Claimed, verified, and optimised Google Business Profiles for all brands — photo strategy, reviews management, Q&amp;A, and full local SEO setup to drive footfall and organic discovery.</p>
            <div className="cs-card-check">
              <svg viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>
          <div className="cs-card reveal-scale">
            <span className="cs-card-num">05</span>
            <div className="cs-card-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <path d="M4 28 Q12 8 20 20 Q28 32 32 12" stroke="#E4B94F" strokeWidth="1.2" fill="none" />
                <circle cx="20" cy="20" r="3" fill="#E4B94F" />
              </svg>
            </div>
            <h4 className="cs-card-title">Meta &amp; Google Campaigns</h4>
            <p className="cs-card-desc">Full-funnel paid campaign management — Facebook, Instagram, and Google Ads. Targeting strategy, ad creative, copywriting, A/B testing, and continuous optimisation for lead generation and online sales.</p>
            <div className="cs-card-check">
              <svg viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>
          <div className="cs-card reveal-scale">
            <span className="cs-card-num">06</span>
            <div className="cs-card-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <rect x="4" y="6" width="28" height="22" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
                <line x1="10" y1="28" x2="26" y2="28" stroke="#F2EFE9" strokeWidth="0.8" />
                <line x1="18" y1="28" x2="18" y2="34" stroke="#F2EFE9" strokeWidth="0.8" />
                <rect x="10" y="12" width="6" height="8" rx="0.5" fill="#E4B94F" opacity="0.5" />
                <rect x="20" y="10" width="6" height="10" rx="0.5" fill="#E4B94F" opacity="0.3" />
              </svg>
            </div>
            <h4 className="cs-card-title">Two Websites — Static &amp; E-Commerce</h4>
            <p className="cs-card-desc">1UJ Fashion — cinematic brand website. Smart Living OneUJ (oneuj.com) — fully functional e-commerce with Razorpay integration, product catalogue, WhatsApp notifications, and mobile-first design. Both built and launched end-to-end.</p>
            <div className="cs-card-check">
              <svg viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>
        </div>

        <div className="cs-cta reveal">
          <p className="cs-cta-text">This is what a full brand build looks like.<br /><strong>Want yours?</strong></p>
          <a href="#book" className="btn-primary"><span>Book a Discovery Call</span></a>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────── */}
      <section id="about">
        <div className="about-left">
          <span className="section-eyebrow reveal">About</span>
          <div className="gold-rule reveal" />
          <h2 className="section-title reveal">Built from the inside.<br /><em>Delivered with precision.</em></h2>
          <div className="about-body reveal">
            <p>Production X was built by people who sat on the brand side before they built the studio.</p>
            <p>We&rsquo;ve been the marketing head who briefed agencies and watched them miss the point. We&rsquo;ve been the creative producer who knew exactly what the brand needed — and couldn&rsquo;t get the agency to deliver it. We built Production X to close that gap. Permanently.</p>
            <p>We think like brand managers. We plan like strategists. We execute like a studio that knows what&rsquo;s at stake — because we&rsquo;ve been on the other side of the table.</p>
            <p><strong>That&rsquo;s the difference. And it shows in every frame.</strong></p>
          </div>
        </div>
        <div className="about-right">
          <div className="credentials">
            <div className="credential reveal-right">
              <div className="credential-icon">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="6" width="28" height="20" rx="1" stroke="#E4B94F" strokeWidth="1.2" />
                  <polygon points="14,12 22,16 14,20" fill="#E4B94F" />
                </svg>
              </div>
              <div>
                <span className="credential-title">Brand-side content experience</span>
                <span className="credential-sub">Mercedes-Benz · AP &amp; Telangana</span>
              </div>
            </div>
            <div className="credential reveal-right">
              <div className="credential-icon">
                <svg viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="12" r="6" stroke="#E4B94F" strokeWidth="1.2" />
                  <path d="M6 28 Q16 20 26 28" stroke="#E4B94F" strokeWidth="1.2" fill="none" />
                </svg>
              </div>
              <div>
                <span className="credential-title">Creative &amp; marketing leadership</span>
                <span className="credential-sub">Ujwala Group · 1UJ Fashion &amp; Lifestyle</span>
              </div>
            </div>
            <div className="credential reveal-right">
              <div className="credential-icon">
                <svg viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="#E4B94F" strokeWidth="1.2" />
                  <line x1="4" y1="16" x2="28" y2="16" stroke="#F2EFE9" strokeWidth="0.8" />
                  <ellipse cx="16" cy="16" rx="6" ry="12" stroke="#F2EFE9" strokeWidth="0.8" />
                </svg>
              </div>
              <div>
                <span className="credential-title">International production partner</span>
                <span className="credential-sub">PitStop Group &amp; Three Falcons · UK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────── */}
      <section id="process">
        <span className="section-eyebrow reveal">How We Work</span>
        <h2 className="section-title reveal">Simple. Transparent.<br /><em>Always delivered.</em></h2>
        <p className="section-sub reveal">You show up. We take care of everything else.</p>

        <div className="process-grid">
          {[
            ["01", "Brief & Discovery", "A 30-minute call to understand your brand, goals, and content requirements."],
            ["02", "Strategy & Planning", "We build your monthly content calendar — shoot dates, concepts, formats, social plan."],
            ["03", "Production", "Our team handles the full shoot. You show up. We take care of everything else."],
            ["04", "Edit & Review", "Content edited to your brand. One round of feedback via our review platform."],
            ["05", "Delivery", "Files delivered or posted directly to your social media — on schedule, every time."],
          ].map(([num, title, desc]) => (
            <div className="process-step" key={num}>
              <div className="process-line"><div className="process-line-fill" /></div>
              <span className="process-num">{num}</span>
              <h4 className="process-title">{title}</h4>
              <p className="process-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOKING ─────────────────────────────────── */}
      <section id="book">
        <div className="book-grid">
          <div>
            <span className="section-eyebrow reveal">Book a Call</span>
            <h2 className="section-title reveal">Let&rsquo;s build something<br /><em>your audience will<br />remember.</em></h2>
            <p className="section-sub reveal">Fill in your details and we&rsquo;ll get back to you within 24 hours to schedule a free 30-minute discovery call.</p>
            <div className="book-contact">
              <a href={WA_INTRO_LINK} className="book-contact-item reveal-left" target="_blank" rel="noopener noreferrer">
                <span className="book-contact-icon">
                  <svg viewBox="0 0 16 16" fill="#E4B94F"><path d="M8 0C3.6 0 0 3.6 0 8c0 1.4.4 2.8 1 4L0 16l4.2-1.1C5.3 15.6 6.6 16 8 16c4.4 0 8-3.6 8-8s-3.6-8-8-8zm3.9 11.3c-.2.5-1 1-1.4 1-.4 0-.8.1-2.5-.5-1.7-.7-3.3-3-3.4-3.2-.1-.1-.9-1.2-.9-2.3s.7-1.6.9-1.8c.2-.2.5-.3.7-.3h.4c.2 0 .4.1.6.5l.8 1.8c.1.2.1.4 0 .6l-.4.7c-.1.1-.1.3 0 .4.4.7.9 1.3 1.5 1.8.5.4 1.1.7 1.7.8.2 0 .3 0 .4-.2l.5-.7c.1-.2.3-.2.5-.1l1.8.8c.2.1.3.2.3.4v.3z" /></svg>
                </span>
                <span className="book-contact-text">+91 93919 26846</span>
              </a>
              <a href="mailto:info@productionx.in" className="book-contact-item reveal-left">
                <span className="book-contact-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="#E4B94F" strokeWidth="1.2"><rect x="1" y="3" width="14" height="10" rx="1" /><path d="M1 3l7 6 7-6" /></svg>
                </span>
                <span className="book-contact-text">info@productionx.in</span>
              </a>
              <a href="https://instagram.com/productionx.in" className="book-contact-item reveal-left" target="_blank" rel="noopener noreferrer">
                <span className="book-contact-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="#E4B94F" strokeWidth="1.2"><rect x="1" y="1" width="14" height="14" rx="3" /><circle cx="8" cy="8" r="3" /><circle cx="11.5" cy="4.5" r="0.5" fill="#E4B94F" /></svg>
                </span>
                <span className="book-contact-text">@productionx.in</span>
              </a>
            </div>
          </div>
          <div>
            {formStatus !== "success" && (
              <form className="book-form reveal" onSubmit={handleSubmit}>
                <div className="form-row-2">
                  <input type="text" name="name" className="form-input" placeholder="Your Name" required />
                  <input type="text" name="brand" className="form-input" placeholder="Brand / Company" required />
                </div>
                <div className="form-row-2">
                  <input type="tel" name="phone" className="form-input" placeholder="Phone Number" required />
                  <input type="email" name="email" className="form-input" placeholder="Email Address" required />
                </div>
                <div className="form-row">
                  <select name="service" className="form-select form-input" required defaultValue="">
                    <option value="" disabled>What do you need?</option>
                    <option>Cinematic Content Production</option>
                    <option>Social Media Management</option>
                    <option>Both — Production &amp; Management</option>
                    <option>Brand Film (One-off)</option>
                    <option>Website Development</option>
                    <option>Event Coverage</option>
                    <option>Custom Package</option>
                  </select>
                </div>
                <div className="form-row">
                  <textarea name="message" className="form-textarea form-input" placeholder="Tell us about your brand" />
                </div>
                <div className="form-row">
                  <select name="budget" className="form-select form-input" defaultValue="">
                    <option value="" disabled>Budget range</option>
                    <option>Website — ₹35,000</option>
                    <option>₹75,000 – ₹1,00,000</option>
                    <option>₹1,00,000 – ₹1,50,000</option>
                    <option>₹1,50,000 – ₹2,00,000</option>
                    <option>₹2,00,000+</option>
                    <option>One-off Project</option>
                  </select>
                </div>
                <button type="submit" className="form-submit" disabled={formStatus === "submitting"}>
                  <span>{formStatus === "submitting" ? "Sending…" : "Book My Free Call →"}</span>
                </button>
                {formStatus === "error" && (
                  <p className="form-error">Something went wrong. Please try WhatsApp or email us directly.</p>
                )}
                <p className="form-note">We respond within 24 hours. No spam. No obligations.</p>
              </form>
            )}
            {formStatus === "success" && (
              <div className="form-success show">
                <div className="form-success-icon">
                  <svg viewBox="0 0 24 24" fill="none"><polyline points="4,12 9,17 20,6" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <h3>We&rsquo;ve received your request.</h3>
                <p>Kiran will reach out within 24 hours to schedule your free discovery call.</p>
                <a href={WA_INTRO_LINK} className="btn-primary" target="_blank" rel="noopener noreferrer"><span>Chat on WhatsApp now</span></a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand-row">
              <Image src="/logo.png" alt="Production X" width={100} height={32} style={{ height: 32, width: "auto" }} />
              <div className="footer-brand-text">
                <span className="footer-brand-name">Production X</span>
                <span className="footer-brand-sub">Cinematic Studio</span>
              </div>
            </div>
            <p className="footer-tagline">Every frame earns its place.</p>
          </div>
          <div>
            <span className="footer-col-title">Services</span>
            <ul className="footer-col-links">
              <li><a href="#services">Content Production</a></li>
              <li><a href="#services">Social Media Management</a></li>
              <li><a href="#services">Brand Films</a></li>
              <li><a href="#services">Event Coverage</a></li>
            </ul>
          </div>
          <div>
            <span className="footer-col-title">Company</span>
            <ul className="footer-col-links">
              <li><a href="#about">About</a></li>
              <li><a href="#reel">Our Work</a></li>
              <li><a href="#case-study">Case Study</a></li>
              <li><a href="#book">Contact</a></li>
            </ul>
          </div>
          <div>
            <span className="footer-col-title">Connect</span>
            <ul className="footer-col-links">
              <li><a href="https://instagram.com/productionx.in" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://wa.me/919391926846" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href="mailto:info@productionx.in">Email Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Production X Creative. Hyderabad · Vizag · Pan India.</span>
          <a href="tel:+919391926846" className="footer-tel">+91 93919 26846</a>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ───────────────────────── */}
      <a href={WA_INTRO_LINK} id="wa-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <span className="wa-tooltip">Chat with us</span>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6C8.2 23.4 10 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0zm6 16.9c-.3.8-1.5 1.5-2.1 1.5-.6.1-1.2.2-3.8-.8-2.6-1-4.9-4.5-5.1-4.7-.2-.2-1.4-1.8-1.4-3.4s1-2.4 1.4-2.7c.4-.3.7-.4 1-.4h.6c.3 0 .6.1.9.8l1.2 2.7c.2.3.1.6-.1.9l-.6 1c-.2.2-.2.4 0 .6.6 1 1.4 2 2.3 2.7.8.6 1.7 1 2.6 1.2.3.1.5 0 .7-.2l.8-1c.2-.3.5-.4.8-.2l2.7 1.3c.3.1.5.3.5.6v.5l-.4-.5z" />
        </svg>
      </a>

      {/* ── VIDEO MODAL ─────────────────────────────── */}
      <div className="video-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Video player">
        <div className="modal-backdrop" onClick={closeModal} />
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal} aria-label="Close video">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Close
          </button>
          <div className="modal-player">
            <iframe
              ref={modalIframeRef}
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Production X — Video"
            />
          </div>
        </div>
      </div>
    </>
  );
}
