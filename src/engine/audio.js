// Procedural sound with the Web Audio API: no audio files. UI blips, gameplay effects, a rail
// clack and wind that follow the cart's speed, Karen's babble, and an original calliope waltz
// whose tempo rises with speed. Starts on the first user gesture (browsers require one).

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI note → Hz

// Original 16-bar waltz in C (3 beats per bar). Melody notes as MIDI (0 = rest), one per beat.
const MELODY = [
  76, 0, 79, 81, 79, 76, 74, 76, 72, 74, 0, 71,
  72, 76, 79, 84, 83, 81, 79, 0, 76, 74, 76, 79,
  77, 0, 81, 84, 81, 77, 76, 79, 76, 74, 72, 74,
  76, 79, 76, 72, 74, 71, 72, 0, 0, 72, 76, 79,
];
const BASS = [48, 43, 43, 48, 43, 43, 53, 48, 48, 55, 50, 50, 48, 43, 43, 53, 48, 48, 55, 50, 50, 48, 43, 43];

export class Sound {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.tempo = 1;
    this.mode = 'menu';
    this.lastHover = 0;
    const unlock = () => this.start();
    addEventListener('pointerdown', unlock, { once: true, capture: true });
    addEventListener('keydown', unlock, { once: true, capture: true });
  }

  start() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.music = ctx.createGain();
    this.sfx.connect(this.master);
    this.music.connect(this.master);
    this.applyToggles();

    // A second of white noise, reused by every noisy sound.
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // Continuous wind: looping noise through a low-pass, volume follows speed.
    const wind = ctx.createBufferSource();
    wind.buffer = this.noise; wind.loop = true;
    this.windFilter = ctx.createBiquadFilter(); this.windFilter.type = 'lowpass'; this.windFilter.frequency.value = 400;
    this.windGain = ctx.createGain(); this.windGain.gain.value = 0;
    wind.connect(this.windFilter).connect(this.windGain).connect(this.sfx);
    wind.start();

    this.beat = 0;
    this.nextBeat = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 50);
  }

  setEnabled({ music, sfx }) {
    this.musicOn = music;
    this.sfxOn = sfx;
    this.applyToggles();
  }

  applyToggles() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.music.gain.setTargetAtTime(this.musicOn ? 0.32 : 0, t, 0.1);
    this.sfx.gain.setTargetAtTime(this.sfxOn ? 0.9 : 0, t, 0.05);
  }

  /** mode: 'menu' | 'run' | 'pause'. Pause ducks the music; runs speed it up with the cart. */
  setMode(mode) {
    this.mode = mode;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.music.gain.setTargetAtTime(this.musicOn ? (mode === 'pause' ? 0.12 : 0.32) : 0, t, 0.2);
    if (mode !== 'run') this.windGain.gain.setTargetAtTime(0, t, 0.2);
  }

  // ---- music ----

  schedule() {
    const ctx = this.ctx;
    const beatLen = 60 / (132 * this.tempo); // waltz at ~132 bpm, faster with speed
    while (this.nextBeat < ctx.currentTime + 0.15) {
      const i = this.beat % MELODY.length;
      const bar = Math.floor(this.beat / 3) % (BASS.length / 3);
      const inBar = this.beat % 3;
      const root = BASS[bar * 3];
      if (inBar === 0) this.organ(NOTE(root - 12), this.nextBeat, beatLen * 0.9, 0.22, this.music); // oom
      else this.organ(NOTE(root + (inBar === 1 ? 4 : 7)), this.nextBeat, beatLen * 0.45, 0.1, this.music); // pah-pah
      if (MELODY[i]) this.organ(NOTE(MELODY[i]), this.nextBeat, beatLen * 0.85, 0.14, this.music, true);
      this.nextBeat += beatLen;
      this.beat += 1;
    }
  }

  /** Calliope-ish organ voice: a few sine harmonics with vibrato. */
  organ(freq, at, dur, vol, out, vibrato = false) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.015);
    g.gain.setTargetAtTime(vol * 0.6, at + 0.05, 0.08);
    g.gain.setTargetAtTime(0, at + dur, 0.04);
    g.connect(out);
    let lfo;
    if (vibrato) {
      lfo = ctx.createOscillator(); lfo.frequency.value = 6.5;
      const lg = ctx.createGain(); lg.gain.value = freq * 0.006;
      lfo.connect(lg);
      lfo.start(at); lfo.stop(at + dur + 0.3);
      this._lfoGain = lg;
    }
    for (const [mult, amp] of [[1, 1], [2, 0.45], [3, 0.2], [4, 0.1]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      if (lfo) this._lfoGain.connect(o.frequency);
      const og = ctx.createGain(); og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(at); o.stop(at + dur + 0.3);
    }
  }

  // ---- building blocks ----

  tone(freq, dur, { type = 'sine', vol = 0.3, to = null, at = 0, attack = 0.005 } = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const ctx = this.ctx, t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfx);
    o.start(t); o.stop(t + dur + 0.02);
  }

  hiss(dur, { vol = 0.3, freq = 1200, q = 1, to = null, at = 0, type = 'bandpass' } = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const ctx = this.ctx, t = ctx.currentTime + at;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }

  // ---- named effects ----

  play(name, arg = 0) {
    if (!this.ctx) return;
    switch (name) {
      case 'click': this.tone(660, 0.06, { type: 'square', vol: 0.08, to: 990 }); this.hiss(0.03, { vol: 0.08, freq: 3000 }); break;
      case 'back': this.tone(700, 0.08, { type: 'square', vol: 0.07, to: 420 }); break;
      case 'hover': {
        const now = performance.now();
        if (now - this.lastHover < 60) return;
        this.lastHover = now;
        this.tone(1400, 0.03, { vol: 0.035 });
        break;
      }
      case 'error': this.tone(150, 0.09, { type: 'square', vol: 0.1 }); this.tone(130, 0.12, { type: 'square', vol: 0.1, at: 0.11 }); break;
      case 'coin': this.tone(988, 0.06, { type: 'triangle', vol: 0.12 }); this.tone(1319, 0.12, { type: 'triangle', vol: 0.12, at: 0.05 }); break;
      case 'fuel':
        for (let i = 0; i < 3; i++) this.tone(420 - i * 60, 0.09, { vol: 0.16, to: 200, at: i * 0.08 });
        break;
      case 'boost': this.hiss(0.6, { vol: 0.35, freq: 300, to: 3000, q: 2 }); this.tone(120, 0.5, { type: 'sawtooth', vol: 0.08, to: 480 }); break;
      case 'air': this.hiss(0.4, { vol: 0.12, freq: 800, to: 1800 }); break;
      case 'land': this.tone(130, 0.18, { vol: 0.35, to: 45 }); this.hiss(0.12, { vol: 0.2, freq: 400, type: 'lowpass' }); break;
      case 'clean': [72, 76, 79, 84].forEach((n, i) => this.tone(NOTE(n), 0.18, { type: 'triangle', vol: 0.12, at: i * 0.07 })); break;
      case 'crash':
        this.hiss(0.9, { vol: 0.6, freq: 1800, to: 120, type: 'lowpass' });
        this.tone(320, 0.7, { type: 'sawtooth', vol: 0.12, to: 40 });
        this.tone(523, 0.5, { type: 'square', vol: 0.05, to: 233, at: 0.05 });
        break;
      case 'shield': this.tone(880, 0.3, { vol: 0.15, to: 1760 }); this.hiss(0.3, { vol: 0.1, freq: 5000 }); break;
      case 'star': this.tone(NOTE(76 + arg * 4), 0.35, { type: 'triangle', vol: 0.16 }); this.tone(NOTE(88 + arg * 4), 0.25, { vol: 0.06, at: 0.02 }); break;
      case 'buy': this.tone(1568, 0.12, { type: 'triangle', vol: 0.12 }); this.tone(2093, 0.25, { type: 'triangle', vol: 0.12, at: 0.08 }); this.hiss(0.08, { vol: 0.12, freq: 6000 }); break;
      case 'claim': [67, 72, 76, 79, 84].forEach((n, i) => this.tone(NOTE(n), 0.2, { type: 'triangle', vol: 0.13, at: i * 0.06 })); break;
      case 'karen': {
        const base = 520 + Math.random() * 120;
        for (let i = 0; i < 5; i++) this.tone(base * (0.85 + Math.random() * 0.4), 0.05, { type: 'square', vol: 0.035, at: i * 0.065 });
        break;
      }
      case 'clack': this.hiss(0.025, { vol: 0.12 + arg * 0.1, freq: 2200, q: 4 }); this.tone(180, 0.03, { vol: 0.05 }); break;
      case 'whoosh': this.hiss(0.25, { vol: 0.12, freq: 600, to: 2400, q: 1.5 }); break;
    }
  }

  /** Called every frame during a run: rail clacks, wind and music tempo follow the cart. */
  updateRun(speed, air, dt) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const k = Math.min(1, speed / 1400);
    this.windGain.gain.setTargetAtTime(this.sfxOn ? (air ? 0.25 : 0.05) + 0.25 * k : 0, t, 0.15);
    this.windFilter.frequency.setTargetAtTime(300 + 1800 * k, t, 0.2);
    this.tempo = 1 + 0.45 * k;
    if (!air && speed > 30) {
      this.rail = (this.rail || 0) + speed * dt;
      if (this.rail > 110) { this.rail = 0; this.play('clack', k); }
    }
  }
}
