import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { site } from '../config/site';

// Same three faces and weights as the house material — self-hosted by next/font
// so the page makes no third-party request to render.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-archivo',
  display: 'swap',
});
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.descriptor}`,
  description:
    'Dated forecasts on the semiconductor supply chain, sealed the moment I make them and graded against reality. The full record is public, right and wrong both.',
  openGraph: {
    title: `${site.name} — sealed, timestamped forecasts`,
    description:
      'Semiconductor supply-chain forecasts, hashed and Bitcoin-anchored before they resolve. Hits and misses both published.',
    url: site.url,
    siteName: site.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — sealed, timestamped forecasts`,
    description:
      'Semiconductor supply-chain forecasts, sealed before they resolve. Hits and misses both published.',
  },
};

export const viewport = {
  themeColor: '#F7F8F6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
