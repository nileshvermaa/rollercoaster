# OFF THE RAILS — Game Design Doc (v0.2)

> Endless 2D side-view roller coaster game. Tilt to accelerate/brake, manage momentum and fuel, don't derail.
> Platform: mobile-first web app (PWA), deployed on Vercel.

## Locked decisions
| Topic | Decision |
|---|---|
| Platform | Web app on Vercel (static build, HTTPS — needed for phone tilt sensors) |
| Pressure mechanic | **Fuel** |
| Tone (writing, characters, jokes) | Chaotic, meme-y, adult humour |
| Look (art, UI, camera) | Bright, chunky, cartoony side-view physics style in the spirit of classic mobile hill-climb games — but our own characters, art and UI |
| References | User will supply reference images during the design phase |

---

## Story

**MegaCorp Fun Holdings™** bought the bankrupt Wobbleton theme park and handed the redesign to an AI model trained exclusively on LinkedIn posts. Its one directive: *"Maximise rider engagement time."*

Result: **The Engagement Loop™** — a roller coaster that never ends. It keeps printing new track forward, forever, through anything in its way. Legal says it's fine because of the waiver.

You play **Dave**, 34, who just wanted one ride before his cousin's wedding. He's now strapped in next to **Karen-9000**, the park's AI safety mascot (a ride animatronic with a megaphone and opinions), plus a rotating cast of passengers in the back cars.

There's no ending. There's only distance, fuel, and how long Dave can go before the coaster leaves the rails (and Dave's dignity with it).

### Fuel: **CRANK™ Energy**
Discount energy drink, "now with 40% less legal liability". The coaster runs on it. Dave drinks it too. Cans hang over the track; grab them or stall.
- Fuel empty + no momentum = coaster rolls back and stops → run over ("Engagement terminated.").

### Tone guide
- Corporate satire, internet brain-rot, mild swearing (bleeped `#$@!` style, so the look stays cartoony).
- Deadpan announcer text on screen: *"You have been riding for 2.3 km. Please rate your experience."*
- Death screens are jokes, not punishment: *"Dave has achieved horizontal career growth."*
- Never punch down; target is corporations, tech-bros, hustle culture, theme parks.

### Cast
| Character | Role | Gag |
|---|---|---|
| **Dave** | Driver, player | Increasingly unhinged face as speed rises; this is the danger feedback |
| **Karen-9000** | AI safety mascot, co-pilot | Yells passive-aggressive safety tips, asks to speak to the track's manager |
| **Back-car passengers** (unlockable) | Extra weight / cosmetics | Crypto Bro, Influencer filming, Grandma who's done this before, a Goose |

---

## World / biomes (repeat with higher difficulty)
| Distance | Biome | Gimmick | Joke |
|---|---|---|---|
| 0–1 km | **Wobbleton Park** | Gentle hills, tutorial | Signs: "Fun is mandatory" |
| 1–3 km | **Suburbia** | Track through backyards, rooftops | Angry HOA guy, trampolines |
| 3–6 km | **Corporate Campus** | Bouncy "synergy" pads, sudden drops | Open-plan office, ping pong tables |
| 6–10 km | **Frozen Startup Graveyard** | Ice = low friction | Dead scooter-share bikes in snow |
| 10 km+ | **Low Orbit** | Low gravity, big airtime, loops | Billionaire's rocket in the background |

---

## Look & feel (the "hill-climb" tone)
- **Side view**, camera follows the coaster, zooms out with speed.
- **Bright saturated colours**, sunny sky gradient, rolling green hills, **simple parallax layers** (far hills, mid trees/buildings, near ground).
- **Chunky cartoon art**: thick outlines, slightly exaggerated proportions, big heads on characters, solid ground shape filled below the track line with dirt/grass texture strip.
- **Physics you can see**: car suspension bounce, trailing cars swinging, characters' heads wobbling.
- **Juice**: sparks on rails, dust on landings, screen shake near derail, ragdoll-ish passengers flying out on crash.
- **HUD**: fuel gauge (top-left, big and obvious), distance (top-centre), coins/tickets (top-right), **speed/danger needle gauge** (bottom), pedals-style touch zones bottom-left (brake) and bottom-right (gas) as fallback for tilt.
- **Menus**: big rounded buttons, garage screen for upgrades, cheesy badge/sticker style.

> We match the *genre feel*: bright, physical, cartoony. We do **not** copy any existing game's characters, UI layouts, logos, sounds or assets. Reference images guide mood only.

---

## Core gameplay
- **Tilt right** = throttle (burns CRANK). **Tilt left** = brake (rolls back if stalled on a slope).
- **Touch fallback**: hold right side = gas, left side = brake. Calibrate neutral tilt at run start + dead zone.
- **Derail rules** (per section, readable before they kill you):
  - Crest too fast → airborne → if landing angle is bad, derail.
  - Tight curve / loop: min speed (or fall off) and max speed (or fly off).
  - Danger needle + Dave's face + track warning signs telegraph limits.
- **Track features**: hills, gaps (jump), loops, boosters, broken track, sticky/icy sections, switch junctions (choose route).
- **Run ends**: derail, or out of fuel and stopped.
- **Meta**: coins → upgrades in garage (engine, brakes, fuel tank, grip, rail-clamps that raise derail threshold), new coaster carts, passengers.

---

## Tech plan (for the web prototype)
- **Vite + TypeScript**, static build → Vercel (zero config).
- **Rendering**: HTML Canvas 2D (or Phaser 3 if we want built-ins). Art as SVG/PNG sprites.
- **Physics**: custom 1D "bead-on-a-wire" model along a spline track (gravity component along slope, throttle, friction, drag) + switch to free 2D projectile when airborne. More controllable than a generic rigid-body engine for rails.
- **Procedural track**: chunks generated ahead, physics-aware so every hill is climbable with max throttle + full fuel.
- **Input**: `DeviceOrientationEvent` (iOS needs a tap-to-allow permission prompt; HTTPS required → Vercel gives this) + touch fallback + keyboard for desktop testing.
- **PWA**: installable, fullscreen, landscape lock.

## Open items
1. Reference images from you (mood, colours, UI).
2. Name: *Off The Rails* vs *The Engagement Loop™* vs other.
3. Next deliverable: style sheet mock (characters, palette, gameplay screen with HUD) → then playable greybox prototype to test tilt feel.
