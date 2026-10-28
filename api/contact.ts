/**
 * POST /api/contact — Vercel Serverless Function (Node runtime).
 *
 * Delivers investor enquiries to a Telegram chat via a bot. Secrets stay server-side:
 *   TELEGRAM_BOT_TOKEN   bot token from @BotFather
 *   TELEGRAM_CHAT_ID     chat / channel id that receives the messages
 *   CONTACT_ALLOWED_ORIGIN (optional) e.g. https://invest.kolaba.app — rejects other origins
 *
 * Spam protection: honeypot field, minimum fill time, size limits, and a per-IP
 * rate limit (best-effort, per function instance — use Vercel KV / Upstash for a
 * shared limit if abuse appears).
 */

type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};
type Res = {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function header(req: Req, name: string) {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const allowed = process.env.CONTACT_ALLOWED_ORIGIN;
  if (allowed && header(req, 'origin') !== allowed) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(503).json({ ok: false, error: 'not-configured' });
  }

  const ip = (header(req, 'x-forwarded-for') ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'rate-limited' });
  }

  let body: Record<string, unknown> = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : ((req.body as Record<string, unknown>) ?? {});
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid-json' });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const consent = body.consent === true;
  const honeypot = String(body.company ?? '');
  const elapsed = Number(body.elapsed ?? 0);

  // Bots: pretend success so they don't retry, but deliver nothing.
  if (honeypot || elapsed < 2500) {
    return res.status(200).json({ ok: true });
  }

  if (!name || name.length > 200 || !EMAIL_RE.test(email) || email.length > 200 || !message || message.length > 4000) {
    return res.status(400).json({ ok: false, error: 'validation' });
  }

  const text = [
    '<b>New KOLABA investor enquiry</b>',
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Consent to privacy policy:</b> ${consent ? 'yes' : 'no'}`,
    '',
    escapeHtml(message),
  ].join('\n');

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    const result = (await tg.json().catch(() => ({}))) as { ok?: boolean };
    if (!tg.ok || !result.ok) {
      return res.status(502).json({ ok: false, error: 'delivery-failed' });
    }
  } catch {
    return res.status(502).json({ ok: false, error: 'delivery-failed' });
  }

  return res.status(200).json({ ok: true });
}
