import { describe, expect, it } from 'vitest';
import {
  CONTINGENCY_RESERVE,
  INVESTMENT_CATEGORIES,
  MARKETING_ALLOCATION,
  MARKETING_TOTAL,
  OPERATING_BUDGET,
  TOTAL_ROUND,
  shareOf,
  sum,
} from '../src/data/budget';

describe('budget reconciliation', () => {
  it('roadmap phases + reserve = $95,000', () => {
    expect(OPERATING_BUDGET).toBe(80_830);
    expect(OPERATING_BUDGET + CONTINGENCY_RESERVE).toBe(95_000);
    expect(TOTAL_ROUND).toBe(95_000);
  });

  it('investment categories add up to the round', () => {
    expect(sum(INVESTMENT_CATEGORIES.map((c) => c.amount))).toBe(TOTAL_ROUND);
    expect(INVESTMENT_CATEGORIES.map((c) => shareOf(c.amount, TOTAL_ROUND))).toEqual([60.7, 19.1, 5.3, 14.9]);
  });

  it('go-to-market allocation equals the marketing category', () => {
    expect(MARKETING_TOTAL).toBe(18_100);
    expect(INVESTMENT_CATEGORIES.find((c) => c.id === 'marketing')?.amount).toBe(MARKETING_TOTAL);
    expect(MARKETING_ALLOCATION.map((m) => m.amount)).toEqual([9_000, 5_200, 2_100, 1_800]);
  });
});
