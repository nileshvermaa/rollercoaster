// The hub: owns the save, input, renderer and the current run, runs the frame loop and the
// screen state machine (title → menu → play ⇄ pause → results).

import { $ } from './dom.js';
import { Input } from '../engine/input.js';
import { loadImages } from '../engine/assets.js';
import { loadSave, writeSave } from './save.js';
import { Renderer } from './systems/render.js';
import { startRun, updateRun } from './systems/run.js';
import { updateHud } from './systems/hud.js';
import { bindScreens, showScreen, refreshMenu, renderGarage, showResults } from './systems/screens.js';
import { CARTS } from '../content/carts.js';

const IMAGES = {
  sky: '/assets/bg/park-sky.webp',
  far: '/assets/bg/park-far.webp',
  mid: '/assets/bg/park-mid.webp',
  near: '/assets/bg/park-near.webp',
  wheel: '/assets/carts/wheel.webp',
  driver: '/assets/carts/driver.webp',
  fuel: '/assets/ui/fuel.webp',
  ...Object.fromEntries(CARTS.map((c) => [`cart_${c.id}`, `/assets/${c.img}`])),
};

export class Game {
  constructor() {
    this.save = loadSave();
    this.input = new Input();
    this.state = 'loading';
    this.lastQuipAt = -99;
    this.input.bindPedal($('pedal-gas'), 'gas');
    this.input.bindPedal($('pedal-brake'), 'brake');
    bindScreens(this);
    addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') this.state === 'play' ? this.pause() : this.state === 'pause' && this.resume();
      if ((e.code === 'Enter' || e.code === 'Space') && (this.state === 'results' || this.state === 'title')) {
        this.state === 'title' ? this.go('menu') : this.play();
      }
    });
    document.addEventListener('visibilitychange', () => document.hidden && this.state === 'play' && this.pause());
  }

  async boot() {
    const images = await loadImages(IMAGES);
    this.renderer = new Renderer($('world'), images);
    this.go('title');
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

  go(state) {
    this.state = state;
    $('hud').classList.toggle('hidden', state !== 'play' && state !== 'pause');
    document.body.classList.toggle('playing', state === 'play');
    showScreen(state === 'play' ? null : state);
    if (state === 'menu' || state === 'settings') refreshMenu(this);
    if (state === 'garage') renderGarage(this);
  }

  async play() {
    this.input.tiltEnabled = this.save.settings.tilt && (await this.input.requestTilt());
    this.input.release();
    startRun(this);
    this.go('play');
  }

  pause() {
    this.input.release();
    this.go('pause');
  }

  resume() {
    this.input.calibrate();
    this.go('play');
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
        this.go('results');
      }
    }
    if (this.cart) this.renderer.draw(this, this.state === 'play' ? dt : 0);
  }
}
