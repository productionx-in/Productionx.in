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
              A content studio in Hyderabad making brand films, campaign content
              and previsualisation for property that is not built yet.
            </p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <div className="footer__col">
              <span className="label">Studio</span>
              <a href="#work">Work</a>
              <a href="#capabilities">Capabilities</a>
              <a href="#process">Process</a>
            </div>
            <div className="footer__col">
              <span className="label">Services</span>
              <a href="#capabilities">Brand films</a>
              <a href="#capabilities">Campaign &amp; social</a>
              <a href="#previz">Real-estate previz</a>
            </div>
            <div className="footer__col">
              <span className="label">Contact</span>
              <a href="mailto:info@productionx.in">info@productionx.in</a>
              <a href="https://wa.me/919391926846" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="https://instagram.com/productionx.in" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </nav>
        </div>

        <div className="footer__wordmark" aria-hidden="true">ProductionX</div>

        <div className="sprocket" aria-hidden="true" style={{ marginTop: "var(--s4)" }} />

        <div className="footer__bar">
          <span className="label">© {year} ProductionX · Hyderabad, India</span>
          <span className="label">Films · Ads · AI previz · Web</span>
        </div>
      </div>
    </footer>
  );
}
