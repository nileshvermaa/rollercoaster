import { describe, it, expect } from 'vitest';
import { Track } from '../src/world/track.js';
import { createCart, stepCart, liftRatio } from '../src/game/physics.js';
import { cartStats } from '../src/content/carts.js';
import { PHYS } from '../src/content/tuning.js';

const DT = 1 / PHYS.stepHz;
const NONE = { throttle: 0, brake: 0 };
const GAS = { throttle: 1, brake: 0 };

/** A hand-made track: flat, then whatever shape `h` gives, no gaps or boosters. */
function shapedTrack(heights) {
  const t = new Track(1);
  t.h = heights.slice();
  t.gaps = []; t.boosters = []; t.items = [];
  t.ensure = () => {};
  return t;
}

function run(cart, track, stats, input, seconds) {
  const events = [];
  for (let i = 0; i < seconds / DT; i++) events.push(...stepCart(cart, track, stats, input, DT));
  return events;
}

describe('cart physics', () => {
  const stats = cartStats('basic');

  it('accelerates on the flat with throttle and burns fuel', () => {
    const t = shapedTrack(new Array(40).fill(0));
    const c = createCart(t, stats, 100);
    run(c, t, stats, GAS, 2);
    expect(c.v).toBeGreaterThan(800);
    expect(c.fuel).toBeLessThan(stats.tank);
  });

  it('climbs the steepest legal slope from a standstill', () => {
    const rise = Math.tan(34 * Math.PI / 180) * 240;
    const h = [0, 0, 0, 0];
    for (let i = 1; i < 20; i++) h.push(i * rise);
    const t = shapedTrack(h);
    const c = createCart(t, stats, 4 * 240);
    run(c, t, stats, GAS, 3);
    expect(c.crashed).toBeNull();
    expect(c.x).toBeGreaterThan(4 * 240 + 300);
  });

  it('rolls back down a hill with no fuel', () => {
    const t = shapedTrack([0, 0, 0, 0, 100, 200, 300, 400, 500, 600]);
    const c = createCart(t, stats, 6 * 240);
    c.fuel = 0;
    run(c, t, stats, GAS, 2);
    expect(c.v).toBeLessThan(0);
  });

  it('flies off a sharp crest at speed and stays on it slowly', () => {
    const h = [0, 0, 0, 0, 120, 0, 0, 0, 0, 0];
    const slow = createCart(shapedTrack(h), stats, 600);
    slow.v = 150;
    expect(run(slow, shapedTrack(h), stats, NONE, 1.5)).not.toContain('airborne');

    const t = shapedTrack(h);
    const fast = createCart(t, stats, 600);
    fast.v = 900;
    expect(liftRatio(t, fast.x, fast.v)).toBeGreaterThan(1);
    expect(run(fast, t, stats, NONE, 1.5)).toContain('airborne');
  });

  it('derails on a landing at the wrong angle', () => {
    const t = shapedTrack(new Array(40).fill(0));
    const c = createCart(t, stats, 1000);
    Object.assign(c, { air: true, y: 15, vx: 400, vy: -300, angle: 75 * Math.PI / 180 });
    run(c, t, stats, NONE, 1);
    expect(c.crashed).toBe('landing');
  });

  it('lands cleanly when level', () => {
    const t = shapedTrack(new Array(40).fill(0));
    const c = createCart(t, stats, 1000);
    Object.assign(c, { air: true, y: 60, vx: 400, vy: 0, angle: 0 });
    const ev = run(c, t, stats, NONE, 1);
    expect(c.crashed).toBeNull();
    expect(ev.some((e) => e.startsWith('landed'))).toBe(true);
    expect(c.v).toBeGreaterThan(300);
  });

  it('clears every generated gap hands-off after its booster', () => {
    for (const seed of [1, 7, 42, 1234]) {
      const t = new Track(seed);
      t.ensure(90000);
      for (const g of t.gaps.slice(0, 6)) {
        const b = t.boosters.find((bb) => bb.x1 < g.x0 && g.x0 - bb.x1 < 300);
        const c = createCart(t, stats, b.x0 - 5);
        c.v = 120;
        let steps = 0;
        while (c.x < g.x1 + 200 && !c.crashed && steps++ < 2000) stepCart(c, t, stats, NONE, DT);
        expect({ seed, gap: g.x0, crashed: c.crashed }).toEqual({ seed, gap: g.x0, crashed: null });
      }
    }
  });
});
