// ─────────────────────────────────────────────────────────────────────────────
// SUBSTACK ESSAYS — every post, newest first, straight off the RSS feed.
//
// Dependency-free parser: Substack's RSS is small, flat and predictable, and a
// landing page should not carry an XML library for four regexes. Feeds that
// return something that is not RSS (a Substack *profile* handle 302s to an HTML
// page, for instance) are skipped silently rather than breaking the build.
// ─────────────────────────────────────────────────────────────────────────────

import { substackFeeds, hiddenEssayUrls } from '../config/site';

const REVALIDATE = 3600; // 1 hour

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', eacute: 'é',
};

function decode(s = '') {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function tag(block, name) {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i').exec(block);
  if (!m) return '';
  return decode(m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')).trim();
}

function stripHtml(s = '') {
  return decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalizeUrl(u = '') {
  try {
    const url = new URL(u);
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return u;
  }
}

function parseFeed(xml) {
  if (!/<rss|<feed|<channel/i.test(xml)) return []; // not RSS — skip this source
  const channel = tag(xml, 'title') || '';
  return xml
    .split(/<item[\s>]/i)
    .slice(1)
    .map((chunk) => {
      const block = chunk.slice(0, chunk.search(/<\/item>/i) + 1);
      const link = normalizeUrl(tag(block, 'link'));
      const pub = tag(block, 'pubDate');
      const date = pub ? new Date(pub) : null;
      return {
        title: tag(block, 'title') || 'Untitled',
        link,
        publication: channel,
        pubDate: pub || null,
        timestamp: date && !isNaN(date) ? date.getTime() : 0,
        summary: stripHtml(tag(block, 'description')).slice(0, 260),
      };
    })
    .filter((p) => p.link);
}

export async function getEssays() {
  const results = await Promise.all(
    substackFeeds.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'adf-site/1.0 (+https://deviationsystems.com)' },
          next: { revalidate: REVALIDATE },
        });
        if (!res.ok) return [];
        return parseFeed(await res.text());
      } catch {
        return [];
      }
    })
  );

  const hidden = new Set(hiddenEssayUrls.map(normalizeUrl));
  const seen = new Set();
  const posts = results
    .flat()
    .filter((p) => !hidden.has(p.link))
    .filter((p) => (seen.has(p.link) ? false : seen.add(p.link)))
    .sort((a, b) => b.timestamp - a.timestamp);

  return { ok: true, posts };
}
