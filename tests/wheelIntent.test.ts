import { describe, expect, it } from 'vitest';
import { WheelIntent } from '../src/engine/wheelIntent';

/** Simulates the engine: feed events and start a transition on every move, like the deck does. */
function run(events: { t: number; d: number }[]) {
  const w = new WheelIntent();
  const moves: number[] = [];
  for (const e of events) {
    const dir = w.feed(e.d, e.t);
    if (dir) {
      moves.push(dir);
      w.begin(e.t);
    }
  }
  return moves;
}

/** A trackpad flick: short ramp-up, then a long decaying inertia tail every 16ms. */
function flick(start: number, sign = 1, ms = 1800) {
  const out: { t: number; d: number }[] = [];
  for (const d of [4, 14, 40]) out.push({ t: start + out.length * 16, d: sign * d });
  const t0 = out.length * 16;
  for (let t = 0; t < ms; t += 16) out.push({ t: start + t0 + t, d: sign * Math.max(1, 120 * Math.exp(-t / 350)) });
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

  it('a second swipe during the previous inertia tail moves again without waiting', () => {
    const first = flick(0).filter((e) => e.t < 600);
    expect(run([...first, ...flick(600)])).toEqual([1, 1]);
  });

  it('reversing direction mid-tail moves back immediately', () => {
    const first = flick(0).filter((e) => e.t < 500);
    expect(run([...first, ...flick(500, -1)])).toEqual([1, -1]);
  });

  it('small jitter does not navigate', () => {
    const jitter = Array.from({ length: 10 }, (_, i) => ({ t: i * 300, d: 4 }));
    expect(run(jitter)).toEqual([]);
  });

  it('ignores input during the short minimum lock', () => {
    expect(run([{ t: 0, d: 100 }, { t: 200, d: 100 }])).toEqual([1]);
  });

  it('separate mouse wheel notches move one slide each', () => {
    expect(run([{ t: 0, d: 100 }, { t: 400, d: 100 }, { t: 800, d: 100 }])).toEqual([1, 1, 1]);
  });
});
