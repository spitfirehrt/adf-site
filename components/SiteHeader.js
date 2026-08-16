import Link from 'next/link';
import { site } from '../config/site';

// Shared across every route. Section links are root-absolute (`/#ledger`) so
// they work from /about and /contact, not just from the home page.
export default function SiteHeader() {
  return (
    <div className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand">{site.name}</Link>
        <nav>
          <Link href="/#ledger">ledger</Link>
          <Link href="/#essays">essays</Link>
          <Link href="/about">about</Link>
          <Link href="/contact">contact</Link>
        </nav>
      </div>
    </div>
  );
}
