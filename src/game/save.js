// Persistent progress in localStorage. Every read is validated field by field and merged over
// defaults, so a corrupt, old or tampered save never breaks the game. Storage failures
// (private mode, quota) are ignored.

import { CARTS, UPGRADES } from '../content/carts.js';
import { WORLDS } from '../content/worlds.js';
import { COSMETICS } from '../content/cosmetics.js';

const KEY = 'off-the-rails.save.v1';
const STAT_KEYS = ['runs', 'distance', 'derails', 'coins', 'airtime', 'cleanLandings', 'boosts', 'fuelCans'];
const INVENTORY_KEYS = ['boost', 'shield', 'magnet', 'doubler'];

export function defaultSave() {
  return {
    name: 'Dave_34',
    coins: 0,
    gems: 0,
    best: 0,
    owned: ['basic'],
    selected: 'basic',
    upgrades: { basic: { engine: 0, tank: 0, grip: 0 } },
    cosmetics: {
      owned: { paint: ['red'], trail: ['none'], wheel: ['classic'] },
      equipped: { paint: 'red', trail: 'none', wheel: 'classic' },
    },
    inventory: { boost: 0, shield: 0, magnet: 0, doubler: 0 },
    world: 'park',
    worlds: Object.fromEntries(WORLDS.map((w) => [w.id, 0])),
    stats: Object.fromEntries(STAT_KEYS.map((k) => [k, 0])),
    daily: { last: '', streak: 0 },
    missions: {
      daily: { key: '', counters: {}, claimed: [] },
      weekly: { key: '', counters: {}, claimed: [] },
      ach: { claimed: [] },
    },
    event: { progress: 0, claimed: false },
    shop: { bought: [] },
    settings: { tilt: true, music: true, sfx: true, vibration: true, graphics: 'high', language: 'en' },
  };
}

const isCart = (id) => CARTS.some((c) => c.id === id);
const num = (v, d = 0) => (Number.isFinite(v) && v >= 0 ? v : d);
const int = (v, d = 0) => Math.floor(num(v, d));
const str = (v, d, max = 40) => (typeof v === 'string' && v.length <= max ? v : d);
const strList = (v, allowed) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && (!allowed || allowed.includes(x))))] : []);
const bool = (v, d) => (typeof v === 'boolean' ? v : d);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function counters(v) {
  const out = {};
  for (const [k, n] of Object.entries(obj(v))) if (k.length < 30 && Number.isFinite(n) && n >= 0) out[k] = n;
  return out;
}

/** Parse a stored string into a valid save. Never throws. */
export function parseSave(raw) {
  const d = defaultSave();
  let o;
  try {
    o = JSON.parse(raw);
  } catch {
    return d;
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return d;

  const owned = strList(o.owned).filter(isCart);
  if (!owned.includes('basic')) owned.unshift('basic');
  const upgrades = {};
  for (const id of owned) {
    const src = obj(obj(o.upgrades)[id]);
    upgrades[id] = {};
    for (const k of Object.keys(UPGRADES)) upgrades[id][k] = Math.min(int(src[k]), UPGRADES[k].maxLevel);
  }

  const cos = obj(o.cosmetics);
  const cosOwned = {}, equipped = {};
  for (const kind of Object.keys(COSMETICS)) {
    const ids = COSMETICS[kind].map((c) => c.id);
    const list = strList(obj(cos.owned)[kind], ids);
    if (!list.includes(ids[0])) list.unshift(ids[0]);
    cosOwned[kind] = list;
    const eq = obj(cos.equipped)[kind];
    equipped[kind] = list.includes(eq) ? eq : ids[0];
  }

  const inv = obj(o.inventory), stats = obj(o.stats), worlds = obj(o.worlds), daily = obj(o.daily);
  const ms = obj(o.missions), ev = obj(o.event), set = obj(o.settings);
  const period = (p) => ({ key: str(obj(p).key, '', 12), counters: counters(obj(p).counters), claimed: strList(obj(p).claimed) });

  return {
    name: str(o.name, d.name, 16).trim() || d.name,
    coins: int(o.coins),
    gems: int(o.gems),
    best: int(o.best),
    owned,
    selected: owned.includes(o.selected) ? o.selected : 'basic',
    upgrades,
    cosmetics: { owned: cosOwned, equipped },
    inventory: Object.fromEntries(INVENTORY_KEYS.map((k) => [k, int(inv[k])])),
    world: WORLDS.some((w) => w.id === o.world) ? o.world : 'park',
    worlds: Object.fromEntries(WORLDS.map((w) => [w.id, int(worlds[w.id])])),
    stats: Object.fromEntries(STAT_KEYS.map((k) => [k, num(stats[k])])),
    daily: { last: str(daily.last, '', 10), streak: int(daily.streak) },
    missions: { daily: period(ms.daily), weekly: period(ms.weekly), ach: { claimed: strList(obj(ms.ach).claimed) } },
    event: { progress: int(ev.progress), claimed: bool(ev.claimed, false) },
    shop: { bought: strList(obj(o.shop).bought) },
    settings: {
      tilt: bool(set.tilt, true),
      music: bool(set.music, true),
      sfx: bool(set.sfx, true),
      vibration: bool(set.vibration, true),
      graphics: set.graphics === 'low' ? 'low' : 'high',
      language: 'en',
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
