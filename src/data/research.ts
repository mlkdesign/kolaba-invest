/**
 * Audience research evidence (slide 07).
 * Add real captures here — no JSX changes needed. Leave arrays empty until
 * actual screenshots exist; the slide then shows the reserved placeholder.
 */
export type ResearchShot = {
  src: string;
  alt: string;
  caption?: string;
};

export type ResearchSource = {
  id: 'meta' | 'google';
  /** META_ADS_SCREENSHOTS / GOOGLE_RESEARCH_SCREENSHOTS */
  shots: ResearchShot[];
  region: string;
  audience: string;
  date: string;
  reach: string;
  takeaway: string;
};

export const RESEARCH_SOURCES: ResearchSource[] = [
  { id: 'meta', shots: [], region: 'TBD', audience: 'TBD', date: 'TBD', reach: 'TBD', takeaway: 'TBD' },
  { id: 'google', shots: [], region: 'TBD', audience: 'TBD', date: 'TBD', reach: 'TBD', takeaway: 'TBD' },
];

/** Funnel values stay "TBD" until real metrics are provided. Never fill with estimates. */
export const RESEARCH_FUNNEL = [
  { id: 'reach', value: 'TBD' },
  { id: 'interest', value: 'TBD' },
  { id: 'activated', value: 'TBD' },
  { id: 'paid', value: 'TBD' },
];
