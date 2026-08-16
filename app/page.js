import Hero from '../components/Hero';
import Ledger, { LedgerStrip } from '../components/Ledger';
import Essays from '../components/Essays';
import FeaturedX from '../components/FeaturedX';
import Subscribe from '../components/Subscribe';
import { getLedger } from '../lib/ledger';
import { getEssays } from '../lib/substack';

// The ledger and the feed are read live and cached for an hour — a new seal or a
// new essay appears on its own, with no redeploy.
export const revalidate = 3600;

export default async function Page() {
  const [ledgerData, essayData] = await Promise.all([getLedger(), getEssays()]);

  return (
    <>
      <Hero />
      {/* The scoreboard sits directly under the hero — the whole live record
          is on screen before a visitor scrolls anything. */}
      <LedgerStrip data={ledgerData} />
      <Ledger data={ledgerData} />
      <Essays data={essayData} />
      <FeaturedX />
      <Subscribe />
    </>
  );
}
