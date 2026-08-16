import Link from 'next/link';
import { site, links } from '../config/site';

export default function SiteFooter() {
  return (
    <footer className="foot">
      <span>{site.name} · {site.domain}</span>
      <a href={links.github} target="_blank" rel="noreferrer">ledger</a>
      <a href={links.substack} target="_blank" rel="noreferrer">substack</a>
      <a href={links.x} target="_blank" rel="noreferrer">x</a>
      <Link href="/about">about</Link>
      <Link href="/contact">contact</Link>
      <span className="spacer">Not investment advice. A data record.</span>
    </footer>
  );
}
