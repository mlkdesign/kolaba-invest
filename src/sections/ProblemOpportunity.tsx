import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { useContent } from '../content';
import { CREATOR_AD_SPEND, SPEND_BAR_MAX_RATIO } from '../data/market';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import disconnectIcon from '../assets/icons/disconnect.svg';
import './ProblemOpportunity.css';

const maxSpend = Math.max(...CREATOR_AD_SPEND.map((d) => d.value));

function Content() {
  const c = useContent().problem;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.intro > *'), 0);
    reveal(tl, q('.problem__relation, .problem__block'), 0.25);
    tl.from(q('.problem__path'), { scaleX: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.1 }, 0.35);
    reveal(tl, q('.spend__title, .spend__meta'), 0.3, { stagger: 0.1 });
    tl.from(q('.spend__bar'), { scaleX: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15 }, 0.45);
    reveal(tl, q('.spend__source, .problem__statement, .problem__note'), 0.9);
  });

  return (
    <>
      <div className="slide__rule" />
      <header className="intro problem__intro">
        <SlideEyebrow />
        <h2 className="display">
          {c.title.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
      </header>

      <div className="problem__grid">
        <div className="problem__left">
          <div className="problem__relation" aria-hidden="true">
            <span>{c.creators}</span>
            <i className="problem__path" />
            <img src={disconnectIcon} alt="" width={13} height={13} />
            <i className="problem__path problem__path--rtl" />
            <span>{c.businesses}</span>
          </div>
          <p className="sr-only">
            {c.creators} — {c.businesses}
          </p>
          <div className="problem__block">
            <h3>{c.creatorProblemTitle}</h3>
            <p>{c.creatorProblemText}</p>
          </div>
          <div className="problem__block">
            <h3>{c.businessProblemTitle}</h3>
            <p className="problem__wide">{c.businessProblemText}</p>
          </div>
        </div>

        <figure className="spend">
          <figcaption className="spend__title">{c.chartTitle}</figcaption>
          <ul className="spend__list">
            {CREATOR_AD_SPEND.map((d, i) => (
              <li key={d.year} className="spend__item">
                <div className="spend__meta">
                  <span className="spend__value">
                    <AnimatedCounter value={d.value} prefix="$" suffix="B" decimals={d.value % 1 ? 1 : 0} delay={0.45 + i * 0.15} />
                  </span>
                  <span className="spend__year">{d.year}</span>
                </div>
                <div
                  className={`spend__bar ${d.highlight ? 'is-highlight' : ''}`}
                  style={{ width: `${(d.value / maxSpend) * SPEND_BAR_MAX_RATIO * 100}%` }}
                />
              </li>
            ))}
          </ul>
          <p className="spend__source">{c.chartSource}</p>
        </figure>
      </div>

      <div className="problem__footer">
        <p className="problem__statement">{c.statement}</p>
        <p className="problem__note">{c.note}</p>
      </div>
    </>
  );
}

export function ProblemOpportunity() {
  return (
    <Slide id="problem">
      <Content />
    </Slide>
  );
}
