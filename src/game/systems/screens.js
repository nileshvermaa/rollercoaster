// Menu, garage, settings, pause and results: DOM screens and the buttons that move between them.

import { $, fmt, show } from '../dom.js';
import { CARTS, UPGRADES, cartStats, upgradeCost } from '../../content/carts.js';
import { EPITAPHS, pick } from '../../content/story.js';
import { defaultSave } from '../save.js';
import { distanceMeters } from './run.js';

const SCREENS = ['loading', 'title', 'menu', 'garage', 'settings', 'pause', 'results'];

export function showScreen(id) {
  for (const s of SCREENS) show(s, s === id);
}

export function bindScreens(game) {
  $('tap-start').addEventListener('click', () => game.go('menu'));
  $('title').addEventListener('click', () => game.go('menu'));
  $('btn-play').addEventListener('click', () => game.play());
  $('btn-garage').addEventListener('click', () => game.go('garage'));
  $('btn-settings').addEventListener('click', () => game.go('settings'));
  $('garage-back').addEventListener('click', () => game.go('menu'));
  $('settings-back').addEventListener('click', () => game.go('menu'));
  $('btn-pause').addEventListener('click', () => game.pause());
  $('btn-resume').addEventListener('click', () => game.resume());
  $('btn-restart').addEventListener('click', () => game.play());
  $('btn-quit').addEventListener('click', () => game.go('menu'));
  $('btn-retry').addEventListener('click', () => game.play());
  $('btn-res-garage').addEventListener('click', () => game.go('garage'));

  const tilt = $('set-tilt');
  tilt.addEventListener('change', async () => {
    if (tilt.checked && !(await game.input.requestTilt())) tilt.checked = false;
    game.save.settings.tilt = tilt.checked;
    game.persist();
  });
  $('set-reset').addEventListener('click', () => {
    if (!confirm('Reset all coins, carts and records?')) return;
    game.save = defaultSave();
    game.persist();
    game.go('menu');
  });
}

export function refreshMenu(game) {
  $('menu-coins').textContent = fmt(game.save.coins);
  $('menu-best').textContent = `${fmt(game.save.best)} m`;
  $('set-tilt').checked = game.save.settings.tilt;
}

export function renderGarage(game) {
  const { save } = game;
  $('garage-coins').textContent = fmt(save.coins);
  const list = $('cart-list');
  list.replaceChildren(
    ...CARTS.map((c) => {
      const owned = save.owned.includes(c.id);
      const card = document.createElement('div');
      card.className = `cart-card${save.selected === c.id ? ' selected' : ''}${owned ? '' : ' locked'}`;
      const img = Object.assign(document.createElement('img'), { src: `/assets/${c.img}`, alt: c.name });
      const name = Object.assign(document.createElement('div'), { className: 'name', textContent: c.name });
      const blurb = Object.assign(document.createElement('div'), { className: 'blurb', textContent: c.blurb });
      const btn = document.createElement('button');
      if (save.selected === c.id) {
        btn.className = 'btn btn-slate'; btn.textContent = 'Selected'; btn.disabled = true;
      } else if (owned) {
        btn.className = 'btn btn-blue'; btn.textContent = 'Select';
        btn.onclick = () => { save.selected = c.id; game.persist(); renderGarage(game); };
      } else {
        btn.className = 'btn btn-yellow'; btn.textContent = `● ${fmt(c.price)}`;
        btn.disabled = save.coins < c.price;
        btn.onclick = () => {
          if (save.coins < c.price) return;
          save.coins -= c.price;
          save.owned.push(c.id);
          save.upgrades[c.id] = { engine: 0, tank: 0, grip: 0 };
          save.selected = c.id;
          game.persist();
          renderGarage(game);
        };
      }
      card.append(img, name, blurb, btn);
      return card;
    }),
  );

  const panel = $('upgrades');
  const levels = save.upgrades[save.selected] || (save.upgrades[save.selected] = { engine: 0, tank: 0, grip: 0 });
  const stats = cartStats(save.selected, levels);
  const title = Object.assign(document.createElement('h3'), { textContent: `${CARTS.find((c) => c.id === save.selected).name} upgrades` });
  const rows = Object.entries(UPGRADES).map(([key, u]) => {
    const lvl = levels[key] || 0;
    const row = document.createElement('div');
    row.className = 'up-row';
    const label = Object.assign(document.createElement('div'), { className: 'label', textContent: u.label });
    const segs = document.createElement('div');
    segs.className = 'segs';
    for (let i = 0; i < u.maxLevel; i++) segs.append(Object.assign(document.createElement('i'), { className: i < lvl ? 'on' : '' }));
    const btn = document.createElement('button');
    btn.className = 'btn btn-green';
    if (lvl >= u.maxLevel) { btn.textContent = 'MAX'; btn.disabled = true; } else {
      const cost = upgradeCost(key, lvl);
      btn.textContent = `● ${fmt(cost)}`;
      btn.disabled = save.coins < cost;
      btn.onclick = () => {
        if (save.coins < cost) return;
        save.coins -= cost;
        levels[key] = lvl + 1;
        game.persist();
        renderGarage(game);
      };
    }
    row.append(label, btn, segs);
    return row;
  });
  const summary = Object.assign(document.createElement('p'), {
    className: 'hint',
    textContent: `Engine ${Math.round(stats.engine)} · Tank ${Math.round(stats.tank)} · Landing grip ${Math.round(stats.grip)}°`,
  });
  panel.replaceChildren(title, ...rows, summary);
}

export function showResults(game) {
  const { run, save } = game;
  const m = Math.floor(distanceMeters(game));
  const earned = run.coins + Math.floor(m / 10);
  const newBest = m > save.best;
  save.coins += earned;
  save.best = Math.max(save.best, m);
  game.persist();
  $('res-title').textContent = run.reason === 'fuel' ? 'OUT OF CRANK!' : 'DERAILED!';
  $('res-epitaph').textContent = pick(EPITAPHS[run.reason] || EPITAPHS.landing);
  $('res-dist').textContent = `${fmt(m)} m`;
  $('res-coins').textContent = `+${fmt(earned)}`;
  $('res-best').textContent = newBest ? `${fmt(m)} m NEW!` : `${fmt(save.best)} m`;
}
