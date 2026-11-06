// Draws the world on the canvas: parallax park, terrain, wooden supports, the lit rail,
// pickups, particles and the cart. World y points up; the camera flips it.

import { clamp, damp } from '../../engine/math.js';

const RAIL_LIFT = 15; // cart wheels ride this far above the rail centre line

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
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth;
    this.h = innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  reset(cart) {
    this.camY = this.startY = cart.y;
    this.camX = cart.x;
    this.zoom = this.baseZoom();
    this.particles.length = 0;
  }

  baseZoom() {
    return clamp(Math.min(this.h / 560, this.w / 900), 0.45, 1.6);
  }

  sx(x) { return (x - this.camX) * this.zoom; }
  sy(y) { return this.h * 0.6 - (y - this.camY) * this.zoom; }

  follow(cart, dt) {
    const speed = cart.air ? Math.hypot(cart.vx, cart.vy) : Math.abs(cart.v);
    const target = this.baseZoom() * (1 - clamp(speed / 2600, 0, 0.28));
    this.zoom = damp(this.zoom, target, 2, dt);
    this.camX = cart.x - (this.w * 0.32) / this.zoom;
    this.camY = damp(this.camY, cart.y + 30, cart.air ? 2.5 : 5, dt);
  }

  burst(x, y, color, n = 10, speed = 260) {
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

    this.drawBackdrop();
    this.drawTerrain(track, x0, x1);
    this.drawSupports(track, x0, x1);
    this.drawRail(track, x0, x1, game.time);
    this.drawItems(track, x0, x1, game.time);
    this.drawParticles(dt);
    this.drawCart(game);
    ctx.globalAlpha = 1;

    if (game.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${game.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawBackdrop() {
    const { ctx, w, h, img } = this;
    const sky = img.sky;
    if (sky) {
      const s = Math.max(w / sky.width, (h * 0.75) / sky.height);
      ctx.drawImage(sky, (w - sky.width * s) / 2, 0, sky.width * s, sky.height * s);
      ctx.fillStyle = '#ffb37a';
      ctx.fillRect(0, sky.height * s - 1, w, h);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#5b3f9a'); g.addColorStop(0.6, '#f48e7a'); g.addColorStop(1, '#ffb37a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    const lift = clamp((this.camY - this.startY) * this.zoom, -h * 0.5, h * 0.5);
    this.layer(img.far, 0.04, 0.24, 0.66, lift * 0.15, '#7d5fb5');
    this.layer(img.mid, 0.12, 0.36, 0.74, lift * 0.3, '#5b3f7a');
    this.layer(img.near, 0.3, 0.22, 0.82, lift * 0.5, '#2f5a26');
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

  drawTerrain(track, x0, x1) {
    const { ctx, h } = this;
    const z = this.zoom;
    ctx.beginPath();
    ctx.moveTo(this.sx(x0), h);
    for (let x = x0; x <= x1 + 24; x += 24) ctx.lineTo(this.sx(x), this.sy(track.groundAt(x)));
    ctx.lineTo(this.sx(x1 + 24), h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, this.sy(track.groundAt(this.camX + 300)), 0, h);
    g.addColorStop(0, '#8b5a2b'); g.addColorStop(1, '#4a2c12');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    for (let x = x0; x <= x1 + 24; x += 24) {
      const X = this.sx(x), Y = this.sy(track.groundAt(x)) + 3 * z;
      if (x === x0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.lineWidth = 12 * z; ctx.strokeStyle = '#3e8a2a'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.lineWidth = 7 * z; ctx.strokeStyle = '#72c95a'; ctx.stroke();
  }

  drawSupports(track, x0, x1) {
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
        ctx.strokeStyle = '#a8662e'; ctx.lineWidth = 3 * z; ctx.stroke();
      }
      ctx.fillStyle = '#2a1608';
      ctx.fillRect(X - 6 * z, top, 12 * z, bot - top);
      ctx.fillStyle = '#b8733a';
      ctx.fillRect(X - 4 * z, top, 8 * z, bot - top);
      ctx.fillStyle = '#d99a5c';
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

  drawRail(track, x0, x1, time) {
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
    stroke(0, 13 * z, '#b3200f');
    stroke(-2 * z, 5 * z, '#e8452a');
    stroke(-10 * z, 7 * z, '#1a0a08');
    stroke(-10 * z, 4 * z, '#c9ced8');
    stroke(-11 * z, 1.5 * z, '#ffffff');

    // Bulbs, with a slow chase so the track feels alive.
    const step = 34;
    for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) {
      if (track.isGap(x)) continue;
      const X = this.sx(x), Y = this.sy(track.at(x).y) + 1 * z;
      const on = 0.75 + 0.25 * Math.sin(time * 6 - x / 60);
      const s = 26 * z * on;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(this.glow, X - s / 2, Y - s / 2, s, s);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff2b0';
      ctx.beginPath(); ctx.arc(X, Y, 2.8 * z, 0, Math.PI * 2); ctx.fill();
    }

    for (const b of track.boosters) {
      if (b.x1 < x0 || b.x0 > x1) continue;
      for (let x = b.x0; x < b.x1; x += 30) {
        const p = track.at(x);
        const X = this.sx(x), Y = this.sy(p.y) - 26 * z;
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

  drawCart(game) {
    const { ctx, img } = this;
    const c = game.cart;
    const z = this.zoom;
    const body = img[`cart_${game.cartId}`] || img.cart_basic;
    const X = this.sx(c.x), Y = this.sy(c.y);
    ctx.save();
    ctx.translate(X, Y);
    ctx.rotate(-c.angle);
    ctx.translate(0, -RAIL_LIFT * z);

    const bw = 150 * z;
    const bh = body ? (bw * body.height) / body.width : 60 * z;
    const wheelR = 15 * z;
    const bodyBottom = -wheelR * 0.6;

    if (img.driver) {
      const dw = 64 * z, dh = (dw * img.driver.height) / img.driver.width;
      const bounce = c.air ? 0 : Math.sin(game.time * 18) * Math.min(Math.abs(c.v) / 900, 1) * 2 * z;
      ctx.drawImage(img.driver, bw * 0.02, bodyBottom - bh * 0.55 - dh * 0.75 + bounce, dw, dh);
    }
    if (body) ctx.drawImage(body, -bw / 2, bodyBottom - bh, bw, bh);
    else { ctx.fillStyle = '#e0201c'; ctx.fillRect(-bw / 2, bodyBottom - bh, bw, bh); }

    for (const wx of [-bw * 0.3, bw * 0.3]) {
      ctx.save();
      ctx.translate(wx, 0);
      ctx.rotate(-c.wheel);
      if (img.wheel) ctx.drawImage(img.wheel, -wheelR, -wheelR, wheelR * 2, wheelR * 2);
      else { ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, wheelR, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
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
