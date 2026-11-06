// Progression rules: stars, levels, daily rewards, missions, the event, purchases, leaderboard.
// Pure functions over the save object (they mutate it and return results). No DOM, so tests drive them.

import { mulberry32 } from '../engine/math.js';
import { CARTS, UPGRADES, upgradeCost } from '../content/carts.js';
import { WORLDS, isWorldUnlocked } from '../content/worlds.js';
import { COSMETICS, cosmeticById } from '../content/cosmetics.js';
import { DAILY_POOL, WEEKLY_POOL, ACHIEVEMENTS, DAILY_COUNT, WEEKLY_COUNT } from '../content/missions.js';
import { DAILY_REWARDS, EVENT, RIVALS } from '../content/rewards.js';
import { GEMS_PER_THREE_STARS } from '../content/shop.js';

// ---- dates (local time) ----

const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Key of the Monday that starts d's week. */
export const weekKey = (d) => dateKey(addDays(d, -((d.getDay() + 6) % 7)));

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// ---- stars and levels ----

export const STAR_METERS = [250, 600, 1000];
export const starsForRun = (m) => STAR_METERS.filter((t) => m >= t).length;
export const worldStars = (best) => Math.min(45, Math.floor(best / 100));
export const totalStars = (save) => WORLDS.reduce((n, w) => n + worldStars(save.worlds[w.id] || 0), 0);

export function levelInfo(save) {
  const xp = Math.floor(save.stats.distance);
  const level = 1 + Math.floor(Math.sqrt(xp / 60));
  const from = (level - 1) ** 2 * 60, to = level ** 2 * 60;
  return { level, xp, from, to, frac: (xp - from) / (to - from) };
}

export const frameFor = (level) => (level < 5 ? 'bronze' : level < 10 ? 'silver' : level < 20 ? 'gold' : 'legendary');

export const worldUnlocked = (save, world) => isWorldUnlocked(world, save.best);

// ---- grants ----

/** Apply a reward or purchase. Returns a short human description. */
export function applyGrant(save, g) {
  const parts = [];
  if (g.coins) { save.coins += g.coins; parts.push(`${g.coins.toLocaleString('en-US')} coins`); }
  if (g.gems) { save.gems += g.gems; parts.push(`${g.gems} gems`); }
  for (const [k, n] of Object.entries(g.inventory || {})) { save.inventory[k] += n; parts.push(`${k} x${n}`); }
  for (const id of g.paints || []) if (!save.cosmetics.owned.paint.includes(id)) save.cosmetics.owned.paint.push(id);
  if (g.paints) parts.push('new paints');
  if (g.paint && !save.cosmetics.owned.paint.includes(g.paint)) { save.cosmetics.owned.paint.push(g.paint); parts.push('new paint'); }
  if (g.cart) {
    if (save.owned.includes(g.cart)) { save.coins += g.coinsIfOwned || 0; parts.push(`${(g.coinsIfOwned || 0).toLocaleString('en-US')} coins`); }
    else { save.owned.push(g.cart); save.upgrades[g.cart] = { engine: 0, tank: 0, grip: 0 }; parts.push(CARTS.find((c) => c.id === g.cart).name); }
  }
  return parts.join(' + ');
}

// ---- daily rewards ----

export function dailyState(save, now = new Date()) {
  const today = dateKey(now), yesterday = dateKey(addDays(now, -1));
  if (save.daily.last === today) return { index: (save.daily.streak - 1) % 7, canClaim: false };
  if (save.daily.last === yesterday) return { index: save.daily.streak % 7, canClaim: true };
  return { index: 0, canClaim: true };
}

export function claimDaily(save, now = new Date()) {
  const st = dailyState(save, now);
  if (!st.canClaim) return null;
  const continuing = save.daily.last === dateKey(addDays(now, -1));
  save.daily.streak = continuing ? save.daily.streak + 1 : 1;
  save.daily.last = dateKey(now);
  return applyGrant(save, DAILY_REWARDS[st.index].grant);
}

// ---- missions ----

function pickMissions(pool, count, key) {
  const rng = mulberry32(hashString(key));
  const list = pool.slice();
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, count);
}

/** Reset daily/weekly counters when the period changes. */
export function rollPeriods(save, now = new Date()) {
  const d = dateKey(now), w = weekKey(now);
  if (save.missions.daily.key !== d) save.missions.daily = { key: d, counters: {}, claimed: [] };
  if (save.missions.weekly.key !== w) save.missions.weekly = { key: w, counters: {}, claimed: [] };
}

export function missionList(save, scope, now = new Date()) {
  rollPeriods(save, now);
  if (scope === 'daily') return pickMissions(DAILY_POOL, DAILY_COUNT, `d${save.missions.daily.key}`);
  if (scope === 'weekly') return pickMissions(WEEKLY_POOL, WEEKLY_COUNT, `w${save.missions.weekly.key}`);
  return ACHIEVEMENTS;
}

export function missionProgress(save, scope, m) {
  if (scope === 'ach') {
    if (m.stat === 'best') return save.best;
    if (m.stat === 'carts') return save.owned.length;
    return save.stats[m.stat] || 0;
  }
  return save.missions[scope].counters[m.stat] || 0;
}

export function claimMission(save, scope, id, now = new Date()) {
  const m = missionList(save, scope, now).find((x) => x.id === id);
  const claimed = save.missions[scope].claimed;
  if (!m || claimed.includes(id) || missionProgress(save, scope, m) < m.target) return null;
  claimed.push(id);
  return applyGrant(save, m.reward);
}

export const claimableCount = (save, now = new Date()) =>
  ['daily', 'weekly', 'ach'].reduce(
    (n, s) => n + missionList(save, s, now).filter((m) => !save.missions[s].claimed.includes(m.id) && missionProgress(save, s, m) >= m.target).length,
    0,
  );

// ---- end of run ----

/**
 * Fold a finished run into the save. summary = { world, distance (m), coins, boosts, airtime,
 * cleanLandings, fuelCans, derailed, reason }. Returns what the results screen shows.
 */
export function recordRun(save, summary, now = new Date()) {
  rollPeriods(save, now);
  const m = Math.floor(summary.distance);
  const doubled = save.inventory.doubler > 0;
  if (doubled) save.inventory.doubler -= 1;
  const coins = (summary.coins + Math.floor(m / 10)) * (doubled ? 2 : 1);
  const stars = starsForRun(m);
  const worldBest = save.worlds[summary.world] || 0;
  const newBest = m > save.best;
  let gems = 0;
  if (stars === 3 && worldBest < STAR_METERS[2]) gems = GEMS_PER_THREE_STARS; // first 3-star run per world

  save.coins += coins;
  save.gems += gems;
  save.best = Math.max(save.best, m);
  save.worlds[summary.world] = Math.max(worldBest, m);

  const add = { runs: 1, distance: m, derails: summary.derailed ? 1 : 0, coins: summary.coins, airtime: summary.airtime,
    cleanLandings: summary.cleanLandings, boosts: summary.boosts, fuelCans: summary.fuelCans };
  for (const [k, v] of Object.entries(add)) save.stats[k] += v;
  for (const scope of ['daily', 'weekly']) {
    const c = save.missions[scope].counters;
    for (const [k, v] of Object.entries(add)) c[k] = k === 'distance' ? Math.max(c[k] || 0, v) : (c[k] || 0) + v;
  }

  let eventStep = false;
  if (summary.world === EVENT.world && m >= EVENT.runMeters && save.event.progress < EVENT.goal) {
    save.event.progress += 1;
    eventStep = true;
  }
  return { meters: m, coins, gems, stars, newBest, doubled, eventStep };
}

// ---- event ----

/** The event runs in weekly cycles ending next Monday 00:00 local. */
export function eventEndsIn(now = new Date()) {
  const end = addDays(now, 7 - ((now.getDay() + 6) % 7));
  const ms = end - now;
  return { days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) };
}

export function claimEvent(save) {
  if (save.event.claimed || save.event.progress < EVENT.goal) return null;
  save.event.claimed = true;
  return applyGrant(save, EVENT.reward);
}

// ---- spending ----

export function buyCart(save, id) {
  const c = CARTS.find((x) => x.id === id);
  if (!c || save.owned.includes(id) || save.coins < c.price) return false;
  save.coins -= c.price;
  save.owned.push(id);
  save.upgrades[id] = { engine: 0, tank: 0, grip: 0 };
  save.selected = id;
  return true;
}

export function buyUpgrade(save, key) {
  const levels = save.upgrades[save.selected];
  const lvl = levels[key] || 0;
  if (lvl >= UPGRADES[key].maxLevel) return false;
  const cost = upgradeCost(key, lvl);
  if (save.coins < cost) return false;
  save.coins -= cost;
  levels[key] = lvl + 1;
  return true;
}

export function buyShopItem(save, item) {
  if (save.gems < item.gems) return null;
  if (item.once && save.shop.bought.includes(item.id)) return null;
  save.gems -= item.gems;
  if (item.once) save.shop.bought.push(item.id);
  return applyGrant(save, item.grant);
}

/** Buy (if needed) and equip a cosmetic. Shop/event items can't be bought with coins. */
export function equipCosmetic(save, kind, id) {
  const item = cosmeticById(kind, id);
  const owned = save.cosmetics.owned[kind];
  if (!owned.includes(id)) {
    if (item.source || save.coins < item.price) return false;
    save.coins -= item.price;
    owned.push(id);
  }
  save.cosmetics.equipped[kind] = id;
  return true;
}

export const cosmeticKinds = Object.keys(COSMETICS);

// ---- leaderboard (offline rivals + you) ----

export function leaderboard(save, tab) {
  const score = tab === 'weekly' ? save.missions.weekly.counters.distance || 0 : save.best;
  const rows = [...RIVALS[tab].map((r) => ({ ...r })), { name: `${save.name} (You)`, avatar: 'dave', score, me: true }];
  rows.sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => (r.rank = i + 1));
  const me = rows.find((r) => r.me);
  // Five rows: the top five if you're in them, else the top four plus you.
  return { rows: me.rank <= 5 ? rows.slice(0, 5) : [...rows.filter((r) => !r.me).slice(0, 4), me], me };
}

// ---- daily challenge ----

export function challengeFor(now = new Date()) {
  const key = dateKey(now);
  const h = hashString(`challenge${key}`);
  const pool = WORLDS.filter((w) => w.unlock === 0);
  return { key, seed: h, world: pool[h % pool.length].id };
}
