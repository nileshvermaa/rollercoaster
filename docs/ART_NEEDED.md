# HD art needed

Every image in the game today was sliced from 1536Ã—1024 composite sheets, so all of them are
**1.6Ã— to 14Ã— below the resolution they need** (run `python tools/art/asset_report.py` for the live
list). Upscaling can't recover detail that small, so the fix is to **regenerate each asset on its own**.

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

## Tier 1: backgrounds (biggest visual win, 5â€“14Ã— too small today)

Parallax layers (`-far`, `-mid`, `-near`) are **3840Ã—1080, transparent above the scenery, and tile
seamlessly left to right**. The sky (`-sky`) is **1920Ã—1080, fully painted**. Scenery sits in the
bottom part of the frame: far â‰ˆ bottom 40%, mid â‰ˆ bottom 55%, near â‰ˆ bottom 30%.

| File | Prompt |
| --- | --- |
| `bg/park-sky` | Sunset sky only: deep purple top â†’ pink â†’ warm orange horizon, fluffy lilac clouds, a few faint stars, two small firework bursts. No ground. |
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

Full-screen backdrops, **1920Ã—1080, fully painted, centre calm and slightly darker for UI**:

| File | Prompt |
| --- | --- |
| `bg/splash` | Sweeping sunset carnival panorama, red coaster track climbing through the centre, castle and ferris wheel at the sides, fireworks. Top third clear for the logo. |
| `bg/menu` | Sunset carnival with castle, circus tents and ferris wheel, middle softly darker. |
| `bg/loading` | Dark purple silhouette of a coaster loop and ferris wheel against a glowing pink-orange sunset. Large empty centre. |
| `bg/garage` | Cartoon garage interior: tool walls, tyre stacks, red toolbox, checkered floor, spotlight pool on an empty round platform. |
| `event/banner` (1920Ã—800) | Night carnival, neon ferris wheel, glowing tents, fireworks, a golden coaster cart bottom-right. Left half calmer for text. |

## Tier 2: the train (3â€“4Ã— too small)

**1024Ã—512, transparent, side view facing right, body only, NO wheels, seats visible on top,
same size and chassis height for every cart:**

`carts/basic` red body, yellow flame decal Â· `carts/wooden` warm wood slats, rivets Â·
`carts/steel` metallic blue streamlined shell Â· `carts/rocket` red/yellow racer with chrome rear
nozzle Â· `carts/golden` gold plating, crown ornament Â· `carts/dragon` red-orange dragon head at the front.

**512Ã—512, transparent, seated passenger, side view facing right, waist up, sitting in a black coaster seat:**

`riders/dave-calm`, `riders/dave-excited`, `riders/dave-terrified`, `riders/dave-dizzy`: Dave
(swept brown hair, red shirt) with that expression Â· `riders/karen9000` boxy silver robot with a blonde
bob and a megaphone Â· `riders/cryptobro` hoodie, gold chain, laser-eye glow Â· `riders/influencer`
filming on a phone, peace sign Â· `riders/grandma` knitting, unbothered Â· `riders/goose` angry goose in a tiny helmet.

`carts/coaster-wheel` (256Ã—256): coaster wheel, exact side view, dark polyurethane tyre, red hub with 6 bolts.

## Tier 3: menus and cards (2â€“5Ã— too small)

`ui/logo` 2048Ã—1024 transparent (check every letter) Â· `hub/adventure|events|multiplayer|challenge`
800Ã—1000 painted cards Â· `cards/park|night|mountain|desert|snow|volcano` 640Ã—400 painted thumbnails
Â· `ui/plinth` 1024Ã—512 Â· `ui/ribbon` 1536Ã—384 Â· `ui/stars` 768Ã—256 (gold, grey, gold-sparkle in a row)
Â· `trails/fire|ice|rainbow|electric` 1024Ã—256 Â· `wheels/gold|neon|wood|spiked` 256Ã—256 Â·
`avatars/*` 512Ã—512 round portraits and frames.

## Tier 4: icons (2â€“3Ã— too small, least visible)

256Ã—256 transparent each: `ui/gem`, `ui/fuel`, `ui/boost`, `ui/shield`, `ui/magnet`,
`ui/hourglass`, `ui/trophy`, `ui/medal-1|2|3`, `shop/*`, `rewards/*`, `missions/*`, `event/timer`,
`event/reward`.

---

## Full list (generated)

| File | Now | Target | Short by | Use |
| --- | --- | --- | --- | --- |
| `bg/mountain-sky.webp` | 276×76 | 1920×1080 | 14.2× | full-screen sky |
| `bg/mountain-near.webp` | 279×76 | 3840×1080 | 14.2× | parallax layer, tiles horizontally |
| `bg/mountain-mid.webp` | 280×76 | 3840×1080 | 14.2× | parallax layer, tiles horizontally |
| `bg/mountain-far.webp` | 279×76 | 3840×1080 | 14.2× | parallax layer, tiles horizontally |
| `bg/volcano-sky.webp` | 276×77 | 1920×1080 | 14.0× | full-screen sky |
| `bg/volcano-near.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/volcano-mid.webp` | 280×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/volcano-far.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/snow-sky.webp` | 276×77 | 1920×1080 | 14.0× | full-screen sky |
| `bg/snow-near.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/snow-mid.webp` | 280×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/snow-far.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/night-sky.webp` | 276×77 | 1920×1080 | 14.0× | full-screen sky |
| `bg/night-near.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/night-mid.webp` | 280×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/night-far.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/desert-sky.webp` | 276×77 | 1920×1080 | 14.0× | full-screen sky |
| `bg/desert-near.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/desert-mid.webp` | 280×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `bg/desert-far.webp` | 279×77 | 3840×1080 | 14.0× | parallax layer, tiles horizontally |
| `trails/ice.webp` | 86×38 | 1024×256 | 11.9× | boost trail |
| `trails/fire.webp` | 87×38 | 1024×256 | 11.8× | boost trail |
| `trails/rainbow.webp` | 95×40 | 1024×256 | 10.8× | boost trail |
| `trails/electric.webp` | 95×37 | 1024×256 | 10.8× | boost trail |
| `bg/park-near.webp` | 1077×112 | 3840×1080 | 9.6× | parallax layer, tiles horizontally |
| `bg/park-far.webp` | 1077×134 | 3840×1080 | 8.1× | parallax layer, tiles horizontally |
| `bg/park-sky.webp` | 1071×163 | 1920×1080 | 6.6× | full-screen sky |
| `bg/park-mid.webp` | 1077×174 | 3840×1080 | 6.2× | parallax layer, tiles horizontally |
| `bg/menu.webp` | 520×218 | 1920×1080 | 5.0× | full-screen backdrop |
| `bg/loading.webp` | 476×218 | 1920×1080 | 5.0× | full-screen backdrop |
| `bg/garage.webp` | 501×218 | 1920×1080 | 5.0× | full-screen backdrop |
| `wheels/wood.webp` | 60×55 | 256×256 | 4.7× | wheel skin |
| `wheels/neon.webp` | 57×55 | 256×256 | 4.7× | wheel skin |
| `bg/splash.webp` | 666×238 | 1920×1080 | 4.5× | full-screen backdrop |
| `wheels/spiked.webp` | 62×57 | 256×256 | 4.5× | wheel skin |
| `ui/logo.webp` | 507×233 | 2048×1024 | 4.4× | logo |
| `riders/dave-calm.webp` | 117×147 | 512×512 | 4.4× | seated rider |
| `wheels/gold.webp` | 60×59 | 256×256 | 4.3× | wheel skin |
| `ui/plinth.webp` | 395×122 | 1024×512 | 4.2× | display platform |
| `riders/dave-excited.webp` | 123×148 | 512×512 | 4.2× | seated rider |
| `event/banner.webp` | 904×197 | 1920×800 | 4.1× | full-screen event backdrop |
| `riders/dave-terrified.webp` | 128×147 | 512×512 | 4.0× | seated rider |
| `riders/dave-dizzy.webp` | 128×152 | 512×512 | 4.0× | seated rider |
| `carts/golden.webp` | 266×170 | 1024×512 | 3.8× | cart body |
| `avatars/frame-silver.webp` | 135×146 | 512×512 | 3.8× | portrait / frame |
| `avatars/frame-gold.webp` | 136×162 | 512×512 | 3.8× | portrait / frame |
| `carts/wooden.webp` | 276×154 | 1024×512 | 3.7× | cart body |
| `avatars/frame-bronze.webp` | 140×142 | 512×512 | 3.7× | portrait / frame |
| `carts/steel.webp` | 286×152 | 1024×512 | 3.6× | cart body |
| `carts/rocket.webp` | 290×151 | 1024×512 | 3.5× | cart body |
| `avatars/frame-legendary.webp` | 149×165 | 512×512 | 3.4× | portrait / frame |
| `avatars/dave.webp` | 154×168 | 512×512 | 3.3× | portrait / frame |
| `carts/dragon.webp` | 309×190 | 1024×512 | 3.3× | cart body |
| `avatars/grandma.webp` | 155×159 | 512×512 | 3.3× | portrait / frame |
| `avatars/cryptobro.webp` | 156×166 | 512×512 | 3.3× | portrait / frame |
| `avatars/karen9000.webp` | 157×160 | 512×512 | 3.3× | portrait / frame |
| `avatars/influencer.webp` | 158×165 | 512×512 | 3.2× | portrait / frame |
| `avatars/goose.webp` | 159×159 | 512×512 | 3.2× | portrait / frame |
| `ui/boost.webp` | 81×114 | 256×256 | 3.2× | icon |
| `missions/crash.webp` | 91×81 | 256×256 | 3.2× | icon |
| `ui/ribbon.webp` | 560×124 | 1536×384 | 3.1× | results ribbon |
| `shop/coin-pile.webp` | 83×86 | 256×256 | 3.1× | icon |
| `riders/karen9000.webp` | 197×168 | 512×512 | 3.0× | seated rider |
| `missions/stunt.webp` | 86×84 | 256×256 | 3.0× | icon |
| `shop/gem-pile.webp` | 88×85 | 256×256 | 3.0× | icon |
| `shop/coin-sack.webp` | 85×86 | 256×256 | 3.0× | icon |
| `shop/coin-doubler.webp` | 89×85 | 256×256 | 3.0× | icon |
| `shop/skin-bundle.webp` | 113×86 | 256×256 | 3.0× | icon |
| `shop/gem-chest.webp` | 89×86 | 256×256 | 3.0× | icon |
| `shop/coin-chest.webp` | 86×86 | 256×256 | 3.0× | icon |
| `shop/boost-refill.webp` | 87×86 | 256×256 | 3.0× | icon |
| `riders/grandma.webp` | 175×172 | 512×512 | 3.0× | seated rider |
| `rewards/gift-box.webp` | 92×86 | 256×256 | 3.0× | icon |
| `rewards/day7-cart.webp` | 101×86 | 256×256 | 3.0× | icon |
| `missions/distance.webp` | 95×86 | 256×256 | 3.0× | icon |
| `missions/coins.webp` | 88×86 | 256×256 | 3.0× | icon |
| `missions/boost.webp` | 88×86 | 256×256 | 3.0× | icon |
| `riders/cryptobro.webp` | 173×176 | 512×512 | 3.0× | seated rider |
| `riders/goose.webp` | 176×179 | 512×512 | 2.9× | seated rider |
| `riders/influencer.webp` | 185×177 | 512×512 | 2.9× | seated rider |
| `ui/gem.webp` | 109×91 | 256×256 | 2.8× | icon |
| `cards/volcano.webp` | 241×144 | 640×400 | 2.8× | level-select card |
| `cards/snow.webp` | 240×144 | 640×400 | 2.8× | level-select card |
| `cards/park.webp` | 251×144 | 640×400 | 2.8× | level-select card |
| `cards/night.webp` | 250×144 | 640×400 | 2.8× | level-select card |
| `cards/mountain.webp` | 243×144 | 640×400 | 2.8× | level-select card |
| `cards/desert.webp` | 243×144 | 640×400 | 2.8× | level-select card |
| `ui/hourglass.webp` | 93×118 | 256×256 | 2.8× | icon |
| `carts/basic.webp` | 442×186 | 1024×512 | 2.8× | cart body |
| `hub/challenge.webp` | 301×364 | 800×1000 | 2.7× | hub card |
| `hub/multiplayer.webp` | 314×366 | 800×1000 | 2.7× | hub card |
| `hub/events.webp` | 304×366 | 800×1000 | 2.7× | hub card |
| `hub/adventure.webp` | 312×366 | 800×1000 | 2.7× | hub card |
| `ui/shield.webp` | 97×107 | 256×256 | 2.6× | icon |
| `ui/fuel.webp` | 99×106 | 256×256 | 2.6× | icon |
| `ui/magnet.webp` | 109×127 | 256×256 | 2.3× | icon |
| `ui/medal-3.webp` | 116×158 | 256×256 | 2.2× | icon |
| `ui/medal-2.webp` | 119×159 | 256×256 | 2.2× | icon |
| `ui/medal-1.webp` | 121×160 | 256×256 | 2.1× | icon |
| `ui/stars.webp` | 417×130 | 768×256 | 2.0× | star states |
| `ui/trophy.webp` | 137×158 | 256×256 | 1.9× | icon |
| `carts/coaster-wheel.webp` | 152×153 | 256×256 | 1.7× | wheel |
| `event/timer.webp` | 154×174 | 256×256 | 1.7× | icon |
| `event/reward.webp` | 227×161 | 256×256 | 1.6× | icon |
