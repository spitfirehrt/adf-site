'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { newsletter } from '../config/site';

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURE POPUP
//
// Same Buttondown path as the in-page block — it POSTs to /api/subscribe, so
// there is one server route, one key, one failure vocabulary.
//
// Timing is engaged-visitor, not instant-interrupt: it waits for ~40% scroll OR
// ~20s, whichever lands first. Once dismissed or successfully submitted it sets
// a localStorage flag and never appears again. A FAILED submit deliberately
// does NOT set the flag — a visitor who tried and hit a server error should get
// another chance, not be locked out by our outage.
//
// It is a corner card (desktop) / bottom sheet (mobile), never a full-screen
// blocker, and it is suppressed on /contact where capture already lives.
// ─────────────────────────────────────────────────────────────────────────────

const FLAG = 'adf-capture-v1';
const SCROLL_TRIGGER = 0.4;   // 40% of scrollable height
const TIME_TRIGGER_MS = 20000;
const SUPPRESSED_ON = ['/contact'];

export default function CapturePopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | ok | err
  const [msg, setMsg] = useState('');

  const suppressed = SUPPRESSED_ON.includes(pathname);

  useEffect(() => {
    if (suppressed) return undefined;

    try {
      if (window.localStorage.getItem(FLAG)) return undefined;
    } catch {
      // Private mode / storage blocked. Showing once per page is the right
      // failure direction here — better than never showing at all.
    }

    let timer = null;

    function teardown() {
      if (timer) clearTimeout(timer);
      timer = null;
      window.removeEventListener('scroll', onScroll);
    }

    function reveal() {
      teardown();
      setVisible(true);
    }

    function onScroll() {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable <= 0) return;
      if (el.scrollTop / scrollable >= SCROLL_TRIGGER) reveal();
    }

    timer = setTimeout(reveal, TIME_TRIGGER_MS);
    window.addEventListener('scroll', onScroll, { passive: true });

    return teardown;
  }, [suppressed, pathname]);

  const settle = useCallback((reason) => {
    try {
      window.localStorage.setItem(FLAG, reason);
    } catch {
      /* nothing to do — the popup still closes for this visit */
    }
    setVisible(false);
  }, []);

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
        // Let the confirmation be read before it goes.
        setTimeout(() => settle('subscribed'), 2200);
      } else {
        setState('err');
        setMsg(data.message || 'That did not go through. Try again in a moment.');
      }
    } catch {
      setState('err');
      setMsg('Network error — nothing was sent.');
    }
  }

  if (suppressed || !visible) return null;

  return (
    <aside
      className="cap-pop"
      role="dialog"
      aria-label="Subscribe for resolutions"
    >
      <div className="cap-hdr">
        <p className="cap-title">{newsletter.headline}</p>
        <button
          type="button"
          className="cap-x"
          onClick={() => settle('dismissed')}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      <p className="cap-sub">{newsletter.sub}</p>

      <form className="cap-form" onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'sending' || state === 'ok'}
        />
        <button type="submit" disabled={state === 'sending' || state === 'ok'}>
          {state === 'sending' ? 'sending…' : 'Notify me'}
        </button>
      </form>

      {msg && (
        <div className={`cap-msg ${state === 'ok' ? 'ok' : 'err'}`} role="status">
          {msg}
        </div>
      )}
    </aside>
  );
}
