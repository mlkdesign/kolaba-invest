import { describe, expect, it } from 'vitest';
import { WheelIntent } from '../src/engine/wheelIntent';

/** Simulates the engine: feed events, start/finish transitions like the deck does. */
function run(events: { t: number; d: number }[], transitionMs = 900) {
  const w = new WheelIntent();
  const moves: number[] = [];
  let endAt = Infinity;
  for (const e of events) {
    if (e.t >= endAt) {
      w.end();
      endAt = Infinity;
    }
    const dir = w.feed(e.d, e.t);
    if (dir) {
      moves.push(dir);
      w.begin(e.t);
      endAt = e.t + transitionMs;
    }
  }
  return moves;
}

/** A trackpad flick: strong start, then a long decaying inertia tail every 16ms. */
function flick(start: number, sign = 1, ms = 1800) {
  const out: { t: number; d: number }[] = [];
  for (let t = 0; t < ms; t += 16) out.push({ t: start + t, d: sign * Math.max(1, 120 * Math.exp(-t / 350)) });
  return out;
}

describe('one gesture = one slide', () => {
  it('fast mouse wheel spinning moves exactly one slide', () => {
    const events = Array.from({ length: 30 }, (_, i) => ({ t: i * 40, d: 100 }));
    expect(run(events)).toEqual([1]);
  });

  it('a long trackpad flick with inertia moves exactly one slide', () => {
    expect(run(flick(0))).toEqual([1]);
  });

  it('a new deliberate gesture after a pause moves again', () => {
    expect(run([...flick(0), ...flick(2400, -1)])).toEqual([1, -1]);
  });

  it('small jitter does not navigate', () => {
    const jitter = Array.from({ length: 10 }, (_, i) => ({ t: i * 300, d: 4 }));
    expect(run(jitter)).toEqual([]);
  });

  it('ignores input during the minimum lock even after a pause', () => {
    // second notch 400ms later is inside the 1100ms lock
    expect(run([{ t: 0, d: 100 }, { t: 400, d: 100 }])).toEqual([1]);
  });
});
