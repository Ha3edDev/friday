/* ══════════════════════════════════════════
   THEMEUPGRADE.JS — F.R.I.D.A.Y OS
   آیکون‌های مینیمال + canvas انیمیشن منحصربفرد هر تم
══════════════════════════════════════════ */

const THEME_ICONS = {
  sand:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2 Q16 8 12 12 Q8 16 12 22"/><path d="M6 7 Q10 10 8 14"/><path d="M18 7 Q14 10 16 14"/></svg>`,
  rose:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="9" r="3"/><path d="M12 12 C10 15 8 17 9 20 C10 21 14 21 15 20 C16 17 14 15 12 12Z"/><path d="M9 6 Q7 4 8 2 Q10 3 10 6"/><path d="M15 6 Q17 4 16 2 Q14 3 14 6"/></svg>`,
  arctic:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/><circle cx="12" cy="12" r="2.5" fill="currentColor" opacity=".3"/></svg>`,
  sage:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22 V10"/><path d="M12 10 C12 10 6 8 5 3 C9 3 12 7 12 10Z"/><path d="M12 10 C12 10 18 8 19 3 C15 3 12 7 12 10Z"/><path d="M8 17 C8 17 5 15 4 11"/><path d="M16 17 C16 17 19 15 20 11"/></svg>`,
  lavender: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,17 5.5,21 7.5,13.5 2,9 9,9"/></svg>`,
  paper:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="1"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
  midnight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><circle cx="17" cy="5" r=".8" fill="currentColor"/><circle cx="19" cy="9" r=".5" fill="currentColor"/><circle cx="14" cy="3" r=".5" fill="currentColor"/></svg>`,
  carbon:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9 L15 15 M15 9 L9 15"/></svg>`,
  forest:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 20,16 4,16"/><polygon points="12,8 18,20 6,20"/><line x1="12" y1="16" x2="12" y2="22"/></svg>`,
  sunset:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 18 A5 5 0 0 0 7 18"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="4.22" y1="6.22" x2="6.34" y2="8.34"/><line x1="1" y1="14" x2="4" y2="14"/><line x1="19.78" y1="6.22" x2="17.66" y2="8.34"/><line x1="23" y1="14" x2="20" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  ocean:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12 Q5 8 8 12 Q11 16 14 12 Q17 8 20 12 Q21 13.5 22 12"/><path d="M2 17 Q5 13 8 17 Q11 21 14 17 Q17 13 20 17 Q21 18.5 22 17"/></svg>`,
  neon:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>`,
  copper:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`,
  slate:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="9"/><path d="M8 12 L16 12 M12 8 L12 16"/></svg>`,
  crimson:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21C4 17 2 11 4.5 7 6 4.5 8.5 3 12 3s6 1.5 7.5 4c2.5 4 .5 10-7.5 14Z"/><path d="M12 8 V14 M9 11 H15"/></svg>`,
  aurora:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 16 Q7 8 12 12 Q17 16 22 8"/><path d="M2 12 Q7 4 12 8 Q17 12 22 4"/><path d="M2 20 Q7 14 12 17 Q17 20 22 14"/></svg>`,
};

const THEME_META = {
  sand:     { accent:'#b07d3a', bg:'#faf7f2', dark:false },
  rose:     { accent:'#c0504a', bg:'#fdf5f5', dark:false },
  arctic:   { accent:'#2470b8', bg:'#f4f8fc', dark:false },
  sage:     { accent:'#3a7a3a', bg:'#f3f7f3', dark:false },
  lavender: { accent:'#6a3ab0', bg:'#f7f4fc', dark:false },
  paper:    { accent:'#333',    bg:'#fefefe', dark:false },
  midnight: { accent:'#5090e0', bg:'#0a0e1a', dark:true  },
  carbon:   { accent:'#d0d0d0', bg:'#111',    dark:true  },
  forest:   { accent:'#4ac870', bg:'#0d1a0f', dark:true  },
  sunset:   { accent:'#f07030', bg:'#1a0e06', dark:true  },
  ocean:    { accent:'#00b4e0', bg:'#030e1a', dark:true  },
  neon:     { accent:'#c000ff', bg:'#060010', dark:true  },
  copper:   { accent:'#c88030', bg:'#110a04', dark:true  },
  slate:    { accent:'#6898d8', bg:'#0e1218', dark:true  },
  crimson:  { accent:'#e0205a', bg:'#120008', dark:true  },
  aurora:   { accent:'#00e8c0', bg:'#04080e', dark:true  },
};

/* ══ CSS ══ */
(function injectCSS() {
  const el = document.getElementById('__tuStyle');
  if (el) el.remove();
  const s = document.createElement('style');
  s.id = '__tuStyle';
  s.textContent = `
    .theme-inner { padding-bottom: 80px !important; }

    .tu-grid {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 7px;
      margin-bottom: 14px;
    }

    .tu-btn {
      border-radius: 14px;
      padding: 10px 5px 8px;
      border: 1.5px solid rgba(128,128,128,.12);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      position: relative;
      overflow: hidden;
      transition: transform .2s, border-color .2s;
      -webkit-tap-highlight-color: transparent;
    }
    .tu-btn:active { transform: scale(.88); }
    .tu-btn.tu-active { border-color: var(--tu-accent) !important; }
    .tu-btn.tu-active::after {
      content: '';
      position: absolute; inset: 0;
      background: var(--tu-accent);
      opacity: .07;
      pointer-events: none;
    }
    .tu-btn.tu-active .tu-dot { opacity:1; transform:scale(1); }

    .tu-dot {
      position: absolute; top: 5px; right: 5px;
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--tu-accent);
      opacity: 0; transform: scale(0);
      transition: all .2s;
    }

    .tu-icon {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .tu-icon svg { width: 18px; height: 18px; }

    .tu-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 5.5px; letter-spacing: .6px; font-weight: 700;
    }

    .tu-bar {
      width: 65%; height: 2px; border-radius: 2px;
    }
    .tu-btn.tu-active .tu-bar { width: 85%; }

    .tu-divider {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.5px; color: var(--text3);
      letter-spacing: 1.5px;
      margin: 4px 0 9px;
      display: flex; align-items: center; gap: 8px;
    }
    .tu-divider::after {
      content: ''; flex: 1; height: 1px;
      background: var(--border);
    }
  `;
  document.head.appendChild(s);
})();

/* ══ BUILD GRID ══ */
function TU_buildGrid() {
  const inner = document.querySelector('.theme-inner');
  if (!inner) return;

  const cur = document.body.getAttribute('data-theme') || 'sand';
  const light = ['sand','rose','arctic','sage','lavender','paper'];
  const dark  = ['midnight','carbon','forest','sunset','ocean','neon','copper','slate','crimson','aurora'];

  function btn(t) {
    const m = THEME_META[t] || {};
    const ico = THEME_ICONS[t] || '';
    const accentCSS = m.accent || '#888';
    const bgCSS = m.bg || '#fff';
    const nameColor = m.dark ? m.accent : m.accent;
    return `
      <button class="tu-btn ${t===cur?'tu-active':''}"
              data-t="${t}"
              style="background:${bgCSS}; --tu-accent:${accentCSS};"
              onclick="TU_pick('${t}',this)">
        <div class="tu-dot"></div>
        <div class="tu-icon" style="background:${accentCSS}20; color:${accentCSS};">
          ${ico}
        </div>
        <div class="tu-name" style="color:${nameColor};">${t.toUpperCase()}</div>
        <div class="tu-bar" style="background:${accentCSS};"></div>
      </button>`;
  }

  inner.innerHTML = `
    <div class="modal-handle"></div>
    <div class="theme-top">
      <div class="theme-title">// تم</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);cursor:pointer" onclick="closeTheme()">✕</div>
    </div>
    <div class="tu-divider">// روشن</div>
    <div class="tu-grid">${light.map(btn).join('')}</div>
    <div class="tu-divider">// تیره</div>
    <div class="tu-grid">${dark.map(btn).join('')}</div>
  `;
}

/* ══ PICK ══ */
window.TU_pick = function(t, el) {
  // ripple morph اگه Effects.js لود شده
  if (window.THEME_MORPH_TRIGGER) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top  + rect.height / 2;
    const m = THEME_META[t];
    window.THEME_MORPH_TRIGGER(x, y, (m?.accent||'#888') + '22');
  }

  // اعمال تم
  document.body.setAttribute('data-theme', t);
  localStorage.setItem('fri_theme3', t);

  // آپدیت canvas bg
  if (window.THEME_BG_MAP && window.BG) {
    const map = window.THEME_BG_MAP[t];
    if (map) window.BG.setStyle(map.style, map.colors);
  }

  // آپدیت active state در grid
  document.querySelectorAll('.tu-btn').forEach(b => {
    b.classList.toggle('tu-active', b.dataset.t === t);
  });
  // active state grid قدیمی هم (اگه هنوز باشه)
  document.querySelectorAll('.tbtn').forEach(b => {
    b.classList.toggle('active', b.dataset.t === t);
  });

  if (typeof haptic === 'function') haptic(8);
  closeTheme();
};

/* ══ HOOK openTheme ══ */
const _origOpen = window.openTheme;
window.openTheme = function() {
  TU_buildGrid();
  if (_origOpen) _origOpen();
  else document.getElementById('themeSheet').classList.add('open');
};

/* ══ اولین بار هم بساز ══ */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(TU_buildGrid, 200);
});
