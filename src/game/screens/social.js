// Missions, Leaderboard, Profile and Settings.

import { $, h, img, fmt, toast } from '../dom.js';
import { missionList, missionProgress, claimMission, leaderboard, totalStars } from '../progress.js';
import { ACHIEVEMENTS } from '../../content/missions.js';
import { defaultSave } from '../save.js';

let missionTab = 'daily';
let lbTab = 'global';

const rewardLabel = (r) =>
  r.gems ? [h('img', { src: '/assets/ui/gem.webp', alt: 'gems', className: 'gem-i' }), ` ${r.gems}`] : [h('i', { className: 'coin sm' }), ` ${fmt(r.coins)}`];

export function renderMissions(game) {
  const { save } = game;
  const tabs = { daily: 'Daily', weekly: 'Weekly', ach: 'Achievements' };
  $('mission-tabs').replaceChildren(...Object.entries(tabs).map(([k, label]) =>
    h('button', { className: `tab${k === missionTab ? ' on' : ''}`, onclick: () => { missionTab = k; renderMissions(game); } }, label)));
  const list = missionList(save, missionTab);
  $('mission-list').replaceChildren(...list.map((m) => {
    const p = Math.min(missionProgress(save, missionTab, m), m.target);
    const done = p >= m.target;
    const claimed = save.missions[missionTab].claimed.includes(m.id);
    const pct = Math.round((p / m.target) * 100);
    const count = m.stat === 'airtime' ? `${p.toFixed(1)} / ${m.target} s` : `${fmt(p)} / ${fmt(m.target)}`;
    return h('div', { className: 'mission' },
      img(`missions/${m.icon}.webp`, ''),
      h('div', { className: 'mtext' }, m.text,
        h('span', { className: 'mbar' }, h('span', { className: `bar${done ? ' done' : ''}` }, h('i', { style: `width:${pct}%` })), count)),
      h('span', { className: 'reward' }, rewardLabel(m.reward)),
      claimed
        ? h('span', { className: 'state' }, 'Claimed ✓')
        : done
          ? h('button', {
              className: 'btn btn-green',
              onclick: () => { const got = claimMission(save, missionTab, m.id); if (got) { game.persist(); toast(`+${got}`); game.refresh(); } },
            }, 'Claim')
          : h('span', { className: 'state' }, 'In progress'));
  }));
}

export function renderLeaderboard(game) {
  const tabs = { global: 'Global', friends: 'Friends', weekly: 'Weekly' };
  $('lb-tabs').replaceChildren(...Object.entries(tabs).map(([k, label]) =>
    h('button', { className: `tab${k === lbTab ? ' on' : ''}`, onclick: () => { lbTab = k; renderLeaderboard(game); } }, label)));
  const { rows } = leaderboard(game.save, lbTab);
  $('lb-rows').replaceChildren(...rows.map((r) =>
    h('div', { className: `lb-row${r.me ? ' me' : ''}` },
      h('span', { className: 'rank' }, r.rank <= 3 ? img(`ui/medal-${r.rank}.webp`, `Rank ${r.rank}`) : String(r.rank)),
      img(`avatars/${r.avatar}.webp`, '', 'av'),
      h('span', { className: 'nm' }, r.name),
      h('span', { className: 'sc' }, `${fmt(r.score)} m`))));
}

export function bindProfile(game) {
  const input = $('profile-name');
  input.addEventListener('change', () => {
    const name = input.value.trim().slice(0, 16);
    if (name) game.save.name = name;
    input.value = game.save.name;
    game.persist();
    game.refreshBinds();
  });
  input.addEventListener('keydown', (e) => e.key === 'Enter' && input.blur());
}

export function renderProfile(game) {
  const { save } = game;
  $('profile-name').value = save.name;
  const trophies = save.missions.ach.claimed.filter((id) => ACHIEVEMENTS.some((a) => a.id === id)).length;
  const card = (pic, n, label) => h('div', { className: 'stat-card' }, pic, h('b', {}, n), h('small', {}, label));
  const star = h('span', { style: 'width:48px;height:50px;overflow:hidden;position:relative;display:block' },
    h('img', { src: '/assets/ui/stars.webp', alt: '', style: 'position:absolute;left:0;top:0;width:150px;height:50px' }));
  $('profile-stats').replaceChildren(
    card(star, fmt(totalStars(save)), 'Stars'),
    card(img('ui/trophy.webp', ''), fmt(trophies), 'Trophies'),
    card(img('carts/basic.webp', ''), fmt(save.owned.length), 'Carts'),
    card(img('missions/crash.webp', ''), fmt(save.stats.derails), 'Derails'),
  );
}

export function bindSettings(game) {
  for (const input of document.querySelectorAll('[data-setting]')) {
    input.addEventListener('change', async () => {
      const key = input.dataset.setting;
      if (key === 'tilt' && input.checked && !(await game.input.requestTilt())) {
        input.checked = false;
        toast('Motion access was not granted. Pedals and keys still work.');
      }
      game.save.settings[key] = input.checked;
      game.persist();
    });
  }
  const flip = () => {
    game.save.settings.graphics = game.save.settings.graphics === 'high' ? 'low' : 'high';
    game.applySettings();
    game.persist();
    renderSettings(game);
  };
  $('gfx-prev').addEventListener('click', flip);
  $('gfx-next').addEventListener('click', flip);
  $('link-privacy').addEventListener('click', (e) => { e.preventDefault(); toast('Progress is stored only on this device. No accounts, no tracking.'); });
  $('link-terms').addEventListener('click', (e) => { e.preventDefault(); toast('By riding you accept that Karen-9000 will judge you.'); });
  $('set-reset').addEventListener('click', () => {
    if (!confirm('Reset all coins, gems, carts and records?')) return;
    game.save = defaultSave();
    game.persist();
    toast('Progress reset.');
    game.go('menu', { replace: true });
  });
}

export function renderSettings(game) {
  const s = game.save.settings;
  for (const input of document.querySelectorAll('[data-setting]')) input.checked = !!s[input.dataset.setting];
  $('gfx-value').textContent = s.graphics === 'low' ? 'Low' : 'High';
}
