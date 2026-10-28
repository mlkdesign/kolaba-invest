/**
 * Single source of truth for subscription prices.
 * Slide 08 (Business Model) and slide 10 (Revenue Calculator) both read from here.
 */
export const PRICING = {
  creatorPro: {
    monthly: 9.99,
    /** Annual plan billed once per year. */
    annualTotal: 95.88,
    /** Monthly equivalent of the annual plan (95.88 / 12). Used by the revenue model. */
    annualMonthlyEquivalent: 7.99,
    trialDays: 14,
  },
  businessPro: {
    /** Agreed financial-model price. The Figma frame still shows $5.99 — superseded by this value. */
    monthly: 4.99,
    /**
     * Annual pricing shown in the Figma frame. Awaiting final approval:
     * displayed on slide 08 only and NOT used in any projection.
     */
    annual: {
      monthlyEquivalent: 3.99,
      total: 47.88,
      status: 'pending-approval' as const,
    },
    trialDays: 14,
  },
  /** Illustrative App Store / platform fee used by the calculator. */
  platformFeeRate: 0.15,
} as const;

export type PlanId = 'creatorPro' | 'businessPro';
export type BillingCycle = 'yearly' | 'monthly';
