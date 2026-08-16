import Hero from '../components/Hero';
import Ledger, { LedgerStrip } from '../components/Ledger';
import Essays from '../components/Essays';
import FeaturedX from '../components/FeaturedX';
import Subscribe from '../components/Subscribe';
import { getLedger } from '../lib/ledger';
import { getEssays } from '../lib/substack';
import { site, links, featuredXPosts } from '../config/site';

// The ledger and the feed are read live and cached for an hour — a new seal or a
// new essay appears on its own, with no redeploy.
export const revalidate = 3600;

export default async function Page() {
  const [ledgerData, essayData] = await Promise.all([getLedger(), getEssays()]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-in">
          <span className="brand">{site.name}</span>
          <nav>
            <a href="#ledger">ledger</a>
            <a href="#essays">essays</a>
            {featuredXPosts.length > 0 && <a href="#featured">featured</a>}
            <a href="#subscribe">subscribe</a>
          </nav>
        </div>
      </div>

      <main className="wrap">
        <Hero />
        {/* The scoreboard sits directly under the hero — the whole live record
            is on screen before a visitor scrolls anything. */}
        <LedgerStrip data={ledgerData} />
        <Ledger data={ledgerData} />
        <Essays data={essayData} />
        <FeaturedX />
        <Subscribe />

        <footer className="foot">
          <span>{site.name} · {site.domain}</span>
          <a href={links.github} target="_blank" rel="noreferrer">ledger</a>
          <a href={links.substack} target="_blank" rel="noreferrer">substack</a>
          <a href={links.x} target="_blank" rel="noreferrer">x</a>
          <span className="spacer">
            Not investment advice. A data record.
          </span>
        </footer>
      </main>
    </>
  );
}
