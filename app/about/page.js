import { site } from '../../config/site';

export const metadata = {
  title: `About — ${site.name}`,
  description:
    'Atlas publishes sealed, timestamped forecasts on the semiconductor supply chain, graded mechanically against a rule fixed when the forecast was made.',
};

// Operator-approved copy, used as written. Each block renders as a dark card in
// the claim-tile grammar: the big title sits where a tile's ticker sits, the
// chip where a tile's tag-chip sits — the same .chip class the tiles use.
const SECTIONS = [
  {
    title: 'What this is',
    chip: 'The record',
    body: `Atlas publishes forecasts about the semiconductor supply chain — specific, dated predictions about what companies like TSMC, Micron, Amkor and their suppliers will report. Each one is written down, hashed, and anchored to the Bitcoin blockchain the moment it's made, then graded mechanically against a rule fixed at that same moment. The full record is public: every forecast, right and wrong, with nothing edited or removed after the fact.`,
  },
  {
    title: 'How it works',
    chip: 'The method',
    body: `Underneath is a frozen map of the semiconductor supply chain — which companies depend on whom, and how a change at one node travels to the others. A fixed reasoning process runs over that map and the recorded market consensus, looking for places where the consensus has misread the structure — where the expected number is wrong given how the dependencies actually connect. When it finds one, the claim is sealed: a concrete, falsifiable statement with a date and a threshold, timestamped before the outcome is known.`,
  },
  {
    title: 'Why sealed, why public',
    chip: 'The proof',
    body: `Anyone can say they called something after it happens. The only way to prove a forecast was made in advance is to timestamp it before the result exists — which is what the Bitcoin anchor does. And the only honest track record is one that includes the misses. Most market commentary quietly deletes what it got wrong; this record keeps all of it, and grades by arithmetic rather than opinion. You don't have to trust any of it — every claim links to its hash and its timestamp proof, verifiable independently.`,
  },
  {
    title: 'Who runs it',
    chip: 'The operator',
    body: `Atlas is a pseudonymous research operation. The work is meant to stand on the record, not on a name — the point is whether the forecasts resolve correctly, which anyone can check.`,
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
              NFA DYOR · no paid promos · views my own, may hold names discussed.
            </div>
          )}
        </article>
        ))}
      </div>
    </section>
  );
}
