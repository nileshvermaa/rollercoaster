# Off The Rails

An endless 2D physics roller coaster in the browser. Hill-climb style controls, carnival art,
corporate-satire commentary.

MegaCorp Fun Holdings™ handed the Wobbleton theme park to an AI trained on LinkedIn posts. Its one
directive: *maximise rider engagement time*. The result is **The Engagement Loop™**, a coaster that
never ends. You are Dave, 34, who just wanted one ride before his cousin's wedding. Karen-9000,
the park's AI safety mascot, rides along and has opinions.

> Draft 0.2: every screen from the design board is in the game: loading, title, menu, home hub,
> level select (6 worlds), gameplay, pause, run complete, garage, customize, shop, events, daily
> rewards, missions, leaderboard, profile and settings. The art is still first-draft placeholders
> sliced from composite sheets. See [docs/ROADMAP.md](docs/ROADMAP.md).

## How to play

- **Gas** climbs; the steepest hill is always climbable with fuel.
- **Brake before crests.** Too much speed over a hump and the cart leaves the rail. The **DERAIL**
  gauge shows how close the next crest is to throwing you.
- **In the air**, gas tips the nose down and brake tips it up. Land roughly parallel to the rail or
  you derail. Clean long landings pay a bonus.
- **Yellow chevrons** are boosters. They always give exactly enough speed to clear the gap after them.
- **CRANK™ cans** refill fuel. Out of fuel and stopped = run over.
- Coins (and 1 coin per 10 m) buy carts and upgrades in the **Garage** and paint, trails and wheels
  in **Customize**. Gems come from daily rewards, missions and first 3-star runs, and buy power-ups
  in the **Shop**.
- **Power-ups**: Boost (B) and Magnet (M) are buttons during a run; a Shield saves one bad landing
  automatically; a Coin Doubler doubles the next runs' coins.
- **Sound**: procedural (no audio files): calliope music that speeds up with the cart, rail clacks,
  wind, crashes and UI blips. Toggle music and effects in Settings.
- **Worlds** unlock by best distance; the **Night Carnival** event fills from long runs there;
  **Challenge** is one seeded track per day.

| Action | Phone | Keyboard |
| --- | --- | --- |
| Gas | Tilt right, or hold GAS | → / D / ↑ / W |
| Brake | Tilt left, or hold BRAKE | ← / A / ↓ / S |
| Boost / Magnet | Power-up buttons | B / M |
| Pause | II button | Esc / P |

Tilt uses the angle you hold the phone at when the run starts as neutral. Turn it off in Settings.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # lint + unit tests + production build (what CI runs)
```

```
src/
  main.js       boot
  game/         the Game hub, pure physics, save data, progression rules, systems, screens
  content/      data and tuning: physics, carts, worlds, cosmetics, shop, missions, rewards, Karen's lines
  world/        the procedural track (rail spline, gaps, boosters, pickups)
  engine/       math, input (keys, pedals, tilt), image loading
  styles/       CSS partials
public/assets/  art (backgrounds, carts, UI)
tests/          Vitest: track rules, physics, careful-driver simulation, save data, progression
tools/art/      Python helpers that cut generated art out of its backgrounds
docs/           architecture, design doc, art pipeline and image prompts, roadmap
```

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the pieces fit, and recipes for adding carts,
  track features and worlds.
- [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md): story, tone, look and feel.
- [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md): how to make and drop in art.
- [docs/ART_NEEDED.md](docs/ART_NEEDED.md): the images that still need HD versions, in priority order, with prompts.
- [CONTRIBUTING.md](CONTRIBUTING.md): workflow and style.

## Deploy

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) lints, tests and builds
every push and pull request, then deploys with the Vercel CLI: **pull requests get a preview URL
(posted as a comment), pushes to `main` go to production.** Vercel's own Git integration is turned
off in `vercel.json` so there are no double deploys.

One-time setup:

1. Create a Vercel project for this repo (vercel.com → Add New → Project, or `npx vercel link`
   locally, which writes `.vercel/project.json`).
2. Create a token at vercel.com/account/tokens.
3. In GitHub → Settings → Secrets and variables → Actions, add:
   - `VERCEL_TOKEN`: the token
   - `VERCEL_ORG_ID`: `orgId` from `.vercel/project.json` (or Team Settings → Team ID)
   - `VERCEL_PROJECT_ID`: `projectId` from `.vercel/project.json` (or Project Settings)

Until those exist the deploy job skips itself and CI stays green.

## License

[MIT](LICENSE): free to use, change and share, including commercially, as long as the copyright notice stays.
Contributions are accepted under the same license.
