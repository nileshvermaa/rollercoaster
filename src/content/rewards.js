// Daily login calendar, the limited event, and the local leaderboard rivals.

export const DAILY_REWARDS = [
  { label: '1,000', icon: 'coins', grant: { coins: 1000 } },
  { label: '50', icon: 'gem', grant: { gems: 50 } },
  { label: 'x3', icon: 'boost', grant: { inventory: { boost: 3 } } },
  { label: '2,000', img: 'shop/coin-sack.webp', grant: { coins: 2000 } },
  { label: '100', icon: 'gem', grant: { gems: 100 } },
  { label: 'x3', icon: 'magnet', grant: { inventory: { magnet: 3 } } },
  { label: 'Golden Cart', img: 'rewards/day7-cart.webp', grant: { cart: 'golden', coinsIfOwned: 10000 }, big: true },
];

export const EVENT = {
  id: 'night-carnival',
  name: 'Night Carnival',
  world: 'night',
  blurb: 'Complete special neon runs to win exclusive rewards. Lights are on, safety inspections are off.',
  goal: 10, // runs of at least `runMeters` in the night world
  runMeters: 500,
  reward: { paint: 'neon' },
  rewardName: 'Neon Cart skin',
};

/** Offline leaderboard: the cast as rivals. Scores are best distances in metres. */
export const RIVALS = {
  global: [
    { name: 'xX_HODL_Xx', avatar: 'cryptobro', score: 12450 },
    { name: 'live_laugh_loop', avatar: 'influencer', score: 11983 },
    { name: 'Nana_NoBrakes', avatar: 'grandma', score: 11328 },
    { name: 'HONK', avatar: 'goose', score: 9884 },
    { name: 'KAREN-9000', avatar: 'karen9000', score: 7200 },
  ],
  friends: [
    { name: 'Nana_NoBrakes', avatar: 'grandma', score: 2140 },
    { name: 'HONK', avatar: 'goose', score: 1310 },
    { name: 'live_laugh_loop', avatar: 'influencer', score: 880 },
  ],
  weekly: [
    { name: 'HONK', avatar: 'goose', score: 3120 },
    { name: 'xX_HODL_Xx', avatar: 'cryptobro', score: 2875 },
    { name: 'KAREN-9000', avatar: 'karen9000', score: 1990 },
  ],
};

export const TIPS = [
  "TIP: Brake before the crest. Dave's insurance does not cover airtime.",
  'TIP: Yellow chevrons always give enough speed for the gap after them.',
  'TIP: In the air, gas tips the nose down and brake tips it up.',
  'TIP: Out of CRANK™ and stopped means the ride is over.',
  'TIP: Shields save you from one bad landing. Karen still files the report.',
];
