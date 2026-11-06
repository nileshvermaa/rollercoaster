# Phase 5 prompts: events, hub, profile, leaderboard, characters

Same **export rules** and **shared style line** as `PROMPTS_PHASE2.md`. The spec says to do this phase only once backend services (leaderboard, multiplayer, events) are planned. The art can be made early.

## Home / Hub cards (800×1000 portrait card art, painted edge to edge)

**HUB_adventure.png** · red cart cresting a sunset hill, castle behind.
**HUB_events.png** · night carnival tent with fireworks.
**HUB_multiplayer.png** · two carts side by side racing, crossed chequered flags.
**HUB_challenge.png** · gold trophy on a rock with spotlight beams.

Add to each: "Vertical card illustration, strong focal object in the upper two-thirds, bottom third darker for a title label. [shared style line]"

## Events

**EVENT_night-carnival_banner.png** (1920×800)
> Wide event banner: night carnival with neon ferris wheel, glowing tents, fireworks and a golden cart in the foreground. Left half calmer for event text. [shared style line]

**EVENT_reward_exclusive-skin.png** (512×512) · a cart in a neon purple skin on a glowing pedestal.
**EVENT_badge_timer.png** (256×256) · gold stopwatch icon.

## Profile and leaderboard (512×512 unless noted, transparent)

**AVATAR_frame_bronze / silver / gold / legendary.png** · round avatar frames with matching metal rims; legendary has flames and gems.
**AVATAR_dave.png, AVATAR_karen9000.png, AVATAR_cryptobro.png, AVATAR_influencer.png, AVATAR_grandma.png, AVATAR_goose.png** · round head-and-shoulders portraits, same style as the driver. Descriptions:
- Dave: brown swept hair, wide nervous grin, red shirt.
- Karen-9000: boxy silver robot head with a blonde bob haircut, red visor eyes, holding a megaphone.
- Crypto Bro: sunglasses, chain necklace, laser-eye glow, hoodie.
- Influencer: ring light glow, phone up filming, peace sign.
- Unbothered Grandma: knitting, tiny glasses, totally calm.
- A Goose: angry white goose with a tiny helmet.

**RANK_medal_gold / silver / bronze.png** (256×256) · ribbon medals with 1, 2, 3 (text allowed, check digits).
**TROPHY_icon.png** (256×256) · gold cup trophy.

## Characters for the back cars (side view, seated, waist up, 512×512)

Same pose framing as `VEH007_driver.png`, so they drop into any cart seat:
**CHAR_karen9000_seated.png · CHAR_cryptobro_seated.png · CHAR_influencer_seated.png · CHAR_grandma_seated.png · CHAR_goose_seated.png**
> Cartoon passenger seated in a coaster seat, side view facing right, waist up, [DESCRIPTION from above], expressive face. [shared style line]

Plus **expression sheets** for Dave (1024×256, 4 frames): calm, excited, terrified, dizzy after crash. These drive the danger feedback in the HUD.

## Settings and system icons

Leave these to the vector kit (music, sound, vibration, graphics, language, back, close, lock). Small UI icons stay crisp as SVG at every size.
