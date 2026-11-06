// Garage (cart on the plinth, stats, upgrades, carousel) and Customize (paint, trail, wheels).

import { $, h, img, icon, fmt, toast } from '../dom.js';
import { drawWheel, Particles, emitTrail } from '../systems/fx.js';
import { CARTS, UPGRADES, cartById, cartStats, upgradeCost } from '../../content/carts.js';
import { PAINTS, TRAILS, WHEELS, cosmeticById } from '../../content/cosmetics.js';
import { buyCart, buyUpgrade, equipCosmetic } from '../progress.js';

const RARITY = { basic: 'STARTER', wooden: 'STABLE', steel: 'FAST', rocket: 'BOOST', golden: 'PREMIUM', dragon: 'SPECIAL' };

// The cart the garage is showing (may be one you don't own yet).
let viewing = null;

const segs = (n, max = 5) => h('span', { className: 'segs' }, ...Array.from({ length: max }, (_, i) => h('i', { className: i < n ? 'on' : '', style: `--i:${i}` })));

/** Map raw stats onto 0..5 bars, relative to the range across all carts. */
function bars(s) {
  const r = (v, lo, hi) => Math.max(1, Math.min(5, Math.round(1 + ((v - lo) / (hi - lo)) * 4)));
  return { Speed: r(s.engine, 720, 1250), Fuel: r(s.tank, 100, 260), Control: r(s.grip, 36, 65), Air: r(s.spin, 1.0, 1.5) };
}

export function renderGarage(game) {
  const { save } = game;
  if (!viewing) viewing = save.selected;
  const cart = cartById(viewing);
  const owned = save.owned.includes(cart.id);
  const levels = save.upgrades[cart.id] || {};
  const stats = cartStats(cart.id, levels);

  const pic = $('garage-cart');
  pic.src = `/assets/${cart.img}`;
  pic.alt = cart.name;
  pic.style.filter = owned ? cosmeticFilter(save) : '';
  pic.classList.toggle('locked', !owned);
  $('garage-name').textContent = cart.name;
  $('garage-rarity').textContent = RARITY[cart.id];

  const b = bars(stats);
  const rows = Object.entries(b).map(([label, n]) => h('div', { className: 'stat-row' }, h('span', {}, label), segs(n)));

  let actions;
  if (!owned) {
    actions = h('div', { className: 'row2' },
      h('button', {
        className: 'btn btn-yellow', disabled: save.coins < cart.price,
        onclick: () => { if (buyCart(save, cart.id)) { game.sound.play('buy'); game.persist(); toast(`${cart.name} is yours.`); game.refresh(); } },
      }, `Buy ● ${fmt(cart.price)}`));
  } else {
    const ups = Object.entries(UPGRADES).map(([key, u]) => {
      const lvl = levels[key] || 0;
      const maxed = lvl >= u.maxLevel;
      const cost = upgradeCost(key, lvl);
      return h('div', { className: 'stat-row up' },
        h('span', {}, u.label.replace('Rail clamps', 'Clamps').replace('Fuel tank', 'Tank')), segs(lvl, u.maxLevel),
        h('button', {
          className: 'btn btn-green btn-s', disabled: maxed || save.coins < cost || save.selected !== cart.id,
          onclick: () => { if (buyUpgrade(save, key)) { game.sound.play('buy'); game.persist(); game.refresh(); } },
        }, maxed ? 'MAX' : `● ${fmt(cost)}`));
    });
    actions = [
      h('div', { className: 'panel-sep', 'aria-hidden': 'true' }),
      ...ups,
      h('div', { className: 'row2' },
        save.selected === cart.id
          ? h('button', { className: 'btn btn-slate', disabled: true }, 'Selected')
          : h('button', { className: 'btn btn-blue', onclick: () => { save.selected = cart.id; game.persist(); game.refresh(); } }, 'Select'),
        h('button', { className: 'btn btn-purple', onclick: () => game.go('customize') }, 'Customize')),
    ];
  }
  $('garage-panel').replaceChildren(...rows, ...[actions].flat());
  $('garage-rarity').title = cart.blurb;

  $('garage-carousel').replaceChildren(
    ...CARTS.map((c) => {
      const own = save.owned.includes(c.id);
      return h('button', {
        className: `car-thumb${c.id === viewing ? ' on' : ''}${own ? '' : ' locked'}`, 'aria-label': c.name,
        onclick: () => { viewing = c.id; game.refresh(); },
      }, img(c.img, ''), !own && h('span', { className: 'price' }, icon('coin', 'gem-i'), ` ${fmt(c.price)}`));
    }),
  );
}

export function resetGarageView() {
  viewing = null;
}

// ---- Customize ----

let draft = null; // { paint, trail, wheel } being previewed

export function cosmeticFilter(save, paintId = save.cosmetics.equipped.paint) {
  const f = cosmeticById('paint', paintId).filter;
  return f === 'none' ? '' : f;
}

export function bindCustomize(game) {
  $('cz-reset').addEventListener('click', () => { draft = { ...game.save.cosmetics.equipped }; renderCustomize(game); });
  $('cz-apply').addEventListener('click', () => {
    const { save } = game;
    for (const kind of ['paint', 'trail', 'wheel']) {
      if (!equipCosmetic(save, kind, draft[kind])) {
        game.sound.play('error');
        const item = cosmeticById(kind, draft[kind]);
        return toast(item.source ? `${item.name} comes from the ${item.source === 'event' ? 'event' : 'shop skin bundle'}.` : 'Not enough coins.');
      }
    }
    game.sound.play('buy');
    game.persist();
    toast('Applied. Looking expensive.');
    game.refresh();
  });
}

export function renderCustomize(game) {
  const { save } = game;
  if (!draft) draft = { ...save.cosmetics.equipped };
  const owned = save.cosmetics.owned;
  const cart = cartById(save.selected);

  const cz = $('cz-cart');
  cz.src = `/assets/${cart.img}`;
  cz.style.filter = cosmeticFilter(save, draft.paint);
  startTrailPreview(game);

  const mark = (kind, item) =>
    owned[kind].includes(item.id) ? null : h('span', { className: 'locked-mark', 'aria-hidden': 'true' }, item.source ? '★' : '●');
  const pick = (kind, id) => () => { draft[kind] = id; renderCustomize(game); };
  const title = (kind, item) => (owned[kind].includes(item.id) ? item.name : item.source ? `${item.name} (${item.source})` : `${item.name} · ${fmt(item.price)} coins`);

  $('cz-paint').replaceChildren(...PAINTS.map((p) => h('button', {
    className: `swatch${draft.paint === p.id ? ' on' : ''}${owned.paint.includes(p.id) ? '' : ' unowned'}`,
    style: `background: linear-gradient(180deg, ${p.swatch[0]}, ${p.swatch[1]})`, title: title('paint', p), 'aria-label': title('paint', p),
    onclick: pick('paint', p.id),
  }, mark('paint', p))));
  $('cz-trails').replaceChildren(...TRAILS.map((t) => h('button', {
    className: `opt trail${draft.trail === t.id ? ' on' : ''}${owned.trail.includes(t.id) ? '' : ' unowned'}`, title: title('trail', t), 'aria-label': title('trail', t),
    onclick: pick('trail', t.id),
  }, t.id === 'none' ? h('span', { className: 'none' }, 'None') : trailThumb(t.id), mark('trail', t))));
  $('cz-wheels').replaceChildren(...WHEELS.map((w) => h('button', {
    className: `opt wheel${draft.wheel === w.id ? ' on' : ''}${owned.wheel.includes(w.id) ? '' : ' unowned'}`, title: title('wheel', w), 'aria-label': title('wheel', w),
    onclick: pick('wheel', w.id),
  }, wheelThumb(w.id), mark('wheel', w))));

  const cost = ['paint', 'trail', 'wheel'].reduce((n, k) => {
    const item = cosmeticById(k, draft[k]);
    return n + (owned[k].includes(item.id) ? 0 : item.price);
  }, 0);
  $('cz-apply').textContent = cost ? `Apply · ● ${fmt(cost)}` : 'Apply';
}

export function resetCustomize() {
  draft = null;
}

// ---- code-drawn previews ----

function wheelThumb(id) {
  const c = h('canvas', { width: 96, height: 96, className: 'thumb-canvas' });
  const g = c.getContext('2d');
  g.translate(48, 48);
  drawWheel(g, 40, -0.4, id);
  return c;
}

function trailThumb(id) {
  const c = h('canvas', { width: 136, height: 92, className: 'thumb-canvas' });
  const g = c.getContext('2d');
  const ps = new Particles();
  // Simulate a short burst so the thumbnail shows the trail's shape and colours.
  for (let f = 0; f < 30; f++) {
    emitTrail(ps, id, 128, 0, 3600, 0, f / 30);
    ps.update(1 / 45);
  }
  ps.draw(g, (x) => x, (y) => 46 - y, 1.1);
  return c;
}

let previewRaf = 0;
/** Animate the selected trail behind the preview cart while Customize is open. */
function startTrailPreview(game) {
  cancelAnimationFrame(previewRaf);
  const canvas = $('cz-trail');
  const g = canvas.getContext('2d');
  const ps = new Particles();
  let last = performance.now(), t = 0;
  const tick = (now) => {
    if (game.state !== 'customize') return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now; t += dt;
    if (draft.trail !== 'none') emitTrail(ps, draft.trail, 112, 0, 4200, 0, t);
    ps.update(dt);
    g.clearRect(0, 0, canvas.width, canvas.height);
    ps.draw(g, (x) => x, (y) => 56 - y, 1);
    previewRaf = requestAnimationFrame(tick);
  };
  previewRaf = requestAnimationFrame(tick);
}
