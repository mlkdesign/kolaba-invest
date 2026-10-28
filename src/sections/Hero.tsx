import { useRef } from 'react';
import { Slide } from '../components/Slide';
import { Glow } from '../components/Glow';
import { Button } from '../components/Button';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { useContent } from '../content';
import { useEngine } from '../engine/SlideEngine';
import { useSection } from '../engine/SectionContext';
import { slideIndex } from '../data/slides';
import { PLAN_DURATIONS, TOTAL_ROUND } from '../data/budget';
import { useSectionTimeline } from '../hooks/useSectionTimeline';
import { usePointerParallax } from '../hooks/usePointerParallax';
import phoneBusiness from '../assets/phones/hero-business.webp';
import phoneCreator from '../assets/phones/hero-creator.webp';
import './Hero.css';

function HeroContent() {
  const c = useContent().hero;
  const { goTo, mode } = useEngine();
  const nextLabel = useContent().slideTitles.opportunity;
  const { active } = useSection();
  const scene = useRef<HTMLDivElement>(null);

  useSectionTimeline((tl, q) => {
    tl.from(q('.hero__word'), { yPercent: 70, autoAlpha: 0, duration: 0.85, stagger: 0.12 }, 0.1)
      .from(q('.hero__eyebrow'), { autoAlpha: 0, y: 16, duration: 0.6 }, 0)
      .from(q('.hero__after'), { autoAlpha: 0, y: 24, stagger: 0.09 }, 0.45)
      .from(q('.hero__phone'), { autoAlpha: 0, y: 40, scale: 0.985, duration: 1, stagger: 0.14, ease: 'power3.out' }, 0.35)
      .from(q('.hero__badge-in'), { autoAlpha: 0, y: 14, scale: 0.92, duration: 0.9, stagger: 0.12, ease: 'back.out(1.3)' }, 0.95)
      .from(q('.hero__amount'), { autoAlpha: 0, scale: 0.94, transformOrigin: '0% 100%', duration: 0.9, ease: 'power3.out' }, 0.6)
      .from(q('.hero__amount-label, .hero__metric'), { autoAlpha: 0, y: 16, stagger: 0.08 }, 0.8);
  });

  usePointerParallax(scene, {
    enabled: active,
    x: 14,
    y: 8,
    rotate: 3,
    layers: [
      { selector: '.hero__phone--business .hero__px', depth: 0.6, lag: 1.1 },
      { selector: '.hero__phone--creator .hero__px', depth: 1, lag: 0.9 },
      { selector: '.hero__badge--business .hero__px', depth: 1.45, lag: 0.7 },
      { selector: '.hero__badge--creator .hero__px', depth: -1.25, lag: 0.8 },
    ],
  });

  return (
    <div className="hero" ref={scene}>
      <div className="hero__narrative">
        <p className="eyebrow hero__eyebrow">{c.eyebrow}</p>
        <h1 className="hero__headline">
          {c.headline.map((line, i) => (
            <span className="hero__line" key={i}>
              {line.map((word) => (
                <span className="hero__word" key={word}>
                  {word}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero__description hero__after">{c.description}</p>
        <div className="hero__actions hero__after">
          <Button onClick={() => goTo(slideIndex('opportunity'))}>{c.primaryCta}</Button>
        </div>
      </div>

      <div className="hero__phones">
        <div className="hero__phone hero__phone--business">
          <div className="hero__px">
            <img src={phoneBusiness} alt={c.phoneBusinessAlt} width={368} height={507} />
          </div>
        </div>
        <div className="hero__phone hero__phone--creator">
          <div className="hero__px">
            <img src={phoneCreator} alt={c.phoneCreatorAlt} width={306} height={491} />
          </div>
        </div>
        <div className="hero__badge hero__badge--business">
          <div className="hero__px">
            <div className="hero__badge-in">
              <span className="glass-badge glass-badge--blue">{c.badgeBusiness}</span>
            </div>
          </div>
        </div>
        <div className="hero__badge hero__badge--creator">
          <div className="hero__px">
            <div className="hero__badge-in">
              <span className="glass-badge">{c.badgeCreator}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__investment">
        <p className="hero__figure">
          <span className="hero__amount">
            <AnimatedCounter value={TOTAL_ROUND} prefix="$" delay={0.7} duration={1.4} />
          </span>
          <span className="hero__amount-label">{c.investmentLabel}</span>
        </p>
        <ul className="hero__metrics">
          {PLAN_DURATIONS.filter((d) => d.id !== 'total').map((d) => (
            <li className="hero__metric" key={d.id}>
              <span className="hero__metric-value">
                {d.months} {c.months}
              </span>
              <span className="hero__metric-label">{c.metrics[d.id as keyof typeof c.metrics]}</span>
            </li>
          ))}
          <li className="hero__metric">
            <span className="hero__metric-value">{c.platform}</span>
            <span className="hero__metric-label">{c.platformLabel}</span>
          </li>
        </ul>
      </div>
      {mode === 'flow' && (
        <button type="button" className="hero__next" onClick={() => goTo(slideIndex('opportunity'))}>
          <span className="hero__next-arrow" aria-hidden="true">
            ↓
          </span>
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export function Hero() {
  return (
    <Slide id="hero" className="slide-hero" background={<Glow position="top" />}>
      <HeroContent />
    </Slide>
  );
}
