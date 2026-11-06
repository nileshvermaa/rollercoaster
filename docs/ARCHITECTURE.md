# Architecture

Off The Rails is a static single-page game: Vite bundles plain ES modules, the world is drawn on
one `<canvas>` with the 2D API, and the HUD and screens are plain DOM. No framework, no backend;
progress lives in `localStorage`.

## Folder map

```
src/
  main.js              boot; exposes window.__game in development
  game/
    Game.js            the hub: save, input, renderer, current run, frame loop, screen state machine
    physics.js         PURE cart physics: on-rail bead model, launch, flight, landing, derail
    save.js            PURE save parsing/validation + localStorage read/write
    dom.js             $(), number formatting, screen toggling
    systems/
      run.js           one run: fixed-step physics, pickups, events → particles and Karen, end of run
      render.js        canvas: parallax park, terrain, supports, lit rail, pickups, particles, cart
      hud.js           DOM HUD: distance/progress, coins, fuel, speed and derail gauges
      screens.js       title, menu, garage (buy/select/upgrade), settings, pause, results
  content/
    tuning.js          every physics and run number
    carts.js           the six carts, stats, upgrades and their prices
    story.js           Karen-9000's lines and the end-of-run epitaphs
  world/
    track.js           PURE procedural track: rail spline, gaps, boosters, coins, fuel cans
  engine/
    math.js            seeded RNG, clamp/lerp/damp, angle helpers
    input.js           keyboard + on-screen pedals + device tilt → { throttle, brake }
    assets.js          image loading that tolerates missing files
  styles/              base (tokens, buttons, panels), screens, hud
```

## The frame

`Game.tick(dt)` → `updateRun` steps physics on a fixed 120 Hz clock (accumulator, capped so a
stalled tab can't explode), collects pickups, updates the danger estimate and checks for the end of
the run → `Renderer.follow` moves the camera → `updateHud` → `Renderer.draw`.

## Physics model (`src/game/physics.js`)

- **On the rail** the cart is a bead on a wire: position `x`, speed `v` along the tangent.
  Acceleration = gravity along the slope + engine × throttle − drag·v|v| − rolling resistance,
  plus braking.
- The rail only *pushes*. Normal force per unit mass is `g·cosθ + κ·v²` (κ = signed curvature).
  When that goes negative (a crest taken too fast) the cart **launches**.
- **In the air** it is a projectile. It weathervanes toward its flight path; gas/brake tip the nose.
- **Landing**: angle mismatch above the cart's `grip` → derail; speed into the rail above
  `PHYS.hardLanding` → derail; otherwise the velocity is projected back onto the rail.
- `liftRatio()` looks ahead along the rail and reports how close the next crest is to launching the
  cart at the current speed. That drives the DERAIL gauge and Karen's warnings.

## Track (`src/world/track.js`)

Knots every `WORLD.segment` px; the rail is a Catmull-Rom spline through them, generated from a
seed as the cart approaches. Rules that keep it fair, each covered by a test:

- **Climbable**: no slope steeper than `WORLD.maxSlopeDeg`, and every cart's engine beats gravity on
  that slope. New knots shrink until both neighbouring segments respect the limit.
- **Clearable jumps**: a jump is a lip, a booster before it and a gap sized at 60% of the distance
  a conservative launch at booster speed would fly. `tests/physics.test.js` drives a hands-off cart
  over real generated gaps.
- Items are kept sorted by x so lookups are a binary search (`firstItemAt`).

## Recipes

**Add a cart**: add an entry to `CARTS` in `src/content/carts.js` and an image at
`public/assets/carts/<id>.webp`. Keep `engine` above the slope test's minimum.

**Add a track feature** (e.g. loops, moving platforms): generate it in `Track._addKnot` (or a sibling
like `_addJump`), store it in its own sorted list, teach `stepCart` the rule, draw it in
`Renderer.drawRail`, and add a test that a sensible driver can get through it.

**Add a world**: put layer art in `public/assets/bg/<world>-{sky,far,mid,near}.webp`, give
`Renderer` a per-distance world lookup for the image keys and terrain colours, and add the world's
tuning to `content/`.

**Change Karen**: edit `src/content/story.js`.
