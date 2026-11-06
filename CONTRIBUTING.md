# Contributing

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first for how the code fits together.

## Setup

Node 20.19 or newer.

```bash
npm install
npm run dev        # http://localhost:5173, window.__game in the console
```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | dev server with hot reload |
| `npm run build` | production bundle in `dist/` |
| `npm run preview` | serve the production bundle |
| `npm run lint` | ESLint (`npm run lint:fix` to auto-fix) |
| `npm test` | Vitest (`npm run test:watch` while working) |
| `npm run check` | lint, test and build: what CI runs |

## Workflow

1. Branch from `main`.
2. Make the change. Numbers and data go in `src/content/`; behaviour in the system it belongs to
   (`src/game/systems/`); track features in `src/world/track.js`; physics in `src/game/physics.js`.
3. Run `npm run check`.
4. Play it. Tests cover the rules (climbable slopes, clearable jumps, derail conditions), not feel.
   Check a phone-sized landscape viewport if you touched the HUD or screens, and a real phone if you
   touched tilt.
5. Open a pull request. CI lints, tests and builds it and posts a Vercel preview URL.

## Style

- ES modules, 2-space indent, single quotes, semicolons (`.editorconfig` and ESLint enforce the basics).
- Physics and track code stay pure (no DOM) so tests can drive them.
- Comment the *why*, not the *what*.
- Any track change must keep the invariants tested in `tests/track.test.js` and `tests/physics.test.js`:
  every slope climbable, every gap clearable from its booster.
