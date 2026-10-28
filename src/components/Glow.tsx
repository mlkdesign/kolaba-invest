import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import glow1 from '../assets/glow/glow-1.svg';
import glow2 from '../assets/glow/glow-2.svg';
import glow3 from '../assets/glow/glow-3.svg';
import { useSection } from '../engine/SectionContext';
import { useEngine } from '../engine/SlideEngine';

type Props = {
  /** 'top' mirrors the frame vertically (hero); 'bottom' sits at the bottom edge. */
  position: 'top' | 'bottom';
  /** Extra offset below the bottom edge, in Figma px (slide 12 uses 122). */
  sink?: number;
  className?: string;
};

/**
 * KOLABA brand glow. The three pre-blurred layers come straight from Figma and keep their
 * frame geometry; only transform/opacity are animated (no per-frame blur), and the loop
 * runs only while the slide is active.
 */
export function Glow({ position, sink = 0, className = '' }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const { active } = useSection();
  const { reducedMotion } = useEngine();
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!root.current || reducedMotion) return;
    const layers = root.current.querySelectorAll<HTMLElement>('.glow__drift');
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ paused: true });
      // Yoyo sine loops never snap back to a start frame, so the motion is seamless.
      const cfg = [
        { x: -48, y: 14, scale: 1.05, rotation: 3, opacity: 0.85, duration: 6.5 },
        { x: 56, y: -12, scale: 1.06, rotation: -3, opacity: 1, duration: 7.5 },
        { x: 36, y: 8, scale: 0.96, rotation: 1.5, opacity: 0.8, duration: 5.5 },
      ];
      layers.forEach((layer, i) => {
        const c = cfg[i % cfg.length];
        t.to(layer, { ...c, ease: 'sine.inOut', repeat: -1, yoyo: true }, 0);
      });
      tl.current = t;
    }, root);
    return () => {
      ctx.revert();
      tl.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!tl.current) return;
    if (active) tl.current.play();
    else tl.current.pause();
  }, [active, reducedMotion]);

  return (
    <div
      ref={root}
      className={`glow glow--${position} ${className}`}
      style={{ '--glow-sink': sink } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="glow__frame">
        <div className="glow__layer glow__layer--1">
          <div className="glow__drift">
            <div className="glow__shape">
              <div className="glow__img">
                <img src={glow1} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="glow__layer glow__layer--2">
          <div className="glow__drift">
            <div className="glow__shape">
              <div className="glow__img">
                <img src={glow2} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="glow__layer glow__layer--3">
          <div className="glow__drift">
            <div className="glow__shape">
              <div className="glow__img">
                <img src={glow3} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
