// Updates the DOM heads-up display from the run state once per frame.

import { $, fmt } from '../dom.js';
import { distanceMeters } from './run.js';
import { clamp } from '../../engine/math.js';

const last = {};
function set(id, text) {
  if (last[id] === text) return;
  last[id] = text;
  $(id).textContent = text;
}

export function updateHud(game) {
  const { cart, run, stats, save } = game;
  const m = distanceMeters(game);
  const target = Math.max(save.worlds[game.world.id] || 0, 100);
  set('hud-dist', `${fmt(m)} m`);
  set('hud-best', `${fmt(target)} m`);
  $('dist-fill').style.width = `${clamp((m / target) * 100, 0, 100)}%`;
  $('dist-crown').style.left = m > target ? '100%' : `${(target / Math.max(target, m)) * 100}%`;
  set('hud-coins', fmt(run.coins));

  const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : Math.abs(cart.v);
  needle('needle-speed', -120 + clamp(speed / 1500, 0, 1) * 240);
  needle('needle-fuel', -75 + clamp(cart.fuel / stats.tank, 0, 1) * 150);
  needle('needle-danger', -120 + clamp(run.danger / 1.15, 0, 1) * 240);

  const inv = save.inventory;
  set('pu-boost-n', String(inv.boost));
  set('pu-magnet-n', String(inv.magnet));
  $('pu-boost').disabled = inv.boost <= 0 || run.over;
  $('pu-magnet').disabled = (inv.magnet <= 0 && run.magnet <= 0) || run.over;
  $('pu-magnet').classList.toggle('active', run.magnet > 0);
  $('hud-shield').classList.toggle('hidden', inv.shield <= 0 || run.shieldUsed);
  $('hud-doubler').classList.toggle('hidden', inv.doubler <= 0);
}

function needle(id, deg) {
  const d = deg.toFixed(1);
  if (last[id] === d) return;
  last[id] = d;
  $(id).style.transform = `rotate(${d}deg)`;
}
