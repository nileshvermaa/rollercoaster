# Phase 2 prompts: carts, track kit, hazards, collectibles

**Export rules (Phase 1 lessons):**
- Download the generator's **original file**, never a screenshot of its preview grid.
- The object must **fill the canvas** (about 85%), not sit as a small strip in the middle.
- Ask for **real transparency**. If the generator can't do it, use a flat **#00FF00** background. Never a grey/white checkerboard.
- One object per image. No neighbouring images, text, labels or watermarks.
- Attach both reference boards **plus the Phase 1 cart body** as style references to every prompt.
- Save as `art/raw/phase2/<file name>`. Claude runs `tools/cutout.py` on it.

**Shared style line (add to every prompt):**
polished playful 2D mobile game art, bright cartoon, rounded shapes, crisp dark outlines, soft shadows, warm glossy highlights, light from top-left, palette midnight #22213D, purple #48346F, pink #F4A6D7, gold #FFB62E, coral #E95757, blue #42A5EF, green #72C95A. Single object, centered, filling 85% of the canvas, transparent background (or flat #00FF00). No text, no logos, no watermark, no checkerboard.

**Cart rule (add to every cart prompt):**
Side view facing right, same size, proportions and chassis height as the attached Basic Cart. Body only, NO wheels (wheels are separate). Seat backs visible on top.

---

## Carts (512×512 each)

**VEH002_wooden-cart_v01_body.png**
> Rollercoaster cart body made of warm brown wooden slats with visible grain, iron rivets and corner brackets, dark brown leather seats, rugged and sturdy. [cart rule] [shared style line]

**VEH003_steel-cart_v01_body.png**
> Sleek streamlined rollercoaster cart, metallic blue shell with steel trim, chrome accents and a pointed aerodynamic nose, black sport seats. [cart rule] [shared style line]

**VEH004_rocket-cart_v01_body.png**
> Red and yellow racing rollercoaster cart with a big chrome rocket nozzle at the rear, racing stripes, black seats. No flame (flame is a separate effect). [cart rule] [shared style line]

**VEH005_golden-cart_v01_body.png**
> Premium rollercoaster cart plated in shiny gold with a small crown ornament on the front, ornate engraved trim, red velvet seats, strong glossy highlights. [cart rule] [shared style line]

**VEH006_dragon-cart_v01_body.png**
> Special rollercoaster cart shaped like a red-orange dragon: sculpted dragon head with horns and open jaw at the front, scale texture along the sides, spiked tail at the rear, black seats. [cart rule] [shared style line]

**VEH008_coaster-wheel.png** (256×256)
> Single rollercoaster wheel, exact side view, perfect circle: thick dark polyurethane tyre, red painted steel hub with 6 bolts, small chrome center cap. NOT a car tyre. [shared style line]

**VEH004_boost-flame_sheet.png** (1024×256, 6 frames in a row)
> Sprite sheet of 6 animation frames in one horizontal row, evenly spaced: a cartoon rocket exhaust flame pointing left, orange-yellow core with blue base, flickering shape changing each frame. [shared style line]

---

## Track kit (1024×512 each)

**TRK002_up-slope.png**
> Rollercoaster rail segment curving upward from left to right (about 30 degrees), red-orange tube rail with steel top rail and evenly spaced glowing warm bulbs, matching the attached straight rail exactly. Rail only, no supports. Both ends horizontal-cut so they join other pieces. [shared style line]

**TRK003_down-slope.png**
> Same rail as the up slope, mirrored: curving downward from left to right. [shared style line]

**TRK004_loop.png** (1024×1024)
> Full 360-degree vertical rollercoaster loop, same red rail with glowing bulbs, entry rail on the left and exit rail on the right, with steel support legs underneath. [shared style line]

**TRK006_bump.png**
> Short rounded hill in the same rail, a gentle bump about one cart-length wide. [shared style line]

**TRK007_support_full.png** (512×1024)
> Complete wooden rollercoaster support tower, side view, both vertical posts fully visible with X cross-braces and bolts, tall and narrow, nothing cropped. [shared style line]

**TRK008_moving-platform.png**
> Short floating rail platform with yellow-black hazard stripes on the ends and a small arrow sign, same rail style. [shared style line]

**TRK009_barrier.png** (512×512)
> Red and yellow striped roadblock barrier on two legs with a small warning light on top. [shared style line]

**TRK010_spikes.png** (1024×256)
> Strip of metallic pointed spikes on a dark steel base, row of 8 spikes, shiny highlights. [shared style line]

**TRK011_pendulum.png** (512×1024)
> Heavy dark iron wrecking ball hanging from a chain on a small pivot bracket at the top. [shared style line]

**TRK012_rail-bulb_sheet.png** (512×128, 4 frames)
> 4 frames in a row of a single warm carnival bulb: off, dim, bright, bright with glow halo. [shared style line]

---

## Collectibles and power-ups (256×256 each)

The vector versions on the board already work for the HUD. Generate these only if you want painted pickups in the world.

**UI005_coin_spin_sheet.png** (1024×128, 8 frames)
> 8-frame spin animation of a golden coin with an embossed star, from face-on to edge-on and back, frames in one row. [shared style line]

**UI006_gem.png**
> Faceted cyan-blue diamond gem with bright sparkle. [shared style line]

**UI007_fuel-can.png**
> Bright red jerry can with silver spout and handle, glossy. [shared style line]

**UI008_boost.png**
> Electric blue lightning bolt with white glow edge. [shared style line]

**UI009_shield.png**
> Blue crest shield with silver rim and a white star in the middle. [shared style line]

**UI010_magnet.png**
> Red horseshoe magnet with silver tips and small blue magnetic sparks. [shared style line]

**UI_slowtime_hourglass.png**
> Gold-framed hourglass with orange sand. [shared style line]

---

## Particles and effects (sprite sheets, frames in one row)

**FX_dust_sheet.png** (768×128, 6 frames): cartoon dust puff growing and fading.
**FX_spark_sheet.png** (768×128, 6 frames): bright yellow-orange rail sparks bursting outward.
**FX_coin-pickup_sheet.png** (768×128, 6 frames): golden sparkle star burst that fades.
**FX_impact-star_sheet.png** (512×128, 4 frames): white-yellow comic impact star.

Add the [shared style line] to each.
