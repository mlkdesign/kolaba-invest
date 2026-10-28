import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { SLIDES, SLIDE_COUNT, type SlideId } from '../data/slides';
import { useEngine } from '../engine/SlideEngine';
import { SectionContext } from '../engine/SectionContext';
import { useContent } from '../content';
import { SectionProgress } from './SectionProgress';

type Props = {
  id: SlideId;
  className?: string;
  /** Full-bleed decorative layers rendered behind the content. */
  background?: ReactNode;
  showProgress?: boolean;
  children: ReactNode;
};

export function Slide({ id, className = '', background, showProgress = true, children }: Props) {
  const { registerSection, mode, activeIndex, visible } = useEngine();
  const c = useContent();
  const index = SLIDES.findIndex((s) => s.id === id);
  const theme = SLIDES[index].theme;
  const ref = useRef<HTMLElement>(null);

  const active = mode === 'deck' ? activeIndex === index : visible.has(index);
  const [revealKey, setRevealKey] = useState(0);
  useEffect(() => {
    if (active) setRevealKey((k) => k + 1);
  }, [active]);

  useEffect(() => {
    registerSection(index, ref.current);
    return () => registerSection(index, null);
  }, [index, registerSection]);

  const ctx = useMemo(() => ({ index, active, revealKey, scopeRef: ref }), [index, active, revealKey]);

  return (
    <SectionContext.Provider value={ctx}>
      <section
        ref={ref}
        id={id}
        data-index={index}
        data-theme={theme}
        className={`slide slide--${theme} ${className}`}
        aria-roledescription="slide"
        aria-label={`${c.sectionNames[id]} — ${c.meta.slideLabel(index + 1, SLIDE_COUNT)}`}
      >
        {background && (
          <div className="slide__bg" aria-hidden="true">
            {background}
          </div>
        )}
        <div className="slide__inner">
          {children}
          {showProgress && <SectionProgress index={index} />}
        </div>
      </section>
    </SectionContext.Provider>
  );
}
