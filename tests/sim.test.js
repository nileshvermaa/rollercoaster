import { describe, it, expect } from 'vitest';
import { Track } from '../src/world/track.js';
import { createCart, stepCart, liftRatio } from '../src/game/physics.js';
import { cartStats } from '../src/content/carts.js';
import { PHYS } from '../src/content/tuning.js';

const DT = 1 / PHYS.stepHz;

/** A simple careful driver: gas unless the crest ahead would throw the cart, then brake. */
function drive(seed, seconds) {
  const stats = cartStats('basic');
  const t = new Track(seed);
  const c = createCart(t, stats, 200);
  for (let i = 0; i < seconds / DT && !c.crashed; i++) {
    t.ensure(c.x + 3000);
    const risk = c.air ? 0 : liftRatio(t, c.x, Math.max(0, c.v), 500);
    const input = risk > 0.75 ? { throttle: 0, brake: 1 } : { throttle: 1, brake: 0 };
    stepCart(c, t, stats, input, DT);
    if (c.fuel <= 0) c.fuel = stats.tank; // refuel: this checks handling, not fuel balance
  }
  return c;
}

describe('playability', () => {
  it('a careful driver survives two minutes on several seeds', () => {
    for (const seed of [2, 11, 300]) {
      const c = drive(seed, 120);
      expect({ seed, crashed: c.crashed }).toEqual({ seed, crashed: null });
      expect(c.x).toBeGreaterThan(20000);
    }
  });
});
