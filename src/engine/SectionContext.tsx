import { createContext, useContext } from 'react';

export type SectionState = {
  index: number;
  /** True while the section is the active slide (deck) or has been revealed (flow). */
  active: boolean;
  /** Increments on every activation, so entrance animations can replay. */
  revealKey: number;
  scopeRef: React.RefObject<HTMLElement>;
};

export const SectionContext = createContext<SectionState>({
  index: 0,
  active: true,
  revealKey: 0,
  scopeRef: { current: null },
});

export const useSection = () => useContext(SectionContext);
