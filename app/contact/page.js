import Subscribe from '../../components/Subscribe';
import { site, links, contact } from '../../config/site';

export const metadata = {
  title: `Contact — ${site.name}`,
  description: 'Research enquiries and the resolution mailing list.',
};

// Deliberately thin. Atlas is pseudonymous, so this page carries a research
// address, a handle, and the list — and nothing that identifies a person.
export default function ContactPage() {
  return (
    <section className="section page-section" id="contact" style={{ '--wc': 'var(--w4)' }}>
      <div className="section-head">
        <h2>Contact</h2>
        <span>research enquiries · no DMs for advice</span>
      </div>

      <div className="prose-panel prose-panel-tight">
        <p>
          Questions about a sealed claim, a resolution, or the method are welcome.
          Everything about the record itself is already public — the claims, their
          hashes and their timestamp proofs are all in the ledger.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-item">
          <div className="prose-label">Research email</div>
          <a className="contact-value" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>

        <div className="contact-item">
          <div className="prose-label">On X</div>
          <a className="contact-value" href={links.x} target="_blank" rel="noreferrer">
            {links.xHandle} ↗
          </a>
        </div>
      </div>

      <Subscribe />
    </section>
  );
}
