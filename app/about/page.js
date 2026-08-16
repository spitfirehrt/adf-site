import { site } from '../../config/site';

export const metadata = {
  title: `About — ${site.name}`,
  description:
    'Atlas publishes sealed, timestamped forecasts on the semiconductor supply chain, graded mechanically against a rule fixed when the forecast was made.',
};

// Operator-approved copy, used as written. Each block is a mono eyebrow label
// plus its prose; the whole thing sits inside one large contained panel so no
// paragraph is ever read off the grid-paper.
const SECTIONS = [
  {
    label: 'What this is',
    body: `Atlas publishes forecasts about the semiconductor supply chain — specific, dated predictions about what companies like TSMC, Micron, Amkor and their suppliers will report. Each one is written down, hashed, and anchored to the Bitcoin blockchain the moment it's made, then graded mechanically against a rule fixed at that same moment. The full record is public: every forecast, right and wrong, with nothing edited or removed after the fact.`,
  },
  {
    label: 'How it works',
    body: `Underneath is a frozen map of the semiconductor supply chain — which companies depend on whom, and how a change at one node travels to the others. A fixed reasoning process runs over that map and the recorded market consensus, looking for places where the consensus has misread the structure — where the expected number is wrong given how the dependencies actually connect. When it finds one, the claim is sealed: a concrete, falsifiable statement with a date and a threshold, timestamped before the outcome is known.`,
  },
  {
    label: 'Why sealed, why public',
    body: `Anyone can say they called something after it happens. The only way to prove a forecast was made in advance is to timestamp it before the result exists — which is what the Bitcoin anchor does. And the only honest track record is one that includes the misses. Most market commentary quietly deletes what it got wrong; this record keeps all of it, and grades by arithmetic rather than opinion. You don't have to trust any of it — every claim links to its hash and its timestamp proof, verifiable independently.`,
  },
  {
    label: 'Who runs it',
    body: `Atlas is a pseudonymous research operation. The work is meant to stand on the record, not on a name — the point is whether the forecasts resolve correctly, which anyone can check.`,
  },
];

export default function AboutPage() {
  return (
    <section className="section page-section" id="about" style={{ '--wc': 'var(--w2)' }}>
      <div className="section-head">
        <h2>About</h2>
        <span>what Atlas is · how it works · who runs it</span>
      </div>

      <article className="prose-panel">
        {SECTIONS.map((s) => (
          <div className="prose-block" key={s.label}>
            <div className="prose-label">{s.label}</div>
            <p>{s.body}</p>
          </div>
        ))}

        <div className="prose-fine">
          NFA DYOR · no paid promos · views my own, may hold names discussed.
        </div>
      </article>
    </section>
  );
}
