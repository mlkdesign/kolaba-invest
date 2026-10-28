import { useEffect, useRef, useState } from 'react';
import { NAV_TARGETS, SLIDES, slideIndex } from '../data/slides';
import { useContent, useLocale, useSetLocale, AVAILABLE_LOCALES } from '../content';
import { useEngine } from '../engine/SlideEngine';
import logoWhite from '../assets/icons/logo-white.svg';
import logoDark from '../assets/icons/logo-dark.svg';
import arrowWhite from '../assets/icons/arrow-white.svg';
import arrowDark from '../assets/icons/arrow-dark.svg';

export function Header() {
  const c = useContent();
  const { activeIndex, goTo, mode } = useEngine();
  const theme = SLIDES[activeIndex]?.theme ?? 'dark';
  const activeGroup = (SLIDES[activeIndex] as { nav?: string }).nav;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const dark = theme === 'light';
  const locale = useLocale();
  const setLocale = useSetLocale();

  const go = (index: number) => {
    setMenuOpen(false);
    goTo(index);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (mode === 'deck') setMenuOpen(false);
  }, [mode]);

  return (
    <header className={`site-header site-header--${theme} ${menuOpen ? 'is-menu-open' : ''}`}>
      <div className="site-header__bar">
        <button type="button" className="site-header__logo" onClick={() => go(0)} aria-label={c.header.homeLabel}>
          <img src={dark && !menuOpen ? logoDark : logoWhite} alt="kolaba." width={70} height={15} />
        </button>

        <nav className="site-header__nav" aria-label="Sections" id="site-nav">
          <ul>
            {NAV_TARGETS.map(({ group, slide }) => (
              <li key={group}>
                <a
                  href={`#${slide}`}
                  className={activeGroup === group ? 'is-active' : undefined}
                  aria-current={activeGroup === group ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(slideIndex(slide));
                  }}
                >
                  {c.header.nav[group]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <div className="lang" role="group" aria-label={c.header.languageLabel}>
            {AVAILABLE_LOCALES.map((l, i) => (
              <button
                key={l}
                type="button"
                className={`lang__item ${l === locale ? 'is-active' : ''}`}
                lang={l}
                aria-pressed={l === locale}
                onClick={() => setLocale(l)}
              >
                {i > 0 && <span aria-hidden="true">/ </span>}
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a
            href="#demo"
            className="site-header__demo"
            onClick={(e) => {
              e.preventDefault();
              go(slideIndex('demo'));
            }}
          >
            {c.header.exploreDemo}
          </a>
          <a
            href="#founder"
            className="btn btn--outline btn--sm site-header__contact"
            onClick={(e) => {
              e.preventDefault();
              go(slideIndex('founder'));
            }}
          >
            <span className="btn__label">{c.header.contact}</span>
            <img src={dark && !menuOpen ? arrowDark : arrowWhite} alt="" width={16} height={16} className="btn__icon" />
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="site-header__burger"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? c.header.closeMenu : c.header.openMenu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
