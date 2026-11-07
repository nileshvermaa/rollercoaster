// The carts, their stats and the garage upgrades.
// engine: px/s² of push at full throttle · tank: fuel units · burn: fuel/s at full throttle
// grip: max landing angle mismatch in degrees before derailing · spin: mid-air rotation rad/s
// seat: [x, rim] where the front rider sits in the art, as fractions of its width / height
//   (x = centre of the gap in front of a seat back, rim = top of the side panel there)

export const CARTS = [
  { id: 'basic', name: 'Budget Bucket', blurb: 'Held together by vibes.', img: 'carts/basic.webp', price: 0,
    engine: 720, tank: 100, burn: 7, grip: 38, spin: 1.1, seat: [0.585, 0.31] },
  { id: 'wooden', name: 'Seed Round', blurb: 'Wood. Stable-ish.', img: 'carts/wooden.webp', price: 2500,
    engine: 740, tank: 135, burn: 7, grip: 44, spin: 1.0, seat: [0.66, 0.21] },
  { id: 'steel', name: 'Series B', blurb: 'Steel. Faster. Burns cash.', img: 'carts/steel.webp', price: 6000,
    engine: 840, tank: 110, burn: 8, grip: 38, spin: 1.3, seat: [0.6, 0.2] },
  { id: 'rocket', name: 'IPO Rocket', blurb: 'Goes up. Mostly.', img: 'carts/rocket.webp', price: 12000,
    engine: 980, tank: 100, burn: 10, grip: 36, spin: 1.4, seat: [0.465, 0.22] },
  { id: 'golden', name: 'Golden Parachute', blurb: 'Lands soft. Always.', img: 'carts/golden.webp', price: 25000,
    engine: 880, tank: 150, burn: 7, grip: 50, spin: 1.2, seat: [0.31, 0.27] },
  { id: 'dragon', name: 'Dragon Cart', blurb: 'HR has concerns.', img: 'carts/dragon.webp', price: 40000,
    engine: 1040, tank: 140, burn: 8, grip: 48, spin: 1.5, seat: [0.3, 0.36] },
];

export const UPGRADES = {
  engine: { label: 'Engine', maxLevel: 5, baseCost: 400, apply: (s, l) => ({ ...s, engine: s.engine * (1 + 0.07 * l) }) },
  tank: { label: 'Fuel tank', maxLevel: 5, baseCost: 300, apply: (s, l) => ({ ...s, tank: s.tank * (1 + 0.15 * l) }) },
  grip: { label: 'Rail clamps', maxLevel: 5, baseCost: 500, apply: (s, l) => ({ ...s, grip: s.grip + 3 * l }) },
};

export const cartById = (id) => CARTS.find((c) => c.id === id) || CARTS[0];

export function upgradeCost(key, level) {
  return Math.round(UPGRADES[key].baseCost * Math.pow(level + 1, 1.6));
}

/** Final stats for a cart with its upgrade levels applied. */
export function cartStats(id, levels = {}) {
  let s = { ...cartById(id) };
  for (const key of Object.keys(UPGRADES)) s = UPGRADES[key].apply(s, levels[key] || 0);
  return s;
}
