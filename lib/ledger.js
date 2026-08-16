// ─────────────────────────────────────────────────────────────────────────────
// LIVE LEDGER READER
//
// Reads the public, append-only forecast record straight out of the ADF-Ledger
// repo — no copy of the claims lives in this site. One GitHub API call (the git
// tree) discovers the files; everything else comes from raw.githubusercontent,
// which does not spend API rate limit. Revalidates hourly.
//
// Repo layout this reads (discovered, not assumed):
//   sealed/<epoch>/<date>_claims.json     the sealed claim set
//   sealed/<epoch>/<date>_claims.sha256   its hash (the receipt)
//   sealed/<epoch>/<date>_claims.json.ots OpenTimestamps Bitcoin proof
//   resolutions/<claim_id>_resolution.json  the mechanical verdict, if graded
// ─────────────────────────────────────────────────────────────────────────────

import { ledger } from '../config/site';

const REVALIDATE = 3600; // 1 hour

const rawBase = () =>
  `https://raw.githubusercontent.com/${ledger.owner}/${ledger.repo}/${ledger.branch}`;

const blobUrl = (path) =>
  `${ledger.repoUrl}/blob/${ledger.branch}/${path}`;

function ghHeaders() {
  const h = { Accept: 'application/vnd.github+json' };
  // Optional — only raises the API rate limit. Never required, never committed.
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function getText(url, headers = {}) {
  const res = await fetch(url, { headers, next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.text();
}

async function getJson(url, headers = {}) {
  return JSON.parse(await getText(url, headers));
}

// ── shaping ──────────────────────────────────────────────────────────────────

function shapeClaim(claim, seal, file) {
  const obs = claim.observable || {};
  const fails = claim.fails_if || {};
  const addr = claim.address || {};
  return {
    id: claim.claim_id,
    epoch: claim.epoch || seal.epoch || null,
    tag: claim.tag || null,
    statement: claim.statement || '',
    nodes: addr.nodes || [],
    edges: addr.edges || [],
    sealedUtc: seal.sealed_utc || null,
    sealedDate: seal.sealed_date || (seal.sealed_utc || '').slice(0, 10) || null,
    sealedCommit: claim.sealed_commit || seal.sealed_against_commit || null,
    asOf: obs.as_of_date || null,
    window: claim.window || null,
    observable: {
      metric: obs.metric || '',
      comparator: obs.comparator || '',
      threshold: obs.threshold,
      unit: obs.unit || '',
      source: obs.source_of_actual || '',
    },
    failsIf: {
      comparator: fails.comparator || '',
      threshold: fails.threshold,
    },
    citedWall: claim.cited_wall || [],
    file,                       // { path, name, sha256, blobUrl, rawUrl, otsUrl }
    isTest: ledger.testClaimPattern.test(claim.claim_id || ''),
    resolution: null,           // filled below when a verdict exists
  };
}

function shapeResolution(r) {
  const det = r.observable_eval || {};
  return {
    verdict: (r.verdict || '').toUpperCase(),
    reason: r.reason || '',
    evaluatedUtc: r.evaluated_utc || null,
    actualValue: det.actual_value ?? null,
    comparator: det.comparator || '',
    threshold: det.threshold ?? null,
    gradedPeriod: r.graded_period || null,
    sha256: r.resolution_sha256 || null,
    blobUrl: r.__path ? blobUrl(r.__path) : null,
  };
}

// ── the read ─────────────────────────────────────────────────────────────────

export async function getLedger() {
  try {
    const tree = await getJson(
      `https://api.github.com/repos/${ledger.owner}/${ledger.repo}/git/trees/${ledger.branch}?recursive=1`,
      ghHeaders()
    );
    const paths = (tree.tree || []).filter((n) => n.type === 'blob').map((n) => n.path);

    const sealPaths = paths
      .filter((p) => /^sealed\/.+_claims\.json$/.test(p))
      .sort();
    const hasFile = (p) => paths.includes(p);

    // Sealed claim sets — each with its hash sidecar and Bitcoin proof.
    const seals = await Promise.all(
      sealPaths.map(async (path) => {
        const seal = await getJson(`${rawBase()}/${path}`);
        const shaPath = path.replace(/\.json$/, '.sha256');
        let sha256 = null;
        if (hasFile(shaPath)) {
          const line = await getText(`${rawBase()}/${shaPath}`);
          sha256 = (line.trim().split(/\s+/)[0] || null);
        }
        const otsPath = `${path}.ots`;
        const file = {
          path,
          name: path.split('/').pop(),
          sha256,
          blobUrl: blobUrl(path),
          rawUrl: `${rawBase()}/${path}`,
          otsUrl: hasFile(otsPath) ? blobUrl(otsPath) : null,
        };
        return (seal.claims || []).map((c) => shapeClaim(c, seal, file));
      })
    );

    const claims = seals.flat();

    // Verdicts — append-only, one file per graded claim. Absent until a
    // resolution date arrives, which is exactly what "nothing to score yet" means.
    const resPaths = paths.filter((p) => /^resolutions\/.+_resolution\.json$/.test(p));
    const resolutions = await Promise.all(
      resPaths.map(async (path) => {
        const r = await getJson(`${rawBase()}/${path}`);
        r.__path = path;
        return r;
      })
    );
    const byClaim = new Map(resolutions.map((r) => [r.claim_id, shapeResolution(r)]));
    for (const c of claims) if (byClaim.has(c.id)) c.resolution = byClaim.get(c.id);

    // Test drills stay published in the ledger, labeled — they are dress
    // rehearsals, not forecasts, so they are counted separately here.
    const real = claims.filter((c) => !c.isTest);
    const testCount = claims.length - real.length;

    const byDate = (a, b) => String(a.asOf || '').localeCompare(String(b.asOf || ''));
    const resolved = real.filter((c) => c.resolution).sort(byDate).reverse();
    const open = real.filter((c) => !c.resolution).sort(byDate);

    const verdicts = resolved.map((c) => c.resolution.verdict);
    const count = (v) => verdicts.filter((x) => x === v).length;

    return {
      ok: true,
      open,
      resolved,
      stats: {
        sealed: real.length,
        open: open.length,
        resolved: resolved.length,
        confirm: count('CONFIRM'),
        disconfirm: count('DISCONFIRM'),
        unresolved: count('UNRESOLVED'),
        testDrills: testCount,
        firstResolveDate: open[0]?.asOf || null,
        lastSealedDate:
          real.map((c) => c.sealedDate).filter(Boolean).sort().pop() || null,
        pulses: [...new Set(
          paths
            .filter((p) => p.startsWith('pulses/'))
            .map((p) => p.split('/')[1])
        )].length,
      },
    };
  } catch (err) {
    // A landing page must never 500 because GitHub hiccuped. Degrade to the
    // honest fallback: say so, and point the visitor at the repo itself.
    return {
      ok: false,
      error: String(err?.message || err),
      open: [],
      resolved: [],
      stats: null,
    };
  }
}
