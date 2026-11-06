// Turns keyboard, the on-screen pedals and phone tilt into { throttle, brake } in 0..1.
// Tilt: the angle the phone is held at when a run starts is neutral (calibrate()), a dead zone
// ignores hand wobble, and a full lean of TILT_RANGE degrees is full throttle or brake.

import { clamp } from './math.js';

const TILT_RANGE = 18;
const DEAD_ZONE = 0.12;

export class Input {
  constructor() {
    this.keys = new Set();
    this.pedals = { gas: false, brake: false };
    this.tiltEnabled = false;
    this.tiltRaw = null; // degrees, along the steering axis for the current orientation
    this.neutral = 0;

    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => { this.keys.clear(); this.pedals.gas = this.pedals.brake = false; });
    addEventListener('deviceorientation', (e) => {
      if (e.beta == null) return;
      const angle = (screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0;
      // Landscape: rolling the phone like a steering wheel changes beta. Portrait: gamma.
      if (angle === 90) this.tiltRaw = e.beta;
      else if (angle === -90 || angle === 270) this.tiltRaw = -e.beta;
      else this.tiltRaw = e.gamma;
    });
  }

  bindPedal(el, which) {
    const set = (on) => (e) => {
      e.preventDefault();
      this.pedals[which] = on;
      el.classList.toggle('down', on);
    };
    el.addEventListener('pointerdown', set(true));
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, set(false));
  }

  /** Must run inside a user gesture: iOS only grants motion access from a tap. */
  async requestTilt() {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return false;
    try {
      if (typeof DOE.requestPermission === 'function') {
        const res = await DOE.requestPermission();
        if (res !== 'granted') return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  calibrate() {
    if (this.tiltRaw != null) this.neutral = this.tiltRaw;
  }

  release() {
    this.pedals.gas = this.pedals.brake = false;
  }

  read() {
    const k = this.keys;
    let throttle = k.has('ArrowRight') || k.has('KeyD') || k.has('ArrowUp') || k.has('KeyW') || this.pedals.gas ? 1 : 0;
    let brake = k.has('ArrowLeft') || k.has('KeyA') || k.has('ArrowDown') || k.has('KeyS') || this.pedals.brake ? 1 : 0;
    if (this.tiltEnabled && this.tiltRaw != null && !throttle && !brake) {
      let t = clamp((this.tiltRaw - this.neutral) / TILT_RANGE, -1, 1);
      t = Math.abs(t) < DEAD_ZONE ? 0 : (t - Math.sign(t) * DEAD_ZONE) / (1 - DEAD_ZONE);
      throttle = Math.max(0, t);
      brake = Math.max(0, -t);
    }
    this.last = { throttle, brake };
    return this.last;
  }
}
