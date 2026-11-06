# Architecture

Off The Rails is a static single-page game: Vite bundles plain ES modules, the world is drawn on
one `<canvas>` with the 2D API, and the HUD and screens are plain DOM. No framework, no backend;
progress lives in `localStorage`.

**Screens use a fixed 844×390 design frame** (`.stage`), the same size as the design board
artboards, scaled with `--s` to fit the viewport (letterboxed by each screen's own backdrop). That is
what keeps every screen aligned like the board on phones and desktops: lay out with absolute
positions in that frame.

## Folder map

```
src/
  main.js              boot; exposes window.__game in development
  game/
    Game.js            the hub: save, input, renderer, current run, frame loop, screen state machine
    physics.js         PURE cart physics: on-rail bead model, launch, flight, landing, derail, shield rescue
    save.js            PURE save parsing/validation + localStorage read/write
    progress.js        PURE progression: stars, levels, daily rewards, missions, event, shop, leaderboard
    dom.js             $(), h() element builder, toast
    systems/
      run.js           one run: world, fixed-step physics, pickups, power-ups, events, end of run
      render.js        canvas: world parallax, terrain, supports, lit rail, pickups, the 3-car train
      hud.js           DOM HUD: distance/progress, coins/gems, speed/fuel/derail gauges, power-ups
    screens/
      menus.js         main menu, home hub, level select
      garage.js        garage (stats, upgrades, carousel) and customize
      store.js         shop, events, daily rewards
      social.js        missions, leaderboard, profile, settings
      results.js       run complete
  content/
    tuning.js          every physics and run number
    carts.js           the six carts, stats, upgrades and their prices
    worlds.js          the six worlds: art, colours, physics quirks, unlock distance
    cosmetics.js       paints, trails, wheel skins
    shop.js            gem shop items
    missions.js        daily/weekly pools and achievements
    rewards.js         daily calendar, the event, leaderboard rivals, loading tips
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
- **The train** is drawn by `Renderer.carPoses`: trailing cars follow the rail at a fixed arc distance
  behind the lead car (rigidly while airborne). Each car sits on small road wheels on the steel top
  rail with brackets hooking under it to upstop wheels; riders are drawn in the seats behind the body.
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
