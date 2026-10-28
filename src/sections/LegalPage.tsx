import { useEffect } from 'react';
import { useContent } from '../content';
import { BASE_PATH, FOUNDER_LINKS, LEGAL_ROUTES } from '../data/contacts';
import logoWhite from '../assets/icons/logo-white.svg';
import './LegalPage.css';

type LegalId = keyof typeof LEGAL_ROUTES;

export function legalPageFor(pathname: string): LegalId | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const hit = (Object.keys(LEGAL_ROUTES) as LegalId[]).find((k) => LEGAL_ROUTES[k] === clean);
  return hit ?? null;
}

/**
 * Prepared legal route. No document text has been supplied yet, so the page
 * states that explicitly instead of showing invented legal copy.
 */
export function LegalPage({ page }: { page: LegalId }) {
  const c = useContent().legal;
  const title = c.titles[page];

  useEffect(() => {
    document.title = `${title} — KOLABA`;
    document.documentElement.classList.remove('is-deck');
    document.documentElement.classList.add('is-flow');
  }, [title]);

  return (
    <main className="legal">
      <a href={BASE_PATH} className="legal__logo" aria-label={c.back}>
        <img src={logoWhite} alt="kolaba." width={84} height={18} />
      </a>
      <h1 className="legal__title">{title}</h1>
      <p className="legal__status">{c.pending}</p>
      <p className="legal__detail">
        {c.pendingDetail}{' '}
        <a href={FOUNDER_LINKS.telegram} target="_blank" rel="noopener noreferrer">
          Telegram ↗
        </a>
      </p>
      <a href={BASE_PATH} className="btn btn--outline btn--sm legal__back">
        <span className="btn__label">← {c.back}</span>
      </a>
    </main>
  );
}
