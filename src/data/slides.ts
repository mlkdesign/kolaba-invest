export type SlideTheme = 'dark' | 'light';
export type NavGroup = 'opportunity' | 'market' | 'businessModel' | 'financials' | 'investment' | 'founder';

/** Investor Proposal — seven sections, in order. */
export const SLIDES = [
  { id: 'hero', theme: 'dark' },
  { id: 'opportunity', theme: 'light', nav: 'opportunity' },
  { id: 'market', theme: 'light', nav: 'market' },
  { id: 'business', theme: 'dark', nav: 'businessModel' },
  { id: 'financials', theme: 'dark', nav: 'financials' },
  { id: 'investment', theme: 'light', nav: 'investment' },
  { id: 'founder', theme: 'dark', nav: 'founder' },
] as const satisfies ReadonlyArray<{ id: string; theme: SlideTheme; nav?: NavGroup }>;

export type SlideId = (typeof SLIDES)[number]['id'];
export const SLIDE_COUNT = SLIDES.length;
export const slideIndex = (id: SlideId) => SLIDES.findIndex((s) => s.id === id);

/** Header anchors -> target slide. */
export const NAV_TARGETS: { group: NavGroup; slide: SlideId }[] = [
  { group: 'opportunity', slide: 'opportunity' },
  { group: 'market', slide: 'market' },
  { group: 'businessModel', slide: 'business' },
  { group: 'financials', slide: 'financials' },
  { group: 'investment', slide: 'investment' },
  { group: 'founder', slide: 'founder' },
];

/**
 * Sections of the former 12-slide deck that are no longer part of the Investor Proposal.
 * Their components stay in `src/sections/` for the future public Product Overview page;
 * they are not rendered anywhere until that page is assembled.
 */
export const PRODUCT_SECTIONS = {
  problem: { theme: 'light' },
  product: { theme: 'dark' },
  demo: { theme: 'dark' },
  advantage: { theme: 'dark' },
  markets: { theme: 'light' },
  research: { theme: 'light' },
  gtm: { theme: 'light' },
} as const satisfies Record<string, { theme: SlideTheme }>;

export type ProductSectionId = keyof typeof PRODUCT_SECTIONS;

/** Anchors from the published 12-slide deck, so links that were already shared keep working. */
export const LEGACY_ANCHORS: Record<string, SlideId> = {
  problem: 'opportunity',
  product: 'opportunity',
  demo: 'opportunity',
  advantage: 'opportunity',
  markets: 'market',
  research: 'market',
  gtm: 'business',
  calculator: 'financials',
  roadmap: 'investment',
};

/** Slide index for a URL hash (`#financials`, or a legacy `#calculator`); -1 when unknown. */
export function slideIndexForHash(hash: string) {
  const id = hash.replace('#', '');
  const target = (LEGACY_ANCHORS[id] ?? id) as SlideId;
  return SLIDES.findIndex((s) => s.id === target);
}
