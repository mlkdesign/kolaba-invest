import { useCallback, useEffect, useRef, useState } from 'react';
import { NAV_TARGETS, SLIDES, SLIDE_COUNT, slideIndex } from '../data/slides';
import { useContent, useLocale, useSetLocale, AVAILABLE_LOCALES } from '../content';
import { useEngine } from '../engine/SlideEngine';
import { lockScroll, unlockScroll } from '../lib/scrollLock';
import logoWhite from '../assets/icons/logo-white.svg';
import logoDark from '../assets/icons/logo-dark.svg';
import arrowWhite from '../assets/icons/arrow-white.svg';
import arrowDark from '../assets/icons/arrow-dark.svg';

const pad = (n: number) => String(n).padStart(2, '0');

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

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const go = (index: number) => {
    setMenuOpen(false);
    goTo(index);
  };

  useEffect(() => {
    if (mode === 'deck') setMenuOpen(false);
  }, [mode]);

  const langSwitch = (
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
  );

  return (
    <header className={`site-header site-header--${theme} ${menuOpen ? 'is-menu-open' : ''}`}>
      <div className="site-header__bar">
        <button type="button" className="site-header__logo" onClick={() => go(0)} aria-label={c.header.homeLabel}>
          <img src={dark && !menuOpen ? logoDark : logoWhite} alt="kolaba." width={70} height={15} />
        </button>

        <nav className="site-header__nav" aria-label="Sections">
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
          {langSwitch}
          {/* "Explore KOLABA" (link to the public Product Overview) goes here once that page exists. */}
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
          {mode === 'flow' && (
            <p className="site-header__count" aria-label={`${c.header.currentSection}: ${c.sectionNames[SLIDES[activeIndex].id]}`}>
              <span>{pad(activeIndex + 1)}</span> / {pad(SLIDE_COUNT)}
            </p>
          )}
          <button
            ref={menuBtn}
            type="button"
            className="site-header__burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? c.header.closeMenu : c.header.openMenu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {mode === 'flow' && (
        <MobileMenu
          open={menuOpen}
          activeIndex={activeIndex}
          returnFocus={menuBtn}
          langSwitch={langSwitch}
          onClose={closeMenu}
          onNavigate={(index, anchor) => {
            setMenuOpen(false);
            // Wait for the scroll lock to release, then move to the target.
            requestAnimationFrame(() => {
              const el = anchor ? document.getElementById(anchor) : null;
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              else goTo(index);
            });
          }}
        />
      )}
    </header>
  );
}

type MenuProps = {
  open: boolean;
  activeIndex: number;
  returnFocus: React.RefObject<HTMLButtonElement>;
  langSwitch: React.ReactNode;
  onClose: () => void;
  onNavigate: (index: number, anchor?: string) => void;
};

/** Fullscreen mobile navigation: scroll-locked, focus-trapped, closes on Escape. */
function MobileMenu({ open, activeIndex, returnFocus, langSwitch, onClose, onNavigate }: MenuProps) {
  const c = useContent().header;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const main = document.getElementById('main');
    main?.setAttribute('inert', '');
    const first = panel.current?.querySelector<HTMLElement>('a, button');
    first?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      // Focus stays inside the menu and its close button.
      const items = [returnFocus.current, ...panel.current.querySelectorAll<HTMLElement>('a, button')].filter(
        Boolean,
      ) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      main?.removeAttribute('inert');
      unlockScroll();
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open, onClose, returnFocus]);

  return (
    <div
      ref={panel}
      id="mobile-menu"
      className={`mobile-menu ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={c.menuLabel}
      aria-hidden={!open}
      {...(open ? {} : { inert: '' })}
    >
      <div className="mobile-menu__glow" aria-hidden="true" />
      <nav aria-label="Sections">
        <ol className="mobile-menu__list">
          {NAV_TARGETS.map((item, i) => {
            const index = slideIndex(item.slide);
            const current = index === activeIndex;
            return (
              <li key={item.slide} style={{ '--i': i } as React.CSSProperties}>
                <a
                  href={`#${item.slide}`}
                  className={current ? 'is-active' : undefined}
                  aria-current={current ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(index);
                  }}
                >
                  <span className="mobile-menu__num">{pad(index)}</span>
                  {c.nav[item.group]}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="mobile-menu__footer" style={{ '--i': NAV_TARGETS.length } as React.CSSProperties}>
        <a
          href="#contact-title"
          className="btn btn--primary mobile-menu__cta"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(slideIndex('founder'), 'contact-title');
          }}
        >
          <span className="btn__label">{c.menuCta}</span>
          <img src={arrowWhite} alt="" width={16} height={16} className="btn__icon" />
        </a>
        {langSwitch}
      </div>
    </div>
  );
}
