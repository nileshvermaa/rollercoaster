// Persistent progress in localStorage. Every read is validated and merged over defaults, so a
// corrupt or old save never breaks the game; storage failures (private mode) are ignored.

import { CARTS, UPGRADES } from '../content/carts.js';

const KEY = 'off-the-rails.save.v1';

export function defaultSave() {
  return {
    coins: 0,
    best: 0,
    owned: ['basic'],
    selected: 'basic',
    upgrades: {},
    settings: { tilt: true, sound: true },
  };
}

const isCart = (id) => CARTS.some((c) => c.id === id);
const num = (v, d) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : d);

/** Parse a stored string into a valid save. Never throws. */
export function parseSave(raw) {
  const d = defaultSave();
  let o;
  try {
    o = JSON.parse(raw);
  } catch {
    return d;
  }
  if (!o || typeof o !== 'object') return d;
  const owned = Array.isArray(o.owned) ? o.owned.filter(isCart) : [];
  if (!owned.includes('basic')) owned.unshift('basic');
  const upgrades = {};
  for (const id of owned) {
    const src = (o.upgrades && o.upgrades[id]) || {};
    upgrades[id] = {};
    for (const k of Object.keys(UPGRADES)) upgrades[id][k] = Math.min(num(src[k], 0), UPGRADES[k].maxLevel);
  }
  return {
    coins: num(o.coins, 0),
    best: num(o.best, 0),
    owned,
    selected: owned.includes(o.selected) ? o.selected : 'basic',
    upgrades,
    settings: {
      tilt: o.settings?.tilt !== false,
      sound: o.settings?.sound !== false,
    },
  };
}

export function loadSave() {
  try {
    return parseSave(localStorage.getItem(KEY));
  } catch {
    return defaultSave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {}
}
