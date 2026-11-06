# HD art needed

Every image in the game today was sliced from 1536×1024 composite sheets, so all of them are
**1.6× to 14× below the resolution they need** (run `python tools/art/asset_report.py` for the live
list). Upscaling can't recover detail that small, so the fix is to **regenerate each asset on its own**.

**Already done in code, so don't generate these:** every UI icon (coin, gem, fuel, boost, shield,
magnet, hourglass, trophy, medals, stars, lock, gift, mission icons, timer, settings icons), avatar
frames, the display plinth, the results ribbon, coaster wheels and wheel skins, boost trails, the
boost flame, sparks, fireworks, clouds and weather. They live in `src/ui/icons.js` and
`src/game/systems/fx.js` and are sharp at any size.

## How to deliver

1. **One asset per request.** Start every prompt with: *"Generate ONLY this one image. Do not make a
   sheet, collage, board or grid. No labels, borders or text."* The earlier batches came back as
   collages because many assets were requested at once.
2. Download the **original file** (not a screenshot), at the size given or larger.
3. Sprites and parallax layers need **real transparency**, or a flat **#00FF00** background.
   Never a painted checkerboard.
4. Save it into `art/hd/` with the **same path** as the file it replaces, e.g. `art/hd/bg/park-sky.png`.
5. Run `python tools/art/ingest.py --check` and then `python tools/art/ingest.py`. That keys out green,
   trims, scales, validates and installs it. The game picks it up with no code change.

Attach the two original reference boards plus `public/assets/carts/basic.webp` as style references.

**Style line (end every prompt with it):** *polished playful 2D mobile game art, bright cartoon,
rounded shapes, crisp dark outlines, soft shadows, warm glossy highlights, light from top-left,
palette midnight #22213D, purple #48346F, pink #F4A6D7, gold #FFB62E, coral #E95757, blue #42A5EF,
green #72C95A.*

---

## Delivered

- **All six worlds' gameplay layers** (`bg/{world}-sky|far|mid|near|ground`) and the weather strips
  (`fx/embers|neon-sparkle|sand-wind|snow|steam`): installed from `fullresart/` in HD. The `ground`
  layer textures the hills. Night Carnival has no `ground` yet (its hills use a colour fill).

### Received but not usable as-is

- `TRK001_rail_{world}.png`: straight trestle segments. The track is a curved spline, so a straight
  picture can't be laid along it. The code rail's colours are matched to these instead.
- `VEH001_basic-cart_paint-mask.png`: a different cart (has wheels, different body) from the game's
  Basic cart, so it can't act as that cart's paint mask. If paint masks are wanted, export a
  white version of exactly `public/assets/carts/basic.webp` (no wheels).

## Tier 1: backgrounds (biggest visual win, 5–14× too small today)

Still needed: `bg/splash`, `bg/menu`, `bg/loading`, `bg/garage`, `event/banner`, and optionally
`bg/night-ground`. The world layer prompts below are kept for reference.

Parallax layers (`-far`, `-mid`, `-near`) are **3840×1080, transparent above the scenery, and tile
seamlessly left to right**. The sky (`-sky`) is **1920×1080, fully painted**. Scenery sits in the
bottom part of the frame: far ≈ bottom 40%, mid ≈ bottom 55%, near ≈ bottom 30%.

| File | Prompt |
| --- | --- |
| `bg/park-sky` | Sunset sky only: deep purple top → pink → warm orange horizon, fluffy lilac clouds, a few faint stars, two small firework bursts. No ground. |
| `bg/park-far` | Hazy purple silhouettes: fairytale castle with blue cone-roof towers and red flags, distant hills, faint ferris wheel. Low contrast. |
| `bg/park-mid` | Carnival: big ferris wheel, striped red-yellow-purple circus tent with lit windows, looping red coaster in the distance, bulb strings, a hot-air balloon. |
| `bg/park-near` | Leafy round trees and bushes, lamp posts with warm glow. |
| `bg/night-sky` | Deep indigo night, stars, coloured spotlight beams, big fireworks. |
| `bg/night-far` | Purple silhouettes of distant rides and a castle under the night sky. |
| `bg/night-mid` | Neon-lit ferris wheel, carousel, glowing striped tents, bulb strings. |
| `bg/night-near` | Dark bushes, glowing lamp posts, small neon shapes (no letters). |
| `bg/mountain-sky` | Bright blue sky, puffy white clouds. |
| `bg/mountain-far` | Blue snow-capped mountain range. |
| `bg/mountain-mid` | Pine forest, wooden chalets, a rope bridge. |
| `bg/mountain-near` | Tall pines and rocks, alpine flowers. |
| `bg/desert-sky` | Warm orange-yellow dusty sky, heat haze. |
| `bg/desert-far` | Distant sandstone mesas. |
| `bg/desert-mid` | Red rock arches, striped desert tents, cacti, abandoned e-scooters half-buried in sand. |
| `bg/desert-near` | Cacti and boulders. |
| `bg/snow-sky` | Pale icy blue sky, light snowfall. |
| `bg/snow-far` | Icy blue mountains. |
| `bg/snow-mid` | Snow-covered pines, a frozen ferris wheel, an ice castle. |
| `bg/snow-near` | Snowy bushes, lamp posts with icicles. |
| `bg/volcano-sky` | Dark red-orange smoky sky with drifting embers. |
| `bg/volcano-far` | Erupting volcano silhouette. |
| `bg/volcano-mid` | Black rock cliffs, glowing lava falls, steam vents, scorched tents. |
| `bg/volcano-near` | Charred trees and glowing rocks. |

Full-screen backdrops, **1920×1080, fully painted, centre calm and slightly darker for UI**:

| File | Prompt |
| --- | --- |
| `bg/splash` | Sweeping sunset carnival panorama, red coaster track climbing through the centre, castle and ferris wheel at the sides, fireworks. Top third clear for the logo. |
| `bg/menu` | Sunset carnival with castle, circus tents and ferris wheel, middle softly darker. |
| `bg/loading` | Dark purple silhouette of a coaster loop and ferris wheel against a glowing pink-orange sunset. Large empty centre. |
| `bg/garage` | Cartoon garage interior: tool walls, tyre stacks, red toolbox, checkered floor, spotlight pool on an empty round platform. |
| `event/banner` (1920×800) | Night carnival, neon ferris wheel, glowing tents, fireworks, a golden coaster cart bottom-right. Left half calmer for text. |

## Tier 2: the train (3–4× too small)

**1024×512, transparent, side view facing right, body only, NO wheels, seats visible on top,
same size and chassis height for every cart:**

`carts/basic` red body, yellow flame decal · `carts/wooden` warm wood slats, rivets ·
`carts/steel` metallic blue streamlined shell · `carts/rocket` red/yellow racer with chrome rear
nozzle · `carts/golden` gold plating, crown ornament · `carts/dragon` red-orange dragon head at the front.

**512×512, transparent, seated passenger, side view facing right, waist up, sitting in a black coaster seat:**

`riders/dave-calm`, `riders/dave-excited`, `riders/dave-terrified`, `riders/dave-dizzy`: Dave
(swept brown hair, red shirt) with that expression · `riders/karen9000` boxy silver robot with a blonde
bob and a megaphone · `riders/cryptobro` hoodie, gold chain, laser-eye glow · `riders/influencer`
filming on a phone, peace sign · `riders/grandma` knitting, unbothered · `riders/goose` angry goose in a tiny helmet.


## Tier 3: menus and cards (2–5× too small)

`ui/logo` 2048×1024 transparent (check every letter) · `hub/adventure|events|multiplayer|challenge`
800×1000 painted cards · `cards/park|night|mountain|desert|snow|volcano` 640×400 painted thumbnails
· `avatars/dave|karen9000|cryptobro|influencer|grandma|goose` 512×512 round portraits (no frame;
frames are code) · `event/reward` 512×512 neon cart on a pedestal.

## Tier 4: illustrated items (least visible)

512×512 transparent each: `shop/coin-pile`, `shop/coin-sack`, `shop/coin-chest`, `shop/skin-bundle`,
`rewards/day7-cart` (the Golden Cart on a small pedestal).

---

## Full list (generated)

| File | Now | Target | Short by | Use |
| --- | --- | --- | --- | --- |
| `bg/menu.webp` | 520×218 | 1920×1080 | 5.0× | full-screen backdrop |
| `bg/loading.webp` | 476×218 | 1920×1080 | 5.0× | full-screen backdrop |
| `bg/garage.webp` | 501×218 | 1920×1080 | 5.0× | full-screen backdrop |
| `bg/splash.webp` | 666×238 | 1920×1080 | 4.5× | full-screen backdrop |
| `ui/logo.webp` | 507×233 | 2048×1024 | 4.4× | logo |
| `riders/dave-calm.webp` | 117×147 | 512×512 | 4.4× | seated rider |
| `riders/dave-excited.webp` | 123×148 | 512×512 | 4.2× | seated rider |
| `event/banner.webp` | 904×197 | 1920×800 | 4.1× | full-screen event backdrop |
| `riders/dave-terrified.webp` | 128×147 | 512×512 | 4.0× | seated rider |
| `riders/dave-dizzy.webp` | 128×152 | 512×512 | 4.0× | seated rider |
| `carts/golden.webp` | 266×170 | 1024×512 | 3.8× | cart body |
| `carts/wooden.webp` | 276×154 | 1024×512 | 3.7× | cart body |
| `carts/steel.webp` | 286×152 | 1024×512 | 3.6× | cart body |
| `carts/rocket.webp` | 290×151 | 1024×512 | 3.5× | cart body |
| `avatars/dave.webp` | 154×168 | 512×512 | 3.3× | portrait / frame |
| `carts/dragon.webp` | 309×190 | 1024×512 | 3.3× | cart body |
| `avatars/grandma.webp` | 155×159 | 512×512 | 3.3× | portrait / frame |
| `avatars/cryptobro.webp` | 156×166 | 512×512 | 3.3× | portrait / frame |
| `avatars/karen9000.webp` | 157×160 | 512×512 | 3.3× | portrait / frame |
| `avatars/influencer.webp` | 158×165 | 512×512 | 3.2× | portrait / frame |
| `avatars/goose.webp` | 159×159 | 512×512 | 3.2× | portrait / frame |
| `shop/coin-pile.webp` | 83×86 | 256×256 | 3.1× | icon |
| `riders/karen9000.webp` | 197×168 | 512×512 | 3.0× | seated rider |
| `shop/coin-sack.webp` | 85×86 | 256×256 | 3.0× | icon |
| `shop/skin-bundle.webp` | 113×86 | 256×256 | 3.0× | icon |
| `shop/coin-chest.webp` | 86×86 | 256×256 | 3.0× | icon |
| `riders/grandma.webp` | 175×172 | 512×512 | 3.0× | seated rider |
| `rewards/day7-cart.webp` | 101×86 | 256×256 | 3.0× | icon |
| `riders/cryptobro.webp` | 173×176 | 512×512 | 3.0× | seated rider |
| `riders/goose.webp` | 176×179 | 512×512 | 2.9× | seated rider |
| `riders/influencer.webp` | 185×177 | 512×512 | 2.9× | seated rider |
| `cards/volcano.webp` | 241×144 | 640×400 | 2.8× | level-select card |
| `cards/snow.webp` | 240×144 | 640×400 | 2.8× | level-select card |
| `cards/park.webp` | 251×144 | 640×400 | 2.8× | level-select card |
| `cards/night.webp` | 250×144 | 640×400 | 2.8× | level-select card |
| `cards/mountain.webp` | 243×144 | 640×400 | 2.8× | level-select card |
| `cards/desert.webp` | 243×144 | 640×400 | 2.8× | level-select card |
| `carts/basic.webp` | 442×186 | 1024×512 | 2.8× | cart body |
| `hub/challenge.webp` | 301×364 | 800×1000 | 2.7× | hub card |
| `hub/multiplayer.webp` | 314×366 | 800×1000 | 2.7× | hub card |
| `hub/events.webp` | 304×366 | 800×1000 | 2.7× | hub card |
| `hub/adventure.webp` | 312×366 | 800×1000 | 2.7× | hub card |
| `event/reward.webp` | 227×161 | 256×256 | 1.6× | icon |
| `fx/steam.webp` | 1024×128 | 1024×128 | 1.0× | 8-frame effect strip |
| `fx/snow.webp` | 1024×128 | 1024×128 | 1.0× | 8-frame effect strip |
| `fx/sand-wind.webp` | 1024×128 | 1024×128 | 1.0× | 8-frame effect strip |
| `fx/neon-sparkle.webp` | 1024×128 | 1024×128 | 1.0× | 8-frame effect strip |
| `fx/embers.webp` | 1024×128 | 1024×128 | 1.0× | 8-frame effect strip |
| `bg/volcano-sky.webp` | 1920×1080 | 1920×1080 | 1.0× | full-screen sky |
| `bg/volcano-near.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/volcano-mid.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/volcano-ground.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/volcano-far.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/snow-sky.webp` | 1920×1080 | 1920×1080 | 1.0× | full-screen sky |
| `bg/snow-near.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/snow-mid.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/snow-ground.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/snow-far.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/park-sky.webp` | 1920×1080 | 1920×1080 | 1.0× | full-screen sky |
| `bg/park-near.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/park-mid.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/park-ground.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/park-far.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/night-sky.webp` | 1920×1080 | 1920×1080 | 1.0× | full-screen sky |
| `bg/night-near.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/night-mid.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/night-far.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/mountain-sky.webp` | 1920×1080 | 1920×1080 | 1.0× | full-screen sky |
| `bg/mountain-near.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/mountain-mid.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/mountain-ground.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/mountain-far.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/desert-sky.webp` | 1920×1080 | 1920×1080 | 1.0× | full-screen sky |
| `bg/desert-near.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/desert-mid.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/desert-ground.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
| `bg/desert-far.webp` | 2880×810 | 2880×810 | 1.0× | parallax layer, tiles horizontally |
