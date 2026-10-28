/**
 * One deliberate scroll gesture = one slide, without making fast flipping wait.
 *
 *   idle ──(accumulated delta ≥ threshold)──▶ locked ──(new gesture detected)──▶ idle
 *
 * - For a short minimum lock after a move every wheel event is swallowed.
 * - After that we keep swallowing the inertia tail of the same gesture (trackpads keep
 *   emitting decaying deltas for up to ~1.5s). A new gesture is recognised by a pause,
 *   a direction change, or a sharp rise after the tail has visibly decayed — so the next
 *   swipe works immediately, even while the previous slide is still settling.
 */
export type WheelPhase = 'idle' | 'locked';

export type WheelIntentOptions = {
  /** Accumulated normalized delta that counts as an intent. */
  threshold?: number;
  /** Silence (ms) that ends a gesture. */
  gestureGap?: number;
  /** Minimum time (ms) after a move before another one can begin. */
  minLock?: number;
};

export class WheelIntent {
  phase: WheelPhase = 'idle';
  private acc = 0;
  private lastTime = -Infinity;
  private lastAbs = 0;
  private prevAbs = 0;
  private lastSign = 0;
  private lockUntil = 0;
  /** Peak delta of the gesture that triggered the last move, and whether its tail decayed since. */
  private peak = 0;
  private decayed = false;
  private readonly threshold: number;
  private readonly gestureGap: number;
  private readonly minLock: number;

  constructor({ threshold = 60, gestureGap = 140, minLock = 320 }: WheelIntentOptions = {}) {
    this.threshold = threshold;
    this.gestureGap = gestureGap;
    this.minLock = minLock;
  }

  /** Feed a normalized wheel delta. Returns the direction to navigate (-1, 1) or 0. */
  feed(delta: number, time: number): -1 | 0 | 1 {
    const abs = Math.abs(delta);
    const sign = Math.sign(delta);
    const gap = time - this.lastTime;
    const recent = Math.max(this.lastAbs, this.prevAbs);
    const lastSign = this.lastSign;
    this.lastTime = time;
    this.prevAbs = this.lastAbs;
    this.lastAbs = abs;
    if (abs === 0) return 0;
    this.lastSign = sign;

    if (this.phase === 'locked') {
      this.peak = Math.max(this.peak, time < this.lockUntil ? abs : 0);
      if (abs < this.peak * 0.6) this.decayed = true;
      if (time < this.lockUntil) return 0;
      const gestureEnded = gap > this.gestureGap;
      const reversed = sign !== lastSign && abs >= 6;
      // A fresh swipe during a decayed inertia tail: deltas suddenly jump up again.
      const freshSpike = this.decayed && abs >= 14 && abs > recent * 1.7 + 4;
      if (!gestureEnded && !reversed && !freshSpike) return 0;
      this.phase = 'idle';
      this.acc = 0;
    }

    if (gap > this.gestureGap || sign !== Math.sign(this.acc)) this.acc = 0;
    this.acc += delta;
    if (Math.abs(this.acc) >= this.threshold) {
      const dir = this.acc > 0 ? 1 : -1;
      this.lock(time, abs);
      return dir;
    }
    return 0;
  }

  /** A navigation started (from wheel, keyboard or menu); `lockMs` overrides the minimum lock. */
  begin(time: number, lockMs = this.minLock) {
    this.lock(time, this.phase === 'locked' ? this.peak : 0);
    this.lockUntil = time + Math.max(lockMs, this.minLock);
  }

  private lock(time: number, abs: number) {
    this.phase = 'locked';
    this.acc = 0;
    this.peak = abs;
    this.decayed = false;
    this.lockUntil = time + this.minLock;
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
