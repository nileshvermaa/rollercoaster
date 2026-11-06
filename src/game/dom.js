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

export const lockIcon = () => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', '44'); s.setAttribute('height', '50'); s.setAttribute('viewBox', '0 0 44 50'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<path d="M12 22 V14 a10 10 0 0 1 20 0 V22" fill="none" stroke="#1A1A2E" stroke-width="9"/><path d="M12 22 V14 a10 10 0 0 1 20 0 V22" fill="none" stroke="#C9CED8" stroke-width="5"/><rect x="4" y="20" width="36" height="28" rx="6" fill="#FFB62E" stroke="#1A1A2E" stroke-width="3"/><circle cx="22" cy="32" r="4" fill="#5A3200"/><rect x="20" y="33" width="4" height="8" rx="2" fill="#5A3200"/>';
  return s;
};

export const isTouch = () => matchMedia('(pointer: coarse)').matches;
