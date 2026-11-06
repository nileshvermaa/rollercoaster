import { describe, it, expect } from 'vitest';
import { defaultSave, parseSave } from '../src/game/save.js';
import {
  dailyState, claimDaily, missionList, claimMission, missionProgress, recordRun, starsForRun,
  buyShopItem, equipCosmetic, leaderboard, claimEvent, levelInfo, weekKey, dateKey, buyCart,
} from '../src/game/progress.js';
import { SHOP_ITEMS } from '../src/content/shop.js';
import { EVENT } from '../src/content/rewards.js';

const day = (y, m, d) => new Date(y, m - 1, d, 12);
const run = (o = {}) => ({ world: 'park', distance: 300, coins: 10, boosts: 1, airtime: 2, cleanLandings: 1, fuelCans: 1, derailed: true, ...o });

describe('daily rewards', () => {
  it('advances on consecutive days, blocks a second claim, resets after a missed day', () => {
    const s = defaultSave();
    expect(dailyState(s, day(2026, 11, 2))).toEqual({ index: 0, canClaim: true });
    claimDaily(s, day(2026, 11, 2));
    expect(s.coins).toBe(1000);
    expect(claimDaily(s, day(2026, 11, 2))).toBeNull();
    claimDaily(s, day(2026, 11, 3));
    expect(s.gems).toBe(50);
    expect(dailyState(s, day(2026, 11, 4)).index).toBe(2);
    expect(dailyState(s, day(2026, 11, 6))).toEqual({ index: 0, canClaim: true });
  });

  it('day 7 gives the Golden Cart, or coins if already owned', () => {
    const s = defaultSave();
    for (let i = 0; i < 7; i++) claimDaily(s, day(2026, 11, 2 + i));
    expect(s.owned).toContain('golden');
    const coins = s.coins;
    for (let i = 7; i < 14; i++) claimDaily(s, day(2026, 11, 2 + i));
    expect(s.coins).toBeGreaterThan(coins + 10000);
  });
});

describe('missions', () => {
  it('picks a stable daily list per date and tracks run counters', () => {
    const s = defaultSave();
    const now = day(2026, 11, 6);
    const a = missionList(s, 'daily', now).map((m) => m.id);
    expect(a).toEqual(missionList(s, 'daily', now).map((m) => m.id));
    expect(a).toHaveLength(5);
    recordRun(s, run({ distance: 1200, coins: 60 }), now);
    recordRun(s, run({ distance: 400, coins: 60 }), now);
    expect(s.missions.daily.counters.distance).toBe(1200); // max, not sum
    expect(s.missions.daily.counters.coins).toBe(120);
  });

  it('claims a finished mission exactly once', () => {
    const s = defaultSave();
    const now = day(2026, 11, 6);
    recordRun(s, run({ distance: 5000, coins: 2000, boosts: 50, airtime: 200, cleanLandings: 50, fuelCans: 50 }), now);
    const m = missionList(s, 'daily', now)[0];
    expect(missionProgress(s, 'daily', m)).toBeGreaterThanOrEqual(m.target);
    expect(claimMission(s, 'daily', m.id, now)).toBeTruthy();
    expect(claimMission(s, 'daily', m.id, now)).toBeNull();
  });

  it('resets daily counters on a new day', () => {
    const s = defaultSave();
    recordRun(s, run(), day(2026, 11, 6));
    missionList(s, 'daily', day(2026, 11, 7));
    expect(s.missions.daily.counters).toEqual({});
    expect(weekKey(day(2026, 11, 8))).toBe(dateKey(day(2026, 11, 2))); // Sunday belongs to Monday's week
  });
});

describe('runs, stars and events', () => {
  it('awards stars, coins, a first-time 3-star gem bonus and best distance', () => {
    const s = defaultSave();
    expect(starsForRun(249)).toBe(0);
    expect(starsForRun(1000)).toBe(3);
    const r = recordRun(s, run({ distance: 1100, coins: 20 }));
    expect(r.stars).toBe(3);
    expect(r.gems).toBeGreaterThan(0);
    expect(s.best).toBe(1100);
    expect(s.coins).toBe(20 + 110);
    expect(recordRun(s, run({ distance: 1200 })).gems).toBe(0);
  });

  it('coin doubler doubles and is used up', () => {
    const s = defaultSave();
    s.inventory.doubler = 1;
    expect(recordRun(s, run({ distance: 100, coins: 10 })).coins).toBe(40);
    expect(s.inventory.doubler).toBe(0);
  });

  it('event fills from long runs in its world and pays out once', () => {
    const s = defaultSave();
    for (let i = 0; i < EVENT.goal; i++) recordRun(s, run({ world: EVENT.world, distance: EVENT.runMeters }));
    recordRun(s, run({ world: 'park', distance: 2000 }));
    expect(s.event.progress).toBe(EVENT.goal);
    expect(claimEvent(s)).toBeTruthy();
    expect(s.cosmetics.owned.paint).toContain('neon');
    expect(claimEvent(s)).toBeNull();
  });

  it('levels rise with lifetime distance', () => {
    const s = defaultSave();
    expect(levelInfo(s).level).toBe(1);
    s.stats.distance = 6000;
    expect(levelInfo(s).level).toBe(11);
  });
});

describe('spending', () => {
  it('shop items cost gems, once-only items stay once', () => {
    const s = defaultSave();
    s.gems = 1000;
    const bundle = SHOP_ITEMS.find((i) => i.once);
    expect(buyShopItem(s, bundle)).toBeTruthy();
    expect(buyShopItem(s, bundle)).toBeNull();
    const shield = SHOP_ITEMS.find((i) => i.id === 'shields');
    buyShopItem(s, shield);
    expect(s.inventory.shield).toBe(3);
    s.gems = 0;
    expect(buyShopItem(s, shield)).toBeNull();
  });

  it('cosmetics: coin items buy then equip, event items cannot be bought', () => {
    const s = defaultSave();
    s.coins = 600;
    expect(equipCosmetic(s, 'paint', 'yellow')).toBe(true);
    expect(s.cosmetics.equipped.paint).toBe('yellow');
    expect(equipCosmetic(s, 'paint', 'neon')).toBe(false);
    expect(equipCosmetic(s, 'trail', 'fire')).toBe(false); // can't afford
  });

  it('carts need enough coins', () => {
    const s = defaultSave();
    expect(buyCart(s, 'wooden')).toBe(false);
    s.coins = 2500;
    expect(buyCart(s, 'wooden')).toBe(true);
    expect(s.selected).toBe('wooden');
  });
});

describe('leaderboard', () => {
  it('ranks you among rivals', () => {
    const s = defaultSave();
    s.best = 100;
    const lb = leaderboard(s, 'global');
    expect(lb.rows).toHaveLength(5);
    expect(lb.rows[4].me).toBe(true);
    s.best = 99999;
    expect(leaderboard(s, 'global').rows[0].me).toBe(true);
  });
});

describe('save v2 parsing', () => {
  it('keeps valid new fields and repairs bad ones', () => {
    const s = parseSave(JSON.stringify({
      gems: 40, world: 'snow', inventory: { shield: 2, magnet: -1 },
      cosmetics: { owned: { paint: ['red', 'blue', 'fake'] }, equipped: { paint: 'blue', trail: 'fire' } },
      settings: { graphics: 'low', vibration: false }, name: 'x'.repeat(50),
    }));
    expect(s.gems).toBe(40);
    expect(s.world).toBe('snow');
    expect(s.inventory).toEqual({ boost: 0, shield: 2, magnet: 0, doubler: 0 });
    expect(s.cosmetics.owned.paint).toEqual(['red', 'blue']);
    expect(s.cosmetics.equipped).toEqual({ paint: 'blue', trail: 'none', wheel: 'classic' });
    expect(s.settings.graphics).toBe('low');
    expect(s.settings.vibration).toBe(false);
    expect(s.name).toBe('Dave_34');
  });
});
