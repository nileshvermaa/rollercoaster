import { icon } from '../ui/icons.js';

export { icon };

export const $ = (id) => document.getElementById(id);

export const fmt = (n) => Math.floor(n).toLocaleString('en-US');

/** Tiny element builder: h('div', { className: 'x', onclick }, child, 'text', ...). */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'style') el.setAttribute('style', v);
    else if (k.startsWith('data-') || k.startsWith('aria-') || k === 'role') el.setAttribute(k, v);
    else el[k] = v;
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c);
  return el;
}

export const img = (src, alt = '', className) => h('img', { src: `/assets/${src}`, alt, className });

let toastTimer;
export function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2400);
}

export const lockIcon = () => icon('lock', 'lock-ico');

/** Restart a one-shot CSS animation class on an element. */
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export const isTouch = () => matchMedia('(pointer: coarse)').matches;
