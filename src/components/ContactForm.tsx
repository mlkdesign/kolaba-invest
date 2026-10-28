import { useEffect, useRef, useState } from 'react';
import { useContent } from '../content';
import { FOUNDER_LINKS, LEGAL_ROUTES } from '../data/contacts';
import { submitContact, validateContact, type FieldErrors } from '../lib/contact';
import { Button, ExternalLink } from './Button';
import telegramIcon from '../assets/icons/telegram.svg';
import angleRight from '../assets/icons/angle-right.svg';

type Status = 'idle' | 'sending' | 'success' | 'error';
type Field = 'name' | 'email' | 'message';

export function ContactForm() {
  const c = useContent().contact;
  const [values, setValues] = useState({ name: '', email: '', message: '', company: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const startedAt = useRef(Date.now());
  const abort = useRef<AbortController | null>(null);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const errorText = (field: Field) => {
    const e = errors[field];
    if (!e || !touched[field]) return '';
    if (field === 'email') return e === 'invalid' ? c.errors.emailInvalid : c.errors.emailRequired;
    return field === 'name' ? c.errors.nameRequired : c.errors.messageRequired;
  };

  const update = (field: Field | 'company', value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (field !== 'company' && touched[field]) setErrors(validateContact(next));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const first = (['name', 'email', 'message'] as Field[]).find((f) => found[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    abort.current = new AbortController();
    const outcome = await submitContact(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        consent,
        company: values.company,
        elapsed: Date.now() - startedAt.current,
      },
      abort.current.signal,
    );
    if (outcome.ok) {
      setStatus('success');
      return;
    }
    setStatus('error');
    setServerError(
      outcome.reason === 'network'
        ? c.errors.network
        : outcome.reason === 'rate-limited'
          ? c.errors.rateLimited
          : outcome.reason === 'not-configured'
            ? c.errors.notConfigured
            : c.errors.server,
    );
  };

  const reset = () => {
    setValues({ name: '', email: '', message: '', company: '' });
    setConsent(false);
    setErrors({});
    setTouched({});
    setStatus('idle');
    startedAt.current = Date.now();
  };

  if (status === 'success') {
    return (
      <div className="contact-form contact-form--success" ref={successRef} tabIndex={-1} role="status">
        <p className="contact-form__success-title">{c.successTitle}</p>
        <p className="contact-form__success-text">{c.successText}</p>
        <Button variant="outline" onClick={reset}>
          {c.sendAnother}
        </Button>
      </div>
    );
  }

  const field = (name: Field, label: string, multiline = false) => {
    const err = errorText(name);
    const id = `contact-${name}`;
    const common = {
      id,
      name,
      placeholder: label,
      value: values[name],
      required: true,
      'aria-invalid': !!err,
      'aria-describedby': err ? `${id}-error` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(name, e.target.value),
      onBlur: () => {
        setTouched((t) => ({ ...t, [name]: true }));
        setErrors(validateContact(values));
      },
    };
    return (
      <div className={`field ${multiline ? 'field--message' : ''} ${err ? 'has-error' : ''}`}>
        <label htmlFor={id} className="field__label">
          {label}
        </label>
        {multiline ? (
          <textarea ref={refs.message} rows={4} maxLength={4000} {...common} />
        ) : (
          <input
            ref={name === 'name' ? refs.name : refs.email}
            type={name === 'email' ? 'email' : 'text'}
            autoComplete={name === 'email' ? 'email' : 'name'}
            maxLength={200}
            {...common}
          />
        )}
        {err && (
          <p className="field__error" id={`${id}-error`}>
            <span aria-hidden="true">! </span>
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="contact-form" noValidate onSubmit={onSubmit} aria-busy={status === 'sending'}>
      <div className="contact-form__row">
        {field('name', c.name)}
        {field('email', c.email)}
      </div>
      {field('message', c.message, true)}

      {/* Honeypot: hidden from people and assistive tech */}
      <div className="contact-form__hp" aria-hidden="true">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={values.company} onChange={(e) => update('company', e.target.value)} />
        </label>
      </div>

      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span className="consent__box" aria-hidden="true" />
        <span className="consent__text">
          {c.consent[0]}
          <a href={LEGAL_ROUTES.privacy} target="_blank" rel="noopener">
            {c.consent[1]}
          </a>
          {c.consent[2]}
          <a href={LEGAL_ROUTES.terms} target="_blank" rel="noopener">
            {c.consent[3]}
          </a>
          {c.consent[4]}
        </span>
      </label>

      {status === 'error' && (
        <p className="contact-form__alert" role="alert">
          {serverError}
        </p>
      )}

      <div className="contact-form__actions">
        <Button type="submit" disabled={status === 'sending'} aria-disabled={status === 'sending'}>
          {status === 'sending' ? c.sending : c.send}
        </Button>
        <ExternalLink href={FOUNDER_LINKS.telegram} className="telegram-btn">
          <img src={telegramIcon} alt="" width={24} height={24} />
          <span>{c.telegram}</span>
          <img src={angleRight} alt="" width={24} height={24} className="telegram-btn__chevron" />
        </ExternalLink>
      </div>
    </form>
  );
}
