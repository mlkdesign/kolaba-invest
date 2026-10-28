/** Execution roadmap and the $95,000 initial round. All budget figures live here. */
export type RoadmapPhase = {
  id: string;
  months: string;
  budget: number;
};

export const ROADMAP_PHASES: RoadmapPhase[] = [
  { id: 'development', months: 'M1–M4', budget: 37_970 },
  { id: 'activation', months: 'M5–M6', budget: 13_040 },
  { id: 'optimization', months: 'M7–M8', budget: 14_250 },
  { id: 'growth', months: 'M9–M10', budget: 15_570 },
];

export const CONTINGENCY_RESERVE = 14_170;

export type InvestmentCategory = {
  id: 'product' | 'marketing' | 'infrastructure' | 'contingency';
  amount: number;
  color: string;
};

/** Clockwise from 12 o'clock, matching the Figma donut. */
export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  { id: 'product', amount: 57_700, color: '#000000' },
  { id: 'marketing', amount: 18_100, color: '#ff00a6' },
  { id: 'infrastructure', amount: 5_030, color: 'rgba(0, 0, 0, 0.6)' },
  { id: 'contingency', amount: CONTINGENCY_RESERVE, color: '#9000ff' },
];

export const PLAN_DURATIONS = [
  { id: 'development', months: 4 },
  { id: 'operations', months: 6 },
  { id: 'total', months: 10 },
] as const;

/** Go-to-market marketing allocation. Must equal the Marketing & Acquisition category. */
export const MARKETING_ALLOCATION = [
  { id: 'paid', amount: 9_000, color: '#ff00a6' },
  { id: 'growth', amount: 5_200, color: '#000000' },
  { id: 'outreach', amount: 2_100, color: 'rgba(0, 0, 0, 0.6)' },
  { id: 'partnerships', amount: 1_800, color: 'rgba(0, 0, 0, 0.15)' },
] as const;

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export const OPERATING_BUDGET = sum(ROADMAP_PHASES.map((p) => p.budget));
export const TOTAL_ROUND = OPERATING_BUDGET + CONTINGENCY_RESERVE;
export const MARKETING_TOTAL = sum(MARKETING_ALLOCATION.map((m) => m.amount));

/** Share of the total in percent, rounded to one decimal for display. */
export const shareOf = (amount: number, total: number) => Math.round((amount / total) * 1000) / 10;

/** Planned monthly spend after launch (M5–M10): what revenue has to cover for KOLABA to pay for itself. */
export const POST_LAUNCH_MONTHLY_COST =
  sum(ROADMAP_PHASES.filter((p) => p.id !== 'development').map((p) => p.budget)) /
  PLAN_DURATIONS.find((d) => d.id === 'operations')!.months;
