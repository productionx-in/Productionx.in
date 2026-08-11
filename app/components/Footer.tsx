export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell wrap">
        <div className="footer__top">
          <div style={{ maxWidth: "34ch" }}>
            <div className="nav__mark" style={{ marginBottom: "var(--s2)" }}>
              <span className="nav__dot" aria-hidden="true" />
              <span className="nav__word">ProductionX</span>
            </div>
            <p className="muted" style={{ fontSize: "var(--t-sm)" }}>
              A brand and marketing studio in Hyderabad. Strategy, content, social,
              websites and AI previsualisation — under one roof.
            </p>
            <p className="italic-note" style={{ marginTop: "var(--s2)" }}>
              Every frame earns its place.
            </p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <div className="footer__col">
              <span className="label">Studio</span>
              <a href="#work">Work</a>
              <a href="#about">About</a>
              <a href="#process">How we work</a>
            </div>
            <div className="footer__col">
              <span className="label">Services</span>
              <a href="#capabilities">Brand strategy</a>
              <a href="#capabilities">Content production</a>
              <a href="#capabilities">Social media</a>
              <a href="#web">Websites &amp; search</a>
              <a href="#previz">AI &amp; previz</a>
            </div>
            <div className="footer__col">
              <span className="label">Contact</span>
              <a href="mailto:info@productionx.in">info@productionx.in</a>
              <a href="tel:+919391926846">+91 93919 26846</a>
              <a href="https://wa.me/919391926846" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="https://instagram.com/productionx.in" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </nav>
        </div>

        <div className="footer__wordmark" aria-hidden="true">ProductionX</div>

        <div className="sprocket" aria-hidden="true" style={{ marginTop: "var(--s4)" }} />

        <div className="footer__bar">
          <span className="label">© {year} ProductionX · Hyderabad, India</span>
          <span className="label">Hyderabad · Vizag · Pan India</span>
        </div>
      </div>
    </footer>
  );
}
