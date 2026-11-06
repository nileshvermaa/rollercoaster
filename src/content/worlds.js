// The six worlds from the design board: art, rail colours, physics quirks and how to unlock them.
// unlock: best distance (m) needed in any world · hills: extra difficulty from the start (0..1)
// rolling / brake: multipliers on rolling resistance and braking (ice is slippery, sand drags)

export const WORLDS = [
  {
    id: 'park', name: 'Wobbleton Park', card: 'cards/park.webp', unlock: 0, hills: 0,
    layers: { sky: 'bg/park-sky.webp', far: 'bg/park-far.webp', mid: 'bg/park-mid.webp', near: 'bg/park-near.webp' },
    clean: true, // park layers are true cut-outs; the others are painted cells we fade in
    sky: ['#5b3f9a', '#f48e7a'], ground: ['#8b5a2b', '#4a2c12'], grass: ['#3e8a2a', '#72c95a'],
    rail: ['#b3200f', '#e8452a'], bulb: '#fff2b0', wood: ['#b8733a', '#a8662e'],
  },
  {
    id: 'night', name: 'Night Carnival', card: 'cards/night.webp', unlock: 0, hills: 0.1,
    layers: { sky: 'bg/night-sky.webp', far: 'bg/night-far.webp', mid: 'bg/night-mid.webp', near: 'bg/night-near.webp' },
    sky: ['#14103a', '#5b2aa0'], ground: ['#2a1f4a', '#120d2e'], grass: ['#1f3a3a', '#3fd3c9'],
    rail: ['#7a1fb3', '#ff4fd8'], bulb: '#ffd6ff', wood: ['#5a3a7a', '#43285c'],
  },
  {
    id: 'mountain', name: 'Mountain Resort', card: 'cards/mountain.webp', unlock: 0, hills: 0.2,
    layers: { sky: 'bg/mountain-sky.webp', far: 'bg/mountain-far.webp', mid: 'bg/mountain-mid.webp', near: 'bg/mountain-near.webp' },
    sky: ['#3f8fe0', '#bfe6ff'], ground: ['#6b5a3a', '#3a2c1a'], grass: ['#2e6b2a', '#6fc25a'],
    rail: ['#a8281f', '#e8452a'], bulb: '#fff2b0', wood: ['#9a6a3a', '#7a4f26'],
  },
  {
    id: 'desert', name: 'Desert of Dead Startups', card: 'cards/desert.webp', unlock: 1500, hills: 0.3, rolling: 1.6,
    layers: { sky: 'bg/desert-sky.webp', far: 'bg/desert-far.webp', mid: 'bg/desert-mid.webp', near: 'bg/desert-near.webp' },
    sky: ['#ff8a4c', '#ffd08a'], ground: ['#d99a4a', '#8a5420'], grass: ['#b5732b', '#f0c070'],
    rail: ['#9a4a12', '#e8862a'], bulb: '#fff2b0', wood: ['#c98a4a', '#a8662e'],
  },
  {
    id: 'snow', name: 'Snowflake Peaks', card: 'cards/snow.webp', unlock: 2500, hills: 0.4, rolling: 0.35, brake: 0.55,
    layers: { sky: 'bg/snow-sky.webp', far: 'bg/snow-far.webp', mid: 'bg/snow-mid.webp', near: 'bg/snow-near.webp' },
    sky: ['#7cc4f0', '#e6f6ff'], ground: ['#e9f2fa', '#9db8cc'], grass: ['#bcd8ec', '#ffffff'],
    rail: ['#2a6fb3', '#9be3ff'], bulb: '#e6fbff', wood: ['#8aa6bc', '#6b8aa3'],
  },
  {
    id: 'volcano', name: 'Burnout Volcano', card: 'cards/volcano.webp', unlock: 4000, hills: 0.5,
    layers: { sky: 'bg/volcano-sky.webp', far: 'bg/volcano-far.webp', mid: 'bg/volcano-mid.webp', near: 'bg/volcano-near.webp' },
    sky: ['#3a0d14', '#c0392b'], ground: ['#2a1414', '#0a0505'], grass: ['#5a1a10', '#ff5a1f'],
    rail: ['#3a1a14', '#ff6b2a'], bulb: '#ffb37a', wood: ['#4a2a20', '#3a1a14'],
  },
];

export const worldById = (id) => WORLDS.find((w) => w.id === id) || WORLDS[0];

export const isWorldUnlocked = (world, bestAnywhere) => bestAnywhere >= world.unlock;
