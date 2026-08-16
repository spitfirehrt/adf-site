import Subscribe from '../../components/Subscribe';
import { site, links, contact } from '../../config/site';

export const metadata = {
  title: `Contact — ${site.name}`,
  description: 'Research enquiries and the resolution mailing list.',
};

// Deliberately thin, and pseudonymity-safe: a research address, a handle, and
// the list. Nothing that identifies a person — see the guard comment in
// config/site.js. Each channel renders as a claim tile carrying an address
// instead of a threshold: big title where the ticker sits, chip on the right,
// the value in mono where the sealed condition sits.
export default function ContactPage() {
  return (
    <section className="section page-section" id="contact" style={{ '--wc': 'var(--w4)' }}>
      <div className="page-head">
        <h1>Contact</h1>
        <span className="page-sub">research enquiries · no DMs for advice</span>
      </div>

      <article className="dark-card">
        <p className="dc-prose">
          Questions about a sealed claim, a resolution, or the method are welcome.
          Everything about the record itself is already public — the claims, their
          hashes and their timestamp proofs are all in the ledger, and every one of
          them can be checked without asking anyone.
        </p>
      </article>

      <div className="contact-grid">
        <article className="dark-card contact-tile">
          <div className="dc-hdr">
            <h3 className="dc-title">Email</h3>
            <span className="chip cal">Direct</span>
          </div>
          <div className="ct-kind">research enquiries</div>
          <a className="ct-value" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <div className="ct-note">replies are not investment advice</div>
        </article>

        <article className="dark-card contact-tile">
          <div className="dc-hdr">
            <h3 className="dc-title">X</h3>
            <span className="chip cal">Public</span>
          </div>
          <div className="ct-kind">seal hashes · pulse notes</div>
          <a className="ct-value" href={links.x} target="_blank" rel="noreferrer">
            {links.xHandle} ↗
          </a>
          <div className="ct-note">open replies · DMs not monitored</div>
        </article>
      </div>

      <Subscribe />
    </section>
  );
}
