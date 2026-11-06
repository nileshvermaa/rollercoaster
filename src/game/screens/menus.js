// Main menu, home hub and level select.

import { $, h, img, fmt, toast, lockIcon } from '../dom.js';
import { WORLDS } from '../../content/worlds.js';
import { worldStars, worldUnlocked, dailyState, claimableCount, challengeFor } from '../progress.js';

export function renderMenu(game) {
  const n = claimableCount(game.save);
  const bm = $('badge-missions');
  bm.textContent = n;
  bm.classList.toggle('hidden', n === 0);
  $('badge-rewards').classList.toggle('hidden', !dailyState(game.save).canClaim);
}

export function bindHub(game) {
  $('hub-multi').addEventListener('click', () => toast('Multiplayer needs a game server. Coming soon!'));
  $('hub-challenge').addEventListener('click', () => {
    const c = challengeFor();
    game.play({ world: c.world, seed: c.seed, mode: 'challenge' });
  });
}

export function renderHub() {
  const c = challengeFor();
  $('challenge-sub').textContent = `Today: ${WORLDS.find((w) => w.id === c.world).name}`;
}

export function renderLevels(game) {
  const { save } = game;
  $('level-list').replaceChildren(
    ...WORLDS.map((w) => {
      const open = worldUnlocked(save, w);
      const best = save.worlds[w.id] || 0;
      const meta = open ? `★ ${worldStars(best)}/45` : `Reach ${(w.unlock / 1000).toFixed(1)} km`;
      return h(
        'button',
        {
          className: `level-card${save.world === w.id ? ' selected' : ''}${open ? '' : ' locked'}`,
          'aria-label': open ? `${w.name}, best ${fmt(best)} m` : `${w.name}, locked`,
          onclick: () => {
            if (!open) return toast(`Reach ${fmt(w.unlock)} m in any world to unlock ${w.name}.`);
            save.world = w.id;
            game.persist();
            game.play({ world: w.id });
          },
        },
        h('span', { className: 'pic' }, img(w.card), !open && h('span', { className: 'lock' }, lockIcon())),
        h('span', { className: 'meta' }, h('b', {}, w.name), h('small', {}, meta)),
      );
    }),
  );
}
