// ─────────────────────────────────────────────────────────────────────────────
// EMAIL CAPTURE → BUTTONDOWN
//
// Server-only. The API key never reaches the browser and is never committed —
// it is read from env (.env.local locally, Vercel project env in production).
//
//   BUTTONDOWN_API_KEY   preferred: the v1 API, so the visitor never leaves.
//   BUTTONDOWN_USERNAME  fallback:  the public embed endpoint, no key needed.
//
// With neither set the route answers 503 in plain English instead of pretending
// the address was captured.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status, body) {
  return Response.json(body, { status });
}

export async function POST(req) {
  let email;
  try {
    ({ email } = await req.json());
  } catch {
    return json(400, { message: 'Malformed request.' });
  }

  email = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json(400, { message: 'That does not look like an email address.' });
  }

  const key = process.env.BUTTONDOWN_API_KEY;
  const username = process.env.BUTTONDOWN_USERNAME;

  if (!key && !username) {
    return json(503, {
      message: 'The list is not wired up yet. Follow on Substack in the meantime.',
    });
  }

  try {
    if (key) {
      const res = await fetch('https://api.buttondown.com/v1/subscribers', {
        method: 'POST',
        headers: {
          Authorization: `Token ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          tags: ['adf-site'],
          referrer_url: 'https://deviationsystems.com',
        }),
      });

      if (res.ok) return json(200, { message: 'Done — you are on the list.' });

      const text = await res.text();
      // Buttondown answers 400 for an address it already holds. That is a
      // success from the visitor's point of view, not an error to show them.
      if (/already|duplicate|exists/i.test(text)) {
        return json(200, { message: 'You were already on the list — nothing changed.' });
      }
      console.error('buttondown api error', res.status, text.slice(0, 500));
      return json(502, { message: 'The list provider rejected that. Try again shortly.' });
    }

    // Keyless fallback — the public embed endpoint.
    const res = await fetch(
      `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(username)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }).toString(),
        redirect: 'manual',
      }
    );

    // The embed endpoint answers 200 or a 3xx redirect to its thank-you page.
    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return json(200, { message: 'Done — you are on the list.' });
    }
    console.error('buttondown embed error', res.status);
    return json(502, { message: 'The list provider rejected that. Try again shortly.' });
  } catch (err) {
    console.error('subscribe failed', err);
    return json(500, { message: 'Something broke on our side. Nothing was sent.' });
  }
}
