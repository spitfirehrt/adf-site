import { links } from '../config/site';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// RFC-822 pubDate → deterministic "12 Aug 2026" (UTC, no locale drift).
function fmtPubDate(pubDate) {
  if (!pubDate) return '';
  const d = new Date(pubDate);
  if (isNaN(d)) return '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function Essays({ data }) {
  const posts = data?.posts || [];

  return (
    <section className="section" id="essays" style={{ '--wc': 'var(--w1)' }}>
      <div className="section-head">
        <h2>Essays</h2>
        <span>
          {posts.length > 0
            ? `${posts.length} post${posts.length === 1 ? '' : 's'} · newest first · live from substack`
            : 'live from substack'}
        </span>
      </div>
      <p className="section-goal">
        The reasoning behind the positions — supply-chain structure, and what a
        deviation would have to look like to be real.
      </p>

      {posts.length === 0 ? (
        <div className="card card-accent">
          <p style={{ fontSize: 14, color: 'var(--dim)' }}>
            No posts are readable from the feed right now.
          </p>
          <div className="linkrow">
            <a href={links.substack} target="_blank" rel="noreferrer">
              read on substack ↗
            </a>
          </div>
        </div>
      ) : (
        <div className="essays">
          {posts.map((p) => (
            <a
              className="essay"
              key={p.link}
              href={p.link}
              target="_blank"
              rel="noreferrer"
            >
              <div className="date">{fmtPubDate(p.pubDate)}</div>
              <h3>{p.title}</h3>
              {p.summary && <p>{p.summary}</p>}
            </a>
          ))}
        </div>
      )}

      <div className="linkrow" style={{ marginTop: 12 }}>
        <a href={links.substack} target="_blank" rel="noreferrer">
          subscribe on substack ↗
        </a>
      </div>
    </section>
  );
}
