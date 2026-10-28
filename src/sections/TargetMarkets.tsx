import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { InteractiveMap } from '../components/InteractiveMap';
import { useContent } from '../content';
import { MARKET_INDICATORS } from '../data/market';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './TargetMarkets.css';

function Content() {
  const c = useContent().markets;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.markets__intro > *, .markets__lead'), 0);
    tl.from(q('.markets__map'), { autoAlpha: 0, y: 24, duration: 1 }, 0.2);
    tl.from(q('.indicator__rule'), { scaleX: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.12 }, 0.35);
    reveal(tl, q('.indicator__label'), 0.5, { stagger: 0.12 });
    reveal(tl, q('.markets__notes > *'), 0.9);
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="markets__head">
        <header className="intro markets__intro">
          <SlideEyebrow />
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </header>
        <p className="markets__lead">{c.lead}</p>
      </div>

      <div className="markets__body">
        <div className="markets__map">
          <InteractiveMap />
        </div>
        <ul className="markets__indicators">
          {MARKET_INDICATORS.map((ind, i) => (
            <li className="indicator" key={ind.id}>
              <span className="indicator__rule" aria-hidden="true" />
              <span className="indicator__value">
                <AnimatedCounter value={ind.value} decimals={ind.decimals} suffix={ind.suffix} delay={0.45 + i * 0.12} />
              </span>
              <span className="indicator__label">{c.indicators[ind.id as keyof typeof c.indicators]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="markets__notes">
        <p className="markets__city">{c.warsawNote}</p>
        <p className="markets__city">{c.baliNote}</p>
        <p className="markets__source">{c.sourceNote}</p>
        <p className="markets__tagline">{c.tagline}</p>
      </div>
    </>
  );
}

export function TargetMarkets() {
  return (
    <Slide id="markets">
      <Content />
    </Slide>
  );
}
