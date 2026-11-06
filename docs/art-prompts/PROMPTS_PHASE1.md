# Phase 1 image-generation prompts

Paste each block into your image generator (the one that made the reference boards).
Attach **both reference boards** to every prompt as style references.
Save outputs into `art/raw/` using the file name given, then tell Claude. Claude will cut the layers, lay them out on the board and wire them into the screens.

**Shared style line (already in every prompt):**
polished playful 2D mobile game art, bright cartoon, rounded shapes, crisp dark outlines, soft shadows, warm glossy highlights, light from top-left, palette midnight #22213D, purple #48346F, pink #F4A6D7, gold #FFB62E, coral #E95757, blue #42A5EF, green #72C95A. No text, no logos, no watermark, no UI.

---

## BG001 — Amusement Park Sunset (5 parallax layers)

Generate each layer separately at **1920×1080**. Layers 2–5 on a **transparent or flat pure-green (#00FF00) background** so they can be cut out.

**BG001_L1_sky.png**
> Side-scrolling 2D game background layer, sky only. Sunset gradient from deep purple at top through pink to warm orange at the horizon, soft fluffy pink-lilac clouds, a few faint stars at the top, two small distant firework bursts. No ground, no buildings. [shared style line]

**BG001_L2_far.png**
> Far parallax layer: hazy purple silhouettes of a fairytale castle with blue cone-roofed towers and red flags, distant hills, faint ferris wheel outline. Low contrast, atmospheric haze, lower third of the frame only, flat #00FF00 background above and behind. Must tile horizontally. [shared style line]

**BG001_L3_mid.png**
> Mid parallax layer: carnival park — large ferris wheel with colored gondolas, striped red-yellow-purple circus tent with warm lit windows, a looping red rollercoaster in the background, strings of warm bulbs, a hot-air balloon. Warm sunset rim light. Flat #00FF00 background. Must tile horizontally. [shared style line]

**BG001_L4_near.png**
> Near parallax layer: leafy round green trees and bushes, a few lamp posts with warm glow, bottom quarter of the frame only, flat #00FF00 background. Must tile horizontally. [shared style line]

**BG001_L5_ground.png**
> Foreground strip: grassy ground edge with dark soil, small flowers, bottom 15% of frame only, flat #00FF00 background. Must tile horizontally. [shared style line]

---

## VEH001 — Basic Cart (512×512, transparent / #00FF00)

**VEH001_basic-cart_v01_body.png**
> Side view, facing right, a single rollercoaster cart body WITHOUT wheels: glossy red body, yellow-orange flame decal along the side, black padded seat, chrome front bumper, small glowing headlight, simple dark metal chassis underneath. Centered, full object visible, nothing cropped, flat #00FF00 background. [shared style line]

**VEH001_wheel.png**
> Single rollercoaster cart wheel, perfectly side-on circle: dark rubber tyre, silver rim with 5 spokes, small hub bolt. Centered, 256×256, flat #00FF00 background. [shared style line]

**VEH007_driver.png**
> Cartoon driver, side view facing right, waist up only: young man with swept brown hair, big friendly eyes, wide grin, red shirt, one arm raised waving. Centered, flat #00FF00 background. [shared style line]

---

## TRK — Track kit (1024×512, transparent / #00FF00)

**TRK001_straight-rail.png**
> Straight horizontal rollercoaster rail segment, side view: red-orange tube rail with steel top rail, glowing warm bulbs evenly spaced along it. Rail only, no supports. Left and right ends must join seamlessly when tiled. Flat #00FF00 background. [shared style line]

**TRK007_support.png**
> Single wooden rollercoaster support tower, side view: two vertical brown wood posts with grain, X cross-braces, metal bolts, tall and narrow, flat #00FF00 background. [shared style line]

---

## Tips
- If the generator can't do transparency, the flat #00FF00 background is fine; Claude can key it out with a Python script.
- Generate 2–4 variants per asset and keep the best one.
- Keep the cart and driver at the **same scale** across prompts (mention "same scale as previous cart").
