// Cart physics: a bead on a wire while on the rail, a projectile once it leaves it.
// The rail pushes only outward, so if the curve asks for more than gravity can give
// (crest too fast) the cart flies. Landing at the wrong angle or too hard derails.
// Pure functions over plain objects: no DOM, deterministic, unit-tested.

import { WORLD, PHYS, RUN } from '../content/tuning.js';
import { angleDiff, DEG } from '../engine/math.js';

export function createCart(track, stats, x = 0) {
  const p = track.at(x);
  return {
    x, y: p.y, v: 0, vx: 0, vy: 0,
    angle: Math.atan(p.dy),
    air: false, airTime: 0,
    fuel: stats.tank,
    crashed: null, // 'landing' | 'slam' | 'fell' once derailed
    wheel: 0,
    lastBooster: -1,
  };
}

/** How close the rail just ahead is to throwing the cart off at speed v: 1 = airborne. */
export function liftRatio(track, x, v, lookahead = 420) {
  let worst = 0;
  const g = WORLD.gravity;
  for (let d = 0; d <= lookahead; d += 30) {
    const p = track.at(x + d);
    const cos = 1 / Math.sqrt(1 + p.dy * p.dy);
    const kappa = p.ddy * cos * cos * cos;
    if (kappa < 0) worst = Math.max(worst, (-kappa * v * v) / (g * cos));
  }
  return worst;
}

/**
 * Advance one fixed step. input = { throttle: 0..1, brake: 0..1 }.
 * Returns a list of event names that happened this step.
 */
export function stepCart(c, track, stats, input, dt) {
  const events = [];
  if (c.crashed) return events;
  const g = WORLD.gravity;

  if (!c.air) {
    if (track.isGap(c.x)) {
      launch(c, track);
      events.push('airborne');
    } else {
      const p = track.at(c.x);
      const cos = 1 / Math.sqrt(1 + p.dy * p.dy);
      const sin = p.dy * cos;
      const kappa = p.ddy * cos * cos * cos;
      const throttle = c.fuel > 0 ? input.throttle : 0;

      let a = -g * sin + throttle * stats.engine - PHYS.drag * c.v * Math.abs(c.v);
      if (Math.abs(c.v) > 1) a -= PHYS.rolling * (stats.rollingMul ?? 1) * Math.sign(c.v);
      c.v += a * dt;
      if (input.brake > 0) {
        const dv = PHYS.brake * (stats.brakeMul ?? 1) * input.brake * dt;
        c.v = Math.abs(c.v) <= dv ? 0 : c.v - Math.sign(c.v) * dv;
      }

      const b = track.boosterAt(c.x);
      if (b && b.id !== c.lastBooster) {
        c.lastBooster = b.id;
        if (c.v < PHYS.boostSpeed) c.v = PHYS.boostSpeed;
        events.push('boost');
      }

      c.x += c.v * cos * dt;
      const q = track.at(c.x);
      c.y = q.y;
      c.angle = Math.atan(q.dy);
      c.wheel += (c.v * dt) / 13;
      c.fuel = Math.max(0, c.fuel - (stats.burn * throttle + RUN.idleBurn) * dt);

      // Normal force per unit mass. Negative = the rail would have to pull: we leave it.
      if (g * cos + kappa * c.v * c.v < 0) {
        launch(c, track);
        events.push('airborne');
      }
    }
    return events;
  }

  // Airborne: gravity, and the player tips the nose with gas (down) and brake (up).
  c.airTime += dt;
  c.vy -= g * dt;
  c.x += c.vx * dt;
  c.y += c.vy * dt;
  // The cart weathervanes toward its flight path (so hands-off landings are fair);
  // the player's lean adds on top of that.
  const heading = Math.atan2(c.vy, c.vx);
  c.angle += angleDiff(heading, c.angle) * Math.min(1, PHYS.airAlign * dt);
  c.angle -= (input.throttle - input.brake) * stats.spin * dt;
  c.wheel += (c.vx * dt) / 13;

  const p = track.at(c.x);
  if (!track.isGap(c.x) && c.y <= p.y) {
    const th = Math.atan(p.dy);
    const cos = Math.cos(th), sin = Math.sin(th);
    const into = -(c.vx * -sin + c.vy * cos); // speed along the rail normal, into the rail
    const mismatch = Math.abs(angleDiff(c.angle, th));
    if (mismatch > stats.grip * DEG) return crash(c, 'landing', events);
    if (into > PHYS.hardLanding) return crash(c, 'slam', events);
    c.v = c.vx * cos + c.vy * sin;
    c.y = p.y;
    c.angle = th;
    c.air = false;
    events.push(mismatch < 10 * DEG && c.airTime > 0.6 ? 'landed-clean' : 'landed');
  } else if (c.y < p.y - PHYS.fallDepth) {
    return crash(c, 'fell', events);
  }
  return events;
}

function launch(c, track) {
  const th = Math.atan(track.at(c.x).dy);
  c.vx = c.v * Math.cos(th);
  c.vy = c.v * Math.sin(th);
  c.angle = th;
  c.air = true;
  c.airTime = 0;
}

/** A shield turns a derail into a hard save: back on the rail at a crawl. */
export function rescue(c, track) {
  if (!c.crashed || c.crashed === 'fell') return false;
  const p = track.at(c.x);
  c.crashed = null;
  c.air = false;
  c.y = p.y;
  c.angle = Math.atan(p.dy);
  c.v = Math.max(150, Math.min(400, Math.hypot(c.vx, c.vy) * 0.35));
  return true;
}

function crash(c, reason, events) {
  c.crashed = reason;
  events.push('crash');
  return events;
}
