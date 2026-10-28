import { useEffect, useState } from 'react';
import { useSection } from '../engine/SectionContext';
import { useEngine } from '../engine/SlideEngine';

/** Bottom inset of the viewport used for mobile reveals: content animates once it is clearly on screen. */
export const FLOW_REVEAL_MARGIN = '0px 0px -8% 0px';

/**
 * When an element's entrance should play.
 * Deck: with its slide (replays on every visit). Flow (mobile/tablet): once the element
 * itself scrolls into view, so long sections never animate content that is still off-screen.
 */
export function useRevealTrigger(ref: React.RefObject<Element>) {
  const { active, revealKey } = useSection();
  const { mode } = useEngine();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (mode !== 'flow' || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: FLOW_REVEAL_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, seen, ref]);

  if (mode === 'deck') return { active, revealKey, flow: false };
  return { active: seen, revealKey: seen ? 1 : 0, flow: true };
}
