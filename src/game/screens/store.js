// Shop, Events and Daily rewards.

import { $, h, img, toast } from '../dom.js';
import { SHOP_ITEMS, SHOP_TABS } from '../../content/shop.js';
import { DAILY_REWARDS, EVENT } from '../../content/rewards.js';
import { buyShopItem, dailyState, claimDaily, eventEndsIn, claimEvent } from '../progress.js';

const TAB_LABEL = { featured: 'Featured', powerups: 'Power-ups', currency: 'Currency', skins: 'Skins' };
let shopTab = 'featured';

const gemPrice = (n) => [h('img', { src: '/assets/ui/gem.webp', alt: 'gems', className: 'gem-i' }), ` ${n}`];

export function renderShop(game) {
  const { save } = game;
  $('shop-tabs').replaceChildren(...SHOP_TABS.map((t) =>
    h('button', { className: `tab${t === shopTab ? ' on' : ''}`, onclick: () => { shopTab = t; renderShop(game); } }, TAB_LABEL[t])));
  const items = SHOP_ITEMS.filter((i) => (shopTab === 'featured' ? i.featured : i.tab === shopTab));
  $('shop-grid').replaceChildren(...items.map((it) => {
    const sold = it.once && save.shop.bought.includes(it.id);
    const owned = it.grant.inventory ? Object.entries(it.grant.inventory).map(([k]) => `You have ${save.inventory[k]}`)[0] : null;
    return h('div', { className: 'shop-card' },
      it.tag && h('span', { className: 'tag' }, it.tag),
      img(it.img, ''),
      h('b', {}, it.name),
      h('small', {}, owned ? `${it.qty} · ${owned}` : it.qty),
      h('button', {
        className: 'btn btn-green', disabled: sold || save.gems < it.gems,
        onclick: () => {
          const got = buyShopItem(save, it);
          if (!got) return toast('Not enough gems. Earn them from daily rewards and missions.');
          game.persist();
          toast(`Got ${got}.`);
          game.refresh();
        },
      }, sold ? 'Owned' : gemPrice(it.gems)));
  }));
}

export function bindEvents(game) {
  $('event-play').addEventListener('click', () => {
    const { save } = game;
    if (save.event.progress >= EVENT.goal && !save.event.claimed) {
      const got = claimEvent(save);
      game.persist();
      toast(`Event reward: ${got}! Equip it in Customize.`);
      return game.refresh();
    }
    game.play({ world: EVENT.world, mode: 'event' });
  });
}

export function renderEvents(game) {
  const { save } = game;
  const t = eventEndsIn();
  $('event-blurb').textContent = EVENT.blurb;
  $('event-ends').textContent = `Ends in ${t.days}d ${t.hours}h`;
  $('event-reward-name').textContent = EVENT.rewardName;
  const done = save.event.progress >= EVENT.goal;
  $('event-progress').textContent = save.event.claimed
    ? 'Claimed. Looking neon.'
    : `Progress ${save.event.progress} / ${EVENT.goal} runs of ${EVENT.runMeters} m+`;
  $('event-play').textContent = done && !save.event.claimed ? 'Claim Reward ★' : 'Play Now ▸';
}

export function bindRewards(game) {
  $('reward-claim').addEventListener('click', () => {
    const got = claimDaily(game.save);
    if (!got) return;
    game.persist();
    toast(`Claimed ${got}!`);
    game.refresh();
  });
}

export function renderRewards(game) {
  const st = dailyState(game.save);
  $('reward-days').replaceChildren(...DAILY_REWARDS.map((r, i) => {
    const claimed = i < st.index || (!st.canClaim && i === st.index);
    const today = st.canClaim && i === st.index;
    const cls = ['day', r.big && 'big', claimed && 'claimed', today && 'today'].filter(Boolean).join(' ');
    return h('div', { className: cls, 'aria-label': `Day ${i + 1}${claimed ? ', claimed' : today ? ', ready' : ''}` },
      h('b', {}, `Day ${i + 1}`), img(r.img, ''), h('span', {}, r.label),
      claimed && h('span', { className: 'tick', 'aria-hidden': 'true' }, '✓'));
  }));
  const btn = $('reward-claim');
  btn.disabled = !st.canClaim;
  btn.textContent = st.canClaim ? 'Claim' : 'Come back tomorrow';
  btn.style.fontSize = st.canClaim ? '' : '18px';
}
