import { Game } from './game/Game.js';

const game = new Game();
game.boot().catch((err) => {
  console.error(err);
  document.getElementById('loading').textContent = 'Something derailed while loading. Refresh to try again.';
});

if (import.meta.env.DEV) window.__game = game;
