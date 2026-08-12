import { Icon } from "./graphics";
import { FAQ } from "../lib/faq";

/**
 * Answers rendered as plain visible text rather than hidden behind an
 * accordion. Collapsed content is still in the DOM and still readable by a
 * crawler, but a person scanning for the one answer they came for should not
 * have to open seven panels to find it — and neither should an assistant
 * summarising the page for them.
 */
export default function Faq() {
  return (
    <section className="band faq" id="faq">
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">
            <Icon name="search" size={15} />
            07 — Questions
          </span>
          <h2>The things people ask on the first call.</h2>
        </header>

        <dl className="faq__list">
          {FAQ.map(({ q, a }) => (
            <div className="faq__row" key={q} data-reveal>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
