export const $ = (id) => document.getElementById(id);

export const fmt = (n) => Math.floor(n).toLocaleString('en-US');

export function show(id, on = true) {
  $(id).classList.toggle('show', on);
}

export const isTouch = () => matchMedia('(pointer: coarse)').matches;
