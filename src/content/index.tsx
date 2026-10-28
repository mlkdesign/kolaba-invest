import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type Content } from './en';
import { ru } from './ru';

/** Locale registry. Add a dictionary here and the header switch picks it up. */
export const LOCALES = { en, ru } satisfies Record<string, Content>;
export type Locale = keyof typeof LOCALES;
export const AVAILABLE_LOCALES = Object.keys(LOCALES) as Locale[];

const STORAGE_KEY = 'kolaba-locale';
const isLocale = (v: unknown): v is Locale => typeof v === 'string' && v in LOCALES;

/** `?lang=ru` wins (shareable links), then the visitor's last choice, then English. */
function initialLocale(fallback: Locale): Locale {
  if (typeof window === 'undefined') return fallback;
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(fromUrl)) return fromUrl;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // storage unavailable (private mode) — fall through
  }
  return fallback;
}

type Ctx = { locale: Locale; content: Content; setLocale: (l: Locale) => void };

const ContentContext = createContext<Ctx>({ locale: 'en', content: en, setLocale: () => {} });

export function ContentProvider({ locale: fallback = 'en', children }: { locale?: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale(fallback));

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, content: LOCALES[locale], setLocale }), [locale, setLocale]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext).content;
export const useLocale = () => useContext(ContentContext).locale;
export const useSetLocale = () => useContext(ContentContext).setLocale;
