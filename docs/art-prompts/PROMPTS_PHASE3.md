# Phase 3 prompts: title, menus, level select, pause, results, garage

Buttons, panels, text, counters and toggles are **built as live vector UI** (spec section 4), so they are not generated here. Generate only the **illustrations** these screens sit on.

Use the same **export rules** and **shared style line** as `PROMPTS_PHASE2.md`. Attach both reference boards to every prompt.

Backgrounds: **1920×1080 landscape**, fully painted edge to edge (no padding, no green), with the **centre left calm and darker** so UI panels stay readable. Also generate a **1080×1920 portrait** crop of each if menus will be portrait.

---

## Logo

**LOGO_main.png** (2048×1024, transparent)
> Game logo reading "[GAME NAME]" in big chunky rounded 3D letters: glossy red-orange-yellow gradient fill, thick dark navy outline, white inner highlight, a small red rollercoaster track swooping under the letters, tiny sparkles. Centered, transparent background. [shared style line, but text IS allowed here]

> Replace `[GAME NAME]` with the final name (Off The Rails or RollerCoaster Racing 2D). The logo is the only image with text baked in. Generate 4 variants and pick the best lettering; AI often misspells, so check every letter.

**LOGO_icon.png** (1024×1024)
> App icon: the red flame rollercoaster cart with the waving driver bursting over a sunset carnival hill, bold and readable at small size, rounded square composition, no text. [shared style line]

---

## Screen backgrounds (1920×1080)

**BG_splash.png**
> Title screen illustration: sweeping sunset carnival panorama, red rollercoaster track climbing through the centre, fairytale castle and ferris wheel on the sides, fireworks in the sky. Leave the top third clear for the logo and the bottom strip clear for "Tap to Start". [shared style line]

**BG_menu.png**
> Main menu backdrop: sunset carnival with castle, circus tents and ferris wheel, softly blurred and slightly darkened in the middle so buttons stand out. [shared style line]

**BG010_loading.png**
> Loading screen: dark purple silhouette of a rollercoaster loop and ferris wheel against a glowing pink-orange sunset, minimal and calm, large empty centre. [shared style line]

**BG007_garage.png**
> Cartoon garage interior: warm-lit workshop with tool walls, tyre stacks, red toolbox, checkered floor, spotlight pool on a round display platform in the centre. Platform empty. [shared style line]

---

## Level-select card thumbnails (640×400 each, painted edge to edge)

**CARD_amusement-park.png** · sunset carnival with ferris wheel and red coaster.
**CARD_night-carnival.png** · neon carnival at night with fireworks.
**CARD_mountain-resort.png** · blue mountains, pine forest and a coaster bridge.
**CARD_desert-carnival.png** · sandstone canyon arches with a coaster.
**CARD_snow-park.png** · snowy pines and an icy coaster.
**CARD_volcano-park.png** · lava river under a dark rock coaster.

Add to each: "Small square-ish thumbnail illustration, strong focal point, readable at 160 px wide. [shared style line]"

---

## Garage and results props (transparent)

**UI_plinth.png** (1024×512)
> Round turntable display platform seen slightly from above, dark metal with a glowing blue rim light and soft floor shadow. Empty. [shared style line]

**UI_results-ribbon.png** (1536×384)
> Big red ribbon banner with folded tail ends, glossy, dark outline, blank centre (text is added in-game). [shared style line]

**UI_star_states.png** (768×256, 3 frames)
> Three big chunky 5-point stars in a row: gold filled and shiny, grey empty, gold with sparkle burst. [shared style line]

**FX_confetti_sheet.png** (1024×256, 8 frames)
> Colourful confetti pieces (gold, pink, blue, green ribbons and squares) falling, 8 frames in one row. [shared style line]

**FX_fireworks_sheet.png** (1536×256, 12 frames)
> Firework burst animation in 12 frames: launch spark, bloom of gold and pink sparks, fading trails. [shared style line]

---

## Pause screen

No new art needed. It's the frozen gameplay scene with a dark scrim plus the vector panel from the element kit.
