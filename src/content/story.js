// Karen-9000's commentary and the end-of-run epitaphs. Tone: corporate satire, never punching down.

export const QUIPS = {
  start: ['Welcome to The Engagement Loop™. Please keep all limbs and opinions inside.', 'Ride duration: unlimited. Waiver: signed.'],
  airborne: ['Sir. SIR. That is not a sanctioned trajectory.', 'Airtime is billed separately.', 'I am filing an incident report mid-flight.'],
  danger: ['Speed exceeds policy. Brake. BRAKE.', 'Our lawyers can see you.', 'That crest is a liability.'],
  lowFuel: ['CRANK™ reserves critical. Hydrate, Dave.', 'Fuel low. Morale lower.'],
  landing: ['Smooth. HR approves.', 'Nailed it. I will remove that from your file.'],
  fuel: ['CRANK™ acquired. 40% less legal liability.', 'Refuelled. Do not lick the can.'],
  boost: ['Booster engaged. Synergy!', 'Speed boost courtesy of our sponsors.'],
};

export const EPITAPHS = {
  landing: ['Dave has achieved horizontal career growth.', 'Landing rated 1 star by Karen-9000.'],
  slam: ['Dave met the rail at speed. The rail won.', 'Structural integrity: retired.'],
  fell: ['Dave has left the building. And the track.', 'Gravity filed a complaint.'],
  fuel: ['Engagement terminated: out of CRANK™.', 'Dave ran on vibes. Vibes ran out.'],
};

export function pick(list, rng = Math.random) {
  return list[Math.floor(rng() * list.length)];
}
