import { useEffect } from 'react';
import gsap from 'gsap';
import { FINE_POINTER_QUERY, useMediaQuery } from './useMediaQuery';
import { useEngine } from '../engine/SlideEngine';

export type ParallaxLayer = {
  selector: string;
  /** Depth multiplier; negative values move against the pointer. */
  depth: number;
  /** Seconds of inertia for this layer. */
  lag?: number;
};

type Options = {
  layers: ParallaxLayer[];
  /** Max translation at depth 1 (px in design units, scaled by --u). */
  x: number;
  y: number;
  /** Max rotation at depth 1 (deg). */
  rotate?: number;
  enabled: boolean;
};

/**
 * One pointer listener per scene drives every layer through gsap.quickTo
 * (rAF-batched, inertial). Disabled for touch, reduced motion, and inactive slides.
 */
export function usePointerParallax(scope: React.RefObject<HTMLElement>, { layers, x, y, rotate = 0, enabled }: Options) {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const { reducedMotion } = useEngine();
  const on = enabled && finePointer && !reducedMotion;

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const targets = layers
      .map((l) => ({ ...l, nodes: Array.from(el.querySelectorAll<HTMLElement>(l.selector)) }))
      .filter((l) => l.nodes.length);

    const movers = targets.map((l) => {
      const dur = l.lag ?? 0.9;
      return {
        depth: l.depth,
        x: gsap.quickTo(l.nodes, 'x', { duration: dur, ease: 'power3.out' }),
        y: gsap.quickTo(l.nodes, 'y', { duration: dur, ease: 'power3.out' }),
        ry: gsap.quickTo(l.nodes, 'rotationY', { duration: dur, ease: 'power3.out' }),
        rx: gsap.quickTo(l.nodes, 'rotationX', { duration: dur, ease: 'power3.out' }),
      };
    });

    // Mirrors the CSS --u unit (custom properties are not resolved by getComputedStyle).
    const scale = () => Math.min(1.5, Math.max(0.6, Math.min(window.innerWidth / 1440, window.innerHeight / 870)));
    const apply = (nx: number, ny: number) => {
      const u = scale();
      for (const m of movers) {
        m.x(nx * x * u * m.depth);
        m.y(ny * y * u * m.depth);
        if (rotate) {
          m.ry(nx * rotate * m.depth);
          m.rx(-ny * rotate * 0.6 * m.depth);
        }
      }
    };

    if (!on) {
      apply(0, 0);
      return;
    }

    gsap.set(targets.flatMap((t) => t.nodes), { transformPerspective: 1000 });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      apply(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
    };
    const onLeave = () => apply(0, 0);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      apply(0, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, on, x, y, rotate]);
}
