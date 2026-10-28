import { PRICING } from '../data/pricing';
import { INPUT_LIMITS, type InputKey, type ScenarioInputs } from '../data/projections';

export type ScenarioResult = {
  paidCreators: number;
  paidBusinesses: number;
  creatorMonthlyEquivalent: number;
  grossMrr: number;
  appStoreProceeds: number;
  annualizedRunRate: number;
  payingSubscribers: number;
};

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

export function clampInput(key: InputKey, value: number): number {
  const { min, max } = INPUT_LIMITS[key];
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sanitizeInputs(inputs: ScenarioInputs): ScenarioInputs {
  return {
    creatorProfiles: clampInput('creatorProfiles', inputs.creatorProfiles),
    businessProfiles: clampInput('businessProfiles', inputs.businessProfiles),
    creatorConversion: clampInput('creatorConversion', inputs.creatorConversion),
    businessConversion: clampInput('businessConversion', inputs.businessConversion),
    annualShare: clampInput('annualShare', inputs.annualShare),
  };
}

/**
 * Revenue model. Values keep full precision; money is rounded only for display.
 * Annualized run rate is MRR × 12 — not realized annual revenue.
 */
export function calculateScenario(raw: ScenarioInputs): ScenarioResult {
  const i = sanitizeInputs(raw);
  const { creatorPro, businessPro, platformFeeRate } = PRICING;

  const paidCreators = Math.round((i.creatorProfiles * i.creatorConversion) / 100);
  const paidBusinesses = Math.round((i.businessProfiles * i.businessConversion) / 100);
  const annual = i.annualShare / 100;
  const creatorMonthlyEquivalent = creatorPro.monthly * (1 - annual) + creatorPro.annualMonthlyEquivalent * annual;

  const grossMrr = finite(paidCreators * creatorMonthlyEquivalent + paidBusinesses * businessPro.monthly);

  return {
    paidCreators,
    paidBusinesses,
    creatorMonthlyEquivalent,
    grossMrr: Math.max(0, grossMrr),
    appStoreProceeds: Math.max(0, finite(grossMrr * (1 - platformFeeRate))),
    annualizedRunRate: Math.max(0, finite(grossMrr * 12)),
    payingSubscribers: paidCreators + paidBusinesses,
  };
}
