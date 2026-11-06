// Draws the world on the canvas: parallax backdrop for the current world, terrain, wooden
// supports, the lit rail, pickups, particles and the coaster train. World y points up; the
// camera flips it.

import { clamp, damp } from '../../engine/math.js';
import { loadImages } from '../../engine/assets.js';
import { cosmeticById } from '../../content/cosmetics.js';
import { CARTS } from '../../content/carts.js';

const CAR_LEN = 128; // world px per car
const CAR_GAP = 10;
const TRAIN = 3; // cars per train
const RIDERS = ['karen9000', 'cryptobro', 'influencer', 'grandma', 'goose'];
const STEEL_TOP = 11; // the running surface (steel top rail) sits this far above the rail centre

export class Renderer {
  constructor(canvas, images) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = images;
    this.zoom = 1;
    this.camX = 0;
    this.camY = 0;
    this.startY = 0;
    this.particles = [];
    this.glow = makeGlow();
    this.coin = makeCoin();
    this.worldCache = new Map();
    this.tinted = new Map();
    this.low = false;
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  setQuality(low) {
    this.low = low;
    this.resize();
  }

  resize() {
    const dpr = this.low ? 1 : Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth;
    this.h = innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Load (once) and prepare a world's backdrop layers. */
  async prepareWorld(world) {
    if (this.worldCache.has(world.id)) return this.worldCache.get(world.id);
    const raw = await loadImages(Object.fromEntries(Object.entries(world.layers).map(([k, v]) => [k, `/assets/${v}`])));
    const layers = world.clean
      ? raw
      : {
          sky: raw.sky,
          far: raw.far && fadeTop(raw.far, 0.3, 0.6),
          mid: raw.mid && fadeTop(raw.mid, 0.25, 0.55),
          near: raw.near && fadeTop(raw.near, 0.4, 0.65),
        };
    this.worldCache.set(world.id, layers);
    return layers;
  }

  reset(game) {
    const cart = game.cart;
    this.camY = this.startY = cart.y;
    this.camX = cart.x;
    this.zoom = this.baseZoom();
    this.particles.length = 0;
    this.world = game.world;
    this.layers = this.worldCache.get(game.world.id) || {};
    this.prepareWorld(game.world).then((l) => { if (this.world === game.world) this.layers = l; });
    const seed = game.track.seed;
    this.riders = [RIDERS[0], RIDERS[1 + (seed % 4)]];
  }

  baseZoom() {
    return clamp(Math.min(this.h / 520, this.w / 880), 0.42, 1.6);
  }

  sx(x) { return (x - this.camX) * this.zoom; }
  sy(y) { return this.h * 0.6 - (y - this.camY) * this.zoom; }

  follow(cart, dt) {
    const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : Math.abs(cart.v);
    const target = this.baseZoom() * (1 - clamp(speed / 2600, 0, 0.25));
    this.zoom = damp(this.zoom, target, 2, dt);
    this.camX = cart.x - (this.w * 0.42) / this.zoom;
    this.camY = damp(this.camY, cart.y + 30, cart.air ? 2.5 : 5, dt);
  }

  burst(x, y, color, n = 10, speed = 260) {
    if (this.low) n = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s + 80, life: 0.5 + Math.random() * 0.4, color, size: 3 + Math.random() * 4 });
    }
  }

  draw(game, dt) {
    const { ctx, w, h } = this;
    const { track } = game;
    const z = this.zoom;
    const x0 = this.camX - 60 / z;
    const x1 = this.camX + (w + 60) / z;
    const W = this.world || game.world;

    this.drawBackdrop(W);
    this.drawTerrain(track, x0, x1, W);
    this.drawSupports(track, x0, x1, W);
    this.drawRail(track, x0, x1, game.time, W);
    this.drawItems(track, x0, x1, game.time);
    this.drawParticles(dt);
    this.drawTrain(game);
    ctx.globalAlpha = 1;

    if (game.run.magnet > 0) {
      const X = this.sx(game.cart.x), Y = this.sy(game.cart.y) - 40 * z;
      ctx.strokeStyle = `rgba(66,165,239,${0.35 + 0.2 * Math.sin(game.time * 8)})`;
      ctx.lineWidth = 3 * z;
      ctx.beginPath(); ctx.arc(X, Y, 260 * z * 0.5, 0, Math.PI * 2); ctx.stroke();
    }
    if (game.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${game.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawBackdrop(W) {
    const { ctx, w, h } = this;
    const L = this.layers || {};
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, W.sky[0]); g.addColorStop(0.7, W.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (L.sky) {
      const s = Math.max(w / L.sky.width, (h * 0.75) / L.sky.height);
      ctx.drawImage(L.sky, (w - L.sky.width * s) / 2, 0, L.sky.width * s, L.sky.height * s);
    }
    const lift = clamp((this.camY - this.startY) * this.zoom, -h * 0.5, h * 0.5);
    this.layer(L.far, 0.04, 0.26, 0.66, lift * 0.15, W.wood[1]);
    this.layer(L.mid, 0.12, 0.38, 0.75, lift * 0.3, W.ground[1]);
    if (!this.low) this.layer(L.near, 0.3, 0.24, 0.83, lift * 0.5, W.grass[0]);
  }

  layer(im, factor, heightFrac, bottomFrac, lift, fill) {
    if (!im) return;
    const { ctx, w, h } = this;
    const dh = h * heightFrac;
    const dw = (im.width * dh) / im.height;
    const bottom = h * bottomFrac + lift;
    let off = -((this.camX * this.zoom * factor) % dw);
    if (off > 0) off -= dw;
    for (let x = off; x < w; x += dw - 1) ctx.drawImage(im, x, bottom - dh, dw, dh);
    ctx.fillStyle = fill;
    ctx.fillRect(0, bottom - 1, w, h - bottom + 1);
  }

  drawTerrain(track, x0, x1, W) {
    const { ctx, h } = this;
    const z = this.zoom;
    ctx.beginPath();
    ctx.moveTo(this.sx(x0), h);
    for (let x = x0; x <= x1 + 24; x += 24) ctx.lineTo(this.sx(x), this.sy(track.groundAt(x)));
    ctx.lineTo(this.sx(x1 + 24), h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, this.sy(track.groundAt(this.camX + 300)), 0, h);
    g.addColorStop(0, W.ground[0]); g.addColorStop(1, W.ground[1]);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    for (let x = x0; x <= x1 + 24; x += 24) {
      const X = this.sx(x), Y = this.sy(track.groundAt(x)) + 3 * z;
      if (x === x0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.lineJoin = 'round';
    ctx.lineWidth = 12 * z; ctx.strokeStyle = W.grass[0]; ctx.stroke();
    ctx.lineWidth = 7 * z; ctx.strokeStyle = W.grass[1]; ctx.stroke();
  }

  drawSupports(track, x0, x1, W) {
    const { ctx } = this;
    const z = this.zoom;
    const step = 96;
    let prev = null;
    for (let x = Math.floor(x0 / step) * step; x <= x1 + step; x += step) {
      if (track.isGap(x)) { prev = null; continue; }
      const top = this.sy(track.at(x).y) + 6 * z;
      const bot = this.sy(track.groundAt(x));
      const X = this.sx(x);
      if (bot - top < 4) { prev = null; continue; }
      if (prev) {
        ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 6 * z; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prev.X, prev.top + 10 * z); ctx.lineTo(X, bot - 4 * z);
        ctx.moveTo(prev.X, prev.bot - 4 * z); ctx.lineTo(X, top + 10 * z);
        ctx.stroke();
        ctx.strokeStyle = W.wood[1]; ctx.lineWidth = 3 * z; ctx.stroke();
      }
      ctx.fillStyle = '#2a1608';
      ctx.fillRect(X - 6 * z, top, 12 * z, bot - top);
      ctx.fillStyle = W.wood[0];
      ctx.fillRect(X - 4 * z, top, 8 * z, bot - top);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(X - 3 * z, top, 2 * z, bot - top);
      prev = { X, top, bot };
    }
  }

  railPaths(track, x0, x1) {
    const paths = [];
    let cur = null;
    for (let x = x0; x <= x1 + 10; x += 10) {
      if (track.isGap(x)) { cur = null; continue; }
      if (!cur) { cur = []; paths.push(cur); }
      cur.push([this.sx(x), this.sy(track.at(x).y)]);
    }
    return paths;
  }

  drawRail(track, x0, x1, time, W) {
    const { ctx } = this;
    const z = this.zoom;
    const paths = this.railPaths(track, x0, x1);
    const stroke = (dy, width, color) => {
      ctx.lineWidth = width; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const p of paths) {
        ctx.beginPath();
        p.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y + dy) : ctx.moveTo(X, Y + dy)));
        ctx.stroke();
      }
    };
    stroke(4 * z, 22 * z, 'rgba(0,0,0,0.25)');
    stroke(0, 18 * z, '#1a0a08');
    stroke(0, 13 * z, W.rail[0]);
    stroke(-2 * z, 5 * z, W.rail[1]);
    stroke(-STEEL_TOP * z, 7 * z, '#1a0a08');
    stroke(-STEEL_TOP * z, 4 * z, '#c9ced8');
    stroke(-(STEEL_TOP + 1) * z, 1.5 * z, '#ffffff');

    const step = 34;
    for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) {
      if (track.isGap(x)) continue;
      const X = this.sx(x), Y = this.sy(track.at(x).y) + 1 * z;
      if (!this.low) {
        const on = 0.75 + 0.25 * Math.sin(time * 6 - x / 60);
        const s = 26 * z * on;
        ctx.globalAlpha = 0.8;
        ctx.drawImage(this.glow, X - s / 2, Y - s / 2, s, s);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = W.bulb;
      ctx.beginPath(); ctx.arc(X, Y, 2.8 * z, 0, Math.PI * 2); ctx.fill();
    }

    for (const b of track.boosters) {
      if (b.x1 < x0 || b.x0 > x1) continue;
      for (let x = b.x0; x < b.x1; x += 30) {
        const p = track.at(x);
        const X = this.sx(x), Y = this.sy(p.y) - 30 * z;
        const pulse = (Math.sin(time * 10 - x / 20) + 1) / 2;
        ctx.save();
        ctx.translate(X, Y);
        ctx.rotate(-Math.atan(p.dy));
        ctx.fillStyle = `rgba(255,${180 + pulse * 60},40,${0.6 + pulse * 0.4})`;
        ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2 * z;
        ctx.beginPath(); ctx.moveTo(-8 * z, -9 * z); ctx.lineTo(6 * z, 0); ctx.lineTo(-8 * z, 9 * z); ctx.lineTo(-3 * z, 0); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    }

    for (const g of track.gaps) {
      for (const x of [g.x0, g.x1]) {
        if (x < x0 || x > x1) continue;
        const X = this.sx(x), Y = this.sy(track.at(x).y);
        ctx.fillStyle = '#1a0a08';
        ctx.beginPath(); ctx.arc(X, Y, 10 * z, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath(); ctx.arc(X, Y, 5 * z, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawItems(track, x0, x1, time) {
    const { ctx } = this;
    const z = this.zoom;
    for (let i = track.firstItemAt(x0); i < track.items.length; i++) {
      const it = track.items[i];
      if (it.x > x1) break;
      if (it.taken) continue;
      const X = this.sx(it.x), Y = this.sy(it.y) + Math.sin(time * 3 + it.x) * 3 * z;
      if (it.kind === 'coin') {
        const spin = Math.abs(Math.cos(time * 3 + it.x / 80));
        const s = 30 * z;
        ctx.drawImage(this.coin, X - (s * spin) / 2, Y - s / 2, s * Math.max(spin, 0.12), s);
      } else if (this.img.fuel) {
        const s = 40 * z;
        ctx.drawImage(this.img.fuel, X - s * 0.45, Y - s / 2, s * 0.9, s);
      }
    }
  }

  drawParticles(dt) {
    const { ctx } = this;
    const z = this.zoom;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy -= 700 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(this.sx(p.x) - (p.size * z) / 2, this.sy(p.y) - (p.size * z) / 2, p.size * z, p.size * z);
    }
    ctx.globalAlpha = 1;
  }

  /** Cart body art with the equipped paint baked in (cached per cart + paint). */
  body(cartId, paintId) {
    const key = `${cartId}:${paintId}`;
    if (this.tinted.has(key)) return this.tinted.get(key);
    const src = this.img[`cart_${cartId}`];
    if (!src) return null;
    const paint = cosmeticById('paint', paintId);
    let out = src;
    if (paint.filter !== 'none') {
      const c = document.createElement('canvas');
      c.width = src.width; c.height = src.height;
      const g = c.getContext('2d');
      g.filter = paint.filter;
      g.drawImage(src, 0, 0);
      out = c;
    }
    this.tinted.set(key, out);
    return out;
  }

  /** Where each car of the train sits: on the rail behind the lead, or rigid while airborne. */
  carPoses(game) {
    const c = game.cart, track = game.track;
    const poses = [{ x: c.x, y: c.y, angle: c.angle }];
    const spacing = CAR_LEN + CAR_GAP;
    for (let k = 1; k < TRAIN; k++) {
      if (c.air || c.crashed || game.run.over) {
        poses.push({ x: c.x - k * spacing * Math.cos(c.angle), y: c.y - k * spacing * Math.sin(c.angle), angle: c.angle });
      } else {
        let x = poses[k - 1].x, s = 0;
        while (s < spacing) {
          const dy = track.at(x).dy;
          x -= 6 / Math.sqrt(1 + dy * dy);
          s += 6;
        }
        const p = track.at(x);
        poses.push({ x, y: p.y, angle: Math.atan(p.dy) });
      }
    }
    return poses;
  }

  daveFace(game) {
    const { cart, run } = game;
    if (cart.crashed || (run.over && run.reason !== 'fuel')) return 'dizzy';
    if (run.danger > 0.8 || (cart.air && cart.airTime > 0.5)) return 'terrified';
    const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : Math.abs(cart.v);
    return speed > 650 || cart.air ? 'excited' : 'calm';
  }

  drawTrain(game) {
    const { ctx, img } = this;
    const z = this.zoom;
    const c = game.cart;
    const eq = game.save.cosmetics.equipped;
    const body = this.body(game.cartId, eq.paint);
    const wheel = img[`wheel_${eq.wheel}`] || img.wheel_classic;
    const trail = eq.trail !== 'none' ? img[`trail_${eq.trail}`] : null;
    const poses = this.carPoses(game);
    const speed = c.air ? Math.hypot(c.vx, c.vy) : Math.abs(c.v);
    const bounce = c.air ? 0 : Math.sin(game.time * 18) * Math.min(speed / 900, 1) * 1.5 * z;

    if (trail && speed > 600 && !game.run.over) {
      const last = poses[poses.length - 1];
      const tw = 170 * z, th = (tw * trail.height) / trail.width;
      ctx.save();
      ctx.translate(this.sx(last.x), this.sy(last.y));
      ctx.rotate(-last.angle);
      ctx.globalAlpha = clamp((speed - 600) / 400, 0.3, 0.9);
      ctx.drawImage(trail, -CAR_LEN * 0.5 * z - tw, -38 * z - th / 2, tw, th);
      ctx.restore();
    }

    for (let k = poses.length - 1; k >= 0; k--) {
      const p = poses[k];
      const rider = k === 0 ? img[`dave_${this.daveFace(game)}`] : img[`rider_${this.riders[(k - 1) % this.riders.length]}`];
      this.drawCar(p, body, wheel, rider, k === 0, k < poses.length - 1, bounce, game.cart.wheel);
    }
  }

  drawCar(p, body, wheel, rider, lead, coupler, bounce, spin) {
    const { ctx } = this;
    const z = this.zoom;
    const bw = CAR_LEN * z;
    const bh = body ? (bw * body.height) / body.width : 50 * z;
    const r = 8 * z; // road wheel
    const rr = 5 * z; // upstop wheel under the rail
    const top = -STEEL_TOP * z; // running surface
    const axle = top - r;
    const bodyBottom = axle - r * 0.4;

    ctx.save();
    ctx.translate(this.sx(p.x), this.sy(p.y));
    ctx.rotate(-p.angle);

    // Rider sits in the seat: drawn behind the body, top half showing above it.
    if (rider) {
      // Lead car: Dave's head-and-shoulders art sits in the front seat; trailing cars carry the
      // seated cast, whose art includes the seat, so it sits a little lower.
      const rw = bw * (lead ? 0.36 : 0.44), rh = (rw * rider.height) / rider.width;
      const rx = lead ? -bw * 0.08 : -bw * 0.2;
      ctx.drawImage(rider, rx, bodyBottom - bh * (lead ? 0.5 : 0.42) - rh * (lead ? 0.92 : 1) + bounce, rw, rh);
    }

    // Bogie brackets hook round the rail to the upstop wheels: the coaster tell.
    const upY = 9 * z + rr; // upstop wheel centre, under the rail
    for (const wx of [-bw * 0.3, bw * 0.3]) {
      const len = upY - (bodyBottom - 2 * z);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(wx - 3.5 * z, bodyBottom - 2 * z, 7 * z, len);
      ctx.fillStyle = '#6e7280';
      ctx.fillRect(wx - 2 * z, bodyBottom - 2 * z, 4 * z, len);
      ctx.fillStyle = '#2a2c35';
      ctx.beginPath(); ctx.arc(wx + 4 * z, upY, rr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9aa1ae';
      ctx.beginPath(); ctx.arc(wx + 4 * z, upY, rr * 0.45, 0, Math.PI * 2); ctx.fill();
    }

    if (body) ctx.drawImage(body, -bw / 2, bodyBottom - bh, bw, bh);
    else { ctx.fillStyle = '#e0201c'; ctx.fillRect(-bw / 2, bodyBottom - bh, bw, bh); }

    if (coupler) {
      ctx.fillStyle = '#2a2c35';
      ctx.fillRect(-bw / 2 - CAR_GAP * z - 2 * z, bodyBottom - 9 * z, CAR_GAP * z + 4 * z, 5 * z);
    }

    for (const wx of [-bw * 0.3, bw * 0.3]) {
      ctx.save();
      ctx.translate(wx, axle);
      ctx.rotate(-spin);
      if (wheel) ctx.drawImage(wheel, -r, -r, r * 2, r * 2);
      else { ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
}

export const RENDER_IMAGES = {
  wheel_classic: '/assets/carts/coaster-wheel.webp',
  wheel_gold: '/assets/wheels/gold.webp',
  wheel_neon: '/assets/wheels/neon.webp',
  wheel_wood: '/assets/wheels/wood.webp',
  wheel_spiked: '/assets/wheels/spiked.webp',
  trail_fire: '/assets/trails/fire.webp',
  trail_ice: '/assets/trails/ice.webp',
  trail_rainbow: '/assets/trails/rainbow.webp',
  trail_electric: '/assets/trails/electric.webp',
  fuel: '/assets/ui/fuel.webp',
  dave_calm: '/assets/riders/dave-calm.webp',
  dave_excited: '/assets/riders/dave-excited.webp',
  dave_terrified: '/assets/riders/dave-terrified.webp',
  dave_dizzy: '/assets/riders/dave-dizzy.webp',
  ...Object.fromEntries(RIDERS.map((r) => [`rider_${r}`, `/assets/riders/${r}.webp`])),
  ...Object.fromEntries(CARTS.map((c) => [`cart_${c.id}`, `/assets/${c.img}`])),
};

function fadeTop(img, from, to) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const grad = g.createLinearGradient(0, 0, 0, img.height);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(from, 'rgba(0,0,0,0)');
  grad.addColorStop(to, 'rgba(0,0,0,1)');
  grad.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = grad;
  g.fillRect(0, 0, img.width, img.height);
  return c;
}

function makeGlow() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,248,201,1)');
  grad.addColorStop(0.35, 'rgba(255,201,74,0.8)');
  grad.addColorStop(1, 'rgba(255,154,31,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

function makeCoin() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.beginPath(); g.arc(32, 32, 29, 0, Math.PI * 2);
  g.fillStyle = '#5a3200'; g.fill();
  const rim = g.createLinearGradient(0, 4, 0, 60);
  rim.addColorStop(0, '#ffe27a'); rim.addColorStop(1, '#b86a00');
  g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.fillStyle = rim; g.fill();
  const face = g.createRadialGradient(24, 22, 2, 32, 32, 22);
  face.addColorStop(0, '#fff3a6'); face.addColorStop(0.45, '#ffc928'); face.addColorStop(1, '#d98a00');
  g.beginPath(); g.arc(32, 32, 19, 0, Math.PI * 2); g.fillStyle = face; g.fill();
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 6 : 13;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r);
  }
  g.closePath();
  g.fillStyle = '#ffe15c'; g.fill();
  g.strokeStyle = '#b86a00'; g.lineWidth = 2; g.stroke();
  return c;
}
