import { describe, expect, it } from 'vitest';
import { BREAK_EVEN_MRR, calculateScenario, clampInput } from '../src/lib/revenue';
import { POST_LAUNCH_MONTHLY_COST, TOTAL_ROUND } from '../src/data/budget';
import { PRESETS } from '../src/data/projections';
import { usd } from '../src/lib/format';

describe('revenue model', () => {
  it('matches the agreed base case', () => {
    const r = calculateScenario(PRESETS.base);
    expect(r.paidCreators).toBe(300);
    expect(r.paidBusinesses).toBe(48);
    expect(r.grossMrr).toBeCloseTo(3056.52, 6);
    expect(usd(r.grossMrr)).toBe('$3,057');
    expect(r.appStoreProceeds).toBeCloseTo(2598.042, 6);
    expect(usd(r.appStoreProceeds)).toBe('$2,598');
    expect(r.annualizedRunRate).toBeCloseTo(36678.24, 6);
    expect(r.payingSubscribers).toBe(348);
  });

  it('computes the conservative and upside scenarios shown on the slide', () => {
    expect(usd(calculateScenario(PRESETS.conservative).grossMrr)).toBe('$764');
    const up = calculateScenario(PRESETS.upside);
    expect(usd(up.grossMrr)).toBe('$8,696');
    expect(usd(up.appStoreProceeds)).toBe('$7,392');
    expect(usd(up.annualizedRunRate)).toBe('$104,352');
    expect(up.payingSubscribers).toBe(1002);
  });

  it('derives break-even from the post-launch budget', () => {
    // M5–M10 spend: 13,040 + 14,250 + 15,570 = 42,860 over 6 months.
    expect(POST_LAUNCH_MONTHLY_COST).toBeCloseTo(7143.33, 2);
    expect(usd(BREAK_EVEN_MRR)).toBe('$8,404');
    expect(calculateScenario(PRESETS.upside).costCoverage).toBeCloseTo(1.035, 3);
    expect(calculateScenario(PRESETS.base).costCoverage).toBeCloseTo(0.364, 3);
    // The upside annual run rate exceeds the whole round.
    expect(calculateScenario(PRESETS.upside).annualizedRunRate).toBeGreaterThan(TOTAL_ROUND);
  });

  it('returns zeros when there are no users', () => {
    const r = calculateScenario({ ...PRESETS.base, creatorProfiles: 0, businessProfiles: 0 });
    expect(r).toMatchObject({ grossMrr: 0, appStoreProceeds: 0, annualizedRunRate: 0, payingSubscribers: 0 });
  });

  it('never produces NaN, Infinity or negative values', () => {
    const r = calculateScenario({
      creatorProfiles: Number.NaN,
      businessProfiles: -50,
      creatorConversion: Infinity,
      businessConversion: 250,
      annualShare: -10,
    });
    for (const v of Object.values(r)) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('clamps inputs to their ranges', () => {
    expect(clampInput('creatorProfiles', 90_000)).toBe(50_000);
    expect(clampInput('businessProfiles', -1)).toBe(0);
    expect(clampInput('annualShare', 140)).toBe(100);
  });
});
