// Every physics and run number in one place. World units are pixels at zoom 1, y points up.

export const WORLD = {
  gravity: 900,
  /** Track knots are this far apart; the rail is a Catmull-Rom spline through them. */
  segment: 240,
  /**
   * Steepest rail allowed anywhere. Every cart's engine beats gravity on this slope
   * (engine > gravity * sin(maxSlope) + drag), so with fuel every hill is climbable.
   */
  maxSlopeDeg: 36,
  /** Flat runway at the start. */
  runwayKnots: 6,
};

export const PHYS = {
  stepHz: 120,
  drag: 0.0003, // per px of speed, applied as drag * v * |v|
  rolling: 16,
  brake: 950,
  /** Speed a booster pad guarantees; every jump gap is sized so this speed clears it. */
  boostSpeed: 780,
  /** Normal-speed (into the rail) above this on landing = derail. */
  hardLanding: 1150,
  /** How fast an airborne cart turns toward its direction of travel, per second. */
  airAlign: 1.6,
  /** Below the rail by this much = fell through a gap. */
  fallDepth: 650,
};

export const RUN = {
  pxPerMeter: 40,
  idleBurn: 0.35, // fuel per second even when coasting
  stallSeconds: 2.2, // out of fuel and stopped this long = run over
  fuelEvery: [1500, 2300], // px between fuel cans
  coinRowChance: 0.5,
  gapFromX: 2600, // no jump gaps before this
};

/** Difficulty 0..1 over distance: hills get taller and gaps more frequent. */
export function difficultyAt(x) {
  return Math.min(1, x / 60000);
}
