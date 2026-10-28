import { useState } from 'react';
import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { InteractiveMap } from '../components/InteractiveMap';
import { ImageViewer } from '../components/ImageViewer';
import { useContent } from '../content';
import { RESEARCH_SOURCES, type ResearchSource } from '../data/research';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import scanIcon from '../assets/icons/scan.svg';
import './TargetMarkets.css';
import './MarketValidation.css';

/** Meta / Google evidence card. Opens the captures full screen once real screenshots are added in `data/research.ts`. */
function ResearchCard({ source }: { source: ResearchSource }) {
  const c = useContent();
  const copy = c.market.sources[source.id];
  const [viewing, setViewing] = useState<number | null>(null);
  const cover = source.shots[0];

  return (
    <article className="mv-card" data-slot={source.id === 'meta' ? 'META_ADS_SCREENSHOTS' : 'GOOGLE_RESEARCH_SCREENSHOTS'}>
      {cover ? (
        <button
          type="button"
          className="mv-card__shot"
          onClick={() => setViewing(0)}
          aria-label={`${c.research.viewer.open}: ${cover.alt}`}
        >
          <img src={cover.src} alt={cover.alt} loading="lazy" />
          {source.shots.length > 1 && <span className="mv-card__count">+{source.shots.length - 1}</span>}
        </button>
      ) : (
        <div className="mv-card__placeholder" aria-hidden="true">
          <img src={scanIcon} alt="" width={22} height={22} />
        </div>
      )}
      <div className="mv-card__body">
        <h3 className="mv-card__title">{copy.title}</h3>
        <p className="mv-card__text">{copy.text}</p>
        {!cover && <p className="mv-card__status">{c.market.inProgress}</p>}
      </div>
      {cover && <ImageViewer images={source.shots} index={viewing} onIndexChange={setViewing} labels={c.research.viewer} />}
    </article>
  );
}

function Content() {
  const c = useContent().market;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.mv__intro > *'), 0);
    reveal(tl, q('.mv__lead, .mv__geo > *'), 0.15, { stagger: 0.07 });
    tl.from(q('.mv__map'), { autoAlpha: 0, y: 24, duration: 1 }, 0.25);
    reveal(tl, q('.mv__label, .mv-card'), 0.4, { stagger: 0.1 });
    tl.from(q('.mv__step-rule'), { scaleX: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.12 }, 0.8);
    reveal(tl, q('.mv__step-name'), 0.9, { stagger: 0.08 });
    reveal(tl, q('.mv__message'), 1.2);
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="mv__head">
        <header className="intro mv__intro">
          <SlideEyebrow />
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </header>
        <div className="mv__aside">
          <p className="mv__lead">{c.lead}</p>
          <dl className="mv__geo">
            <div>
              <dt className="mv__label">{c.pilotLabel}</dt>
              <dd className="mv__pilots">
                {c.pilots.map((p) => (
                  <span className="mv__pilot" key={p}>
                    {p}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="mv__label">{c.expansionLabel}</dt>
              <dd className="mv__expansion">{c.expansion}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mv__body">
        <div className="mv__map markets__map">
          <InteractiveMap />
        </div>
        <section className="mv__validation" aria-labelledby="validation-title">
          <h3 className="mv__label" id="validation-title">
            {c.validationLabel}
          </h3>
          <div className="mv__cards">
            {RESEARCH_SOURCES.map((s) => (
              <ResearchCard key={s.id} source={s} />
            ))}
          </div>
          <p className="mv__label">{c.funnelLabel}</p>
          <ol className="mv__funnel">
            {c.funnel.map((step, i) => (
              <li className={`mv__step ${i === c.funnel.length - 1 ? 'is-final' : ''}`} key={step}>
                <span className="mv__step-rule" aria-hidden="true" />
                <span className="mv__step-name">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mv__message">{c.message}</p>
        </section>
      </div>
    </>
  );
}

export function MarketValidation() {
  return (
    <Slide id="market">
      <Content />
    </Slide>
  );
}
