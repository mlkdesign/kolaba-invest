import type { ResearchSource } from '../data/research';
import { useContent } from '../content';
import scanIcon from '../assets/icons/scan.svg';

/** One evidence panel. Renders real captures when `source.shots` has entries, otherwise the reserved state. */
export function ResearchPanel({ source }: { source: ResearchSource }) {
  const c = useContent().research;
  const copy = c.sources[source.id];
  const hasShots = source.shots.length > 0;

  return (
    <article className="research-panel" data-slot={source.id === 'meta' ? 'META_ADS_SCREENSHOTS' : 'GOOGLE_RESEARCH_SCREENSHOTS'}>
      <header className="research-panel__head">
        <h3>{copy.title}</h3>
        {!hasShots && <span className="research-panel__status">{c.pending}</span>}
      </header>
      {hasShots ? (
        <div className="research-panel__shots" data-native-scroll="">
          {source.shots.map((shot) => (
            <figure key={shot.src}>
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              {shot.caption && <figcaption>{shot.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <div className="research-panel__placeholder">
          <img src={scanIcon} alt="" width={28} height={28} />
          <p className="research-panel__reserved">{c.reserved}</p>
          <p className="research-panel__desc">{copy.description}</p>
        </div>
      )}
      <div className="research-panel__meta">
        <dl>
          <ResearchMetric label={c.meta.region} value={source.region} />
          <ResearchMetric label={c.meta.audience} value={source.audience} />
          <ResearchMetric label={c.meta.date} value={source.date} />
        </dl>
        <div>
          <dl>
            <ResearchMetric label={c.meta.reach} value={source.reach} />
            <ResearchMetric label={c.meta.takeaway} value={source.takeaway} />
          </dl>
          <p className="research-panel__note">{c.meta.multiple}</p>
        </div>
      </div>
    </article>
  );
}

export function ResearchMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="research-metric">
      <dt>{label}:</dt> <dd>{value}</dd>
    </div>
  );
}

type FunnelStage = { id: string; value: string };

export function ResearchFunnel({ stages }: { stages: FunnelStage[] }) {
  const c = useContent().research.funnel;
  return (
    <ol className="funnel">
      {stages.map((s, i) => {
        const copy = c[s.id as keyof typeof c];
        return (
          <li key={s.id} className={`funnel__stage ${i === stages.length - 1 ? 'is-final' : ''}`}>
            <span className="funnel__rule" aria-hidden="true" />
            <p className="funnel__metric">
              <span>{copy.label}</span>
              <span>{s.value}</span>
            </p>
            <p className="funnel__text">{copy.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
