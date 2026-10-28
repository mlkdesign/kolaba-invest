import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Button } from './Button';
import { useEngine } from '../engine/SlideEngine';

type Step = { title: string; text: string };

type Props = {
  steps: Step[];
  labels: { prev: string; next: string; group: string };
  /** Notifies a future prototype embed which step is shown. */
  onStepChange?: (index: number) => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Six-step text walkthrough (Figma "Text Slider / 01–06"). Buttons disable at the ends. */
export function DemoExplanationSlider({ steps, labels, onStepChange }: Props) {
  const [index, setIndex] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const shownIndex = useRef(0);
  const { reducedMotion } = useEngine();

  const go = (to: number) => {
    if (to < 0 || to >= steps.length || to === index) return;
    dir.current = to > index ? 1 : -1;
    setIndex(to);
    onStepChange?.(to);
  };

  useLayoutEffect(() => {
    // Animate only real step changes (not mount / StrictMode re-runs, which would fight the section reveal).
    if (shownIndex.current === index) return;
    shownIndex.current = index;
    if (reducedMotion || !body.current) return;
    const tween = gsap.fromTo(
      body.current.children,
      { autoAlpha: 0, y: 18 * dir.current },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', overwrite: true },
    );
    return () => void tween.kill();
  }, [index, reducedMotion]);

  // Horizontal swipe on touch screens; vertical page scrolling stays native (touch-action: pan-y).
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipe.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    go(index + (dx < 0 ? 1 : -1));
  };

  const step = steps[index];
  return (
    <div
      className="demo-slider"
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.group}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="demo-slider__body" ref={body} aria-live="polite">
        <p className="demo-slider__count">
          <span>{pad(index + 1)}</span> <span className="demo-slider__total">/ {pad(steps.length)}</span>
        </p>
        <h3 className="demo-slider__title">{step.title}</h3>
        <p className="demo-slider__text">{step.text}</p>
      </div>
      <div className="demo-slider__progress" role="tablist" aria-label={labels.group}>
        {steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${pad(i + 1)} — ${s.title}`}
            className={`demo-slider__step ${i === index ? 'is-active' : ''}`}
            onClick={() => go(i)}
            tabIndex={i === index ? 0 : -1}
          />
        ))}
      </div>
      <div className="demo-slider__controls">
        <Button variant="outline" icon="arrow-left" className="demo-slider__btn" onClick={() => go(index - 1)} disabled={index === 0}>
          {labels.prev}
        </Button>
        <Button className="demo-slider__btn" onClick={() => go(index + 1)} disabled={index === steps.length - 1}>
          {labels.next}
        </Button>
      </div>
    </div>
  );
}
