import { useRef } from 'react';
import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { useContent } from '../content';
import { useSection } from '../engine/SectionContext';
import { CREATOR_AD_SPEND } from '../data/market';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import { usePointerParallax } from '../hooks/usePointerParallax';
import phoneCreator from '../assets/phones/product-creator.webp';
import phoneBusiness from '../assets/phones/product-business.webp';
import './Opportunity.css';

/** Industry context shown on this slide: the 2025 estimate and the 2026 forecast. */
const SPEND = CREATOR_AD_SPEND.filter((d) => d.year !== '2024');
const pad = (n: number) => String(n).padStart(2, '0');

function Content() {
  const c = useContent().opportunity;
  const { active } = useSection();
  const scene = useRef<HTMLDivElement>(null);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.opp__intro > *'), 0);
    reveal(tl, q('.opp__problem'), 0.2, { stagger: 0.1 });
    reveal(tl, q('.opp__solution'), 0.4);
    tl.from(q('.opp__phone'), { autoAlpha: 0, y: 36, scale: 0.985, duration: 0.95, stagger: 0.14 }, 0.3);
    tl.from(q('.opp__link-line'), { scaleX: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.1 }, 0.6);
    tl.from(q('.opp__hub'), { autoAlpha: 0, scale: 0.85, duration: 0.7, ease: 'back.out(1.6)' }, 0.75);
    reveal(tl, q('.opp__flow'), 0.9, { stagger: 0.08 });
    tl.from(q('.opp__adv-rule, .opp__stat-rule'), { scaleX: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.07 }, 0.6);
    reveal(tl, q('.opp__adv > :not(.opp__adv-rule), .opp__stat > :not(.opp__stat-rule)'), 0.75, { stagger: 0.04 });
    reveal(tl, q('.opp__context-label, .opp__source'), 1);
  });

  usePointerParallax(scene, {
    enabled: active,
    x: 8,
    y: 6,
    rotate: 2,
    layers: [
      { selector: '.opp__phone--creator .opp__px', depth: 0.9, lag: 1 },
      { selector: '.opp__phone--business .opp__px', depth: 1.1, lag: 0.85 },
    ],
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="opp">
        <div className="opp__left">
          <header className="intro opp__intro">
            <SlideEyebrow />
            <h2 className="display">
              {c.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
          </header>
          <div className="opp__problems">
            <div className="opp__problem">
              <p className="opp__label">{c.creatorsLabel}</p>
              <p className="opp__text">{c.creatorsText}</p>
            </div>
            <div className="opp__problem">
              <p className="opp__label">{c.businessesLabel}</p>
              <p className="opp__text">{c.businessesText}</p>
            </div>
          </div>
          <div className="opp__solution">
            <p className="opp__label opp__label--accent">{c.solutionLabel}</p>
            <p className="opp__solution-text">{c.solutionText}</p>
          </div>
        </div>

        {/* Two sides of the marketplace, connected through KOLABA. */}
        <div className="opp__visual" ref={scene}>
          <figure className="opp__phone opp__phone--creator">
            <div className="opp__px">
              <img src={phoneCreator} alt={c.phoneCreatorAlt} width={200} height={369} loading="lazy" />
            </div>
            <figcaption className="opp__side">{c.creators}</figcaption>
          </figure>
          <div className="opp__link" aria-hidden="true">
            <span className="opp__flow opp__flow--top">{c.creatorFlow} →</span>
            <span className="opp__link-line" />
            <span className="opp__hub">
              kolaba<span className="opp__hub-dot">.</span>
            </span>
            <span className="opp__link-line opp__link-line--rtl" />
            <span className="opp__flow opp__flow--bottom">← {c.businessFlow}</span>
          </div>
          <figure className="opp__phone opp__phone--business">
            <div className="opp__px">
              <img src={phoneBusiness} alt={c.phoneBusinessAlt} width={200} height={369} loading="lazy" />
            </div>
            <figcaption className="opp__side">{c.businesses}</figcaption>
          </figure>
        </div>
      </div>

      <div className="opp__bottom">
        <ol className="opp__advantages">
          {c.advantages.map((a, i) => (
            <li className="opp__adv" key={a.title}>
              <span className="opp__adv-rule" aria-hidden="true" />
              <span className="opp__adv-num">{pad(i + 1)}</span>
              <h3 className="opp__adv-title">{a.title}</h3>
              <p className="opp__adv-text">{a.text}</p>
            </li>
          ))}
        </ol>
        <div className="opp__context">
          <p className="opp__context-label">{c.contextLabel}</p>
          <ul className="opp__stats">
            {SPEND.map((d, i) => (
              <li className={`opp__stat ${d.highlight ? 'is-highlight' : ''}`} key={d.year}>
                <span className="opp__stat-rule" aria-hidden="true" />
                <span className="opp__stat-value">
                  <AnimatedCounter value={d.value} prefix="$" suffix="B" delay={0.7 + i * 0.15} />
                </span>
                <span className="opp__stat-label">{c.spend[d.year]}</span>
              </li>
            ))}
          </ul>
          <p className="opp__source">{c.source}</p>
        </div>
      </div>
    </>
  );
}

export function Opportunity() {
  return (
    <Slide id="opportunity">
      <Content />
    </Slide>
  );
}
