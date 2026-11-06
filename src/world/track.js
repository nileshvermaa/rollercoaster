// The endless rail: a Catmull-Rom spline through evenly spaced knots, generated ahead of the cart
// from a seed. Also owns what sits on the rail: jump gaps, booster pads, coins and fuel cans.
// Pure data, no DOM, so tests can drive it.

import { mulberry32, clamp, DEG } from '../engine/math.js';
import { WORLD, PHYS, RUN, difficultyAt } from '../content/tuning.js';

const SEG = WORLD.segment;
const MAX_SLOPE = Math.tan(WORLD.maxSlopeDeg * DEG);

export class Track {
  constructor(seed = 1, { hills = 0 } = {}) {
    this.seed = seed;
    this.hills = hills; // extra starting difficulty for later worlds
    this.rng = mulberry32(seed);
    this.h = []; // knot heights; knot i sits at x = i * SEG
    this.gaps = []; // { x0, x1 } sorted, rail absent in between
    this.boosters = []; // { x0, x1, id }
    this.items = []; // { kind: 'coin' | 'fuel', x, y, taken }
    this.nextFuelX = 1200;
    this.gapCooldown = 0;
    this.itemSeg = 0; // next segment that still needs items
    for (let i = 0; i < WORLD.runwayKnots; i++) this.h.push(0);
    this.ensure(4000);
  }

  /** Furthest x the spline can be evaluated at. */
  get extent() {
    return (this.h.length - 3) * SEG;
  }

  ensure(x) {
    if (this.extent >= x) return;
    while (this.extent < x) this._addKnot();
    this._placeItems();
    this.items.sort((a, b) => a.x - b.x); // jump coins are added ahead of row coins
  }

  _knot(i) {
    return this.h[clamp(i, 0, this.h.length - 1)];
  }

  /** Height, slope and second derivative of the rail at x. */
  at(x) {
    const j = Math.max(0, Math.floor(x / SEG));
    const t = x / SEG - j;
    const p0 = this._knot(j - 1), p1 = this._knot(j), p2 = this._knot(j + 1), p3 = this._knot(j + 2);
    const a = -p0 + 3 * p1 - 3 * p2 + p3;
    const b = 2 * p0 - 5 * p1 + 4 * p2 - p3;
    const c = -p0 + p2;
    const y = 0.5 * (2 * p1 + c * t + b * t * t + a * t * t * t);
    const dy = (0.5 * (c + 2 * b * t + 3 * a * t * t)) / SEG;
    const ddy = (0.5 * (2 * b + 6 * a * t)) / (SEG * SEG);
    return { y, dy, ddy };
  }

  /** Lower, smoother terrain the supports stand on. */
  groundAt(x) {
    const j = Math.floor(x / SEG);
    const t = x / SEG - j;
    const g = (k) => Math.min(this._knot(k - 2), this._knot(k - 1), this._knot(k), this._knot(k + 1), this._knot(k + 2)) - 70;
    const s = (1 - Math.cos(t * Math.PI)) / 2;
    return g(j) * (1 - s) + g(j + 1) * s;
  }

  isGap(x) {
    for (let i = this.gaps.length - 1; i >= 0; i--) {
      const g = this.gaps[i];
      if (x >= g.x0 && x <= g.x1) return true;
      if (g.x1 < x) return false;
    }
    return false;
  }

  boosterAt(x) {
    for (let i = this.boosters.length - 1; i >= 0; i--) {
      const b = this.boosters[i];
      if (x >= b.x0 && x <= b.x1) return b;
      if (b.x1 < x) return null;
    }
    return null;
  }

  /** Index of the first item at or after x (items are sorted by x). */
  firstItemAt(x) {
    let lo = 0, hi = this.items.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.items[mid].x < x) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  maxSlopeOnSegment(j) {
    let m = 0;
    for (let k = 0; k <= 32; k++) m = Math.max(m, Math.abs(this.at((j + k / 32) * SEG).dy));
    return m;
  }

  _addKnot() {
    const i = this.h.length;
    const x = i * SEG;
    const d = Math.min(1, difficultyAt(x) + this.hills);
    const gentle = Math.abs(this.h[i - 1] - this.h[i - 2]) < 50; // jump knots skip the slope guard
    if (x > RUN.gapFromX && this.gapCooldown <= 0 && gentle && this.rng() < 0.06 + 0.12 * d) {
      this._addJump();
      return;
    }
    this.gapCooldown--;
    const prev = this.h[i - 1];
    const maxStep = MAX_SLOPE * SEG * (0.3 + 0.45 * d);
    let delta = clamp((this.rng() * 2 - 1) * maxStep - prev * 0.1, -maxStep, maxStep);
    // Catmull-Rom can overshoot the chord slope: shrink the step until the finished segment
    // behind this knot stays under the slope limit (that is what keeps every hill climbable).
    for (let k = 0; k < 10; k++) {
      this.h[i] = prev + delta;
      // Segment i-1 is checked with knot i+1 assumed level; adding i+1 re-checks it as i-2.
      if (i < 3 || Math.max(this.maxSlopeOnSegment(i - 2), this.maxSlopeOnSegment(i - 1)) <= MAX_SLOPE * 0.95) break;
      delta *= 0.6;
    }
  }

  _addJump() {
    const i = this.h.length;
    const top = this.h[i - 1] + 45;
    this.h.push(top, top - 90, top - 110, top - 120, top - 125);
    const x0 = i * SEG - 70; // still on the rising side, so the lip throws the cart up
    const boost = { x0: x0 - 260, x1: x0 - 110, id: this.boosters.length };
    this.boosters.push(boost);

    // Size the gap from a conservative launch: booster speed minus the climb to the lip, less drag.
    const g = WORLD.gravity;
    const rise = this.at(x0).y - this.at(boost.x1).y;
    const vl = Math.sqrt(Math.max(0, PHYS.boostSpeed ** 2 - 2 * g * rise)) * 0.9;
    const th = Math.atan(this.at(x0).dy);
    const vx = vl * Math.cos(th);
    let px = x0, py = this.at(x0).y, vy = vl * Math.sin(th);
    const path = [];
    for (let s = 0; s < 2000; s++) {
      const dt = 1 / 240;
      vy -= g * dt; px += vx * dt; py += vy * dt;
      path.push([px, py]);
      if (px > x0 + 40 && py <= this.at(px).y) break;
    }
    const width = clamp(0.6 * (px - x0), 120, 420);
    this.gaps.push({ x0, x1: x0 + width });
    for (let k = 1; k <= 5; k++) {
      const [cx, cy] = path[Math.floor((path.length * k) / 7)];
      this.items.push({ kind: 'coin', x: cx, y: cy + 30, taken: false });
    }
    this.gapCooldown = 8;
  }

  _placeItems() {
    // A segment's shape is final once the knot two past it exists.
    while ((this.itemSeg + 3) < this.h.length) {
      const j = this.itemSeg++;
      const x0 = j * SEG;
      if (x0 < SEG * 2) continue;
      if (this.rng() < RUN.coinRowChance) {
        for (let k = 0; k < 5; k++) {
          const x = x0 + 40 + k * 38;
          if (!this.isGap(x)) this.items.push({ kind: 'coin', x, y: this.at(x).y + 48, taken: false });
        }
      }
      if (x0 >= this.nextFuelX) {
        const x = x0 + SEG / 2;
        if (!this.isGap(x) && !this.isGap(x - 300)) {
          this.items.push({ kind: 'fuel', x, y: this.at(x).y + 50, taken: false });
          const [lo, hi] = RUN.fuelEvery;
          this.nextFuelX = x + lo + this.rng() * (hi - lo) * (1 + Math.min(1, difficultyAt(x) + this.hills) * 0.6);
        }
      }
    }
  }
}
