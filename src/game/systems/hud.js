// Updates the DOM heads-up display from the run state once per frame.

import { $, fmt } from '../dom.js';
import { distanceMeters } from './run.js';
import { clamp } from '../../engine/math.js';

export function updateHud(game) {
  const { cart, run, stats, save } = game;
  const m = distanceMeters(game);
  const target = Math.max(save.best, 100);
  $('hud-dist').textContent = `${fmt(m)} m`;
  $('hud-best').textContent = `BEST ${fmt(save.best)} m`;
  $('dist-fill').style.width = `${clamp((m / target) * 100, 0, 100)}%`;
  $('dist-crown').style.left = m > target ? '100%' : `${(target / Math.max(target, m)) * 100}%`;
  $('hud-coins').textContent = fmt(save.coins + run.coins);

  const fuel = clamp(cart.fuel / stats.tank, 0, 1);
  const fill = $('fuel-fill');
  fill.style.width = `${fuel * 100}%`;
  fill.classList.toggle('low', fuel < 0.2);

  const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : Math.abs(cart.v);
  needle('needle-speed', clamp(speed / 1500, 0, 1));
  needle('needle-danger', clamp(run.danger / 1.15, 0, 1));
}

function needle(id, t) {
  $(id).style.transform = `rotate(${-90 + t * 180}deg)`;
}
