// One run: build the track and cart for a world, step physics on a fixed clock, collect pickups,
// apply power-ups, react to events (Karen, particles, vibration) and decide when the run is over.

import { Track } from '../../world/track.js';
import { createCart, stepCart, liftRatio, rescue } from '../physics.js';
import { cartStats } from '../../content/carts.js';
import { worldById } from '../../content/worlds.js';
import { PHYS, RUN } from '../../content/tuning.js';
import { QUIPS, pick } from '../../content/story.js';

const DT = 1 / PHYS.stepHz;
const MAGNET_SECONDS = 20;
const MAGNET_RANGE = 260;

/** opts: { world, seed?, mode: 'adventure' | 'challenge' | 'event' } */
export function startRun(game, opts = {}) {
  const save = game.save;
  const world = worldById(opts.world || save.world);
  game.world = world;
  game.mode = opts.mode || 'adventure';
  game.cartId = save.selected;
  game.stats = {
    ...cartStats(save.selected, save.upgrades[save.selected]),
    rollingMul: world.rolling ?? 1,
    brakeMul: world.brake ?? 1,
  };
  game.track = new Track(opts.seed ?? ((Math.random() * 1e9) | 0), { hills: world.hills });
  game.cart = createCart(game.track, game.stats, 200);
  game.run = {
    coins: 0, boosts: 0, airtime: 0, cleanLandings: 0, fuelCans: 0, derailed: false,
    stall: 0, over: false, overTimer: 0, danger: 0, maxX: 200,
    magnet: 0, shieldUsed: false,
  };
  game.time = 0;
  game.acc = 0;
  game.flash = 0;
  game.renderer.reset(game);
  game.input.calibrate();
  game.say(pick(QUIPS.start), true);
}

export function distanceMeters(game) {
  return Math.max(0, (game.run.maxX - 200) / RUN.pxPerMeter);
}

export function runSummary(game) {
  const r = game.run;
  return {
    world: game.world.id, distance: distanceMeters(game), coins: r.coins, boosts: r.boosts, airtime: r.airtime,
    cleanLandings: r.cleanLandings, fuelCans: r.fuelCans, derailed: r.derailed, reason: r.reason,
  };
}

/** Power-up buttons in the HUD. */
export function useBoost(game) {
  const { cart, save, run } = game;
  if (run.over || save.inventory.boost <= 0) return;
  save.inventory.boost -= 1;
  game.persist();
  if (cart.air) { cart.vx = Math.max(cart.vx, PHYS.boostSpeed); } else { cart.v = Math.max(cart.v, PHYS.boostSpeed * 1.1); }
  run.boosts += 1;
  game.renderer.burst(cart.x, cart.y + 20, '#42a5ef', 18, 340);
  game.say(pick(QUIPS.boost), true);
}

export function useMagnet(game) {
  const { save, run } = game;
  if (run.over || run.magnet > 0 || save.inventory.magnet <= 0) return;
  save.inventory.magnet -= 1;
  game.persist();
  run.magnet = MAGNET_SECONDS;
  game.say('Magnet on. Coins are legally obliged to come to you.', true);
}

export function updateRun(game, dt) {
  const { cart, track, stats, run } = game;
  game.time += dt;
  game.flash = Math.max(0, game.flash - dt * 2.5);
  track.ensure(cart.x + 4000);

  if (run.over) {
    // Tumble: the derailed cart keeps flying for a moment before the results show.
    run.overTimer += dt;
    if (cart.crashed) {
      cart.vy -= 900 * dt;
      cart.x += cart.vx * dt;
      cart.y += cart.vy * dt;
      cart.angle += 5 * dt;
    }
    return run.overTimer > 1.4;
  }

  const input = game.input.read();
  game.acc = Math.min(game.acc + dt, 0.1);
  while (game.acc >= DT) {
    game.acc -= DT;
    for (const ev of stepCart(cart, track, stats, input, DT)) onEvent(game, ev);
    if (cart.air) run.airtime += DT;
    if (cart.crashed) break;
  }
  run.maxX = Math.max(run.maxX, cart.x);
  run.magnet = Math.max(0, run.magnet - dt);

  collect(game);

  const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : cart.v;
  run.danger = cart.air ? 1 : Math.min(1.2, liftRatio(track, cart.x, Math.max(0, speed)));
  if (!cart.air && run.danger > 0.85) game.say(pick(QUIPS.danger));
  if (cart.fuel / stats.tank < 0.2 && cart.fuel > 0) game.say(pick(QUIPS.lowFuel));

  if (cart.crashed) {
    // A shield saves one bad landing per run.
    if (cart.crashed !== 'fell' && !run.shieldUsed && game.save.inventory.shield > 0) {
      game.save.inventory.shield -= 1;
      run.shieldUsed = true;
      game.persist();
      rescue(cart, track);
      game.flash = 0.5;
      game.renderer.burst(cart.x, cart.y + 30, '#9be3ff', 22, 300);
      game.say('Shield absorbed that. Karen filed the report anyway.', true);
      return false;
    }
    return endRun(game, cart.crashed);
  }
  if (cart.fuel <= 0 && !cart.air && Math.abs(cart.v) < 15) {
    run.stall += dt;
    if (run.stall > RUN.stallSeconds) return endRun(game, 'fuel');
  } else run.stall = 0;
  return false;
}

function collect(game) {
  const { cart, track, run, stats, renderer } = game;
  const cy = cart.y + 35;
  const reach = run.magnet > 0 ? MAGNET_RANGE : 70;
  for (let i = track.firstItemAt(cart.x - reach); i < track.items.length; i++) {
    const it = track.items[i];
    if (it.x > cart.x + reach) break;
    if (it.taken) continue;
    const magnetized = run.magnet > 0 && it.kind === 'coin';
    if (!magnetized && (Math.abs(it.x - cart.x) > 70 || Math.abs(it.y - cy) > 70)) continue;
    if (magnetized && Math.hypot(it.x - cart.x, it.y - cy) > MAGNET_RANGE) continue;
    it.taken = true;
    if (it.kind === 'coin') {
      run.coins += 1;
      renderer.burst(it.x, it.y, '#ffd23f', 5, 160);
    } else {
      cart.fuel = stats.tank;
      run.fuelCans += 1;
      renderer.burst(it.x, it.y, '#72c95a', 12, 220);
      game.say(pick(QUIPS.fuel), true);
    }
  }
}

function onEvent(game, ev) {
  const { cart, renderer, run } = game;
  if (ev === 'airborne') game.say(pick(QUIPS.airborne));
  if (ev === 'boost') {
    run.boosts += 1;
    renderer.burst(cart.x, cart.y + 20, '#ffb62e', 14, 300);
    game.say(pick(QUIPS.boost));
  }
  if (ev === 'landed' || ev === 'landed-clean') renderer.burst(cart.x, cart.y + 5, '#c9a27a', 10, 200);
  if (ev === 'landed-clean') {
    run.coins += 5;
    run.cleanLandings += 1;
    game.say(pick(QUIPS.landing), true);
  }
}

function endRun(game, reason) {
  const { run, cart, renderer } = game;
  run.over = true;
  run.reason = reason;
  run.derailed = reason !== 'fuel';
  if (run.derailed) {
    game.flash = 0.8;
    renderer.burst(cart.x, cart.y + 20, '#ff6b3d', 26, 420);
    if (!cart.air) { cart.vx = cart.v; cart.vy = 300; }
    game.vibrate(250);
  }
  return false;
}
