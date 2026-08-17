import { site } from '../../config/site';

const DESCRIPTION =
  'Atlas publishes sealed, timestamped forecasts on the semiconductor supply chain, graded mechanically against a rule fixed when the forecast was made.';

export const metadata = {
  // Separators are middots, not em dashes: these strings render in the browser
  // tab and in share cards, so they count as page copy. og/twitter titles are
  // restated here because the site-wide ones in app/layout.js carry an em dash
  // and a page's openGraph block replaces the layout's rather than merging into
  // it. Scoped to this route on purpose: the home page and /contact keep theirs.
  title: `About · ${site.name}`,
  description: DESCRIPTION,
  openGraph: {
    title: `About · ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/about`,
    siteName: site.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About · ${site.name}`,
    description: DESCRIPTION,
  },
};

// Operator-approved copy, used as written. Each block renders as a dark card in
// the claim-tile grammar: the big title sits where a tile's ticker sits, the
// chip where a tile's tag-chip sits, using the same .chip class the tiles use.
const SECTIONS = [
  {
    title: 'What this is',
    chip: 'The record',
    body: `Atlas publishes forecasts on the semiconductor supply chain. Specific, dated predictions about what companies like TSMC, Micron, and Amkor will report. Every forecast is written down, hashed, and anchored to the Bitcoin blockchain the moment it is made. It is then graded mechanically against a rule fixed at that same moment. The full record is public. Every forecast, right and wrong. Nothing is edited or removed after the fact.`,
  },
  {
    title: 'How it works',
    chip: 'The method',
    body: `Underneath is a frozen map of the semiconductor supply chain. It records which companies depend on whom, and how a change at one company travels to the others. A fixed reasoning process runs over that map and the recorded market consensus, looking for places where the consensus has misread the structure. When it finds one, the claim is sealed: a concrete statement with a date and a threshold, timestamped before the outcome is known.`,
  },
  {
    title: 'Why sealed, why public',
    chip: 'The proof',
    body: `Anyone can say they called it after it happens. The only way to prove a forecast was made in advance is to timestamp it before the result exists. That is what the Bitcoin anchor does. An honest track record also has to include the misses. Most market commentary quietly deletes what it got wrong. This record keeps all of it, and grades by arithmetic rather than opinion. You do not have to take any of this on trust. Every claim links to its hash and its timestamp proof, and you can verify both yourself.`,
  },
  {
    title: 'Who runs it',
    chip: 'The operator',
    body: `Atlas is an independent research project. The work is built to stand on its record. What matters is whether the forecasts resolve correctly, and anyone can check that.`,
  },
];

export default function AboutPage() {
  return (
    <section className="section page-section" id="about" style={{ '--wc': 'var(--w2)' }}>
      <div className="page-head">
        <h1>About</h1>
        <span className="page-sub">what Atlas is · how it works · who runs it</span>
      </div>

      <div className="dark-stack">
        {SECTIONS.map((s, i) => (
        <article className="dark-card" key={s.title}>
          <div className="dc-hdr">
            <h3 className="dc-title">{s.title}</h3>
            <span className="chip alpha">{s.chip}</span>
          </div>
          <p className="dc-prose">{s.body}</p>

          {i === SECTIONS.length - 1 && (
            <div className="dc-fine">
              Nothing here is investment advice. Atlas takes no payment for
              coverage, and may hold positions in names discussed. Do your own
              research.
            </div>
          )}
        </article>
        ))}
      </div>
    </section>
  );
}
