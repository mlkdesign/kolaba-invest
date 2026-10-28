import { createContext, useContext, type ReactNode } from 'react';
import { en, type Content } from './en';

/**
 * Locale registry. Only English ships today; add `ru: ru` here once the
 * Russian dictionary exists, and the header switch becomes active.
 */
export const LOCALES = { en } satisfies Record<string, Content>;
export type Locale = keyof typeof LOCALES;
export const AVAILABLE_LOCALES = Object.keys(LOCALES) as Locale[];

const ContentContext = createContext<{ locale: Locale; content: Content }>({ locale: 'en', content: en });

export function ContentProvider({ locale = 'en', children }: { locale?: Locale; children: ReactNode }) {
  return <ContentContext.Provider value={{ locale, content: LOCALES[locale] }}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext).content;
export const useLocale = () => useContext(ContentContext).locale;
