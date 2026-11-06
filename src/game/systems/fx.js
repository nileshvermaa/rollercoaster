// Code-drawn effects: wheel skins, boost trails, flames, sparks, fireworks, clouds and weather.
// All vector/particle based, so they stay sharp at any resolution and move every frame.

const TAU = Math.PI * 2;

// ---- wheels ----

const WHEEL_SKINS = {
  classic: { tyre: '#22232b', rim: '#c9ced8', hub: '#e0201c', bolt: '#e9ecf2', spokes: 0 },
  gold: { tyre: '#3a2a10', rim: '#ffe27a', hub: '#ffb62e', bolt: '#fff3a6', spokes: 6 },
  neon: { tyre: '#0e0f14', rim: '#3fd3ff', hub: '#1a1a2e', bolt: '#9be3ff', spokes: 5, glow: '#3fd3ff' },
  wood: { tyre: '#5a2e14', rim: '#c98a4a', hub: '#8b5a2b', bolt: '#e0b080', spokes: 4 },
  spiked: { tyre: '#1a1a1e', rim: '#9aa1ae', hub: '#4a4e5a', bolt: '#e9ecf2', spokes: 0, spikes: true },
};

/** Draw a wheel centred on the origin. */
export function drawWheel(ctx, r, spin, skinId = 'classic') {
  const s = WHEEL_SKINS[skinId] || WHEEL_SKINS.classic;
  ctx.save();
  ctx.rotate(spin);
  if (s.glow) { ctx.shadowColor = s.glow; ctx.shadowBlur = r * 1.2; }
  if (s.spikes) {
    ctx.fillStyle = '#c9ced8';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.14) * r * 0.92, Math.sin(a - 0.14) * r * 0.92);
      ctx.lineTo(Math.cos(a) * r * 1.28, Math.sin(a) * r * 1.28);
      ctx.lineTo(Math.cos(a + 0.14) * r * 0.92, Math.sin(a + 0.14) * r * 0.92);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#0a0a0e';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = s.tyre;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.88, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = s.rim;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fill();
  ctx.fillStyle = s.hub;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.48, 0, TAU); ctx.fill();
  if (s.spokes) {
    ctx.strokeStyle = s.rim; ctx.lineWidth = r * 0.14; ctx.lineCap = 'round';
    for (let i = 0; i < s.spokes; i++) {
      const a = (i / s.spokes) * TAU;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); ctx.stroke();
    }
  }
  ctx.fillStyle = s.bolt;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.07, 0, TAU); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0, r * 0.13, 0, TAU); ctx.fill();
  // Glint: drawn unrotated so the light stays top-left.
  ctx.rotate(-spin);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.75, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
  ctx.restore();
}

// ---- particles (world space) ----

export class Particles {
  constructor() {
    this.list = [];
    this.max = 900;
  }

  add(p) {
    if (this.list.length < this.max) this.list.push(p);
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.age += dt;
      if (p.age >= p.life) { this.list.splice(i, 1); continue; }
      p.vy -= (p.gravity ?? 700) * dt;
      p.vx *= 1 - (p.drag ?? 0) * dt;
      p.vy *= 1 - (p.drag ?? 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot = (p.rot || 0) + (p.spin || 0) * dt;
    }
  }

  /** sx/sy map world to screen; z is the zoom. */
  draw(ctx, sx, sy, z) {
    for (const p of this.list) {
      const t = p.age / p.life;
      const X = sx(p.x), Y = sy(p.y);
      const size = p.size * z * (p.grow ? 1 + t * p.grow : 1 - t * 0.5);
      ctx.globalAlpha = (p.alpha ?? 1) * (1 - t);
      if (p.add) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = typeof p.color === 'function' ? p.color(t) : p.color;
      if (p.shape === 'spark') {
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(1, size * 0.4); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - p.vx * 0.03 * z, Y + p.vy * 0.03 * z); ctx.stroke();
      } else if (p.shape === 'square') {
        ctx.save(); ctx.translate(X, Y); ctx.rotate(p.rot || 0); ctx.fillRect(-size / 2, -size / 2, size, size * 0.6); ctx.restore();
      } else if (p.shape === 'crystal') {
        ctx.save(); ctx.translate(X, Y); ctx.rotate(p.rot || 0);
        ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * 0.5, 0); ctx.lineTo(0, size); ctx.lineTo(-size * 0.5, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else if (p.shape === 'bolt') {
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(1.5, size * 0.25); ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(X - size, Y);
        for (let k = 1; k <= 4; k++) ctx.lineTo(X - size + (k * size) / 2, Y + (k % 2 ? -1 : 1) * size * 0.5);
        ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(X, Y, Math.max(0.5, size / 2), 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  }
}

/** Emit one frame's worth of trail behind (x, y) moving with velocity (vx, vy). */
export function emitTrail(ps, kind, x, y, vx, vy, time) {
  const back = { vx: -vx * 0.15, vy: -vy * 0.15 };
  const jitter = () => (Math.random() - 0.5) * 60;
  if (kind === 'fire') {
    for (let i = 0; i < 3; i++) ps.add({ x, y: y + jitter() * 0.2, vx: back.vx + jitter(), vy: back.vy + jitter() + 40, life: 0.45, age: 0, size: 14, grow: 1.2, gravity: -120, add: true,
      color: (t) => (t < 0.3 ? '#fff3a6' : t < 0.6 ? '#ffb62e' : '#e0201c') });
  } else if (kind === 'ice') {
    for (let i = 0; i < 2; i++) ps.add({ x, y: y + jitter() * 0.2, vx: back.vx + jitter(), vy: back.vy + jitter(), life: 0.6, age: 0, size: 9, gravity: 60, shape: 'crystal', spin: 4, color: i ? '#e6fbff' : '#7fd6ff' });
  } else if (kind === 'rainbow') {
    const hue = (time * 240) % 360;
    for (let i = 0; i < 2; i++) ps.add({ x, y: y + (i - 0.5) * 8, vx: back.vx, vy: back.vy, life: 0.55, age: 0, size: 12, gravity: 0, add: true, color: `hsl(${(hue + i * 40) % 360},95%,62%)` });
  } else if (kind === 'electric') {
    ps.add({ x, y: y + jitter() * 0.3, vx: back.vx, vy: back.vy, life: 0.18, age: 0, size: 22, gravity: 0, shape: 'bolt', add: true, color: Math.random() < 0.5 ? '#9be3ff' : '#ffffff' });
    ps.add({ x, y, vx: back.vx + jitter(), vy: back.vy + jitter(), life: 0.3, age: 0, size: 6, gravity: 0, add: true, color: '#3fd3ff' });
  }
}

export function emitSparks(ps, x, y, vx, n = 3) {
  for (let i = 0; i < n; i++) {
    ps.add({ x, y, vx: -vx * (0.2 + Math.random() * 0.3) + (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 220, life: 0.35 + Math.random() * 0.2, age: 0,
      size: 5, shape: 'spark', gravity: 900, add: true, color: Math.random() < 0.5 ? '#ffd23f' : '#ff8a00' });
  }
}

/** Animated exhaust flame pointing left, drawn at the origin (call inside a transformed context). */
export function drawFlame(ctx, len, time, power = 1) {
  const flick = 0.85 + 0.15 * Math.sin(time * 40) + 0.08 * Math.sin(time * 67);
  const L = len * flick * power, H = len * 0.32 * power;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, -L, 0);
  g.addColorStop(0, 'rgba(120,200,255,0.95)');
  g.addColorStop(0.18, 'rgba(255,248,200,0.95)');
  g.addColorStop(0.5, 'rgba(255,170,40,0.85)');
  g.addColorStop(1, 'rgba(224,32,28,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -H / 2);
  ctx.quadraticCurveTo(-L * 0.5, -H * (0.7 + 0.2 * Math.sin(time * 31)), -L, 0);
  ctx.quadraticCurveTo(-L * 0.5, H * (0.7 + 0.2 * Math.cos(time * 29)), 0, H / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---- sky life (screen space): clouds, fireworks, weather ----

export class Sky {
  constructor() {
    this.clouds = Array.from({ length: 6 }, (_, i) => ({ x: i / 6, y: 0.06 + Math.random() * 0.22, s: 0.6 + Math.random() * 0.8, v: 0.004 + Math.random() * 0.008 }));
    this.rockets = [];
    this.sparks = [];
    this.weather = [];
    this.nextRocket = 1;
  }

  update(dt, kind, w, h, low) {
    for (const c of this.clouds) { c.x -= c.v * dt; if (c.x < -0.25) { c.x = 1.15; c.y = 0.06 + Math.random() * 0.22; } }

    if (kind.fireworks) {
      this.nextRocket -= dt;
      if (this.nextRocket <= 0) {
        this.nextRocket = (low ? 2.4 : 1.1) + Math.random() * 1.6;
        this.rockets.push({ x: w * (0.15 + Math.random() * 0.7), y: h * 0.62, vy: -h * (0.75 + Math.random() * 0.3), top: h * (0.12 + Math.random() * 0.2), hue: Math.floor(Math.random() * 360) });
      }
    }
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.y += r.vy * dt;
      if (r.y <= r.top) {
        const n = low ? 24 : 46;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * TAU, sp = h * (0.18 + Math.random() * 0.06);
          this.sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: 1.1 + Math.random() * 0.4, hue: r.hue + Math.random() * 30 });
        }
        this.rockets.splice(i, 1);
      }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.age += dt;
      if (s.age > s.life) { this.sparks.splice(i, 1); continue; }
      s.vy += h * 0.12 * dt; s.vx *= 1 - 1.4 * dt; s.vy *= 1 - 1.4 * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;
    }

    if (kind.weather) {
      const want = low ? 40 : 110;
      while (this.weather.length < want) this.weather.push(this.spawnWeather(kind.weather, w, h, true));
      for (let i = 0; i < this.weather.length; i++) {
        const p = this.weather[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.t += dt;
        if (p.y > h + 10 || p.y < -10 || p.x < -10 || p.x > w + 10) this.weather[i] = this.spawnWeather(kind.weather, w, h, false);
      }
    } else this.weather.length = 0;
  }

  spawnWeather(type, w, h, anywhere) {
    const r = Math.random;
    if (type === 'snow') return { type, x: r() * w, y: anywhere ? r() * h : -5, vx: -20 - r() * 30, vy: 30 + r() * 50, s: 1.5 + r() * 2.5, t: r() * 10 };
    if (type === 'embers') return { type, x: r() * w, y: anywhere ? r() * h : h + 5, vx: -15 + r() * 30, vy: -(30 + r() * 60), s: 1.5 + r() * 2, t: r() * 10 };
    if (type === 'sand') return { type, x: anywhere ? r() * w : w + 5, y: h * (0.3 + r() * 0.6), vx: -(160 + r() * 200), vy: -5 + r() * 10, s: 1 + r() * 1.5, t: 0 };
    return { type, x: r() * w, y: r() * h * 0.7, vx: -8 + r() * 16, vy: -8 + r() * 16, s: 1.5 + r() * 2, t: r() * 10 }; // neon sparkle
  }

  drawBack(ctx, w, h, kind) {
    if (kind.clouds) {
      ctx.fillStyle = kind.clouds;
      for (const c of this.clouds) {
        const X = c.x * w, Y = c.y * h, S = 60 * c.s * (h / 400);
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.ellipse(X, Y, S, S * 0.32, 0, 0, TAU);
        ctx.ellipse(X - S * 0.45, Y + S * 0.08, S * 0.5, S * 0.26, 0, 0, TAU);
        ctx.ellipse(X + S * 0.4, Y - S * 0.1, S * 0.55, S * 0.3, 0, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (this.rockets.length || this.sparks.length) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#fff2b0';
      for (const r of this.rockets) { ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, TAU); ctx.fill(); }
      for (const s of this.sparks) {
        const t = s.age / s.life;
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = `hsl(${s.hue},100%,${70 - t * 20}%)`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.2 * (1 - t * 0.5), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  drawFront(ctx) {
    for (const p of this.weather) {
      if (p.type === 'snow') { ctx.fillStyle = 'rgba(255,255,255,0.85)'; p.x += Math.sin(p.t * 2) * 0.3; }
      else if (p.type === 'embers') ctx.fillStyle = `rgba(255,${120 + Math.sin(p.t * 6) * 60},40,0.9)`;
      else if (p.type === 'sand') ctx.fillStyle = 'rgba(240,200,130,0.5)';
      else ctx.fillStyle = `rgba(255,140,255,${0.4 + 0.4 * Math.sin(p.t * 5)})`;
      if (p.type === 'sand') ctx.fillRect(p.x, p.y, p.s * 10, p.s * 0.6);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, TAU); ctx.fill(); }
    }
  }
}

/** Per-world sky life. */
export const SKY_KIND = {
  park: { clouds: '#ffd6e8', fireworks: true },
  night: { fireworks: true, weather: 'neon' },
  mountain: { clouds: '#ffffff' },
  desert: { clouds: '#ffe2b8', weather: 'sand' },
  snow: { clouds: '#ffffff', weather: 'snow' },
  volcano: { weather: 'embers' },
};
