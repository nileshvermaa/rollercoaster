// 08 Run complete: ribbon drop, stars popping in one by one with chimes, numbers counting up, confetti.

import { $, h, icon, fmt } from '../dom.js';
import { EPITAPHS, pick } from '../../content/story.js';
import { recordRun } from '../progress.js';
import { runSummary } from '../systems/run.js';

const COLORS = ['#FFB62E', '#F4A6D7', '#42A5EF', '#72C95A', '#E95757', '#FFFFFF'];
let timers = [];

/** Animate a number from 0 to `to` in the element. */
function countUp(el, to, format, ms = 900) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    el.textContent = format(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function showResults(game) {
  timers.forEach(clearTimeout);
  timers = [];
  const summary = runSummary(game);
  const r = recordRun(game.save, summary);
  game.persist();
  game.lastResult = r;

  const derailed = summary.reason !== 'fuel';
  $('res-title').textContent = r.stars === 3 ? 'Run Complete!' : derailed ? 'DERAILED!' : 'OUT OF CRANK!';
  const stars = $('res-stars');
  stars.setAttribute('aria-label', `${r.stars} of 3 stars`);
  stars.replaceChildren(...[0, 1, 2].map((i) => h('span', { className: 'star-slot' }, icon('star-empty', 'star-bg'))));
  [0, 1, 2].forEach((i) => {
    if (i >= r.stars) return;
    timers.push(setTimeout(() => {
      const slot = stars.children[i];
      slot.append(icon('star', 'star-on'));
      game.sound.play('star', i);
    }, 550 + i * 380));
  });

  countUp($('res-dist'), r.meters, (n) => `${fmt(n)} m`);
  const extras = `${r.doubled ? ' (×2)' : ''}${r.gems ? ` · +${r.gems} gems` : ''}`;
  countUp($('res-coins'), r.coins, (n) => `+${fmt(n)}${extras}`);
  $('res-best').textContent = r.newBest ? `${fmt(r.meters)} m NEW!` : `${fmt(game.save.best)} m`;
  $('res-best').classList.toggle('new-best', r.newBest);
  let line = pick(EPITAPHS[summary.reason] || EPITAPHS.landing);
  if (r.eventStep) line = `Night Carnival progress +1 (${game.save.event.progress}/10). ${line}`;
  if (game.mode === 'challenge') line = `Daily challenge: ${fmt(r.meters)} m. ${line}`;
  $('res-epitaph').textContent = line;

  const conf = $('confetti');
  const pieces = r.stars >= 2 ? 46 : 14;
  conf.replaceChildren(...Array.from({ length: pieces }, (_, i) => h('i', {
    style: `left:${(i * 37) % 100}%;top:-${(i * 13) % 40}px;width:${6 + (i % 3) * 3}px;height:${i % 2 ? 12 : 6}px;` +
      `background:${COLORS[i % COLORS.length]};animation-duration:${3 + (i % 5) * 0.7}s;animation-delay:-${(i * 0.37) % 4}s`,
  })));
  if (r.stars === 3) timers.push(setTimeout(() => game.sound.play('claim'), 550 + 3 * 380));
}
