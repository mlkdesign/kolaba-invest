import { SLIDES, SLIDE_COUNT } from '../data/slides';
import { useContent } from '../content';
import { useEngine } from '../engine/SlideEngine';

const pad = (n: number) => String(n).padStart(2, '0');

/** "01 / 12 ——— NEXT: … ↑ ↓" — doubles as the previous/next slide control. */
export function SectionProgress({ index }: { index: number }) {
  const c = useContent();
  const { goTo } = useEngine();
  const id = SLIDES[index].id;
  const nextLabel = c.slides[id];
  const isLast = index === SLIDE_COUNT - 1;

  return (
    <nav className="progress" aria-label={c.meta.slideLabel(index + 1, SLIDE_COUNT)}>
      <p className="progress__count">
        {pad(index + 1)} / {pad(SLIDE_COUNT)}
      </p>
      <div className="progress__line" aria-hidden="true">
        <span className="progress__fill" style={{ transform: `scaleX(${(index + 1) / SLIDE_COUNT})` }} />
      </div>
      <div className="progress__next">
        {nextLabel && (
          <button type="button" className="progress__label" onClick={() => goTo(index + 1)} tabIndex={-1}>
            {c.progressNext} {nextLabel}
          </button>
        )}
        <button
          type="button"
          className="progress__arrow"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label={c.meta.prev}
        >
          ↑
        </button>
        <button
          type="button"
          className="progress__arrow"
          onClick={() => goTo(index + 1)}
          disabled={isLast}
          aria-label={c.meta.next}
        >
          ↓
        </button>
      </div>
    </nav>
  );
}
