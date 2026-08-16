import { site } from '../config/site';

// Operator's final hero copy — verbatim. Visual order is the reading order:
// identity (Atlas) → what it is (ADF descriptor) → the pitch → the lede.
export default function Hero() {
  return (
    <header className="hero">
      <div className="anchor">{site.name}</div>
      <p className="subanchor">{site.descriptor}</p>

      <div className="rule" />

      <h1>
        I timestamp my calls before they play out —{' '}
        <span className="hl">and I show the ones I get wrong.</span>
      </h1>
      <p className="lede">
        Dated forecasts on the semiconductor supply chain, sealed the moment I make
        them and graded against reality. The full record is public, right and wrong
        both. No edits, nothing deleted.
      </p>
    </header>
  );
}
