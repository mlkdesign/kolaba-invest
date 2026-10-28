export type NumberFormat = {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Thousands separators (default true). */
  grouping?: boolean;
};

const cache = new Map<string, Intl.NumberFormat>();

function formatter(decimals: number, grouping: boolean) {
  const key = `${decimals}:${grouping}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
    });
    cache.set(key, f);
  }
  return f;
}

export function formatNumber(value: number, opts: NumberFormat = {}) {
  const { prefix = '', suffix = '', decimals = 0, grouping = true } = opts;
  const safe = Number.isFinite(value) ? value : 0;
  // Avoid "-0" during count-downs that cross zero.
  const rounded = Number(safe.toFixed(decimals));
  return `${prefix}${formatter(decimals, grouping).format(Object.is(rounded, -0) ? 0 : rounded)}${suffix}`;
}

export const usd = (value: number) => formatNumber(value, { prefix: '$' });
export const int = (value: number) => formatNumber(value);
