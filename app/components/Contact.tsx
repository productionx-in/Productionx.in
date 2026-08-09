"use client";

import { useState } from "react";
import { Arrow } from "./graphics";

const SERVICES = [
  "Brand film",
  "Campaign & social",
  "AI content",
  "Real-estate previz",
  "Website",
  "Not sure yet",
];

type State = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    // Validate here as well as in the route so the visitor gets the error next
    // to the field rather than as a failed request.
    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = "We need a name to reply to.";
    if (!/^[\d+\s()-]{8,}$/.test(data.phone || "")) next.phone = "Enter a reachable phone number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email || "")) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("bad response");
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <section className="band contact" id="contact">
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">05 — Start</span>
          <h2>
            Tell us the date it has to <span className="em">land</span>.
          </h2>
        </header>

        <div className="contact__layout">
          <div className="contact__aside" data-reveal>
            <p className="lead">
              Send the brief, however rough. You will hear back within one working
              day with a direction, a rough number, and whether we are the right
              studio for it — including when we are not.
            </p>

            <div className="contact__direct">
              <span className="label">Direct</span>
              <a className="ulink" href="mailto:info@productionx.in">info@productionx.in</a>
              <a className="ulink" href="https://wa.me/919391926846" target="_blank" rel="noopener noreferrer">
                WhatsApp the studio
              </a>
              <span className="label" style={{ marginTop: "var(--s3)" }}>Based in Hyderabad · Working anywhere</span>
            </div>
          </div>

          <form className="form" onSubmit={onSubmit} noValidate data-reveal>
            <div className={`field${errors.name ? " is-invalid" : ""}`}>
              <label htmlFor="f-name">Name *</label>
              <input id="f-name" name="name" autoComplete="name" required />
              {errors.name && <span className="err" role="alert">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="f-brand">Brand or company</label>
              <input id="f-brand" name="brand" autoComplete="organization" />
            </div>

            <div className={`field${errors.phone ? " is-invalid" : ""}`}>
              <label htmlFor="f-phone">Phone *</label>
              <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required />
              {errors.phone && <span className="err" role="alert">{errors.phone}</span>}
            </div>

            <div className={`field${errors.email ? " is-invalid" : ""}`}>
              <label htmlFor="f-email">Email *</label>
              <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" required />
              {errors.email && <span className="err" role="alert">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="f-service">What do you need</label>
              <select id="f-service" name="service" defaultValue={SERVICES[0]}>
                {SERVICES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-budget">Rough budget</label>
              <input id="f-budget" name="budget" placeholder="₹ range, or leave blank" />
              <span className="hint">A range is enough. It only decides scope, not whether we reply.</span>
            </div>

            <div className="field">
              <label htmlFor="f-message">The brief</label>
              <textarea id="f-message" name="message" placeholder="What it is, who it's for, when it has to land." />
            </div>

            <button className="btn" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send the brief"}
              <Arrow className="arrow" />
            </button>

            <p className="form__status" aria-live="polite">
              {state === "sent" && <span className="ok">Received. We will reply within one working day.</span>}
              {state === "error" && (
                <span className="bad">
                  That did not go through. Email{" "}
                  <a className="ulink" href="mailto:info@productionx.in">info@productionx.in</a> instead.
                </span>
              )}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
