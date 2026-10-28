export type SlideTheme = 'dark' | 'light';
export type NavGroup = 'product' | 'market' | 'businessModel' | 'roadmap' | 'founder';

export const SLIDES = [
  { id: 'hero', theme: 'dark' },
  { id: 'problem', theme: 'light' },
  { id: 'product', theme: 'dark', nav: 'product' },
  { id: 'demo', theme: 'dark', nav: 'product' },
  { id: 'advantage', theme: 'dark', nav: 'product' },
  { id: 'markets', theme: 'light', nav: 'market' },
  { id: 'research', theme: 'light', nav: 'market' },
  { id: 'business', theme: 'dark', nav: 'businessModel' },
  { id: 'gtm', theme: 'light', nav: 'businessModel' },
  { id: 'calculator', theme: 'dark', nav: 'businessModel' },
  { id: 'roadmap', theme: 'light', nav: 'roadmap' },
  { id: 'founder', theme: 'dark', nav: 'founder' },
] as const satisfies ReadonlyArray<{ id: string; theme: SlideTheme; nav?: NavGroup }>;

export type SlideId = (typeof SLIDES)[number]['id'];
export const SLIDE_COUNT = SLIDES.length;
export const slideIndex = (id: SlideId) => SLIDES.findIndex((s) => s.id === id);

/** Header anchors -> target slide. */
export const NAV_TARGETS: { group: NavGroup; slide: SlideId }[] = [
  { group: 'product', slide: 'product' },
  { group: 'market', slide: 'markets' },
  { group: 'businessModel', slide: 'business' },
  { group: 'roadmap', slide: 'roadmap' },
  { group: 'founder', slide: 'founder' },
];
