import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { formatNumber, type NumberFormat } from '../lib/format';
import { useSection } from '../engine/SectionContext';
import { useEngine } from '../engine/SlideEngine';

type Props = NumberFormat & {
  value: number;
  /** Entrance delay after the section activates (s). */
  delay?: number;
  /** Entrance duration (s). */
  duration?: number;
  /** Count up from zero when the section activates (default true). */
  countOnReveal?: boolean;
  className?: string;
};

/**
 * Animated number: counts up from 0 on section activation and tweens from the
 * previous value when `value` changes. Writes to the DOM directly (no re-render per frame).
 * A hidden "ghost" with the final value reserves width, so neighbours never shift.
 */
export function AnimatedCounter({
  value,
  delay = 0.15,
  duration = 1.1,
  countOnReveal = true,
  className = '',
  ...format
}: Props) {
  const { active, revealKey } = useSection();
  const { reducedMotion } = useEngine();
  const liveRef = useRef<HTMLSpanElement>(null);
  const state = useRef({ v: value });
  const tween = useRef<gsap.core.Tween | null>(null);
  const formatRef = useRef(format);
  formatRef.current = format;
  const mounted = useRef(false);

  const render = () => {
    if (liveRef.current) liveRef.current.textContent = formatNumber(state.current.v, formatRef.current);
  };

  // Entrance count-up.
  useEffect(() => {
    if (!active || !countOnReveal) return;
    tween.current?.kill();
    if (reducedMotion) {
      state.current.v = value;
      render();
      return;
    }
    state.current.v = 0;
    render();
    tween.current = gsap.to(state.current, { v: value, duration, delay, ease: 'power2.out', onUpdate: render });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey, reducedMotion]);

  // Value changes (calculator): animate from wherever the number currently is.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    tween.current?.kill();
    if (reducedMotion || !active) {
      state.current.v = value;
      render();
      return;
    }
    tween.current = gsap.to(state.current, { v: value, duration: 0.45, ease: 'power2.out', onUpdate: render });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => () => void tween.current?.kill(), []);

  const final = formatNumber(value, format);
  return (
    <span className={`counter ${className}`}>
      <span className="counter__ghost" aria-hidden="true">
        {final}
      </span>
      <span className="counter__live" ref={liveRef} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
