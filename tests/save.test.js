import { describe, it, expect } from 'vitest';
import { parseSave, defaultSave } from '../src/game/save.js';
import { cartStats, upgradeCost, CARTS } from '../src/content/carts.js';

describe('save data', () => {
  it('falls back to defaults on garbage', () => {
    expect(parseSave('not json')).toEqual(defaultSave());
    expect(parseSave(null)).toEqual(defaultSave());
    expect(parseSave('42')).toEqual(defaultSave());
  });

  it('drops unknown carts, clamps upgrades and keeps the basic cart', () => {
    const s = parseSave(JSON.stringify({
      coins: 500, best: -3, owned: ['steel', 'hoverboard'], selected: 'hoverboard',
      upgrades: { steel: { engine: 99, tank: 'x' } },
    }));
    expect(s.owned).toEqual(['basic', 'steel']);
    expect(s.selected).toBe('basic');
    expect(s.best).toBe(0);
    expect(s.coins).toBe(500);
    expect(s.upgrades.steel).toEqual({ engine: 5, tank: 0, grip: 0 });
  });
});

describe('carts', () => {
  it('upgrades raise stats and get pricier', () => {
    expect(cartStats('basic', { engine: 3 }).engine).toBeGreaterThan(cartStats('basic').engine);
    expect(upgradeCost('engine', 2)).toBeGreaterThan(upgradeCost('engine', 1));
  });

  it('prices rise along the garage', () => {
    for (let i = 1; i < CARTS.length; i++) expect(CARTS[i].price).toBeGreaterThan(CARTS[i - 1].price);
  });
});
