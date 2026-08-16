// ─────────────────────────────────────────────────────────────────────────────
// ADF SITE CONFIG — the only file the operator edits for day-to-day changes.
// No secrets in here. Keys live in .env.local / Vercel env vars ONLY.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Atlas',
  descriptor: 'ADF · Asymmetric Deviation Framework — semiconductor supply-chain research',
  domain: 'deviationsystems.com',
  url: 'https://deviationsystems.com',
};

// ── HERO HEADLINE — OPERATOR PICKS ONE ───────────────────────────────────────
// Three drafts in a plain, factual register. Change `heroHeadline` to 0, 1 or 2
// to switch; that is the whole edit. Each states what the thing IS and stops —
// the scoreboard immediately below is what does the arguing.
//
//   0  Tightest. Works as a label; scans in one beat. (currently live)
//   1  Fullest. Names the mechanism — hash, fixed rule — in one sentence.
//   2  First person. Plainest of the three; reads as a working note.
//
export const heroHeadlines = [
  'Semiconductor supply-chain forecasts, timestamped before they resolve.',
  'A public record of semiconductor supply-chain forecasts — each one dated and hashed when written, and graded on a rule fixed at the same moment.',
  'I write down what I expect the semiconductor supply chain to do, timestamp it, and grade it on a date set in advance.',
];
export const heroHeadline = 0;

export const heroLede =
  'Each forecast is hashed and anchored to the Bitcoin blockchain when it is written, then graded mechanically against a rule fixed at the same moment. Open, confirmed and disconfirmed are all shown below, read live from the public ledger.';

// ── THE LEDGER ───────────────────────────────────────────────────────────────
// Public, append-only forecast record. Read live at build/revalidate time.
export const ledger = {
  owner: 'spitfirehrt',
  repo: 'ADF-Ledger',
  branch: 'main',
  get repoUrl() {
    return `https://github.com/${this.owner}/${this.repo}`;
  },
  // Claim ids matching this are dress-rehearsal drills, not forecasts.
  // They stay published in the ledger (labeled); they don't belong on the scoreboard.
  testClaimPattern: /^TEST-/i,
};

// ── SUBSTACK ─────────────────────────────────────────────────────────────────
// All posts from these feeds are rendered, newest first, deduped by URL.
// NOTE: deviationadf.substack.com is a PROFILE handle — it 302s to
// substack.com/@deviationadf and serves no RSS. The publication feed that
// actually carries the posts is deviationsystems.substack.com. Both are listed
// so that if the ADF-branded publication is created later it appears with no
// code change. Override the whole list with SUBSTACK_FEEDS (comma-separated).
export const substackFeeds = (
  process.env.SUBSTACK_FEEDS ||
  [
    'https://deviationsystems.substack.com/feed',
    'https://deviationadf.substack.com/feed',
  ].join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Every post in those feeds renders by default. Paste a post URL here to keep
// one off the page (Substack's auto-generated "Coming soon" stub, say).
export const hiddenEssayUrls = [
  // 'https://deviationsystems.substack.com/p/coming-soon',
];

// ── FEATURED X ARTICLES ──────────────────────────────────────────────────────
// CURATED, not a live timeline — X is mostly non-article posts, so only what is
// listed here ever shows. TO FEATURE A POST: paste its URL as one line below.
//
//   export const featuredXPosts = [
//     'https://x.com/deviationadf/status/1234567890123456789',
//   ];
//
// Order is top-to-bottom as written. Empty array => the section is not rendered.
export const featuredXPosts = [
  // 'https://x.com/deviationadf/status/0000000000000000000',
];

// ── EMAIL CAPTURE ────────────────────────────────────────────────────────────
// Buttondown. The username is public (it is in the form action); the API key is
// NOT — it is read server-side only, from env. See .env.example.
export const newsletter = {
  headline: 'Get each resolution the moment it grades.',
  sub: 'Hits and misses, same day, same format. Nothing else.',
};

// ── ELSEWHERE ────────────────────────────────────────────────────────────────
export const links = {
  x: 'https://x.com/deviationadf',
  substack: 'https://deviationsystems.substack.com',
  github: 'https://github.com/spitfirehrt/ADF-Ledger',
};
