'use client';

import { useState } from 'react';
import { newsletter } from '../config/site';

// One field, one button, one metric: does the address land in Buttondown.
// The POST goes to this site's own /api/subscribe route so no key is ever
// exposed to the browser.
export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | ok | err
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState('ok');
        setMsg(data.message || 'Done — you are on the list.');
        setEmail('');
      } else {
        setState('err');
        setMsg(data.message || 'That did not go through. Try again in a moment.');
      }
    } catch {
      setState('err');
      setMsg('Network error — nothing was sent.');
    }
  }

  return (
    <section className="section" id="subscribe" style={{ '--wc': 'var(--w4)' }}>
      <div className="subscribe">
        <div className="eyebrow">The list</div>
        <h2>{newsletter.headline}</h2>
        <p>{newsletter.sub}</p>

        <form className="subform" onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@domain.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'sending'}
          />
          <button type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'sending…' : 'Notify me'}
          </button>
        </form>

        {msg && (
          <div className={`submsg ${state === 'ok' ? 'ok' : 'err'}`} role="status">
            {msg}
          </div>
        )}

        <div className="subfine">
          No sequences, no upsells. Unsubscribe link on every send.
        </div>
      </div>
    </section>
  );
}
