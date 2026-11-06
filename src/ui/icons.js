// Vector icon library: every UI icon that doesn't need painted art is drawn here as SVG, so it is
// sharp at any size and can be animated with CSS. Styled after the Phase 1 element kit: dark
// crisp outline, light from the top-left, glossy highlight.
//
//   icon('gem')                 -> SVG element
//   hydrateIcons(root)          -> fills every <i data-icon="gem"> under root
//   iconImage('fuel', 128)      -> Promise<HTMLImageElement> for canvas drawing

let uid = 0;
const INK = '#1A1A2E';

// Each icon is (u) => inner SVG markup for a 0 0 100 100 viewBox; u('name') gives a unique id.
const ICONS = {
  coin: (u) => `
    <defs><radialGradient id="${u('f')}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFF3A6"/><stop offset=".45" stop-color="#FFC928"/><stop offset="1" stop-color="#D98A00"/></radialGradient>
    <linearGradient id="${u('r')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#B86A00"/></linearGradient></defs>
    <circle cx="50" cy="50" r="44" fill="url(#${u('r', 1)})" stroke="#5A3200" stroke-width="6"/>
    <circle cx="50" cy="50" r="32" fill="url(#${u('f', 1)})" stroke="#B86A00" stroke-width="3"/>
    <path d="M50 26 L57 42 L74 43 L61 54 L65 71 L50 62 L35 71 L39 54 L26 43 L43 42Z" fill="#FFE15C" stroke="#B86A00" stroke-width="3" stroke-linejoin="round"/>
    <path d="M20 34 Q30 14 54 12" fill="none" stroke="#FFFBE0" stroke-width="5" stroke-linecap="round" opacity=".85"/>`,
  gem: () => `
    <path d="M50 90 L8 38 L26 14 L74 14 L92 38Z" fill="#1E6FD0"/>
    <path d="M8 38 L92 38 L74 14 L26 14Z" fill="#7FD6FF"/><path d="M26 14 L38 38 L50 14Z" fill="#C8F1FF"/>
    <path d="M50 14 L62 38 L74 14Z" fill="#A6E6FF"/><path d="M38 38 L50 14 L62 38Z" fill="#5CC4FF"/>
    <path d="M8 38 L38 38 L50 90Z" fill="#3E9BEA"/><path d="M38 38 L62 38 L50 90Z" fill="#62B8F5"/><path d="M62 38 L92 38 L50 90Z" fill="#2A7FDA"/>
    <path d="M50 90 L8 38 L26 14 L74 14 L92 38Z" fill="none" stroke="#0B2E66" stroke-width="5" stroke-linejoin="round"/>
    <path d="M30 20 L42 20" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  fuel: (u) => `
    <defs><linearGradient id="${u('r')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5A4E"/><stop offset=".55" stop-color="#E0201C"/><stop offset="1" stop-color="#9E0E12"/></linearGradient></defs>
    <path d="M22 22 L60 22 L80 38 L80 84 Q80 90 74 90 L26 90 Q20 90 20 84 L20 26 Q20 22 22 22Z" fill="url(#${u('r', 1)})" stroke="#4A0606" stroke-width="5" stroke-linejoin="round"/>
    <rect x="30" y="10" width="22" height="16" rx="5" fill="url(#${u('r', 1)})" stroke="#4A0606" stroke-width="5"/>
    <path d="M64 22 L74 10 L84 16 L78 30" fill="#C9CED8" stroke="#4A0606" stroke-width="5" stroke-linejoin="round"/>
    <path d="M32 44 L68 74 M68 44 L32 74" stroke="#9E0E12" stroke-width="7" stroke-linecap="round"/>
    <path d="M27 30 L27 80" stroke="#FFB3A8" stroke-width="5" stroke-linecap="round" opacity=".8"/>`,
  boost: (u) => `
    <defs><linearGradient id="${u('b')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BE3FF"/><stop offset=".5" stop-color="#42A5EF"/><stop offset="1" stop-color="#1667C9"/></linearGradient></defs>
    <path d="M60 6 L22 54 L46 54 L36 94 L80 38 L54 38 L66 6Z" fill="url(#${u('b', 1)})" stroke="#0B2E66" stroke-width="5" stroke-linejoin="round"/>
    <path d="M58 14 L32 48 L44 48" fill="none" stroke="#E6FAFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  shield: (u) => `
    <defs><linearGradient id="${u('s')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#C9CED8"/><stop offset="1" stop-color="#8A91A0"/></linearGradient>
    <linearGradient id="${u('b')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BE3FF"/><stop offset=".5" stop-color="#42A5EF"/><stop offset="1" stop-color="#1667C9"/></linearGradient></defs>
    <path d="M50 6 Q70 16 88 14 Q90 62 50 92 Q10 62 12 14 Q30 16 50 6Z" fill="url(#${u('s', 1)})" stroke="#1B2A4A" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 16 Q66 24 79 23 Q79 58 50 81 Q21 58 21 23 Q34 24 50 16Z" fill="url(#${u('b', 1)})" stroke="#1B4F9A" stroke-width="3"/>
    <path d="M50 32 L54 44 L66 45 L56 52 L60 64 L50 57 L40 64 L44 52 L34 45 L46 44Z" fill="#E8F8FF"/>`,
  magnet: (u) => `
    <defs><linearGradient id="${u('r')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9E0E12"/><stop offset=".35" stop-color="#FF5A4E"/><stop offset="1" stop-color="#C0181A"/></linearGradient></defs>
    <path d="M18 40 L18 58 A32 32 0 0 0 82 58 L82 40 L62 40 L62 58 A12 12 0 0 1 38 58 L38 40Z" fill="url(#${u('r', 1)})" stroke="#3A0A0A" stroke-width="5" stroke-linejoin="round"/>
    <rect x="18" y="24" width="20" height="18" fill="#E9ECF2" stroke="#3A0A0A" stroke-width="5"/>
    <rect x="62" y="24" width="20" height="18" fill="#E9ECF2" stroke="#3A0A0A" stroke-width="5"/>
    <path d="M28 8 L24 18 M50 4 L50 16 M72 8 L76 18" stroke="#42A5EF" stroke-width="5" stroke-linecap="round"/>`,
  hourglass: (u) => `
    <defs><linearGradient id="${u('g')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE68A"/><stop offset=".5" stop-color="#FFB62E"/><stop offset="1" stop-color="#C77800"/></linearGradient></defs>
    <path d="M30 16 L70 16 Q70 40 54 50 Q70 60 70 84 L30 84 Q30 60 46 50 Q30 40 30 16Z" fill="#DFF3FF" fill-opacity=".6" stroke="#3B2A10" stroke-width="4"/>
    <path d="M36 26 L64 26 Q60 40 50 46 Q40 40 36 26Z" fill="#F0A030"/><path d="M36 82 Q50 66 64 82Z" fill="#F0A030"/>
    <rect x="22" y="8" width="56" height="10" rx="4" fill="url(#${u('g', 1)})" stroke="#3B2A10" stroke-width="4"/>
    <rect x="22" y="82" width="56" height="10" rx="4" fill="url(#${u('g', 1)})" stroke="#3B2A10" stroke-width="4"/>`,
  trophy: (u) => `
    <defs><linearGradient id="${u('g')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3A6"/><stop offset=".45" stop-color="#FFC928"/><stop offset="1" stop-color="#B86A00"/></linearGradient></defs>
    <path d="M30 14 L70 14 L68 46 Q66 62 50 64 Q34 62 32 46Z" fill="url(#${u('g', 1)})" stroke="#5A3200" stroke-width="5" stroke-linejoin="round"/>
    <path d="M30 20 Q12 20 14 34 Q16 46 32 46 M70 20 Q88 20 86 34 Q84 46 68 46" fill="none" stroke="#5A3200" stroke-width="5"/>
    <path d="M30 20 Q16 20 18 33 Q20 43 32 43 M70 20 Q84 20 82 33 Q80 43 68 43" fill="none" stroke="#FFC928" stroke-width="2.5"/>
    <rect x="44" y="64" width="12" height="12" fill="#D98A00" stroke="#5A3200" stroke-width="4"/>
    <rect x="30" y="76" width="40" height="14" rx="3" fill="#8B5A2B" stroke="#5A3200" stroke-width="4"/>
    <path d="M50 24 L54 34 L64 34 L56 40 L59 50 L50 44 L41 50 L44 40 L36 34 L46 34Z" fill="#FFF6C2"/>
    <path d="M36 20 L37 40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
  star: () => `
    <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="#FFC928" stroke="#8A5200" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 16 L58 38 L42 38Z" fill="#FFF3A6"/><path d="M50 6 L62 36 L94 38 L69 58 L50 72Z" fill="#000" opacity=".08"/>`,
  'star-empty': () => `
    <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="#9AA1AE" stroke="#3A3D55" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 16 L58 38 L42 38Z" fill="#D8DCE6"/>`,
  lock: () => `
    <path d="M30 46 V30 a20 20 0 0 1 40 0 V46" fill="none" stroke="${INK}" stroke-width="16"/>
    <path d="M30 46 V30 a20 20 0 0 1 40 0 V46" fill="none" stroke="#C9CED8" stroke-width="8"/>
    <rect x="16" y="42" width="68" height="50" rx="10" fill="#FFB62E" stroke="${INK}" stroke-width="5"/>
    <circle cx="50" cy="62" r="7" fill="#5A3200"/><rect x="46" y="64" width="8" height="14" rx="3" fill="#5A3200"/>`,
  gift: () => `
    <rect x="12" y="38" width="76" height="52" rx="6" fill="#7A3FC8" stroke="${INK}" stroke-width="5"/>
    <rect x="8" y="26" width="84" height="18" rx="5" fill="#9B5AE8" stroke="${INK}" stroke-width="5"/>
    <rect x="42" y="26" width="16" height="64" fill="#FFC928" stroke="${INK}" stroke-width="4"/>
    <path d="M50 26 Q34 4 24 14 Q20 24 50 26 Q66 4 76 14 Q80 24 50 26Z" fill="#FFC928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  flag: () => `
    <path d="M6 92 Q50 62 94 92Z" fill="#5FAE3B" stroke="${INK}" stroke-width="4"/>
    <rect x="30" y="10" width="6" height="72" rx="2" fill="#8B5A2B" stroke="${INK}" stroke-width="3"/>
    <path d="M36 12 L84 12 L84 46 L36 46Z" fill="#fff" stroke="${INK}" stroke-width="4"/>
    <path d="M36 12h12v11H36z M60 12h12v11H60z M48 23h12v12H48z M72 23h12v12H72z M36 35h12v11H36z M60 35h12v11H60z" fill="${INK}"/>`,
  coins: () => `
    <ellipse cx="38" cy="78" rx="26" ry="9" fill="#C77800" stroke="#5A3200" stroke-width="4"/>
    <rect x="12" y="50" width="52" height="28" fill="#FFC928" stroke="#5A3200" stroke-width="4"/>
    <path d="M12 60 H64 M12 70 H64" stroke="#C77800" stroke-width="3"/>
    <ellipse cx="38" cy="50" rx="26" ry="9" fill="#FFE27A" stroke="#5A3200" stroke-width="4"/>
    <circle cx="68" cy="58" r="22" fill="#FFC928" stroke="#5A3200" stroke-width="4"/>
    <path d="M68 44 L72 54 L82 54 L74 60 L77 70 L68 64 L59 70 L62 60 L54 54 L64 54Z" fill="#FFE15C" stroke="#B86A00" stroke-width="2"/>`,
  loop: () => `
    <path d="M6 86 L94 86" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
    <path d="M6 86 L94 86" stroke="#E0201C" stroke-width="7" stroke-linecap="round"/>
    <circle cx="50" cy="48" r="32" fill="none" stroke="${INK}" stroke-width="12"/>
    <circle cx="50" cy="48" r="32" fill="none" stroke="#E0201C" stroke-width="7"/>
    <circle cx="50" cy="48" r="32" fill="none" stroke="#FFF2B0" stroke-width="3" stroke-dasharray="0 12" stroke-linecap="round"/>`,
  crash: () => `
    <path d="M50 4 L58 30 L84 16 L70 40 L96 50 L70 60 L84 84 L58 70 L50 96 L42 70 L16 84 L30 60 L4 50 L30 40 L16 16 L42 30Z" fill="#FFC928" stroke="#B53A00" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 22 L55 40 L72 34 L62 48 L78 54 L60 58 L66 74 L52 64 L46 80 L42 62 L26 68 L36 54 L22 46 L40 42 L34 26 L46 38Z" fill="#FF6B2A"/>`,
  doubler: () => `
    <circle cx="44" cy="50" r="36" fill="#FFC928" stroke="#5A3200" stroke-width="6"/>
    <circle cx="44" cy="50" r="26" fill="#FFE15C" stroke="#B86A00" stroke-width="3"/>
    <path d="M44 32 L49 44 L62 45 L52 53 L55 66 L44 59 L33 66 L36 53 L26 45 L39 44Z" fill="#FFC928" stroke="#B86A00" stroke-width="2"/>
    <rect x="56" y="58" width="40" height="30" rx="10" fill="#E95757" stroke="${INK}" stroke-width="4"/>
    <text x="76" y="80" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="22" font-weight="400" fill="#fff">×2</text>`,
  timer: () => `
    <rect x="42" y="4" width="16" height="12" rx="3" fill="#FFC928" stroke="${INK}" stroke-width="4"/>
    <path d="M74 20 L84 12" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="50" cy="56" r="38" fill="#FFC928" stroke="${INK}" stroke-width="5"/>
    <circle cx="50" cy="56" r="29" fill="#FFF8E1" stroke="#B86A00" stroke-width="3"/>
    <path d="M50 56 L50 34" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M50 56 L66 46" stroke="#E0201C" stroke-width="5" stroke-linecap="round" class="timer-hand"/>
    <circle cx="50" cy="56" r="5" fill="${INK}"/>`,
  gear: () => `
    <path d="M44 6h12l2 12 9 4 10-7 8 8-7 10 4 9 12 2v12l-12 2-4 9 7 10-8 8-10-7-9 4-2 12H44l-2-12-9-4-10 7-8-8 7-10-4-9-12-2V44l12-2 4-9-7-10 8-8 10 7 9-4Z" fill="#E9ECF2" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="13" fill="#4A4F80" stroke="${INK}" stroke-width="5"/>`,
  music: () => `<path d="M36 72 V22 L80 12 V62" fill="none" stroke="#FFE68A" stroke-width="8" stroke-linejoin="round"/><circle cx="26" cy="72" r="12" fill="#FFE68A"/><circle cx="70" cy="62" r="12" fill="#FFE68A"/>`,
  sfx: () => `<path d="M14 38 H32 L54 18 V82 L32 62 H14Z" fill="#FFE68A"/><path d="M66 34 Q76 50 66 66 M76 24 Q94 50 76 76" fill="none" stroke="#FFE68A" stroke-width="7" stroke-linecap="round"/>`,
  vibrate: () => `<rect x="32" y="12" width="36" height="76" rx="8" fill="none" stroke="#FFE68A" stroke-width="7"/><path d="M18 30 L12 40 L18 50 L12 60 L18 70 M82 30 L88 40 L82 50 L88 60 L82 70" fill="none" stroke="#FFE68A" stroke-width="6" stroke-linejoin="round"/>`,
  tilt: () => `<rect x="30" y="16" width="40" height="68" rx="8" fill="none" stroke="#FFE68A" stroke-width="7" transform="rotate(-18 50 50)"/><path d="M14 74 Q8 50 22 30 M86 26 Q92 50 78 70" fill="none" stroke="#FFE68A" stroke-width="6" stroke-linecap="round"/>`,
  graphics: () => `<rect x="10" y="16" width="80" height="54" rx="6" fill="none" stroke="#FFE68A" stroke-width="7"/><path d="M36 86 H64 M50 70 V86" stroke="#FFE68A" stroke-width="7" stroke-linecap="round"/><path d="M22 58 L40 38 L52 50 L62 40 L78 58Z" fill="#FFE68A"/>`,
  language: () => `<circle cx="50" cy="50" r="38" fill="none" stroke="#FFE68A" stroke-width="7"/><path d="M12 50 H88 M50 12 Q30 50 50 88 Q70 50 50 12" fill="none" stroke="#FFE68A" stroke-width="6"/>`,
};

// Avatar frames by tier: ring + laurels (+ crown and gem for the top tiers).
const FRAME_COLORS = {
  bronze: ['#F0B27A', '#B5651D', '#6B3410'],
  silver: ['#FFFFFF', '#AEB6C4', '#4E5462'],
  gold: ['#FFF3A6', '#FFB62E', '#8A5200'],
  legendary: ['#F4A6D7', '#8A3FC8', '#3B1A6B'],
};
for (const [tier, [hi, mid, lo]] of Object.entries(FRAME_COLORS)) {
  ICONS[`frame-${tier}`] = (u) => `
    <defs><linearGradient id="${u('g')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".5" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>
    <path d="M18 74 Q4 52 12 30 M82 74 Q96 52 88 30" fill="none" stroke="${lo}" stroke-width="7" stroke-linecap="round"/>
    ${[0, 1, 2].map((i) => `<ellipse cx="${10 + i * 2}" cy="${66 - i * 14}" rx="7" ry="4" fill="url(#${u('g', 1)})" stroke="${lo}" stroke-width="2" transform="rotate(${-50 + i * 20} ${10 + i * 2} ${66 - i * 14})"/>
      <ellipse cx="${90 - i * 2}" cy="${66 - i * 14}" rx="7" ry="4" fill="url(#${u('g', 1)})" stroke="${lo}" stroke-width="2" transform="rotate(${50 - i * 20} ${90 - i * 2} ${66 - i * 14})"/>`).join('')}
    <circle cx="50" cy="50" r="38" fill="none" stroke="${INK}" stroke-width="12"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="url(#${u('g', 1)})" stroke-width="8"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5"/>
    ${tier === 'gold' || tier === 'legendary' ? `<path d="M36 14 L36 4 L43 10 L50 2 L57 10 L64 4 L64 14Z" fill="url(#${u('g', 1)})" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` : ''}
    <path d="M42 86 L50 96 L58 86 L50 80Z" fill="${tier === 'legendary' ? '#E95757' : `url(#${u('g', 1)})`}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
}

// Medals 1–3: ribbon tails and a numbered disc.
const MEDALS = { 1: ['#FFF3A6', '#FFC928', '#B86A00', '#E0201C'], 2: ['#FFFFFF', '#C9CED8', '#6E7280', '#1F76D2'], 3: ['#F0B27A', '#D98A4A', '#7A3A10', '#3E9A30'] };
for (const [n, [hi, mid, lo, ribbon]] of Object.entries(MEDALS)) {
  ICONS[`medal-${n}`] = (u) => `
    <defs><radialGradient id="${u('g')}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${hi}"/><stop offset=".5" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient></defs>
    <path d="M30 56 L18 94 L32 86 L40 98 L48 62Z M70 56 L82 94 L68 86 L60 98 L52 62Z" fill="${ribbon}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="50" cy="40" r="34" fill="url(#${u('g', 1)})" stroke="${INK}" stroke-width="5"/>
    <circle cx="50" cy="40" r="25" fill="none" stroke="${lo}" stroke-width="3" opacity=".6"/>
    <text x="50" y="53" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="38" font-weight="400" fill="${lo}">${n}</text>`;
}

function build(name) {
  const draw = ICONS[name];
  if (!draw) throw new Error(`unknown icon ${name}`);
  const n = ++uid;
  // u('g') declares an id; u('g', 1) references the same one.
  const u = (k) => `i${n}${k}`;
  return draw(u);
}

export const hasIcon = (name) => name in ICONS;

export function iconMarkup(name, size = 100) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${build(name)}</svg>`;
}

export function icon(name, className = '') {
  const tpl = document.createElement('template');
  tpl.innerHTML = iconMarkup(name).trim();
  const svg = tpl.content.firstChild;
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('class', `ico ${className}`.trim());
  return svg;
}

export function hydrateIcons(root = document) {
  for (const el of root.querySelectorAll('[data-icon]:not([data-hydrated])')) {
    el.replaceChildren(icon(el.dataset.icon));
    el.dataset.hydrated = '1';
  }
}

/** Rasterise an icon at `px` for canvas drawing (crisp at that size). */
export function iconImage(name, px = 128) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconMarkup(name, px))}`;
  });
}
