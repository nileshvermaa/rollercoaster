import { describe, it, expect } from 'vitest';
import { Track } from '../src/world/track.js';
import { WORLD, ZONE_PX, difficultyAt, zoneAt } from '../src/content/tuning.js';
import { CARTS } from '../src/content/carts.js';
import { PHYS } from '../src/content/tuning.js';

const SEEDS = [1, 7, 42, 1234, 99991];

describe('track generation', () => {
  it('is deterministic for a seed', () => {
    const a = new Track(42), b = new Track(42);
    a.ensure(30000); b.ensure(30000);
    expect(a.h).toEqual(b.h);
    expect(a.gaps).toEqual(b.gaps);
  });

  it('never exceeds the max slope on the rail, so every hill is climbable', () => {
    const limit = Math.tan(WORLD.maxSlopeDeg * Math.PI / 180);
    for (const seed of SEEDS) {
      const t = new Track(seed);
      t.ensure(80000);
      for (let x = 0; x < 79000; x += 7) {
        if (t.isGap(x)) continue;
        expect(Math.abs(t.at(x).dy)).toBeLessThanOrEqual(limit * 1.02);
      }
    }
  });

  it('gives every cart an engine that beats gravity on the steepest slope', () => {
    const worst = WORLD.gravity * Math.sin(WORLD.maxSlopeDeg * Math.PI / 180) + PHYS.rolling + 40;
    for (const c of CARTS) expect(c.engine).toBeGreaterThan(worst);
  });

  it('puts a booster before every gap and keeps items out of gaps', () => {
    const t = new Track(7);
    t.ensure(80000);
    expect(t.gaps.length).toBeGreaterThan(3);
    for (const g of t.gaps) {
      expect(t.boosters.some((b) => b.x1 < g.x0 && g.x0 - b.x1 < 300)).toBe(true);
    }
    for (const it of t.items) if (it.kind === 'fuel') expect(t.isGap(it.x)).toBe(false);
  });

  it('keeps items sorted by x', () => {
    const t = new Track(3);
    t.ensure(40000);
    for (let i = 1; i < t.items.length; i++) expect(t.items[i].x).toBeGreaterThanOrEqual(t.items[i - 1].x);
  });

  it('steps difficulty up by zone and gets sharper crests later on', () => {
    expect(zoneAt(ZONE_PX * 2.5)).toBe(2);
    expect(difficultyAt(ZONE_PX * 0.5)).toBeLessThan(difficultyAt(ZONE_PX * 3.5));
    // A knot standing P above its neighbours throws the train at lower speed the bigger P is.
    const crests = (t, z) => {
      let n = 0;
      for (let i = Math.ceil((z * ZONE_PX) / 240); i < ((z + 1) * ZONE_PX) / 240; i++) if (t.h[i] - (t.h[i - 1] + t.h[i + 1]) / 2 > 50) n++;
      return n;
    };
    let early = 0, late = 0;
    for (const seed of SEEDS) {
      const t = new Track(seed);
      t.ensure(6 * ZONE_PX);
      early += crests(t, 0);
      late += crests(t, 4);
    }
    expect(late).toBeGreaterThan(early * 2);
  });
});
