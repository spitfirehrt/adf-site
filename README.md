# adf-site — the Atlas landing page

Public front door for **Atlas / ADF** at `deviationsystems.com`. Next.js (app
router) + hand-written CSS, deployed on the Vercel free tier.

It holds **no content of its own**. The forecast record is read live out of the
public [ADF-Ledger](https://github.com/spitfirehrt/ADF-Ledger) repo and the essays
are read live off the Substack RSS feed, both cached for an hour. A new seal or a
new post appears on the site by itself — **no redeploy, no edit here.**

> This repo is a **sibling** of `adf-engine` and `adf-ledger`, not part of either.
> Nothing here reads or writes the engine.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (same live fetches run here)
```

It runs with **zero environment variables set** — the ledger and Substack are
public. Env vars only switch extra things on (see below).

---

## Routes

| Route | What it is |
|---|---|
| `/` | The dashboard — hero, live state strip, ledger tile wall, essays, curated X, capture |
| `/about` | What Atlas is, how it works, why sealed — one large contained panel |
| `/contact` | Research email, X handle, the list. Pseudonymity-safe by design |

Header and footer live in `app/layout.js` and are shared by every route.

## What's on the page

| Section | Source | Refresh |
|---|---|---|
| Hero | headline options in `config/site.js` (`heroHeadline` picks one) | — |
| The ledger | GitHub API + raw content, `lib/ledger.js` | ISR, 1 hour |
| Essays | Substack RSS, `lib/substack.js` | ISR, 1 hour |
| Featured on X | `config/site.js` → `featuredXPosts` | on deploy |
| Email capture | `app/api/subscribe/route.js` → Buttondown | live |
| About copy | `app/about/page.js` (operator-approved, edit there) | — |
| Contact details | `config/site.js` → `contact` / `links` | — |

### The contrast rule

The grid-paper is a **backdrop for cards, never a reading surface**. Every block
of body prose sits on a defined, bordered, contrasting fill with its text at
full contrast — never the metadata grey, never loose on the paper. Two
treatments, both in `app/globals.css`:

- **`.section-goal` / `.panel`** — light soft-fill panel, tinted with the
  section's accent. For intro paragraphs on the home page.
- **`.dark-card`** — the claim tile expanded: dark fill, same border, same
  radius, same left stripe, and the same header grammar (`.dc-title` where a
  tile's ticker sits, `.chip` on the right). Body runs at 15px/1.7 in
  `--d-prose` — a shade off pure white so a full page of it doesn't halate,
  still 12.4:1 on the dark fill. This is what /about and /contact are built
  from, so they read as part of the tile wall rather than as generic pages.

Stacked dark cards space with `.dark-stack` (grid + gap), **not** sibling
margins — a sibling margin also fires between grid items and knocks the contact
tiles out of alignment.

### The ledger read

`lib/ledger.js` makes **one** GitHub API call (the recursive git tree) to discover
files, then reads them from `raw.githubusercontent.com`, which does not spend API
rate limit. It picks up, without any path being hardcoded per-epoch:

- `sealed/<epoch>/*_claims.json` — the claims
- `sealed/<epoch>/*_claims.sha256` — the hash shown on each card
- `sealed/<epoch>/*_claims.json.ots` — the Bitcoin proof, linked per card
- `resolutions/*_resolution.json` — the verdict, when a claim has been graded

When a resolution file appears in the ledger, that claim moves to a **Resolved**
block above the open ones with its `CONFIRM` / `DISCONFIRM` / `UNRESOLVED` badge
and the actual figure. Nothing on this site needs changing for that to happen.

Claim ids matching `TEST-…` (the sacrificial skeptic drills) are kept **off** the
scoreboard and counted separately in the honesty note — they are dress rehearsals,
not forecasts. The pattern lives in `config/site.js`.

If GitHub is unreachable the section degrades to a short note plus a link to the
repo. It never fails the build.

### Featuring an X post — a one-line edit

Open `config/site.js` and paste the URL into `featuredXPosts`:

```js
export const featuredXPosts = [
  'https://x.com/deviationadf/status/1234567890123456789',
];
```

Commit and push; Vercel redeploys. **An empty array hides the whole section** —
deliberate, so there is never an empty shelf on the page. Curated only: the X
timeline is mostly seal hashes and pulse notes, which belong in the ledger where
they can be checked.

### Substack feeds — a note

`deviationadf.substack.com` is a **profile handle**, not a publication: it 302s to
`substack.com/@deviationadf` and serves no RSS. The publication that actually
carries the posts is **`deviationsystems.substack.com`**. Both URLs are listed in
`config/site.js`, deduped by post URL, so if an ADF-branded publication is created
later its posts appear with no code change. Override the list entirely with the
`SUBSTACK_FEEDS` env var.

To keep a post off the page (Substack's auto-generated *Coming soon* stub, for
instance), paste its URL into `hiddenEssayUrls` in the same file.

### Email capture

`POST /api/subscribe` → Buttondown, **server-side only**, so no key ever reaches
the browser. Set **one** of:

- `BUTTONDOWN_API_KEY` — preferred; uses the v1 API, visitor stays on the page.
- `BUTTONDOWN_USERNAME` — keyless fallback via the public embed endpoint.

With neither set the route answers `503` with a plain-English message rather than
pretending an address was captured. An address Buttondown already holds is
reported to the visitor as success, not as an error.

---

## Environment variables

Copy `.env.example` → `.env.local` for local dev, and set the same names in
**Vercel → Settings → Environment Variables** for production.

| Name | Required | What it does |
|---|---|---|
| `BUTTONDOWN_API_KEY` | no | Turns on email capture (preferred path). |
| `BUTTONDOWN_USERNAME` | no | Turns on email capture without a key. |
| `GITHUB_TOKEN` | no | Raises the GitHub API rate limit. A fine-grained token with **no scopes** is enough — the ledger is public. |
| `SUBSTACK_FEEDS` | no | Comma-separated feed URLs, overriding `config/site.js`. |

**`.env*` is gitignored. Never commit a key.**

---

## Deploy to Vercel

1. **Create a new public GitHub repo** — e.g. `spitfirehrt/adf-site`. Do not add a
   README/.gitignore in the GitHub UI; this repo already has both.

2. **Push:**
   ```bash
   git remote add origin https://github.com/spitfirehrt/adf-site.git
   git branch -M main
   git push -u origin main
   ```

3. **Import to Vercel** — [vercel.com/new](https://vercel.com/new) → *Add New →
   Project* → pick the repo. Framework preset **Next.js**, build command, output
   directory and install command all stay at their defaults. Deploy.

4. **Set the env vars** — Vercel → the project → *Settings → Environment
   Variables*. Add whichever of the four you are using, for **Production**,
   **Preview** and **Development**, then *Deployments → ⋯ → Redeploy* so they take
   effect.

5. **Custom domain `deviationsystems.com`** — Vercel → *Settings → Domains* → add
   `deviationsystems.com` **and** `www.deviationsystems.com` (Vercel will offer to
   redirect one to the other; keep the apex as primary). At the registrar, set the
   records Vercel shows — typically:

   | Type | Name | Value |
   |---|---|---|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

   Use the exact values Vercel displays, not these, if they differ. HTTPS is
   issued automatically once DNS resolves (minutes to a couple of hours).

6. **Check the live site** — the ledger section should show the current sealed
   count, and each card's SHA-256 should match the `.sha256` sidecar in the ledger
   repo. That is the whole promise, rendered.

### Keeping it current

Nothing routine. The ledger and Substack refresh themselves hourly. Redeploy only
when the code, the hero copy, or the featured-X list changes.
