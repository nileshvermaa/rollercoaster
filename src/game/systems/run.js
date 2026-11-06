// One run: build the track and cart, step physics on a fixed clock, collect pickups,
// react to events (Karen's commentary, particles) and decide when the run is over.

import { Track } from '../../world/track.js';
import { createCart, stepCart, liftRatio } from '../physics.js';
import { cartStats } from '../../content/carts.js';
import { PHYS, RUN } from '../../content/tuning.js';
import { QUIPS, pick } from '../../content/story.js';

const DT = 1 / PHYS.stepHz;

export function startRun(game) {
  const save = game.save;
  game.cartId = save.selected;
  game.stats = cartStats(save.selected, save.upgrades[save.selected]);
  game.track = new Track((Math.random() * 1e9) | 0);
  game.cart = createCart(game.track, game.stats, 200);
  game.run = { coins: 0, stall: 0, over: false, overTimer: 0, danger: 0, lastQuip: -10, maxX: 200 };
  game.time = 0;
  game.acc = 0;
  game.flash = 0;
  game.renderer.reset(game.cart);
  game.input.calibrate();
  game.say(pick(QUIPS.start), true);
}

export function distanceMeters(game) {
  return Math.max(0, (game.run.maxX - 200) / RUN.pxPerMeter);
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
    if (cart.crashed) break;
  }
  run.maxX = Math.max(run.maxX, cart.x);

  collect(game);

  const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : cart.v;
  run.danger = cart.air ? 1 : Math.min(1.2, liftRatio(track, cart.x, Math.max(0, speed)));
  if (!cart.air && run.danger > 0.85) game.say(pick(QUIPS.danger));
  if (cart.fuel / stats.tank < 0.2 && cart.fuel > 0) game.say(pick(QUIPS.lowFuel));

  if (cart.crashed) return endRun(game, cart.crashed);
  if (cart.fuel <= 0 && !cart.air && Math.abs(cart.v) < 15) {
    run.stall += dt;
    if (run.stall > RUN.stallSeconds) return endRun(game, 'fuel');
  } else run.stall = 0;
  return false;
}

function collect(game) {
  const { cart, track, run, stats, renderer } = game;
  const cy = cart.y + 35;
  for (let i = track.firstItemAt(cart.x - 70); i < track.items.length; i++) {
    const it = track.items[i];
    if (it.x > cart.x + 70) break;
    if (it.taken || Math.abs(it.y - cy) > 70) continue;
    it.taken = true;
    if (it.kind === 'coin') {
      run.coins += 1;
      renderer.burst(it.x, it.y, '#ffd23f', 5, 160);
    } else {
      cart.fuel = stats.tank;
      renderer.burst(it.x, it.y, '#72c95a', 12, 220);
      game.say(pick(QUIPS.fuel), true);
    }
  }
}

function onEvent(game, ev) {
  const { cart, renderer } = game;
  if (ev === 'airborne') game.say(pick(QUIPS.airborne));
  if (ev === 'boost') {
    renderer.burst(cart.x, cart.y + 20, '#ffb62e', 14, 300);
    game.say(pick(QUIPS.boost));
  }
  if (ev === 'landed' || ev === 'landed-clean') renderer.burst(cart.x, cart.y + 5, '#c9a27a', 10, 200);
  if (ev === 'landed-clean') {
    game.run.coins += 5;
    game.say(pick(QUIPS.landing), true);
  }
}

function endRun(game, reason) {
  const { run, cart, renderer } = game;
  run.over = true;
  run.reason = reason;
  if (reason !== 'fuel') {
    game.flash = 0.8;
    renderer.burst(cart.x, cart.y + 20, '#ff6b3d', 26, 420);
    if (!cart.air) { cart.vx = cart.v; cart.vy = 300; }
  }
  return false;
}
