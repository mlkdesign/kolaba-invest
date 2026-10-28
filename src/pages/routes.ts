import { BASE_PATH } from '../data/contacts';

/**
 * Page routing. Two pages are planned:
 *   - Investor Proposal (private, noindex) — live today at the site root and at `/investors`.
 *   - Product Overview (public, indexable) — not built yet; it will take over `/`.
 *
 * Until Product Overview ships, the root keeps serving the Investor Proposal so every
 * link already sent to investors keeps working. When it ships: point `/` at the
 * product page, keep `/investors`, and redirect old root links that carry an investor
 * anchor (`/#financials` etc.) to `/investors#…`.
 */
export type PageId = 'investors';

export const PAGE_META: Record<PageId, { title: string; description: string; robots: string }> = {
  investors: {
    title: 'KOLABA — Private Investment Opportunity',
    description: 'KOLABA — private investor proposal: business model, financial scenarios and the $95,000 initial round.',
    robots: 'noindex, nofollow, noarchive',
  },
};

export const INVESTORS_PATH = `${BASE_PATH}investors`;

/** Resolves the page for a pathname under the app base; null for unknown paths (legal pages are handled separately). */
export function pageFor(pathname: string): PageId | null {
  const rel = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname.replace(/^\//, '');
  const path = rel.replace(/\/+$/, '');
  if (path === '' || path === 'index.html' || path === 'investors') return 'investors';
  return null;
}

/** Applies per-page title, description and robots, so privacy settings never leak to a future public page. */
export function applyPageMeta(page: PageId) {
  const meta = PAGE_META[page];
  document.title = meta.title;
  const set = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  };
  set('description', meta.description);
  set('robots', meta.robots);
}
