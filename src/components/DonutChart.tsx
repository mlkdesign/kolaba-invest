import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { INVESTMENT_CATEGORIES, TOTAL_ROUND, type InvestmentCategory } from '../data/budget';
import { useRevealTrigger } from '../hooks/useRevealTrigger';
import { useEngine } from '../engine/SlideEngine';
import { AnimatedCounter } from './AnimatedCounter';
import productSvg from '../assets/images/donut-product.svg?raw';
import marketingSvg from '../assets/images/donut-marketing.svg?raw';
import infraSvg from '../assets/images/donut-infra.svg?raw';
import contingencySvg from '../assets/images/donut-contingency.svg?raw';

/** Segment artwork exported from Figma, positioned with the frame's insets (% of the 210px box). */
const SEGMENTS: Record<InvestmentCategory['id'], { svg: string; inset: string }> = {
  product: { svg: productSvg, inset: '0% 0% 0% 20.34%' },
  marketing: { svg: marketingSvg, inset: '36.38% 75.2% 12.12% 0%' },
  infrastructure: { svg: infraSvg, inset: '21.95% 82.38% 62.13% 3%' },
  contingency: { svg: contingencySvg, inset: '0.11% 50.43% 73.93% 10.85%' },
};

/** Mid-angle of each segment (radians, clockwise from 12 o'clock), used for hover offsets and popups. */
export const SEGMENT_ANGLES = (() => {
  let acc = 0;
  const out = {} as Record<InvestmentCategory['id'], number>;
  for (const cat of INVESTMENT_CATEGORIES) {
    const span = cat.amount / TOTAL_ROUND;
    out[cat.id] = (acc + span / 2) * Math.PI * 2;
    acc += span;
  }
  return out;
})();

const reducedMotionAtStart = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = {
  active: InvestmentCategory['id'] | null;
  onHover: (id: InvestmentCategory['id'] | null, source: 'pointer' | 'tap') => void;
  label: string;
  caption: string;
  rootRef: React.RefObject<HTMLDivElement>;
};

export function DonutChart({ active, onHover, label, caption, rootRef }: Props) {
  const ring = useRef<HTMLDivElement>(null);
  const [sweeping, setSweeping] = useState(!reducedMotionAtStart());
  const { active: sectionActive, revealKey, flow } = useRevealTrigger(ring);
  const { reducedMotion, mode } = useEngine();

  // Clockwise fill: a conic mask sweeps over the exact Figma segment shapes.
  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    if (reducedMotion) {
      setSweeping(false);
      return;
    }
    if (!sectionActive) {
      if (mode === 'deck') {
        const id = window.setTimeout(() => {
          setSweeping(true);
          el.style.setProperty('--sweep', '0deg');
        }, 1000);
        return () => window.clearTimeout(id);
      }
      return;
    }
    setSweeping(true);
    const tween = gsap.fromTo(
      el,
      { '--sweep': '0deg' },
      {
        '--sweep': '360deg',
        duration: 1.3,
        delay: flow ? 0.1 : 0.45,
        ease: 'power2.inOut',
        onComplete: () => setSweeping(false),
      },
    );
    return () => void tween.kill();
  }, [sectionActive, revealKey, reducedMotion, mode]);

  const segmentFrom = (target: EventTarget) => {
    const el = (target as Element).closest?.('[data-segment]') as HTMLElement | null;
    return (el?.dataset.segment as InvestmentCategory['id'] | undefined) ?? null;
  };

  return (
    <div className="donut" ref={rootRef} role="img" aria-label={label}>
      <div
        className={`donut__ring ${sweeping ? 'is-sweeping' : ''} ${active ? 'has-active' : ''}`}
        ref={ring}
        onPointerOver={(e) => {
          if (e.pointerType !== 'mouse') return;
          const id = segmentFrom(e.target);
          if (id) onHover(id, 'pointer');
        }}
        onPointerOut={(e) => {
          if (e.pointerType !== 'mouse') return;
          const from = segmentFrom(e.target);
          const to = e.relatedTarget ? segmentFrom(e.relatedTarget) : null;
          if (from && !to) onHover(null, 'pointer');
        }}
        onClick={(e) => {
          const id = segmentFrom(e.target);
          if (id) onHover(id, 'tap');
        }}
      >
        {INVESTMENT_CATEGORIES.map((cat) => {
          const a = SEGMENT_ANGLES[cat.id];
          return (
            <div
              key={cat.id}
              className={`donut__segment ${active === cat.id ? 'is-active' : ''}`}
              data-segment={cat.id}
              style={
                {
                  inset: SEGMENTS[cat.id].inset,
                  '--dx': Math.sin(a).toFixed(3),
                  '--dy': (-Math.cos(a)).toFixed(3),
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{ __html: SEGMENTS[cat.id].svg }}
            />
          );
        })}
      </div>
      <p className="donut__total">
        <AnimatedCounter value={TOTAL_ROUND / 1000} prefix="$" suffix="K" delay={0.5} duration={1.3} />
      </p>
      <p className="donut__caption">{caption}</p>
    </div>
  );
}
