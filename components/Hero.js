import { site, heroHeadlines, heroHeadline, heroLede } from '../config/site';

// Reading order is the visual order: identity (Atlas) → what it is (ADF
// descriptor) → the plain statement → the lede. The live scoreboard strip is
// rendered immediately under this by page.js, so the record is on screen before
// a visitor scrolls anything.
export default function Hero() {
  const headline = heroHeadlines[heroHeadline] || heroHeadlines[0];

  return (
    <header className="hero">
      <div className="anchor">{site.name}</div>
      <p className="subanchor">{site.descriptor}</p>
      <h1>{headline}</h1>
      <p className="lede">{heroLede}</p>
    </header>
  );
}
