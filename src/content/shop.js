// Shop items, paid in gems. grant() describes what the purchase adds to the save.

export const SHOP_TABS = ['featured', 'powerups', 'currency', 'skins'];

export const SHOP_ITEMS = [
  { id: 'doubler', tab: 'powerups', name: 'Coin Doubler', qty: '3 runs', img: 'shop/coin-doubler.webp', gems: 50, tag: 'HOT', featured: true,
    grant: { inventory: { doubler: 3 } } },
  { id: 'boosts', tab: 'powerups', name: 'Boost Refill', qty: 'x5', img: 'ui/boost.webp', gems: 40, featured: true,
    grant: { inventory: { boost: 5 } } },
  { id: 'shields', tab: 'powerups', name: 'Shield', qty: 'x3', img: 'ui/shield.webp', gems: 60, featured: true,
    grant: { inventory: { shield: 3 } } },
  { id: 'magnets', tab: 'powerups', name: 'Magnet', qty: 'x3', img: 'ui/magnet.webp', gems: 50, featured: true,
    grant: { inventory: { magnet: 3 } } },
  { id: 'coins-s', tab: 'currency', name: 'Pile of Coins', qty: '5,000', img: 'shop/coin-pile.webp', gems: 20, featured: true,
    grant: { coins: 5000 } },
  { id: 'coins-m', tab: 'currency', name: 'Sack of Coins', qty: '15,000', img: 'shop/coin-sack.webp', gems: 50, featured: true,
    grant: { coins: 15000 } },
  { id: 'coins-l', tab: 'currency', name: 'Chest of Coins', qty: '40,000', img: 'shop/coin-chest.webp', gems: 120, tag: 'BEST', featured: true,
    grant: { coins: 40000 } },
  { id: 'skins', tab: 'skins', name: 'Skin Bundle', qty: '2 paints', img: 'shop/skin-bundle.webp', gems: 150, featured: true, once: true,
    grant: { paints: ['black', 'gold'] } },
];

/** Gems are earned, never bought: daily rewards, missions and 3-star runs. */
export const GEMS_PER_THREE_STARS = 5;
