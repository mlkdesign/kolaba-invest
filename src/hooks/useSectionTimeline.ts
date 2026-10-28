import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useEngine } from '../engine/SlideEngine';
import { useSection } from '../engine/SectionContext';

type Builder = (tl: gsap.core.Timeline, q: (selector: string) => Element[]) => void;

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

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.75 } });
      buildRef.current(tl, gsap.utils.selector(scope));
      tlRef.current = tl;
    }, scope);
    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, [scopeRef]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (reducedMotion) {
      tl.progress(1).pause();
      return;
    }
    if (active) {
      tl.restart(true);
      return;
    }
    if (mode === 'deck') {
      // Wait until the slide has left the viewport before hiding its content again.
      const id = window.setTimeout(() => tl.pause(0), 1000);
      return () => window.clearTimeout(id);
    }
  }, [active, revealKey, mode, reducedMotion]);
}

/** The standard reveal: fade + rise with a light stagger. */
export function reveal(tl: gsap.core.Timeline, targets: gsap.TweenTarget, position: gsap.Position = 0, vars: gsap.TweenVars = {}) {
  if (Array.isArray(targets) && targets.length === 0) return tl;
  return tl.from(targets, { autoAlpha: 0, y: 28, duration: 0.75, stagger: 0.09, ...vars }, position);
}
