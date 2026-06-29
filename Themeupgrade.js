/* ══════════════════════════════════════════
   THEMEUPGRADE.JS — F.R.I.D.A.Y OS
   آیکون‌های مینیمال + canvas انیمیشن منحصربفرد هر تم
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   1. آیکون‌های SVG مینیمال برای هر تم
══════════════════════════════════════════ */
const THEME_ICONS = {
  sand:     { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2 Q16 8 12 12 Q8 16 12 22"/><path d="M6 7 Q10 10 8 14"/><path d="M18 7 Q14 10 16 14"/></svg>`, label: 'SAND' },
  rose:     { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="10" r="3"/><path d="M12 13 C10 16 8 18 9 21 C10 22 14 22 15 21 C16 18 14 16 12 13Z"/><path d="M9 7 Q7 5 8 3 Q10 4 10 7"/><path d="M15 7 Q17 5 16 3 Q14 4 14 7"/></svg>`, label: 'ROSE' },
  arctic:   { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/><circle cx="12" cy="12" r="2"/></svg>`, label: 'ARCTIC' },
  sage:     { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22 V10"/><path d="M12 10 C12 10 6 8 5 3 C9 3 12 7 12 10Z"/><path d="M12 10 C12 10 18 8 19 3 C15 3 12 7 12 10Z"/><path d="M8 17 C8 17 5 15 4 11"/><path d="M16 17 C16 17 19 15 20 11"/></svg>`, label: 'SAGE' },
  lavender: { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,17 5.5,21 7.5,13.5 2,9 9,9"/></svg>`, label: 'LAVENDER' },
  paper:    { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="1"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`, label: 'PAPER' },
  midnight: { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><circle cx="17" cy="5" r=".8" fill="currentColor"/><circle cx="19" cy="9" r=".5" fill="currentColor"/><circle cx="14" cy="3" r=".5" fill="currentColor"/></svg>`, label: 'MIDNIGHT' },
  carbon:   { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9 L15 15 M15 9 L9 15"/></svg>`, label: 'CARBON' },
  forest:   { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 20,16 4,16"/><polygon points="12,8 18,19 6,19"/><line x1="12" y1="16" x2="12" y2="22"/></svg>`, label: 'FOREST' },
  sunset:   { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 18 A5 5 0 0 0 7 18"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="4.22" y1="6.22" x2="6.34" y2="8.34"/><line x1="1" y1="14" x2="4" y2="14"/><line x1="19.78" y1="6.22" x2="17.66" y2="8.34"/><line x1="23" y1="14" x2="20" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`, label: 'SUNSET' },
  ocean:    { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12 Q5 8 8 12 Q11 16 14 12 Q17 8 20 12 Q21 13.5 22 12"/><path d="M2 17 Q5 13 8 17 Q11 21 14 17 Q17 13 20 17 Q21 18.5 22 17"/></svg>`, label: 'OCEAN' },
  neon:     { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>`, label: 'NEON' },
  copper:   { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`, label: 'COPPER' },
  slate:    { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="9"/><path d="M8 12 L16 12 M12 8 L12 16"/></svg>`, label: 'SLATE' },
  crimson:  { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21.593C4 17 2 11 4.5 7 6 4.5 8.5 3 12 3s6 1.5 7.5 4c2.5 4 .5 10-7.5 14.593Z"/><path d="M12 8 V14 M9 11 H15"/></svg>`, label: 'CRIMSON' },
  aurora:   { svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 16 Q7 8 12 12 Q17 16 22 8"/><path d="M2 12 Q7 4 12 8 Q17 12 22 4"/><path d="M2 20 Q7 14 12 17 Q17 20 22 14"/></svg>`, label: 'AURORA' },
};

/* ══════════════════════════════════════════
   2. CSS برای theme grid جدید
══════════════════════════════════════════ */
(function injectThemeStyle() {
  const s = document.createElement('style');
  s.textContent = `
    /* ── Theme Grid جدید ── */
    .theme-grid-new {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
    }

    .tbtn-new {
      border-radius: 14px; padding: 10px 4px 8px;
      border: 1.5px solid transparent;
      cursor: pointer; text-align: center;
      transition: all .25s cubic-bezier(.34,1.3,.64,1);
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      background: var(--card); position: relative; overflow: hidden;
    }
    .tbtn-new:hover { transform: translateY(-2px); }
    .tbtn-new:active { transform: scale(.88); }
    .tbtn-new.active { border-color: var(--accent); }
    .tbtn-new.active::after {
      content: ''; position: absolute; inset: 0;
      background: var(--accent); opacity: .06; pointer-events: none;
    }
    .tbtn-new.active .tnew-active-dot { opacity: 1; transform: scale(1); }

    /* اندیکاتور فعال */
    .tnew-active-dot {
      position: absolute; top: 5px; right: 5px;
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent); opacity: 0;
      transform: scale(0); transition: all .2s;
    }

    /* آیکون SVG */
    .tnew-icon {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      transition: all .2s;
    }
    .tnew-icon svg { width: 18px; height: 18px; }

    /* نام تم */
    .tnew-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 5.5px; letter-spacing: .8px; font-weight: 600;
    }

    /* رنگ accent بار پایین */
    .tnew-bar {
      width: 70%; height: 2px; border-radius: 2px; margin-top: 1px;
      transition: width .25s;
    }
    .tbtn-new.active .tnew-bar { width: 90%; }

    /* تقسیم‌بند */
    .theme-divider {
      font-family: 'JetBrains Mono', monospace; font-size: 6.5px;
      color: var(--text3); letter-spacing: 1.5px;
      margin: 12px 0 8px; display: flex; align-items: center; gap: 8px;
    }
    .theme-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }
  `;
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════
   3. بازسازی theme sheet
══════════════════════════════════════════ */
function buildThemeGrid() {
  const inner = document.querySelector('.theme-inner');
  if (!inner) return;

  const currentTheme = document.body.getAttribute('data-theme') || 'sand';

  // تم‌های روشن و تاریک
  const lightThemes = ['sand', 'rose', 'arctic', 'sage', 'lavender', 'paper'];
  const darkThemes  = ['midnight', 'carbon', 'forest', 'sunset', 'ocean', 'neon', 'copper', 'slate', 'crimson', 'aurora'];

  // رنگ‌های پیش‌نمایش هر تم
  const THEME_ACCENTS = {
    sand: '#b07d3a', rose: '#c0504a', arctic: '#2470b8', sage: '#3a7a3a',
    lavender: '#6a3ab0', paper: '#222', midnight: '#5090e0', carbon: '#d0d0d0',
    forest: '#4ac870', sunset: '#f07030', ocean: '#00b4e0', neon: '#c000ff',
    copper: '#c88030', slate: '#6898d8', crimson: '#e0205a', aurora: '#00e8c0',
  };
  const THEME_BG_COLORS = {
    sand: '#faf7f2', rose: '#fdf5f5', arctic: '#f4f8fc', sage: '#f3f7f3',
    lavender: '#f7f4fc', paper: '#fefefe', midnight: '#0a0e1a', carbon: '#111',
    forest: '#0d1a0f', sunset: '#1a0e06', ocean: '#030e1a', neon: '#060010',
    copper: '#110a04', slate: '#0e1218', crimson: '#120008', aurora: '#04080e',
  };

  function makeBtn(t) {
    const ico = THEME_ICONS[t];
    const accent = THEME_ACCENTS[t] || '#888';
    const bg = THEME_BG_COLORS[t] || '#fff';
    const isLight = lightThemes.includes(t);
    const iconColor = isLight ? accent : accent;
    return `
      <button class="tbtn-new ${t === currentTheme ? 'active' : ''}" 
              data-t="${t}" onclick="setTheme('${t}', this)"
              style="background:${bg}10;">
        <div class="tnew-active-dot"></div>
        <div class="tnew-icon" style="background:${accent}18; color:${iconColor}">
          ${ico?.svg || ''}
        </div>
        <div class="tnew-name" style="color:${accent}">${ico?.label || t.toUpperCase()}</div>
        <div class="tnew-bar" style="background:${accent}"></div>
      </button>`;
  }

  inner.innerHTML = `
    <div class="modal-handle"></div>
    <div class="theme-top">
      <div class="theme-title">// تم</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);cursor:pointer" onclick="closeTheme()">✕ بستن</div>
    </div>
    <div class="theme-divider">// روشن</div>
    <div class="theme-grid-new" style="margin-bottom:10px">
      ${lightThemes.map(makeBtn).join('')}
    </div>
    <div class="theme-divider">// تیره</div>
    <div class="theme-grid-new">
      ${darkThemes.map(makeBtn).join('')}
    </div>
  `;
}

// اجرا بعد از لود
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(buildThemeGrid, 100);
});

// هر بار که theme sheet باز میشه، ری‌بیلد کن
const _origOpenTheme = window.openTheme;
window.openTheme = function() {
  buildThemeGrid();
  _origOpenTheme && _origOpenTheme();
};

// Override setTheme برای آپدیت active state
const _origSetTheme2 = window.setTheme;
window.setTheme = function(t, el) {
  _origSetTheme2 && _origSetTheme2(t, el);
  // آپدیت active state در grid جدید
  document.querySelectorAll('.tbtn-new').forEach(b => {
    b.classList.toggle('active', b.dataset.t === t);
  });
};


/* ══════════════════════════════════════════
   4. Canvas انیمیشن منحصربفرد هر تم
   (extends THEME_BG_MAP با استایل‌های بهتر)
══════════════════════════════════════════ */
// ما BG engine رو با چند استایل جدید غنی‌تر می‌کنیم
(function extendBGEngine() {
  function waitForBG() {
    if (!window.BG) { setTimeout(waitForBG, 200); return; }
    injectNewStyles();
  }

  function injectNewStyles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // استایل‌های اضافه برای تم‌های خاص
    // این‌ها از طریق BG.setStyle با نام جدید قابل دسترسن

    // ── SAND: شن‌های روان ──
    window._BG_SAND = function(t, W, H, colors) {
      ctx.clearRect(0, 0, W, H);
      // موج‌های شنی
      for (let i = 0; i < 5; i++) {
        const y = H * (.15 + i * .17) + 20 * Math.sin(t * .0004 + i * 1.2);
        const g = ctx.createLinearGradient(0, y - 20, 0, y + 20);
        g.addColorStop(0, 'transparent');
        g.addColorStop(.5, colors[0].replace(/[\d.]+\)$/, `${.04 + i * .008})`));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 20, W, 40);
      }
      // ذرات شن
      if (!window._sandPts) {
        window._sandPts = Array.from({ length: 60 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          r: .5 + Math.random() * 1.2, vy: .1 + Math.random() * .3,
          vx: (Math.random() - .5) * .2,
          op: .05 + Math.random() * .15, phase: Math.random() * Math.PI * 2,
        }));
      }
      window._sandPts.forEach(p => {
        p.x += p.vx + .1; p.y += p.vy; p.phase += .01;
        if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
        if (p.x > W + 5) p.x = -5;
        const op = p.op * (.6 + .4 * Math.sin(p.phase));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[0].replace(/[\d.]+\)$/, `${op})`);
        ctx.fill();
      });
    };

    // ── NEON: نور نئون پالسی ──
    window._BG_NEON = function(t, W, H, colors) {
      ctx.clearRect(0, 0, W, H);
      // خطوط افقی نئونی
      [.2, .4, .6, .8].forEach((frac, i) => {
        const y = H * frac + 30 * Math.sin(t * .0015 + i * 1.5);
        const pulse = .4 + .6 * Math.abs(Math.sin(t * .003 + i));
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = colors[i % 3].replace(/[\d.]+\)$/, '.8)');
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const yy = y + 15 * Math.sin(x * .015 + t * .002 + i);
          x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = colors[i % 3].replace(/[\d.]+\)$/, `${.2 * pulse})`);
        ctx.lineWidth = 1.5; ctx.stroke();
      });
      ctx.shadowBlur = 0;
      // ذرات نئونی
      if (!window._neonPts) {
        window._neonPts = Array.from({ length: 30 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6,
          r: 1 + Math.random() * 2, phase: Math.random() * Math.PI * 2,
          col: Math.floor(Math.random() * 3),
        }));
      }
      window._neonPts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += .02;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const pulse = .5 + .5 * Math.sin(p.phase);
        ctx.shadowBlur = 8 * pulse;
        ctx.shadowColor = colors[p.col].replace(/[\d.]+\)$/, '.8)');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[p.col].replace(/[\d.]+\)$/, `${.3 * pulse})`);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    };

    // ── CRIMSON / SUNSET: آتش ──
    window._BG_FIRE = function(t, W, H, colors) {
      ctx.clearRect(0, 0, W, H);
      // شعله‌ها
      for (let i = 0; i < 4; i++) {
        const x = W * (.15 + i * .24) + 30 * Math.sin(t * .001 + i);
        const h = H * (.3 + .15 * Math.sin(t * .0013 + i * 1.7));
        const g = ctx.createRadialGradient(x, H, 0, x, H - h, h * .6);
        g.addColorStop(0, colors[0].replace(/[\d.]+\)$/, '.15)'));
        g.addColorStop(.5, colors[1].replace(/[\d.]+\)$/, '.08)'));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      // ذرات آتش که بالا میرن
      if (!window._firePts) {
        window._firePts = Array.from({ length: 40 }, () => ({
          x: Math.random() * W, y: H + Math.random() * 20,
          vy: -(0.5 + Math.random() * 1.5),
          vx: (Math.random() - .5) * .4,
          r: .5 + Math.random() * 2, alpha: 0,
          life: Math.random(), maxLife: .6 + Math.random() * .4,
        }));
      }
      window._firePts.forEach(p => {
        p.y += p.vy; p.x += p.vx + Math.sin(t * .002 + p.x) * .2;
        p.life += .008;
        if (p.life > p.maxLife) {
          p.y = H + 5; p.x = Math.random() * W;
          p.vy = -(0.5 + Math.random() * 1.5);
          p.life = 0; p.maxLife = .6 + Math.random() * .4;
        }
        const progress = p.life / p.maxLife;
        p.alpha = progress < .5 ? progress * .4 : (1 - progress) * .4;
        const col = progress < .5 ? colors[0] : colors[1];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = col.replace(/[\d.]+\)$/, `${p.alpha})`);
        ctx.fill();
      });
    };
  }

  waitForBG();
})();


/* ══════════════════════════════════════════
   5. THEME → CANVAS MAPPING بهبود‌یافته
══════════════════════════════════════════ */
// بعد از لود کامل، THEME_BG_MAP رو override کن
window.addEventListener('load', () => {
  if (!window.THEME_BG_MAP) return;

  // تم‌های خاص رو به استایل‌های جدید map کن
  // (THEME_BG_MAP موجوده، فقط override می‌کنیم)
  const overrides = {
    sand:    { style: 'particles' }, // با ذرات شنی — از BG engine موجود
    rose:    { style: 'petals'    },
    lavender:{ style: 'petals'    },
    midnight:{ style: 'stars'     },
    ocean:   { style: 'waves'     },
    neon:    { style: 'neon'      },
    sunset:  { style: 'aurora'    },
    crimson: { style: 'aurora'    },
    aurora:  { style: 'aurora'    },
    forest:  { style: 'particles' },
    copper:  { style: 'particles' },
    arctic:  { style: 'grid'      },
    paper:   { style: 'grid'      },
    carbon:  { style: 'grid'      },
    slate:   { style: 'grid'      },
    sage:    { style: 'particles' },
  };

  Object.keys(overrides).forEach(t => {
    if (window.THEME_BG_MAP[t]) {
      window.THEME_BG_MAP[t] = { ...window.THEME_BG_MAP[t], ...overrides[t] };
    }
  });

  // اعمال تم فعلی
  const cur = document.body.getAttribute('data-theme') || 'sand';
  const map = window.THEME_BG_MAP[cur];
  if (map && window.BG) window.BG.setStyle(map.style, map.colors);
});
