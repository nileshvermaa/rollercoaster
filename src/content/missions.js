// Mission pools. stat: which counter the mission reads · mode: 'max' keeps the best single run,
// 'sum' adds every run up. Daily and weekly lists are picked from the pools by date; achievements
// read lifetime stats and are permanent.

export const DAILY_POOL = [
  { id: 'd-dist', icon: 'distance', text: 'Drive 1,000 m in one run', stat: 'distance', mode: 'max', target: 1000, reward: { coins: 500 } },
  { id: 'd-coins', icon: 'coins', text: 'Collect 100 coins', stat: 'coins', mode: 'sum', target: 100, reward: { coins: 300 } },
  { id: 'd-boost', icon: 'boost', text: 'Hit 5 boosters', stat: 'boosts', mode: 'sum', target: 5, reward: { gems: 20 } },
  { id: 'd-air', icon: 'stunt', text: 'Spend 10 s airborne', stat: 'airtime', mode: 'sum', target: 10, reward: { gems: 30 } },
  { id: 'd-crash', icon: 'crash', text: 'Derail in a way Karen will report', stat: 'derails', mode: 'sum', target: 1, reward: { coins: 250 } },
  { id: 'd-clean', icon: 'stunt', text: 'Land 3 clean jumps', stat: 'cleanLandings', mode: 'sum', target: 3, reward: { gems: 25 } },
  { id: 'd-fuel', icon: 'boost', text: 'Grab 4 CRANK™ cans', stat: 'fuelCans', mode: 'sum', target: 4, reward: { coins: 400 } },
];

export const WEEKLY_POOL = [
  { id: 'w-dist', icon: 'distance', text: 'Drive 3,000 m in one run', stat: 'distance', mode: 'max', target: 3000, reward: { gems: 80 } },
  { id: 'w-coins', icon: 'coins', text: 'Collect 1,500 coins', stat: 'coins', mode: 'sum', target: 1500, reward: { coins: 5000 } },
  { id: 'w-runs', icon: 'crash', text: 'Ride 25 times', stat: 'runs', mode: 'sum', target: 25, reward: { gems: 60 } },
  { id: 'w-air', icon: 'stunt', text: 'Spend 90 s airborne', stat: 'airtime', mode: 'sum', target: 90, reward: { gems: 70 } },
  { id: 'w-clean', icon: 'stunt', text: 'Land 25 clean jumps', stat: 'cleanLandings', mode: 'sum', target: 25, reward: { coins: 6000 } },
];

export const ACHIEVEMENTS = [
  { id: 'a-1k', icon: 'distance', text: 'Best run over 1 km', stat: 'best', target: 1000, reward: { gems: 50 } },
  { id: 'a-5k', icon: 'distance', text: 'Best run over 5 km', stat: 'best', target: 5000, reward: { gems: 200 } },
  { id: 'a-runs', icon: 'crash', text: 'Ride 100 times', stat: 'runs', target: 100, reward: { gems: 100 } },
  { id: 'a-derails', icon: 'crash', text: 'Derail 50 times (HR is aware)', stat: 'derails', target: 50, reward: { coins: 10000 } },
  { id: 'a-carts', icon: 'coins', text: 'Own 3 carts', stat: 'carts', target: 3, reward: { gems: 120 } },
  { id: 'a-dist', icon: 'distance', text: 'Ride 50 km in total', stat: 'distance', target: 50000, reward: { gems: 150 } },
];

export const DAILY_COUNT = 5;
export const WEEKLY_COUNT = 3;
