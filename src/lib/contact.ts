import { CONTACT_ENDPOINT } from '../data/contacts';

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  consent: boolean;
  /** Honeypot — must stay empty. */
  company: string;
  /** ms since the form was rendered; bots submit instantly. */
  elapsed: number;
};

export type FieldErrors = Partial<Record<'name' | 'email' | 'message', 'required' | 'invalid'>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(p: Pick<ContactPayload, 'name' | 'email' | 'message'>): FieldErrors {
  const errors: FieldErrors = {};
  if (!p.name.trim()) errors.name = 'required';
  if (!p.email.trim()) errors.email = 'required';
  else if (!EMAIL_RE.test(p.email.trim())) errors.email = 'invalid';
  if (!p.message.trim()) errors.message = 'required';
  return errors;
}

export type SubmitOutcome =
  | { ok: true }
  | { ok: false; reason: 'network' | 'server' | 'rate-limited' | 'not-configured' | 'validation' };

/** Sends the enquiry. Success is reported only when the server confirms delivery. */
export async function submitContact(payload: ContactPayload, signal?: AbortSignal): Promise<SubmitOutcome> {
  let res: Response;
  try {
    res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  } catch {
    return { ok: false, reason: 'network' };
  }
  let body: { ok?: boolean; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    // Static hosting without the function returns HTML (or 404): treat as not configured.
    return { ok: false, reason: res.status === 404 || res.status === 405 ? 'not-configured' : 'server' };
  }
  if (res.ok && body.ok === true) return { ok: true };
  if (res.status === 429) return { ok: false, reason: 'rate-limited' };
  if (res.status === 400) return { ok: false, reason: 'validation' };
  if (res.status === 503 || body.error === 'not-configured') return { ok: false, reason: 'not-configured' };
  return { ok: false, reason: 'server' };
}
