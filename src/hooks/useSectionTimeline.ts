import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useEngine } from '../engine/SlideEngine';
import { useSection } from '../engine/SectionContext';
import { FLOW_REVEAL_MARGIN } from './useRevealTrigger';

type Builder = (tl: gsap.core.Timeline, q: (selector: string) => Element[]) => void;

type Recorded =
  | { kind: 'from'; targets: gsap.TweenTarget; vars: gsap.TweenVars }
  | { kind: 'fromTo'; targets: gsap.TweenTarget; from: gsap.TweenVars; vars: gsap.TweenVars };

/** Stands in for a timeline in flow mode: collects the section's entrance tweens instead of sequencing them. */
function recorder(out: Recorded[]) {
  const proxy = {
    from(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
      out.push({ kind: 'from', targets, vars });
      return proxy;
    },
    fromTo(targets: gsap.TweenTarget, from: gsap.TweenVars, vars: gsap.TweenVars) {
      out.push({ kind: 'fromTo', targets, from, vars });
      return proxy;
    },
  };
  return proxy as unknown as gsap.core.Timeline;
}

/** Resting values of the properties entrances animate from. */
const NATURAL: Record<string, number> = {
  autoAlpha: 1,
  opacity: 1,
  x: 0,
  y: 0,
  xPercent: 0,
  yPercent: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  rotationX: 0,
  rotationY: 0,
};
const TIMING = new Set(['duration', 'ease', 'stagger', 'delay']);
const SETUP = new Set(['transformOrigin', 'transformPerspective']);

/**
 * Turns `from(vars)` into explicit from → to values. A plain `from` captures the element's
 * current state as its end state, so an element that is still hidden by an earlier build
 * (StrictMode, hot reload, layout-mode switch) would animate from hidden to hidden.
 */
function explicit(vars: gsap.TweenVars, targets: gsap.TweenTarget): [gsap.TweenVars, gsap.TweenVars] {
  const from: gsap.TweenVars = {};
  const to: gsap.TweenVars = {};
  const first = gsap.utils.toArray<Element>(targets)[0];
  for (const [k, v] of Object.entries(vars)) {
    if (TIMING.has(k)) to[k] = v;
    else {
      from[k] = v;
      if (k in NATURAL) to[k] = NATURAL[k];
      // Other properties (e.g. a background colour) end at their stylesheet value.
      else if (!SETUP.has(k) && first) {
        // Read without inline overrides or a running CSS transition.
        const el = first as HTMLElement;
        const transition = el.style.transition;
        el.style.transition = 'none';
        gsap.set(targets, { clearProps: k });
        to[k] = gsap.getProperty(first, k);
        el.style.transition = transition;
      }
    }
  }
  return [from, to];
}

/** Deck: a timeline whose `from` calls are converted to explicit `fromTo`. */
function explicitTimeline(tl: gsap.core.Timeline) {
  const proxy = {
    from(targets: gsap.TweenTarget, vars: gsap.TweenVars, position?: gsap.Position) {
      const [a, b] = explicit({ ...tl.vars.defaults, ...vars }, targets);
      tl.fromTo(targets, a, b, position);
      return proxy;
    },
    fromTo(targets: gsap.TweenTarget, a: gsap.TweenVars, b: gsap.TweenVars, position?: gsap.Position) {
      tl.fromTo(targets, a, b, position);
      return proxy;
    },
  };
  return proxy as unknown as gsap.core.Timeline;
}

/** Mobile motion: shorter (≤ 0.7s), smaller travel, half-strength 3D, no section-level sequencing. */
function mobileVars(vars: gsap.TweenVars): gsap.TweenVars {
  const { stagger: _s, delay: _d, ...rest } = vars;
  const out: gsap.TweenVars = { ...rest, duration: Math.min(Number(vars.duration ?? 0.7), 0.7) };
  if (typeof out.y === 'number') out.y = Math.max(-24, Math.min(24, out.y));
  if (typeof out.x === 'number') out.x = Math.max(-16, Math.min(16, out.x));
  if (typeof out.rotationX === 'number') out.rotationX = out.rotationX * 0.45;
  return out;
}

/**
 * Builds one paused entrance timeline per section and replays it on every activation.
 * Leaving a slide (deck mode) resets it once the slide is off-screen, so the next
 * visit animates again without flashes. Reduced motion jumps to the final state.
 */
export function useSectionTimeline(build: Builder) {
  const { active, scopeRef, revealKey } = useSection();
  const { mode, reducedMotion } = useEngine();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  // Flow (mobile/tablet): each element plays its own entrance when it scrolls into view.
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || mode !== 'flow') return;
    const recs: Recorded[] = [];
    buildRef.current(recorder(recs), gsap.utils.selector(scope));
    const byElement = new Map<Element, gsap.core.Tween[]>();
    const ctx = gsap.context(() => {
      for (const rec of recs) {
        for (const el of gsap.utils.toArray<Element>(rec.targets)) {
          const [from, to] = rec.kind === 'from' ? explicit(mobileVars(rec.vars), el) : [rec.from, mobileVars(rec.vars)];
          const tween = gsap.fromTo(el, from, { ease: 'power3.out', ...to, paused: true });
          byElement.set(el, [...(byElement.get(el) ?? []), tween]);
        }
      }
    }, scope);
    if (reducedMotion) {
      byElement.forEach((tweens) => tweens.forEach((t) => t.progress(1)));
      return () => ctx.revert();
    }
    const io = new IntersectionObserver(
      (entries) => {
        // Elements entering together play in document order with a light stagger.
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        entering.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        entering.forEach((el, i) => {
          io.unobserve(el);
          byElement.get(el)?.forEach((t) => t.delay(Math.min(i, 6) * 0.08).restart(true));
        });
      },
      { rootMargin: FLOW_REVEAL_MARGIN },
    );
    byElement.forEach((_, el) => io.observe(el));
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [scopeRef, mode, reducedMotion]);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || mode !== 'deck') return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out', duration: 0.95 } });
      buildRef.current(explicitTimeline(tl), gsap.utils.selector(scope));
      tlRef.current = tl;
    }, scope);
    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, [scopeRef, mode]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || mode !== 'deck') return;
    if (reducedMotion) {
      tl.progress(1).pause();
      return;
    }
    if (active) {
      // The reveal starts once the incoming slide is mostly in view,
      // so content doesn't animate against the moving track.
      tl.delay(0.2).restart(true);
      return;
    }
    // Wait until the slide has left the viewport before hiding its content again.
    const id = window.setTimeout(() => tl.pause(0), 1000);
    return () => window.clearTimeout(id);
  }, [active, revealKey, mode, reducedMotion]);
}

/** The standard reveal: fade + soft rise with a light stagger and a long, gentle settle. */
export function reveal(tl: gsap.core.Timeline, targets: gsap.TweenTarget, position: gsap.Position = 0, vars: gsap.TweenVars = {}) {
  if (Array.isArray(targets) && targets.length === 0) return tl;
  return tl.from(targets, { autoAlpha: 0, y: 22, duration: 1, ease: 'power4.out', stagger: 0.08, ...vars }, position);
}

/** True while the page uses the stacked mobile/tablet layout (timelines are rebuilt when this changes). */
export const isFlowLayout = () => document.documentElement.classList.contains('is-flow');
