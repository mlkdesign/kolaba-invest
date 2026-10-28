import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { SLIDES, SLIDE_COUNT } from '../data/slides';
import { DECK_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { WheelIntent, normalizeWheel } from './wheelIntent';

export type EngineMode = 'deck' | 'flow';

type EngineValue = {
  mode: EngineMode;
  activeIndex: number;
  /** Sections currently in view (flow mode) or the active slide (deck mode). */
  visible: ReadonlySet<number>;
  reducedMotion: boolean;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  registerSection: (index: number, el: HTMLElement | null) => void;
  trackRef: React.RefObject<HTMLDivElement>;
};

const EngineContext = createContext<EngineValue | null>(null);

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be used inside <SlideEngine>');
  return ctx;
}

const TRANSITION_S = 0.9;
const EASE = 'power2.inOut';

/** Keys are ignored while the user works with form fields and widgets that use arrows themselves. */
function isKeyboardOwner(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el.closest('input, textarea, select, [role="slider"], [role="listbox"], [role="radiogroup"], [role="tablist"], [role="application"], [data-keys-owned]')) return true;
  return false;
}

/** Let the wheel scroll nested scrollable areas (popups, prototype embed) natively. */
function canScrollNatively(target: EventTarget | null, deltaY: number, boundary: HTMLElement | null) {
  let el = target instanceof Element ? target : null;
  while (el && el !== boundary && el !== document.body) {
    if (el instanceof HTMLElement) {
      if (el.dataset.nativeScroll !== undefined) return true;
      const style = getComputedStyle(el);
      if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
        if (deltaY < 0 && el.scrollTop > 0) return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

function initialIndexFromHash() {
  const id = window.location.hash.replace('#', '');
  const i = SLIDES.findIndex((s) => s.id === id);
  return i >= 0 ? i : 0;
}

export function SlideEngine({ children }: { children: ReactNode }) {
  const isDeck = useMediaQuery(DECK_QUERY);
  const mode: EngineMode = isDeck ? 'deck' : 'flow';
  const reducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(initialIndexFromHash);
  const [visible, setVisible] = useState<ReadonlySet<number>>(() => new Set([initialIndexFromHash()]));

  const trackRef = useRef<HTMLDivElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(activeIndex);
  const posRef = useRef({ pos: activeIndex });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const intent = useRef(new WheelIntent());

  activeRef.current = activeIndex;

  const applyPos = useCallback(() => {
    trackRef.current?.style.setProperty('--deck-pos', String(posRef.current.pos));
  }, []);

  const registerSection = useCallback((index: number, el: HTMLElement | null) => {
    sections.current[index] = el;
  }, []);

  const goTo = useCallback(
    (raw: number) => {
      const index = Math.max(0, Math.min(SLIDE_COUNT - 1, raw));
      if (mode === 'flow') {
        sections.current[index]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      if (index === activeRef.current && !tweenRef.current?.isActive()) return;
      const distance = Math.abs(posRef.current.pos - index);
      const duration = reducedMotion ? 0 : Math.min(1.25, TRANSITION_S + (distance - 1) * 0.06);
      intent.current.begin(performance.now(), duration * 1000);
      activeRef.current = index;
      setActiveIndex(index);
      setVisible(new Set([index]));
      tweenRef.current?.kill();
      tweenRef.current = gsap.to(posRef.current, {
        pos: index,
        duration,
        ease: EASE,
        onUpdate: applyPos,
        onComplete: () => intent.current.end(),
      });
    },
    [applyPos, mode, reducedMotion],
  );

  const next = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  // Keep the deck position in sync when switching modes or on first paint.
  useLayoutEffect(() => {
    if (mode !== 'deck') return;
    tweenRef.current?.kill();
    posRef.current.pos = activeRef.current;
    applyPos();
    intent.current.reset();
    setVisible(new Set([activeRef.current]));
  }, [mode, applyPos]);

  // Flow mode: restore the scroll position of the active slide, then track visibility.
  useEffect(() => {
    if (mode !== 'flow') return;
    const target = sections.current[activeRef.current];
    if (target && activeRef.current > 0) target.scrollIntoView({ block: 'start' });

    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.index);
          ratios.set(i, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        const nowVisible = new Set<number>();
        let best = activeRef.current;
        let bestRatio = -1;
        ratios.forEach((r, i) => {
          if (r > 0.18) nowVisible.add(i);
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        });
        setVisible((prevSet) => {
          // Sections reveal once in flow mode, so keep previously seen ones.
          const merged = new Set(prevSet);
          nowVisible.forEach((i) => merged.add(i));
          return merged.size === prevSet.size ? prevSet : merged;
        });
        if (bestRatio > 0) {
          activeRef.current = best;
          setActiveIndex(best);
        }
      },
      { threshold: [0, 0.18, 0.35, 0.5, 0.75, 1] },
    );
    sections.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [mode]);

  // Hash reflects the active slide so links can be shared and reloads keep position.
  useEffect(() => {
    const id = SLIDES[activeIndex]?.id;
    if (id && window.location.hash !== `#${id}`) {
      history.replaceState(null, '', activeIndex === 0 ? window.location.pathname : `#${id}`);
    }
  }, [activeIndex]);

  // Deep links (#calculator etc.) work after load too.
  useEffect(() => {
    const onHash = () => {
      const i = SLIDES.findIndex((s) => `#${s.id}` === window.location.hash);
      if (i >= 0 && i !== activeRef.current) goTo(i);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [goTo]);

  // Deck input: wheel, keyboard, touch, focus.
  useEffect(() => {
    if (mode !== 'deck') return;
    const track = trackRef.current;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (canScrollNatively(e.target, e.deltaY, track)) return;
      e.preventDefault();
      const dir = intent.current.feed(normalizeWheel(e, window.innerHeight), performance.now());
      if (dir === 0) return;
      const target = activeRef.current + dir;
      if (target < 0 || target >= SLIDE_COUNT) return;
      goTo(target);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
      if (isKeyboardOwner(e.target)) return;
      const busy = tweenRef.current?.isActive();
      let target: number | null = null;
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          target = activeRef.current + 1;
          break;
        case 'ArrowUp':
        case 'PageUp':
          target = activeRef.current - 1;
          break;
        case ' ':
          if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;
          target = activeRef.current + (e.shiftKey ? -1 : 1);
          break;
        case 'Home':
          target = 0;
          break;
        case 'End':
          target = SLIDE_COUNT - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      if (busy || target < 0 || target >= SLIDE_COUNT) return;
      goTo(target);
    };

    let touchStart: { x: number; y: number; t: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return (touchStart = null);
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, t: performance.now() };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStart && !canScrollNatively(e.target, 0, track)) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dy = touchStart.y - t.clientY;
      const dx = touchStart.x - t.clientX;
      touchStart = null;
      if (Math.abs(dy) < 50 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
      if (tweenRef.current?.isActive()) return;
      const target = activeRef.current + (dy > 0 ? 1 : -1);
      if (target >= 0 && target < SLIDE_COUNT) goTo(target);
    };

    // Tabbing into another slide brings it into view.
    const onFocusIn = (e: FocusEvent) => {
      const section = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-index]');
      if (!section) return;
      const i = Number(section.dataset.index);
      if (i !== activeRef.current) goTo(i);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    track?.addEventListener('touchstart', onTouchStart, { passive: true });
    track?.addEventListener('touchmove', onTouchMove, { passive: false });
    track?.addEventListener('touchend', onTouchEnd);
    track?.addEventListener('focusin', onFocusIn);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      track?.removeEventListener('touchstart', onTouchStart);
      track?.removeEventListener('touchmove', onTouchMove);
      track?.removeEventListener('touchend', onTouchEnd);
      track?.removeEventListener('focusin', onFocusIn);
    };
  }, [mode, goTo]);

  // Keep <html> mode class in sync after resizes (initial value set inline in index.html).
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('is-deck', mode === 'deck');
    root.classList.toggle('is-flow', mode === 'flow');
  }, [mode]);

  useEffect(() => () => void tweenRef.current?.kill(), []);

  const value = useMemo<EngineValue>(
    () => ({ mode, activeIndex, visible, reducedMotion, goTo, next, prev, registerSection, trackRef }),
    [mode, activeIndex, visible, reducedMotion, goTo, next, prev, registerSection],
  );

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}
