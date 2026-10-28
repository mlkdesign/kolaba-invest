/**
 * One deliberate scroll gesture = one slide.
 *
 *   idle ──(accumulated delta ≥ threshold)──▶ transitioning ──(animation done)──▶ cooldown ──(gesture ended)──▶ idle
 *
 * - While transitioning every wheel event is swallowed.
 * - In cooldown we keep swallowing the inertia tail of the same gesture (trackpads keep
 *   emitting decaying deltas for up to ~1.5s). A gap between events, or a sharp delta spike
 *   after a decayed tail, marks the start of a new gesture.
 * - A minimum lock after a transition starts covers devices without inertia data.
 */
export type WheelPhase = 'idle' | 'transitioning' | 'cooldown';

export type WheelIntentOptions = {
  /** Accumulated normalized delta that counts as an intent. */
  threshold?: number;
  /** Silence (ms) that ends a gesture. */
  gestureGap?: number;
  /** Minimum time (ms) from transition start before another transition can begin. */
  minLock?: number;
};

export class WheelIntent {
  phase: WheelPhase = 'idle';
  private acc = 0;
  private lastTime = -Infinity;
  private lastAbs = 0;
  private lockUntil = 0;
  /** Safety release in case the animation never reports completion (e.g. throttled background tab). */
  private forceEndAt = Infinity;
  private readonly threshold: number;
  private readonly gestureGap: number;
  private readonly minLock: number;

  constructor({ threshold = 90, gestureGap = 200, minLock = 1100 }: WheelIntentOptions = {}) {
    this.threshold = threshold;
    this.gestureGap = gestureGap;
    this.minLock = minLock;
  }

  /** Feed a normalized wheel delta. Returns the direction to navigate (-1, 1) or 0. */
  feed(delta: number, time: number): -1 | 0 | 1 {
    const abs = Math.abs(delta);
    const gap = time - this.lastTime;
    const prevAbs = this.lastAbs;
    this.lastTime = time;
    this.lastAbs = abs;
    if (abs === 0) return 0;

    if (this.phase === 'transitioning') {
      if (time < this.forceEndAt) return 0;
      this.phase = 'cooldown';
    }

    if (this.phase === 'cooldown') {
      if (time < this.lockUntil) return 0;
      const gestureEnded = gap > this.gestureGap;
      // A fresh swipe during a decayed inertia tail: small deltas suddenly jump.
      const freshSpike = prevAbs < 12 && abs > 40 && abs > prevAbs * 3;
      if (!gestureEnded && !freshSpike) return 0;
      this.phase = 'idle';
      this.acc = 0;
    }

    if (gap > this.gestureGap || Math.sign(delta) !== Math.sign(this.acc)) this.acc = 0;
    this.acc += delta;
    if (Math.abs(this.acc) >= this.threshold) {
      const dir = this.acc > 0 ? 1 : -1;
      this.acc = 0;
      return dir;
    }
    return 0;
  }

  /** A navigation started (from wheel, keyboard or menu). */
  begin(time: number, expectedMs = 1000) {
    this.phase = 'transitioning';
    this.acc = 0;
    this.lockUntil = time + this.minLock;
    this.forceEndAt = time + Math.max(expectedMs, this.minLock) + 400;
  }

  /** The slide animation finished; wait for the current gesture to end. */
  end() {
    if (this.phase === 'transitioning') this.phase = 'cooldown';
    this.forceEndAt = Infinity;
  }

  reset() {
    this.phase = 'idle';
    this.acc = 0;
  }
}

/** Convert a WheelEvent delta to pixels. */
export function normalizeWheel(e: Pick<WheelEvent, 'deltaY' | 'deltaMode'>, pageHeight: number) {
  if (e.deltaMode === 1) return e.deltaY * 33;
  if (e.deltaMode === 2) return e.deltaY * pageHeight;
  return e.deltaY;
}
