# Phase 4 prompts: other biomes, customization, shop, rewards, missions

Same **export rules** and **shared style line** as `PROMPTS_PHASE2.md`. Attach both reference boards **plus the Phase 1 BG001 layers** to every biome prompt, so every world keeps the same illustration language.

## Biome parallax sets (5 layers each, 1920×1080)

Every biome uses the same 5 layers as BG001:
- **L1 sky:** fully painted, opaque, edge to edge.
- **L2 far / L3 mid / L4 near / L5 ground:** transparent or flat #00FF00. The art fills the **full width** and tiles seamlessly left-to-right. Height: L2 bottom 40%, L3 bottom 55%, L4 bottom 30%, L5 bottom 15%.

Prompt pattern for each layer:
> Side-scrolling 2D game background, [LAYER] layer for the [BIOME] world: [DESCRIPTION]. Fills the full width and tiles seamlessly horizontally. [shared style line]

| Biome | L1 sky | L2 far | L3 mid | L4 near | L5 ground |
|---|---|---|---|---|---|
| **BG002 Night Carnival** | deep indigo night, stars, coloured spotlight beams, fireworks | purple silhouettes of distant rides | neon-lit ferris wheel, carousel, glowing tents, bulb strings | dark bushes, glowing lamp posts, neon signs (no letters) | dark grass with fairy lights |
| **BG003 Mountain Resort** | bright blue sky, puffy white clouds | blue snow-capped mountain range | pine forest, wooden chalets, a rope bridge | tall pines and rocks | grassy alpine ground with wildflowers |
| **BG004 Desert Carnival** | warm orange-yellow dusty sky, heat haze | distant sandstone mesas | red rock arches, striped desert tents, cacti, abandoned scooters | cacti and boulders | sand dunes with pebbles |
| **BG005 Snow Park** | pale icy blue sky, light snowfall | icy blue mountains | snow-covered pines, frozen ferris wheel, ice castle | snowy bushes, lamp posts with icicles | snow ground with ice patches |
| **BG006 Volcano Park** | dark red-orange smoky sky, embers | erupting volcano silhouette | black rock cliffs, glowing lava falls, steam vents, scorched tents | charred trees, glowing rocks | dark rock ground with lava cracks |

Also per biome: **CARD_<biome>.png** (640×400), already listed in Phase 3. Plus a track variant:
- **TRK001_rail_<biome>.png** (1024×512): the same straight rail recoloured to match, e.g. icy blue-white rail for Snow, steel and neon tubes for Night, scorched black-red for Volcano.

**Biome particles** (sprite sheets, 8 frames in a row, 1024×128):
FX_snow · FX_embers · FX_sand-wind · FX_neon-sparkle · FX_steam

---

## Vehicle customization

**PAINT masks:** for each cart, ask for the same body in flat **white** with the original outlines and shading only (`VEH00X_<name>_paint-mask.png`). The game tints it to any colour.
> Same cart as attached, side view, identical shape and size, but the body painted flat white with all shading and outlines preserved, decals removed. [shared style line]

**Trail effects** (1024×256, 6 frames each): TRAIL_fire · TRAIL_ice · TRAIL_rainbow · TRAIL_electric · TRAIL_hearts

**Wheel skins** (256×256): WHEEL_gold · WHEEL_neon · WHEEL_wood · WHEEL_spiked

**Decals** (512×256, transparent): DECAL_flames · DECAL_stars · DECAL_racing-stripes · DECAL_lightning

---

## Shop item art (512×512 each)

**SHOP_coin-doubler.png** · gold coin with a "×2" badge (text allowed, check spelling).
**SHOP_boost-refill.png** · blue lightning bolt over a small battery.
**SHOP_coin-pile.png / SHOP_coin-sack.png / SHOP_coin-chest.png** · small, medium, large coin bundles.
**SHOP_gem-pile.png / SHOP_gem-chest.png** · gem bundles.
**SHOP_skin-bundle.png** · three mini carts fanned out.

## Daily rewards and missions (256×256 each)

**REWARD_gift-box.png** · purple gift box with gold ribbon.
**REWARD_day7-cart.png** · the Golden Cart on a small pedestal with sparkles.
**MISSION_icon_distance.png** · flag on a hill.
**MISSION_icon_coins.png** · coin stack.
**MISSION_icon_boost.png** · bolt with speed lines.
**MISSION_icon_stunt.png** · cart doing a loop.
**MISSION_icon_crash.png** · comedic dizzy stars over a dented cart (fits the meme tone).
