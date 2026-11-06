// 08 Run complete: ribbon, stars, stats, confetti.

import { $, h, fmt } from '../dom.js';
import { EPITAPHS, pick } from '../../content/story.js';
import { recordRun } from '../progress.js';
import { runSummary } from '../systems/run.js';

const COLORS = ['#FFB62E', '#F4A6D7', '#42A5EF', '#72C95A', '#E95757', '#FFFFFF'];

export function showResults(game) {
  const summary = runSummary(game);
  const r = recordRun(game.save, summary);
  game.persist();
  game.lastResult = r;

  const derailed = summary.reason !== 'fuel';
  $('res-title').textContent = r.stars === 3 ? 'Run Complete!' : derailed ? 'DERAILED!' : 'OUT OF CRANK!';
  const stars = $('res-stars');
  stars.setAttribute('aria-label', `${r.stars} of 3 stars`);
  stars.replaceChildren(...[0, 1, 2].map((i) =>
    h('span', {}, h('img', { src: '/assets/ui/stars.webp', alt: '', style: `left:${i < r.stars ? 0 : -78}px` }))));

  $('res-dist').textContent = `${fmt(r.meters)} m`;
  $('res-coins').textContent = `+${fmt(r.coins)}${r.doubled ? ' (×2)' : ''}${r.gems ? ` · +${r.gems} gems` : ''}`;
  $('res-best').textContent = r.newBest ? `${fmt(r.meters)} m NEW!` : `${fmt(game.save.best)} m`;
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
}
