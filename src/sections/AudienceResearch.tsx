import { useState } from 'react';
import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { ResearchFunnel, ResearchPanel } from '../components/Research';
import { useContent } from '../content';
import { RESEARCH_FUNNEL, RESEARCH_SOURCES } from '../data/research';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import { useEngine } from '../engine/SlideEngine';
import './AudienceResearch.css';

function Content() {
  const c = useContent().research;
  const { mode } = useEngine();
  const tabs = mode === 'flow';
  const [tab, setTab] = useState(RESEARCH_SOURCES[0].id);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.research__intro > *, .research__lead'), 0);
    reveal(tl, q('.research-panel'), 0.25, { y: 28, stagger: 0.15, duration: 1.1 });
    tl.from(q('.funnel__rule'), { scaleX: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.18 }, 0.75);
    reveal(tl, q('.funnel__metric, .funnel__text'), 0.85, { stagger: 0.06 });
    reveal(tl, q('.research__statement'), 1.3);
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="research__head">
        <header className="intro research__intro">
          <SlideEyebrow />
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </header>
        <p className="research__lead">{c.lead}</p>
      </div>
      {/* Mobile: one source at a time behind Meta Ads / Google tabs. */}
      {tabs && (
        <div className="research__tabs" role="tablist" aria-label={c.tabsLabel}>
          {RESEARCH_SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`research-tab-${s.id}`}
              aria-selected={tab === s.id}
              aria-controls={`research-panel-${s.id}`}
              tabIndex={tab === s.id ? 0 : -1}
              className={`research__tab ${tab === s.id ? 'is-active' : ''}`}
              onClick={() => setTab(s.id)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                const next = RESEARCH_SOURCES.find((x) => x.id !== s.id)!.id;
                setTab(next);
                document.getElementById(`research-tab-${next}`)?.focus();
              }}
            >
              {c.sources[s.id].title}
            </button>
          ))}
        </div>
      )}
      <div className="research__panels">
        {RESEARCH_SOURCES.filter((s) => !tabs || s.id === tab).map((s) => (
          <ResearchPanel
            key={s.id}
            source={s}
            id={tabs ? `research-panel-${s.id}` : undefined}
            labelledBy={tabs ? `research-tab-${s.id}` : undefined}
          />
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
