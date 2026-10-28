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
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out', duration: 0.95 } });
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
      // In deck mode the reveal starts once the incoming slide is mostly in view,
      // so content doesn't animate against the moving track.
      tl.delay(mode === 'deck' ? 0.2 : 0).restart(true);
      return;
    }
    if (mode === 'deck') {
      // Wait until the slide has left the viewport before hiding its content again.
      const id = window.setTimeout(() => tl.pause(0), 1000);
      return () => window.clearTimeout(id);
    }
  }, [active, revealKey, mode, reducedMotion]);
}

/** The standard reveal: fade + soft rise with a light stagger and a long, gentle settle. */
export function reveal(tl: gsap.core.Timeline, targets: gsap.TweenTarget, position: gsap.Position = 0, vars: gsap.TweenVars = {}) {
  if (Array.isArray(targets) && targets.length === 0) return tl;
  return tl.from(targets, { autoAlpha: 0, y: 22, duration: 1, ease: 'power4.out', stagger: 0.08, ...vars }, position);
}
