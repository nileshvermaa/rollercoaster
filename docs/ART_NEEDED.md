# HD art still needed

These are the only images still below the resolution they need (they were sliced from the early
composite sheets). Everything else is either delivered in HD or drawn in code. Run
`python tools/art/asset_report.py` for the live numbers.

## How to deliver

1. **One asset per request.** Start every prompt with: *"Generate ONLY this one image. Do not make a
   sheet, collage, board or grid. No labels, borders or text."*
2. Download the **original file**, at the size given or larger.
3. Sprites need **real transparency** or a flat **#00FF00** background. Never a painted checkerboard.
4. Save it under `art/hd/` with the path given below (any image extension), then run:
   ```bash
   python tools/art/ingest.py
   ```
   Backdrops can instead go in your art folder as `BG_{name}.png` and be installed with
   `python tools/art/ingest.py --from G:/game/fullresart`. Either way the tool keys out green,
   trims, scales, warns if anything is too small and installs it. No code changes needed.

Attach the reference boards and `public/assets/carts/basic.webp` as style references.

**Style line (end every prompt with it):** *polished playful 2D mobile game art, bright cartoon,
rounded shapes, crisp dark outlines, soft shadows, warm glossy highlights, light from top-left,
palette midnight #22213D, purple #48346F, pink #F4A6D7, gold #FFB62E, coral #E95757, blue #42A5EF,
green #72C95A.*

**Don't send** (already drawn in code, sharp at any size): UI icons, coins, gems, power-ups, stars,
medals, trophy, avatar frames, the garage platform, the results ribbon, wheels and wheel skins, boost
trails, flames, sparks, fireworks, clouds, weather. Also no logo: the splash and menu backdrops carry it.

---

## 1. Backdrops (most visible)

**1920×1080, fully painted, no text.**

| Save as | Goes to | Prompt |
| --- | --- | --- |
| `BG_garage.png` | Garage screen | Cartoon coaster workshop interior: tool wall, tyre stacks, red toolbox, checkered floor, warm hanging lamps, a spotlight pool on an empty round display platform **left of centre**. Right third calmer and darker (a stats panel sits there). |
| `BG_events.png` | Events screen | Night carnival: neon ferris wheel, glowing striped tents, fireworks, a golden coaster cart on a lit track bottom-right. **Left half calm and dark** for event text. |

Optional:
- `night-ground.png` (3840×1080, transparent above the ground strip) to texture the Night Carnival
  hills like the other worlds.
- `BG_loading.png` for a dedicated loading screen (today it's a silhouette composed from the park layers).

## 2. The train (seen every run)

**Carts: 1024×512, transparent, side view facing right, body only, NO wheels (wheels are drawn in
code), 2–3 seat backs visible on top, same size and chassis height as `carts/basic.webp`.** These are
roller coaster cars, not go-karts.

| Save as | Prompt |
| --- | --- |
| `art/hd/carts/basic.png` | Glossy red coaster car, yellow-orange flame decal along the side, chrome front bumper, small glowing headlight. |
| `art/hd/carts/wooden.png` | Warm brown wooden slat coaster car, iron rivets and corner brackets, dark leather seats. |
| `art/hd/carts/steel.png` | Sleek metallic blue streamlined coaster car, steel trim, chrome accents, pointed nose. |
| `art/hd/carts/rocket.png` | Red and yellow racing coaster car with a chrome rocket nozzle at the rear, racing stripes. No flame (that's code). |
| `art/hd/carts/golden.png` | Gold-plated coaster car, small crown ornament at the front, engraved trim, red velvet seats. |
| `art/hd/carts/dragon.png` | Red-orange coaster car shaped like a dragon: sculpted head with horns at the front, scales, spiked tail. |

**Riders: 512×512, transparent, side view facing right, waist up, sitting in a black coaster seat
(seat back visible), same framing for all.**

| Save as | Prompt |
| --- | --- |
| `art/hd/riders/dave-calm.png` | Dave: swept brown hair, red shirt, relaxed smile. |
| `art/hd/riders/dave-excited.png` | Dave: big open grin, eyes wide, hair blown back. |
| `art/hd/riders/dave-terrified.png` | Dave: screaming, sweat drops, gripping the bar. |
| `art/hd/riders/dave-dizzy.png` | Dave: spiral eyes, little stars circling his head. |
| `art/hd/riders/karen9000.png` | Karen-9000: boxy silver robot, blonde bob haircut, red visor eyes, megaphone. |
| `art/hd/riders/cryptobro.png` | Crypto Bro: purple hoodie, gold coin chain, red laser-eye glow, fist up. |
| `art/hd/riders/influencer.png` | Influencer: ponytail, sunglasses on head, filming on a phone, peace sign. |
| `art/hd/riders/grandma.png` | Grandma: white bun, round glasses, knitting, totally unbothered. |
| `art/hd/riders/goose.png` | A goose in a tiny red aviator helmet and goggles, honking. |

## 3. Menu art

| Save as | Size | Prompt |
| --- | --- | --- |
| `art/hd/hub/adventure.png` | 800×1000 | Dave cheering in the red flame coaster car cresting a sunset hill, castle behind. Bottom third darker for a label. |
| `art/hd/hub/events.png` | 800×1000 | Night carnival tent with fireworks and a neon ferris wheel. Bottom third darker. |
| `art/hd/hub/multiplayer.png` | 800×1000 | Two coaster cars racing side by side, crossed chequered flags above. Bottom third darker. |
| `art/hd/hub/challenge.png` | 800×1000 | Gold trophy on a rock under spotlight beams, coasters behind. Bottom third darker. |
| `art/hd/cards/{world}.png` | 640×400 | One per world (`park`, `night`, `mountain`, `desert`, `snow`, `volcano`): a small scene with a coaster, strong focal point, readable at 160 px wide. |
| `art/hd/avatars/{name}.png` | 512×512 | Round head-and-shoulders portraits, transparent, no frame: `dave`, `karen9000`, `cryptobro`, `influencer`, `grandma`, `goose` (same looks as the riders). |

## 4. Shop and reward items (least visible)

**512×512, transparent:**

| Save as | Prompt |
| --- | --- |
| `art/hd/shop/coin-pile.png` | Small pile of gold star coins. |
| `art/hd/shop/coin-sack.png` | Bulging sack of gold coins. |
| `art/hd/shop/coin-chest.png` | Open treasure chest overflowing with gold coins. |
| `art/hd/shop/skin-bundle.png` | Three mini coaster cars in different paints, fanned out. |
| `art/hd/rewards/day7-cart.png` | The gold-plated coaster car on a small round pedestal, sparkles. |
| `art/hd/event/reward.png` | A neon purple coaster car on a glowing pedestal. |

---

## Current sizes (generated)

| File | Now | Target | Short by | Use |
| --- | --- | --- | --- | --- |
| `bg/garage.webp` | 501×218 | 1920×1080 | 5.0× | full-screen backdrop |
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
