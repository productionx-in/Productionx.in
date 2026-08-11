"use client";

import { Arrow, Tick } from "./graphics";

type Pack = {
  name: string;
  price: string;
  note: string;
  items: string[];
  featured?: boolean;
};

/**
 * The studio's published retainers, shown as a floor rather than a flat rate.
 *
 * A buyer weighing a marketing partner wants the order of magnitude before
 * they call — hiding it costs more enquiries than it protects, and filters out
 * the briefs that were never going to convert. "From" keeps that benefit
 * without capping a larger scope: strategy, websites and previz sit outside
 * these tiers and are quoted on top.
 *
 * To show flat prices instead, delete the `from` flag below. To remove pricing
 * entirely, drop <Packages /> from app/page.tsx and the nav link in Chrome.tsx.
 */
const SHOW_FROM = true;
const PACKS: Pack[] = [
  {
    name: "Foundation",
    price: "₹75,000",
    note: "For brands establishing a consistent presence.",
    items: [
      "8 cinematic reels a month",
      "10 static posts",
      "Stories pack (10)",
      "Caption writing & scheduling",
      "1 shoot day a month",
      "Monthly analytics report",
    ],
  },
  {
    name: "Growth",
    price: "₹1,25,000",
    note: "For brands pushing for reach and enquiries.",
    featured: true,
    items: [
      "15 cinematic reels a month",
      "1 brand film (2–3 min)",
      "Full social media management",
      "Content calendar & strategy",
      "2–3 shoot days a month",
      "Monthly analytics & review",
    ],
  },
  {
    name: "Signature",
    price: "₹2,00,000",
    note: "For brands that need a studio on permanent call.",
    items: [
      "20+ cinematic reels a month",
      "2 brand films a month",
      "Full social management",
      "Event coverage (1 a month)",
      "Performance ads integration",
      "Dedicated account manager",
    ],
  },
];

export default function Packages() {
  return (
    <section className="band packs" id="packages">
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">07 — Engagement</span>
          <h2>Built around your goals.</h2>
        </header>

        <p className="lead" data-reveal style={{ marginBottom: "var(--s6)" }}>
          Monthly retainers with a three-month minimum and 50% advance to
          initiate. Brand strategy, websites, search and previsualisation are
          scoped and quoted on top — or folded into a custom retainer.
        </p>

        <div className="packs__grid" data-reveal data-reveal-group>
          {PACKS.map((p) => (
            <article className={`pack${p.featured ? " pack--featured" : ""}`} key={p.name}>
              {p.featured && <span className="pack__flag label">Most popular</span>}
              <h3>{p.name}</h3>
              <p className="pack__note">{p.note}</p>
              <div className="pack__price">
                {SHOW_FROM && <span className="pack__from label">From</span>}
                {p.price}
                <span className="label"> / month</span>
              </div>
              <ul className="pack__items">
                {p.items.map((i) => (
                  <li key={i}><Tick /><span>{i}</span></li>
                ))}
              </ul>
              <a href="#contact" className={`btn${p.featured ? "" : " btn--ghost"}`}>
                Book a call
                <Arrow className="arrow" />
              </a>
            </article>
          ))}
        </div>

        <p className="packs__foot label" data-reveal>
          Need something specific? We build custom packages for brands with unique requirements.
        </p>
      </div>
    </section>
  );
}
