/** Industry context for slide 02 (USD billions). Brief-supplied; see source line on the slide. */
export const CREATOR_AD_SPEND = [
  { year: '2024', value: 29.5, highlight: false },
  { year: '2025E', value: 37, highlight: false },
  { year: '2026F', value: 44, highlight: true },
];
/** In the frame the largest bar fills 538 of 630 px. */
export const SPEND_BAR_MAX_RATIO = 538 / 630;

/** Contextual indicators for slide 06. */
export const MARKET_INDICATORS = [
  { id: 'poland', value: 12.4, decimals: 1, suffix: 'M' },
  { id: 'thailand', value: 20.6, decimals: 1, suffix: 'M' },
  { id: 'ukraine', value: 4.43, decimals: 2, suffix: 'M' },
];

export type RegionId = 'eu' | 'cis' | 'gulf' | 'asia';

/** ISO 3166-1 numeric codes, as used by world-atlas. */
export const MARKET_COUNTRIES: Record<RegionId, string[]> = {
  // Current EU-27 member states
  eu: [
    '040', '056', '100', '191', '196', '203', '208', '233', '246', '250', '276', '300', '348', '372',
    '380', '428', '440', '442', '470', '528', '616', '620', '642', '703', '705', '724', '752',
  ],
  // Marketing focus region, not a statement about CIS membership
  cis: ['804', '643', '398', '112', '268', '498', '051', '688'],
  gulf: ['784'],
  asia: ['764', '360'],
};

export type CityMarker = {
  id: string;
  lon: number;
  lat: number;
  pilot?: boolean;
};

/** Order defines the community connection path drawn on the map. */
export const CITY_MARKERS: CityMarker[] = [
  { id: 'warsaw', lon: 21.0122, lat: 52.2297, pilot: true },
  { id: 'berlin', lon: 13.405, lat: 52.52 },
  { id: 'prague', lon: 14.4378, lat: 50.0755 },
  { id: 'belgrade', lon: 20.4489, lat: 44.7866 },
  { id: 'tbilisi', lon: 44.8271, lat: 41.7151 },
  { id: 'dubai', lon: 55.2708, lat: 25.2048 },
  { id: 'phuket', lon: 98.3923, lat: 7.8804 },
  { id: 'bali', lon: 115.1889, lat: -8.4095, pilot: true },
];

/**
 * Countries left off the Europe–Asia map (Africa, Oceania), matching the Figma
 * "Stylized Europe and Asia" artwork. ISO 3166-1 numeric.
 */
export const MAP_EXCLUDED = new Set([
  '012', '024', '204', '072', '854', '108', '132', '120', '140', '148', '174', '178', '180', '384', '262',
  '818', '226', '232', '748', '231', '266', '270', '288', '324', '624', '404', '426', '430', '434', '450',
  '454', '466', '478', '480', '504', '508', '516', '562', '566', '646', '678', '686', '690', '694', '706',
  '710', '728', '729', '834', '768', '788', '800', '894', '716', '732', '036', '554', '090', '548', '242',
  '540',
]);
