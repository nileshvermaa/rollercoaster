// The hub: owns the save, input, renderer and the current run, runs the frame loop and the screen
// flow from the design board: loading → title → menu → hub → levels → play ⇄ pause → results,
// plus garage, customize, shop, events, rewards, missions, leaderboard, profile and settings.

import { $, toast } from './dom.js';
import { Input } from '../engine/input.js';
import { loadImages } from '../engine/assets.js';
import { loadSave, writeSave } from './save.js';
import { Renderer, RENDER_IMAGES } from './systems/render.js';
import { startRun, updateRun, useBoost, useMagnet } from './systems/run.js';
import { updateHud } from './systems/hud.js';
import { levelInfo, frameFor } from './progress.js';
import { worldById } from '../content/worlds.js';
import { TIPS } from '../content/rewards.js';
import { renderMenu, renderHub, bindHub, renderLevels } from './screens/menus.js';
import { renderGarage, resetGarageView, renderCustomize, bindCustomize, resetCustomize } from './screens/garage.js';
import { renderShop, renderEvents, bindEvents, renderRewards, bindRewards } from './screens/store.js';
import { renderMissions, renderLeaderboard, renderProfile, bindProfile, renderSettings, bindSettings } from './screens/social.js';
import { showResults } from './screens/results.js';

const SCREENS = ['loading', 'title', 'menu', 'hub', 'levels', 'garage', 'customize', 'shop', 'events', 'rewards',
  'missions', 'leaderboard', 'profile', 'settings', 'pause', 'results'];
const RENDER = {
  menu: renderMenu, hub: renderHub, levels: renderLevels, garage: renderGarage, customize: renderCustomize,
  shop: renderShop, events: renderEvents, rewards: renderRewards, missions: renderMissions,
  leaderboard: renderLeaderboard, profile: renderProfile, settings: renderSettings,
};
const WORLD_VISIBLE = new Set(['play', 'pause', 'results']);

export class Game {
  constructor() {
    this.save = loadSave();
    this.input = new Input();
    this.state = 'loading';
    this.history = [];
    this.lastQuipAt = -99;
    this.lastRunOpts = {};

    this.fitStage();
    addEventListener('resize', () => this.fitStage());
    this.input.bindPedal($('pedal-gas'), 'gas');
    this.input.bindPedal($('pedal-brake'), 'brake');
    this.bindNavigation();
    bindHub(this);
    bindCustomize(this);
    bindEvents(this);
    bindRewards(this);
    bindProfile(this);
    bindSettings(this);
  }

  /** Scale the 844×390 design frame to fit the viewport. */
  fitStage() {
    const s = Math.min(innerWidth / 844, innerHeight / 390);
    document.documentElement.style.setProperty('--s', s.toFixed(4));
  }

  bindNavigation() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-go]');
      if (!el) return;
      const to = el.dataset.go;
      if (to === 'back') this.back();
      else this.go(to);
    });
    $('tap-start').addEventListener('click', (e) => { e.stopPropagation(); this.go('menu', { replace: true }); });
    $('title').addEventListener('click', () => this.go('menu', { replace: true }));
    $('btn-pause').addEventListener('click', () => this.pause());
    $('btn-resume').addEventListener('click', () => this.resume());
    $('btn-resume-x').addEventListener('click', () => this.resume());
    $('btn-restart').addEventListener('click', () => this.play(this.lastRunOpts));
    $('btn-levels').addEventListener('click', () => { this.history = ['menu', 'hub']; this.go('levels', { replace: true }); });
    $('btn-pause-settings').addEventListener('click', () => this.go('settings'));
    $('btn-retry').addEventListener('click', () => this.play(this.lastRunOpts));
    $('btn-next').addEventListener('click', () => { this.history = ['menu', 'hub']; this.go('levels', { replace: true }); });
    $('pu-boost').addEventListener('click', () => useBoost(this));
    $('pu-magnet').addEventListener('click', () => useMagnet(this));

    addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'play') this.pause();
        else if (this.state === 'pause') this.resume();
        else if (this.state !== 'title' && this.state !== 'loading' && this.state !== 'results') this.back();
      }
      if (this.state === 'play' && e.code === 'KeyB') useBoost(this);
      if (this.state === 'play' && e.code === 'KeyM') useMagnet(this);
      if ((e.code === 'Enter' || e.code === 'Space') && this.state === 'title') this.go('menu', { replace: true });
      if ((e.code === 'Enter' || e.code === 'Space') && this.state === 'results') this.play(this.lastRunOpts);
    });
    document.addEventListener('visibilitychange', () => document.hidden && this.state === 'play' && this.pause());
  }

  async boot() {
    $('load-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    const started = performance.now();
    const progress = (done, total) => {
      const pct = Math.round((done / total) * 100);
      $('load-fill').style.width = `${pct}%`;
      $('load-pct').textContent = `${pct}%`;
    };
    const images = await loadImages(RENDER_IMAGES, progress);
    this.renderer = new Renderer($('world'), images);
    this.applySettings();
    await this.renderer.prepareWorld(worldById(this.save.world));
    const wait = 700 - (performance.now() - started); // let the loading art register
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.go('title', { replace: true });

    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this.tick(dt);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  persist() {
    writeSave(this.save);
  }

  applySettings() {
    this.renderer?.setQuality(this.save.settings.graphics === 'low');
  }

  vibrate(ms) {
    if (this.save.settings.vibration && navigator.vibrate) navigator.vibrate(ms);
  }

  /** Update every [data-bind] element (coins, gems, name, level, xp, frame). */
  refreshBinds() {
    const { save } = this;
    const lvl = levelInfo(save);
    const values = {
      coins: save.coins.toLocaleString('en-US'),
      gems: save.gems.toLocaleString('en-US'),
      name: save.name,
      level: String(lvl.level),
      xpText: `${lvl.xp.toLocaleString('en-US')} / ${lvl.to.toLocaleString('en-US')} XP`,
    };
    for (const el of document.querySelectorAll('[data-bind]')) {
      const k = el.dataset.bind;
      if (k === 'xp') el.style.width = `${Math.round(lvl.frac * 100)}%`;
      else if (k === 'frame') el.src = `/assets/avatars/frame-${frameFor(lvl.level)}.webp`;
      else if (k in values) el.textContent = values[k];
    }
  }

  /** Re-render the current screen after a purchase or setting change. */
  refresh() {
    this.refreshBinds();
    RENDER[this.state]?.(this);
  }

  go(state, { replace = false } = {}) {
    const from = this.state;
    if (!replace && from !== state && SCREENS.includes(from) && !['loading', 'title', 'results'].includes(from)) this.history.push(from);
    if (from === 'play') this.history = [];
    if (state === 'garage' && from !== 'customize') resetGarageView();
    if (state === 'customize') resetCustomize();
    this.state = state;
    $('hud').classList.toggle('hidden', state !== 'play' && state !== 'pause');
    document.body.classList.toggle('playing', state === 'play');
    for (const s of SCREENS) $(s).classList.toggle('show', s === state);
    this.refresh();
  }

  back() {
    const to = this.history.pop() || 'menu';
    if (to === 'pause') {
      this.state = 'pause';
      for (const s of SCREENS) $(s).classList.toggle('show', s === 'pause');
      $('hud').classList.remove('hidden');
      return;
    }
    this.go(to, { replace: true });
  }

  async play(opts = {}) {
    this.lastRunOpts = opts;
    this.input.tiltEnabled = this.save.settings.tilt && (await this.input.requestTilt());
    this.input.release();
    const world = worldById(opts.world || this.save.world);
    await this.renderer.prepareWorld(world);
    startRun(this, opts);
    this.history = [];
    this.go('play', { replace: true });
  }

  pause() {
    if (this.state !== 'play') return;
    this.input.release();
    this.history = [];
    this.go('pause', { replace: true });
  }

  resume() {
    this.input.calibrate();
    this.history = [];
    this.go('play', { replace: true });
  }

  /** Karen-9000 speaks. Throttled so she nags, but not every frame. */
  say(text, force = false) {
    const t = this.time ?? 0;
    if (!force && t - this.lastQuipAt < 4) return;
    this.lastQuipAt = t;
    $('karen-text').textContent = text;
    const el = $('karen');
    el.classList.remove('hidden');
    clearTimeout(this.quipTimer);
    this.quipTimer = setTimeout(() => el.classList.add('hidden'), 2800);
  }

  tick(dt) {
    if (!this.renderer) return;
    if (this.state === 'play') {
      const finished = updateRun(this, dt);
      this.renderer.follow(this.cart, dt);
      updateHud(this);
      if (finished) {
        showResults(this);
        this.go('results', { replace: true });
        if (this.lastResult?.newBest) toast('New personal best!');
      }
    }
    const showWorld = this.cart && (WORLD_VISIBLE.has(this.state) || (this.state === 'settings' && this.history.includes('pause')));
    $('world').style.visibility = showWorld ? 'visible' : 'hidden';
    if (showWorld) this.renderer.draw(this, this.state === 'play' ? dt : 0);
  }
}
