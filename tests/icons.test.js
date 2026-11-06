import { describe, it, expect } from 'vitest';
import { iconMarkup, hasIcon } from '../src/ui/icons.js';

const NAMES = ['coin', 'gem', 'fuel', 'boost', 'shield', 'magnet', 'hourglass', 'trophy', 'star', 'star-empty', 'lock',
  'gift', 'flag', 'coins', 'loop', 'crash', 'doubler', 'timer', 'gear', 'music', 'sfx', 'vibrate', 'tilt', 'graphics',
  'language', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-legendary', 'medal-1', 'medal-2', 'medal-3'];

describe('vector icons', () => {
  it('has every icon the UI asks for', () => {
    for (const n of NAMES) expect(hasIcon(n)).toBe(true);
  });

  it('gives each rendered copy its own gradient ids, so two icons on one page never clash', () => {
    const a = iconMarkup('coin'), b = iconMarkup('coin');
    const ids = (s) => [...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids(a).length).toBeGreaterThan(0);
    expect(ids(a).some((id) => ids(b).includes(id))).toBe(false);
    for (const id of ids(a)) expect(a).toContain(`url(#${id})`);
  });

  it('produces standalone SVG markup', () => {
    for (const n of NAMES) {
      const s = iconMarkup(n, 64);
      expect(s.startsWith('<svg')).toBe(true);
      expect(s).toContain('viewBox="0 0 100 100"');
      expect(s.endsWith('</svg>')).toBe(true);
    }
  });
});
