// ─────────────────────────────────────────────────────────────────────────────
// THE LEDGER — presentation only. The data layer (lib/ledger.js) is untouched.
//
// Structure is lifted from the operator's own pulse dashboard (pulse.html):
// a dark state-strip carrying the whole scoreboard, then a TILE WALL — a
// responsive grid of compact dark cards, ticker set large, tag-chip, the sealed
// condition, and days-to-resolution colour-coded by proximity. The left stripe
// reads tag (alpha vs calibration, or the verdict once graded). Tiles expand in
// place for the full sealed detail, hash and Bitcoin proof.
//
// Expansion is a native <details>/<summary> — no JavaScript, no hydration, and
// it degrades to "always open" if CSS never arrives. The reference build page
// uses the same element for the same job.
// ─────────────────────────────────────────────────────────────────────────────

import { ledger } from '../config/site';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Deterministic formatting — no locale, no timezone, same string everywhere.
function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  if (!y || !m || !d) return String(iso);
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

function shortDate(iso) {
  if (!iso) return '—';
  const [, m, d] = String(iso).slice(0, 10).split('-');
  if (!m || !d) return String(iso);
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}

function daysUntil(iso, now) {
  if (!iso) return null;
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86400000);
}

// Proximity bands match the pulse's read of its own board: this quarter's
// prints are near, the next one is mid, anything beyond is far.
function proximity(days) {
  if (days === null) return 'far';
  if (days <= 45) return 'near';
  if (days <= 120) return 'mid';
  return 'far';
}

const COMPARATORS = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=', '!=': '≠' };
const PERCENT_UNITS = new Set(['%', 'x', 'ratio', 'pct', 'percent']);

// The ledger seals percentage observables as fractions under several unit
// spellings (0.15 "%", 0.05 "x", -0.0668 "ratio"). The operator's own pulse
// renders all of them as percentages, so this does too. The magnitude guard
// leaves anything already in percent-magnitude, or in any other unit, as sealed.
function fmtValue(value, unit, signed = false) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  const u = String(unit || '').toLowerCase();
  if (PERCENT_UNITS.has(u) && Number.isFinite(n) && Math.abs(n) <= 1.5) {
    const pct = +(n * 100).toFixed(2);
    return `${signed && pct > 0 ? '+' : ''}${pct}%`;
  }
  if (u === 'usd') return `$${value}`;
  return unit ? `${value} ${unit}` : String(value);
}

// A growth/spread observable reads better with an explicit sign; a level (a
// margin, a share price) does not.
const isSigned = (metric) => /yoy|growth|spread|return/i.test(metric || '');

// The tile's headline ticker is the SUBJECT of the observable, not simply the
// first address node — a claim addressed to {MU, SKHYNIX, SAMSUNG} whose
// observable measures SKHYNIX is a SKHYNIX tile. Matches the pulse's choice.
function tickerFor(claim) {
  const nodes = claim.nodes || [];
  const hay = `${claim.observable?.metric || ''} ${claim.id || ''}`.toLowerCase();
  let best = null;
  let bestIdx = Infinity;
  for (const n of nodes) {
    const i = hay.indexOf(String(n).toLowerCase());
    if (i >= 0 && i < bestIdx) { bestIdx = i; best = n; }
  }
  return best || nodes[0] || '—';
}

// One-line "what kind of number is this" under the ticker.
function kindOf(metric = '') {
  const m = metric.toLowerCase();
  if (/share price|price/.test(m)) return 'share price';
  if (/gross margin|margin/.test(m)) return 'gross margin';
  if (/total return|spread/.test(m)) return 'return spread';
  if (/revenue/.test(m)) return /yoy|growth/.test(m) ? 'revenue · YoY' : 'revenue';
  return 'observable';
}

// The ledger's own vocabulary on the chip: ALPHA is a call against consensus,
// CONSENSUS-HOLDS is a calibration check. The exact sealed tag is shown in the
// expanded detail, so nothing is renamed away.
function chipFor(tag) {
  if (tag === 'ALPHA') return { label: 'Alpha', cls: 'alpha' };
  if (tag === 'CONSENSUS-HOLDS') return { label: 'Calibration', cls: 'cal' };
  return { label: tag || '—', cls: 'cal' };
}

const verdictCls = (v) =>
  v === 'CONFIRM' ? 'confirm' : v === 'DISCONFIRM' ? 'disconfirm' : 'unresolved';

// ── the state strip — the whole scoreboard, above the fold ───────────────────

export function LedgerStrip({ data }) {
  const { ok, open, resolved, stats } = data;

  if (!ok || !stats) {
    return (
      <div className="strip-band">
        <span className="sb-mark">LIVE RECORD</span>
        <span className="sb-meta">
          not readable right now — the record itself is in the ledger repo
        </span>
      </div>
    );
  }

  const all = [...open, ...resolved];
  const alpha = all.filter((c) => c.tag === 'ALPHA').length;
  const calibration = all.filter((c) => c.tag === 'CONSENSUS-HOLDS').length;

  return (
    <div className="strip-band">
      <span className="sb-mark">LIVE RECORD</span>
      <div className="sb-sums">
        <span className="sb hot"><b>{stats.open}</b> sealed &amp; open</span>
        <span className="sb"><b>{alpha}</b> alpha · <b>{calibration}</b> calibration</span>
        <span className="sb"><b>{stats.resolved}</b> resolved</span>
        {stats.resolved > 0 && (
          <span className="sb">
            <b>{stats.confirm}</b> confirm · <b>{stats.disconfirm}</b> disconfirm
          </span>
        )}
        {stats.resolved === 0 && stats.firstResolveDate && (
          <span className="sb">first resolves <b>{shortDate(stats.firstResolveDate)}</b></span>
        )}
      </div>
      <span className="sb-meta">epoch v1</span>
    </div>
  );
}

// ── one tile ─────────────────────────────────────────────────────────────────

function Tile({ claim, now }) {
  const o = claim.observable;
  const res = claim.resolution;
  const chip = chipFor(claim.tag);
  const days = daysUntil(claim.asOf, now);
  const prox = proximity(days);
  const signed = isSigned(o.metric);
  const condition = `${COMPARATORS[o.comparator] || o.comparator} ${fmtValue(o.threshold, o.unit, signed)}`;
  const stripe = res ? verdictCls(res.verdict) : chip.cls;

  return (
    <details className={`tile ${stripe}`}>
      <summary>
        <div className="t-hdr">
          <span className="tk">{tickerFor(claim)}</span>
          <span className={`chip ${res ? verdictCls(res.verdict) : chip.cls}`}>
            {res ? res.verdict : chip.label}
          </span>
        </div>

        <div className="t-kind">{kindOf(o.metric)}</div>
        <div className="t-cond">{condition}</div>

        {res ? (
          <div className={`t-days ${verdictCls(res.verdict)}`}>
            {fmtValue(res.actualValue, o.unit, signed)}
            <small>actual</small>
          </div>
        ) : (
          <div className={`t-days ${prox}`}>
            {days === null ? '—' : days}
            <small>d</small>
          </div>
        )}

        <div className="t-when">
          {res ? `graded ${fmtDate(res.evaluatedUtc)}` : `resolves ${fmtDate(claim.asOf)}`}
          <span className="plus">+</span>
        </div>
      </summary>

      <div className="t-det">
        <dl className="kv">
          <dt>id</dt><dd className="on">{claim.id}</dd>
          <dt>tag</dt><dd className="on">{claim.tag}</dd>
          {claim.nodes.length > 0 && (
            <>
              <dt>address</dt>
              <dd>
                {claim.nodes.join(', ')}
                {claim.edges.length > 0 && (
                  <span className="faint"> | {claim.edges.join(', ')}</span>
                )}
              </dd>
            </>
          )}
          <dt>claim</dt><dd>{claim.statement}</dd>
          <dt>observable</dt>
          <dd>{o.metric} [{condition}]</dd>
          {claim.failsIf.comparator && (
            <>
              <dt>fails if</dt>
              <dd>
                {COMPARATORS[claim.failsIf.comparator] || claim.failsIf.comparator}{' '}
                {fmtValue(claim.failsIf.threshold, o.unit, signed)}
              </dd>
            </>
          )}
          {claim.window && <><dt>window</dt><dd>[{claim.window.join(', ')}]</dd></>}
          <dt>sealed</dt>
          <dd>{fmtDate(claim.sealedDate)}{claim.sealedUtc ? ` · ${claim.sealedUtc}` : ''}</dd>
          {claim.file.sha256 && (
            <><dt>sha-256</dt><dd className="brk">{claim.file.sha256}</dd></>
          )}
          {res && (
            <>
              <dt>verdict</dt>
              <dd className="on">
                {res.verdict}
                {res.reason ? ` — ${res.reason}` : ''}
              </dd>
            </>
          )}
        </dl>

        <div className="t-links">
          <a href={claim.file.blobUrl} target="_blank" rel="noreferrer">sealed file ↗</a>
          {claim.file.otsUrl && (
            <a href={claim.file.otsUrl} target="_blank" rel="noreferrer">bitcoin proof ↗</a>
          )}
          {res?.blobUrl && (
            <a href={res.blobUrl} target="_blank" rel="noreferrer">verdict ↗</a>
          )}
        </div>
      </div>
    </details>
  );
}

// ── the section ──────────────────────────────────────────────────────────────

export default function Ledger({ data }) {
  const { ok, open, resolved, stats } = data;
  const now = new Date();

  return (
    <section className="section" id="ledger" style={{ '--wc': 'var(--w2)' }}>
      <div className="section-head">
        <h2>The ledger</h2>
        <span>sealed · hashed · bitcoin-anchored · graded mechanically</span>
      </div>
      <p className="section-goal">
        Every position below was written down, hashed and anchored to Bitcoin
        <em> before</em> its outcome could be known. Click a tile for the sealed
        detail, its hash, and the proof. Days-to-resolution is colour-coded by
        proximity.
      </p>

      {!ok && (
        <div className="card card-accent">
          <p style={{ fontSize: 14 }}>
            The live read of the ledger did not complete just now. The record itself
            is unaffected — it lives in the repo, not here.
          </p>
          <div className="linkrow">
            <a href={ledger.repoUrl} target="_blank" rel="noreferrer">
              read the ledger directly ↗
            </a>
          </div>
        </div>
      )}

      {ok && (
        <>
          {resolved.length > 0 && (
            <>
              <div className="wall-head">
                Resolved <span>{resolved.length} graded · hits and misses in one format</span>
              </div>
              <div className="wall">
                {resolved.map((c) => <Tile claim={c} now={now} key={c.id} />)}
              </div>
            </>
          )}

          {open.length > 0 && (
            <>
              <div className="wall-head">
                Open positions{' '}
                <span>{open.length} sealed · soonest first · click a tile for full detail</span>
              </div>
              <div className="wall">
                {open.map((c) => <Tile claim={c} now={now} key={c.id} />)}
              </div>
            </>
          )}

          <div className="note">
            <b>THE RECORD SO FAR</b>
            <div style={{ marginTop: 4 }}>
              {stats?.resolved === 0 && (
                <>
                  No hit-rate is claimed — nothing has reached its resolution date yet,
                  so there is nothing to score.{' '}
                </>
              )}
              {stats?.testDrills > 0 && (
                <>
                  {stats.testDrills} sacrificial test drill
                  {stats.testDrills === 1 ? ' sits' : 's sit'} in the ledger too,
                  labelled and never deleted — dress rehearsals of the sealing
                  machinery, not forecasts, so they are kept off this board.{' '}
                </>
              )}
              The repo is append-only: nothing is edited or removed once sealed.
            </div>
            <div className="linkrow">
              <a href={ledger.repoUrl} target="_blank" rel="noreferrer">the full ledger ↗</a>
              <a href={`${ledger.repoUrl}#how-to-verify-in-90-seconds`} target="_blank" rel="noreferrer">
                verify in 90 seconds ↗
              </a>
              {stats?.pulses > 0 && (
                <a href={`${ledger.repoUrl}/tree/${ledger.branch}/pulses`} target="_blank" rel="noreferrer">
                  {stats.pulses} public pulses ↗
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
