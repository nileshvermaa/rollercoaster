// Customization: paint (a colour filter over the cart art), boost trails and wheel skins.
// price in coins; source: 'shop' items unlock through the skin bundle, 'event' through the event.

export const PAINTS = [
  { id: 'red', name: 'Factory Red', swatch: ['#ff5a4e', '#b3120f'], filter: 'none', price: 0 },
  { id: 'yellow', name: 'Taxi Yellow', swatch: ['#ffe68a', '#f0a000'], filter: 'hue-rotate(45deg) saturate(1.3)', price: 500 },
  { id: 'blue', name: 'Series B Blue', swatch: ['#8ed0ff', '#1f76d2'], filter: 'hue-rotate(200deg) saturate(1.2)', price: 500 },
  { id: 'purple', name: 'Synergy Purple', swatch: ['#c69cf0', '#6e3fb7'], filter: 'hue-rotate(260deg)', price: 800 },
  { id: 'green', name: 'Growth Green', swatch: ['#b6f59a', '#3e9a30'], filter: 'hue-rotate(110deg) saturate(1.1)', price: 800 },
  { id: 'black', name: 'Stealth Mode', swatch: ['#4a4d57', '#16171c'], filter: 'grayscale(1) brightness(0.45)', price: 0, source: 'shop' },
  { id: 'gold', name: 'Golden Hour', swatch: ['#ffe68a', '#c77800'], filter: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.05)', price: 0, source: 'shop' },
  { id: 'neon', name: 'Neon Carnival', swatch: ['#ff8af0', '#7a1fb3'], filter: 'hue-rotate(290deg) saturate(2) brightness(1.1)', price: 0, source: 'event' },
];

export const TRAILS = [
  { id: 'none', name: 'No trail', img: null, price: 0 },
  { id: 'fire', name: 'Fire', img: 'trails/fire.webp', price: 1500 },
  { id: 'ice', name: 'Ice', img: 'trails/ice.webp', price: 1500 },
  { id: 'rainbow', name: 'Rainbow', img: 'trails/rainbow.webp', price: 2500 },
  { id: 'electric', name: 'Electric', img: 'trails/electric.webp', price: 4000 },
];

export const WHEELS = [
  { id: 'classic', name: 'Classic', img: 'carts/coaster-wheel.webp', price: 0 },
  { id: 'gold', name: 'Gold', img: 'wheels/gold.webp', price: 1000 },
  { id: 'neon', name: 'Neon', img: 'wheels/neon.webp', price: 1000 },
  { id: 'wood', name: 'Wood', img: 'wheels/wood.webp', price: 800 },
  { id: 'spiked', name: 'Spiked', img: 'wheels/spiked.webp', price: 2000 },
];

export const COSMETICS = { paint: PAINTS, trail: TRAILS, wheel: WHEELS };

export const cosmeticById = (kind, id) => COSMETICS[kind].find((c) => c.id === id) || COSMETICS[kind][0];
