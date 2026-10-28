import { Slide } from '../components/Slide';
import { ResearchFunnel, ResearchPanel } from '../components/Research';
import { useContent } from '../content';
import { RESEARCH_FUNNEL, RESEARCH_SOURCES } from '../data/research';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './AudienceResearch.css';

function Content() {
  const c = useContent().research;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.research__intro > *, .research__lead'), 0);
    reveal(tl, q('.research-panel'), 0.25, { y: 36, stagger: 0.15, duration: 0.85 });
    tl.from(q('.funnel__rule'), { scaleX: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.18 }, 0.75);
    reveal(tl, q('.funnel__metric, .funnel__text'), 0.85, { stagger: 0.06 });
    reveal(tl, q('.research__statement'), 1.3);
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="research__head">
        <header className="intro research__intro">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </header>
        <p className="research__lead">{c.lead}</p>
      </div>
      <div className="research__panels">
        {RESEARCH_SOURCES.map((s) => (
          <ResearchPanel key={s.id} source={s} />
        ))}
      </div>
      <ResearchFunnel stages={RESEARCH_FUNNEL} />
      <p className="research__statement">{c.statement}</p>
    </>
  );
}

export function AudienceResearch() {
  return (
    <Slide id="research">
      <Content />
    </Slide>
  );
}
