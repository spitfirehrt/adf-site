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

const COMPARATORS = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=', '!=': '≠' };

// The ledger stores percentage observables as fractions (0.15 with unit "%").
// Render them as the percent a reader expects; leave anything already in
// percent-magnitude, or in any other unit, exactly as sealed.
function fmtThreshold(value, unit) {
  if (value === null || value === undefined) return '—';
  if (unit === '%' && typeof value === 'number' && Math.abs(value) <= 1.5) {
    return `${+(value * 100).toFixed(2)}%`;
  }
  return unit ? `${value} ${unit}` : String(value);
}

function tagClass(tag) {
  if (tag === 'ALPHA') return 'tag tag-alpha';
  if (tag === 'CONSENSUS-HOLDS') return 'tag tag-consensus';
  return 'tag';
}

function verdictClass(v) {
  if (v === 'CONFIRM') return 'tag tag-confirm';
  if (v === 'DISCONFIRM') return 'tag tag-disconfirm';
  return 'tag tag-unresolved';
}

function ClaimCard({ claim }) {
  const o = claim.observable;
  const res = claim.resolution;
  return (
    <article className="claim">
      <div className="claim-top">
        {claim.tag && <span className={tagClass(claim.tag)}>{claim.tag}</span>}
        {res && <span className={verdictClass(res.verdict)}>{res.verdict}</span>}
        <span className="claim-id">{claim.id}</span>
        <span className="claim-when">
          {res
            ? `graded ${fmtDate(res.evaluatedUtc)}`
            : `resolves ${fmtDate(claim.asOf)}`}
        </span>
      </div>

      <p className="claim-statement">{claim.statement}</p>

      {claim.nodes.length > 0 && (
        <div className="claim-nodes">
          {claim.nodes.map((n) => (
            <span className="node" key={n}>{n}</span>
          ))}
        </div>
      )}

      <div className="claim-test">
        <div>
          PASSES IF · <b>{o.metric}</b>{' '}
          {COMPARATORS[o.comparator] || o.comparator}{' '}
          <b>{fmtThreshold(o.threshold, o.unit)}</b>
          {claim.failsIf.comparator &&
            ` · fails if ${COMPARATORS[claim.failsIf.comparator] || claim.failsIf.comparator} ${fmtThreshold(claim.failsIf.threshold, o.unit)}`}
        </div>
        <div>
          SEALED · <b>{fmtDate(claim.sealedDate)}</b>
          {claim.sealedUtc ? ` (${claim.sealedUtc})` : ''}
        </div>
        {claim.file.sha256 && (
          <div className="hash">
            SHA-256 · <b>{claim.file.sha256}</b>
          </div>
        )}
      </div>

      {res && (
        <div
          className="verdict-line"
          style={{
            '--tc':
              res.verdict === 'CONFIRM'
                ? 'var(--ok)'
                : res.verdict === 'DISCONFIRM'
                  ? 'var(--you)'
                  : 'var(--dim)',
          }}
        >
          {res.verdict} · actual{' '}
          <b>{fmtThreshold(res.actualValue, o.unit)}</b> vs{' '}
          {COMPARATORS[res.comparator] || res.comparator}{' '}
          {fmtThreshold(res.threshold, o.unit)}
          {res.reason ? ` — ${res.reason}` : ''}
        </div>
      )}

      <div className="linkrow">
        <a href={claim.file.blobUrl} target="_blank" rel="noreferrer">
          sealed file ↗
        </a>
        {claim.file.otsUrl && (
          <a href={claim.file.otsUrl} target="_blank" rel="noreferrer">
            bitcoin proof (.ots) ↗
          </a>
        )}
        {res?.blobUrl && (
          <a href={res.blobUrl} target="_blank" rel="noreferrer">
            verdict file ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function Ledger({ data }) {
  const { ok, open, resolved, stats } = data;

  return (
    <section className="section" id="ledger" style={{ '--wc': 'var(--w2)' }}>
      <div className="eyebrow">The keystone</div>
      <div className="section-head">
        <h2>The ledger</h2>
        <span>sealed · hashed · bitcoin-anchored · graded mechanically</span>
      </div>
      <p className="section-goal">
        Every forecast below was written down, hashed, and anchored to the Bitcoin
        blockchain <em>before</em> its outcome could be known. Grading is mechanical
        against a rule sealed at the same moment — no partial credit, no moving the
        line afterwards. Read live from the public ledger repo.
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

      {ok && stats && (
        <>
          <div className="strips">
            <div className="strip">
              <h3>Sealed &amp; open</h3>
              <div className="big">{stats.open}</div>
              <p>
                {stats.resolved === 0
                  ? `${stats.sealed} forecasts sealed & timestamped, first resolves ${fmtDate(stats.firstResolveDate)}.`
                  : `${stats.sealed} sealed to date. Nothing withdrawn.`}
              </p>
            </div>
            <div className="strip">
              <h3>Graded</h3>
              <div className="big">
                {stats.resolved === 0 ? 'none yet' : `${stats.confirm}–${stats.disconfirm}`}
              </div>
              <p>
                {stats.resolved === 0
                  ? 'No hit-rate is claimed. There is nothing to score until claims start resolving.'
                  : `${stats.confirm} confirmed · ${stats.disconfirm} disconfirmed${stats.unresolved ? ` · ${stats.unresolved} unresolved` : ''}. Misses published same-day, same format.`}
              </p>
            </div>
            <div className="strip">
              <h3>Verify it yourself</h3>
              <div className="big">~90 seconds</div>
              <p>
                Hash the file, drop the .ots proof into opentimestamps.org, read the
                Bitcoin block time. You do not have to trust me.
              </p>
            </div>
          </div>

          {resolved.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 26 }}>Resolved</div>
              <div className="claims">
                {resolved.map((c) => <ClaimCard claim={c} key={c.id} />)}
              </div>
            </>
          )}

          {open.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 26 }}>
                Open — {open.length} live forecast{open.length === 1 ? '' : 's'}
              </div>
              <div className="claims">
                {open.map((c) => <ClaimCard claim={c} key={c.id} />)}
              </div>
            </>
          )}

          <div className="note">
            <b>HONESTY NOTE</b>
            <div style={{ marginTop: 4 }}>
              {stats.testDrills > 0 && (
                <>
                  {stats.testDrills} sacrificial test drill
                  {stats.testDrills === 1 ? ' sits' : 's sit'} in the ledger too,
                  labelled and never deleted — dress rehearsals of the sealing
                  machinery, not forecasts, so they are kept off this scoreboard.{' '}
                </>
              )}
              The repo is append-only: nothing here is edited or removed once sealed.
            </div>
            <div className="linkrow">
              <a href={ledger.repoUrl} target="_blank" rel="noreferrer">
                the full ledger ↗
              </a>
              <a href={`${ledger.repoUrl}#how-to-verify-in-90-seconds`} target="_blank" rel="noreferrer">
                how to verify ↗
              </a>
              {stats.pulses > 0 && (
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
