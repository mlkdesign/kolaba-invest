import { SLIDES } from '../data/slides';
import { useContent } from '../content';
import { useSection } from '../engine/SectionContext';

/** "05 / BUSINESS MODEL" — numbered by the slide's current position, so reordering slides stays consistent. */
export function SlideEyebrow() {
  const { index } = useSection();
  const title = useContent().slideTitles[SLIDES[index].id];
  return (
    <p className="eyebrow">
      {String(index).padStart(2, '0')} / {title}
    </p>
  );
}
