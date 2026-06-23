// ============================================================================
// 🔗 Links.js — F.R.I.D.A.Y Vault v2
// deps: apiFetch, esc, catKey, getDomain, CAT_MAP, getYtThumb (index.html)
// ============================================================================

/* ══════════ INJECT CSS ══════════ */
(function BL_injectCSS() {
  if (document.getElementById('bl-style')) return;
  const s = document.createElement('style');
  s.id = 'bl-style';
  s.textContent = `
/* ── TOOLBAR ── */
.bl-toolbar{display:flex;align-items:center;gap:6px;margin-bottom:9px;flex-wrap:wrap;}
.bl-view-btns{display:flex;gap:4px;flex-shrink:0;}
.bl-vbtn{width:30px;height:30px;border-radius:9px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;transition:all .2s;flex-shrink:0;}
.bl-vbtn.active{background:var(--glow2);border-color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.bl-vbtn:active{transform:scale(.88);}
.bl-sort-sel{background:var(--bg2);border:1px solid var(--border2);border-radius:9px;padding:6px 9px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;flex-shrink:0;}
.bl-cnt{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-right:auto;white-space:nowrap;}

/* ── CAT BAR ── */
.bl-cat-bar{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;margin-bottom:9px;}
.bl-cat-bar::-webkit-scrollbar{display:none;}
.bl-cpill{padding:4px 12px;border-radius:18px;background:var(--surface);border:1px solid var(--border);font-size:8px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:4px;}
.bl-cpill.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.bl-cpill:active{transform:scale(.93);}
.bl-cpill-dot{width:5px;height:5px;border-radius:50%;}

/* ══ CARD — LIST MODE ══ */
.bl-list{display:flex;flex-direction:column;gap:7px;}
.bl-card{display:flex;align-items:stretch;border-radius:15px;background:var(--card);border:1px solid var(--card-b);text-decoration:none;overflow:hidden;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;position:relative;}
.bl-card:hover{transform:perspective(500px) rotateX(-2deg) translateZ(8px);box-shadow:0 16px 40px rgba(0,0,0,.5),0 0 20px var(--glow2);}
.bl-card:active{transform:scale(.97);}
.bl-card-bar{width:3px;flex-shrink:0;border-radius:15px 0 0 15px;}

/* thumbnail / placeholder area */
.bl-card-thumb{width:72px;flex-shrink:0;position:relative;overflow:hidden;}
.bl-card-thumb img{width:100%;height:100%;object-fit:cover;display:block;}

/* ── GENERATED PLACEHOLDER ── */
.bl-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative;overflow:hidden;min-height:72px;}
.bl-ph-canvas{position:absolute;inset:0;}
.bl-ph-favicon{width:28px;height:28px;border-radius:8px;object-fit:contain;position:relative;z-index:2;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));}
.bl-ph-letter{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:16px;font-weight:900;position:relative;z-index:2;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.15);}
.bl-ph-domain{font-size:5.5px;font-family:'JetBrains Mono',monospace;position:relative;z-index:2;opacity:.7;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}

/* card info */
.bl-card-info{flex:1;padding:10px 11px;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px;}
.bl-card-name{font-size:10px;font-weight:700;color:var(--text1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;}
.bl-card-domain{font-size:6.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;direction:ltr;margin-top:1px;}
.bl-card-meta{display:flex;align-items:center;gap:5px;margin-top:4px;flex-wrap:wrap;}
.bl-badge{font-family:'JetBrains Mono',monospace;font-size:6px;padding:1px 6px;border-radius:5px;border:1px solid;white-space:nowrap;}
.bl-card-arr{color:var(--accent);font-size:14px;padding:0 8px;align-self:center;flex-shrink:0;opacity:.5;transition:opacity .2s,transform .2s;}
.bl-card:hover .bl-card-arr{opacity:1;transform:translateX(-2px);}

/* ══ GRID MODE ══ */
.bl-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.bl-gc{border-radius:16px;overflow:hidden;background:var(--card);border:1px solid var(--card-b);text-decoration:none;display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;position:relative;}
.bl-gc:hover{transform:perspective(400px) rotateY(-5deg) rotateX(3deg) scale(1.04);box-shadow:10px 18px 40px rgba(0,0,0,.6),0 0 20px var(--glow2);}
.bl-gc:active{transform:scale(.94);}
.bl-gc-thumb{width:100%;aspect-ratio:16/9;position:relative;overflow:hidden;flex-shrink:0;}
.bl-gc-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.bl-gc-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;position:relative;overflow:hidden;}
.bl-gc-ph-canvas{position:absolute;inset:0;}
.bl-gc-ph-favicon{width:32px;height:32px;border-radius:9px;object-fit:contain;position:relative;z-index:2;filter:drop-shadow(0 2px 8px rgba(0,0,0,.5));}
.bl-gc-ph-letter{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:18px;font-weight:900;position:relative;z-index:2;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.15);}
.bl-gc-ph-domain{font-size:6px;font-family:'JetBrains Mono',monospace;position:relative;z-index:2;opacity:.7;}
.bl-gc-info{padding:9px 10px;}
.bl-gc-name{font-size:9px;font-weight:700;color:var(--text1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;}
.bl-gc-domain{font-size:6px;color:var(--text3);font-family:'JetBrains Mono',monospace;direction:ltr;margin-top:2px;}
.bl-gc-top-bar{position:absolute;top:0;left:0;right:0;height:2.5px;z-index:3;}

/* ══ COMPACT MODE ══ */
.bl-compact{display:flex;flex-direction:column;gap:3px;}
.bl-crow{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;background:var(--card);border:1px solid var(--card-b);text-decoration:none;transition:background .15s,transform .2s;}
.bl-crow:hover{background:var(--surface2);transform:translateX(-2px);}
.bl-crow:active{transform:scale(.98);}
.bl-cph-sm{width:26px;height:26px;border-radius:7px;flex-shrink:0;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.bl-cph-sm-canvas{position:absolute;inset:0;}
.bl-cph-sm-fav{width:16px;height:16px;border-radius:4px;object-fit:contain;position:relative;z-index:2;}
.bl-cph-sm-letter{font-family:'Syne',sans-serif;font-size:11px;font-weight:900;position:relative;z-index:2;}
.bl-crow-name{font-size:10px;font-weight:600;color:var(--text1);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bl-crow-domain{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);direction:ltr;flex-shrink:0;}
.bl-crow-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}

/* ── EMPTY ── */
.bl-empty{text-align:center;padding:36px 0;color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:8px;line-height:2.4;}
  `;
  document.head.appendChild(s);
})();

/* ══════════ STATE ══════════ */
let _blLinks  = [];
let _blCat    = 'all';
let _blQ      = '';
let _blView   = 'list';   // list | grid | compact
let _blSort   = 'default'; // default | alpha | newest | oldest

/* ══════════ PALETTE — برای placeholder ══════════ */
// هر دامنه یه رنگ ثابت میگیره بر اساس hash
function _blHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const _BL_PALETTES = [
  ['#7c5cfc','#c084fc'],['#00ffb3','#00e5ff'],['#ff1f3d','#ff6b4a'],
  ['#00ff41','#00ffaa'],['#ff7700','#ffe033'],['#ff00cc','#00f5ff'],
  ['#0096ff','#66ffee'],['#f472b6','#fbbf24'],['#22d3ee','#6366f1'],
  ['#a78bfa','#34d399'],['#fb923c','#f43f5e'],['#38bdf8','#a3e635'],
];

function _blGetPalette(seed) {
  return _BL_PALETTES[_blHash(seed) % _BL_PALETTES.length];
}

/* ── canvas gradient placeholder ── */
function _blDrawCanvas(canvas, colors) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || 72, h = canvas.offsetHeight || 72;
  canvas.width = w; canvas.height = h;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, colors[0] + 'cc');
  g.addColorStop(1, colors[1] + '88');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // subtle noise dots
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.arc(
      (_blHash(colors[0] + i) % w),
      (_blHash(colors[1] + i) % h),
      2 + (_blHash(colors[0] + colors[1] + i) % 5),
      0, Math.PI * 2
    );
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ── placeholder HTML برای card (list) ── */
function _blPhHTML(l, size = 'md') {
  const domain = getDomain(l.url);
  const colors = _blGetPalette(domain);
  const letter = (l.name || domain || '?').charAt(0).toUpperCase();
  const fav    = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const uid    = 'blc_' + _blHash(l.url + size);

  if (size === 'sm') {
    return `<div class="bl-cph-sm" id="${uid}">
      <canvas class="bl-cph-sm-canvas" id="${uid}_cv"></canvas>
      <img src="${fav}" class="bl-cph-sm-fav"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
           loading="lazy">
      <div class="bl-cph-sm-letter" style="display:none;color:${colors[0]}">${letter}</div>
    </div>`;
  }

  if (size === 'grid') {
    return `<div class="bl-gc-ph" id="${uid}">
      <canvas class="bl-gc-ph-canvas" id="${uid}_cv"></canvas>
      <img src="${fav}" class="bl-gc-ph-favicon"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
           loading="lazy">
      <div class="bl-gc-ph-letter" style="display:none;color:${colors[0]};background:${colors[0]}22">${letter}</div>
      <div class="bl-gc-ph-domain" style="color:${colors[0]}">${domain}</div>
    </div>`;
  }

  // md — list card
  return `<div class="bl-ph" id="${uid}">
    <canvas class="bl-ph-canvas" id="${uid}_cv"></canvas>
    <img src="${fav}" class="bl-ph-favicon"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         loading="lazy">
    <div class="bl-ph-letter" style="display:none;color:${colors[0]};background:${colors[0]}22">${letter}</div>
    <div class="bl-ph-domain" style="color:${colors[0]}">${domain}</div>
  </div>`;
}

/* بعد از render کانواس‌ها رو رنگ کن */
function _blPaintCanvases() {
  document.querySelectorAll('[id$="_cv"]').forEach(cv => {
    const uid  = cv.id.replace('_cv', '');
    const wrap = document.getElementById(uid);
    if (!wrap) return;
    // پیدا کردن دامنه از اطراف
    const fav = wrap.querySelector('img');
    if (!fav) return;
    const domain = (fav.src.match(/domain=([^&]+)/) || [])[1] || 'x';
    const colors = _blGetPalette(decodeURIComponent(domain));
    _blDrawCanvas(cv, colors);
  });
}

/* ══════════ THUMB ══════════ */
function _blThumb(l, size = 'md') {
  const ck = catKey(l.category);
  // YouTube: thumbnail واقعی
  if (ck === 'yt') {
    const s = getYtThumb(l.url);
    if (s) {
      if (size === 'grid') return `<img class="bl-gc-ph-favicon" src="${s}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:0">`;
      if (size === 'sm')   return `<img src="${s}" style="width:26px;height:26px;border-radius:7px;object-fit:cover">`;
      return `<img src="${s}" style="width:72px;height:100%;object-fit:cover;display:block">`;
    }
  }
  // user-supplied thumbnail
  if (l.thumbnail) {
    if (size === 'grid') return `<img src="${l.thumbnail}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
    if (size === 'sm')   return `<img src="${l.thumbnail}" style="width:26px;height:26px;border-radius:7px;object-fit:cover">`;
    return `<img src="${l.thumbnail}" style="width:72px;height:100%;object-fit:cover;display:block">`;
  }
  // generated placeholder
  return _blPhHTML(l, size);
}

/* ══════════ SORT ══════════ */
function _blSorted(arr) {
  const a = [...arr];
  if (_blSort === 'alpha')   return a.sort((x, y) => (x.name || '').localeCompare(y.name || '', 'fa'));
  if (_blSort === 'alpha-z') return a.sort((x, y) => (y.name || '').localeCompare(x.name || '', 'fa'));
  if (_blSort === 'newest')  return a.reverse();
  if (_blSort === 'oldest')  return a;
  return a; // default
}

/* ══════════ ENTRY ══════════ */
async function BL_load() {
  const data = await apiFetch('vault_data');
  if (!data) {
    document.getElementById('linkList').innerHTML = '<div class="bl-empty">// خطا در بارگذاری</div>';
    return;
  }
  _blLinks = data;
  BL_render();

  // search
  const si = document.getElementById('linkSearch');
  if (si) si.oninput = e => { _blQ = e.target.value.trim(); BL_render(); };
}

// compat با index.html
function loadLinks() { BL_load(); }

/* ══════════ RENDER ══════════ */
function BL_render() {
  /* ── cat counts ── */
  const cats = { all: _blLinks.length };
  _blLinks.forEach(l => {
    const k = catKey(l.category);
    cats[k] = (cats[k] || 0) + 1;
  });

  /* ── cat bar ── */
  const catEl = document.getElementById('linkCats');
  if (catEl) {
    catEl.className = 'bl-cat-bar';
    catEl.innerHTML = Object.entries(cats).map(([k, v]) => {
      const cm = CAT_MAP[k];
      const color = cm?.color || 'var(--accent)';
      return `<div class="bl-cpill ${k === _blCat ? 'active' : ''}" onclick="BL_setCat('${k}')">
        <div class="bl-cpill-dot" style="background:${color}"></div>
        ${cm ? cm.label : k} <span style="opacity:.5">${v}</span>
      </div>`;
    }).join('');
  }

  /* ── filter ── */
  let f = _blLinks;
  if (_blCat !== 'all') f = f.filter(l => catKey(l.category) === _blCat);
  if (_blQ) {
    const q = _blQ.toLowerCase();
    f = f.filter(l => (l.name || '').toLowerCase().includes(q) || (l.url || '').toLowerCase().includes(q));
  }
  f = _blSorted(f);

  /* ── toolbar ── */
  const listEl = document.getElementById('linkList');
  listEl.innerHTML = `
    <div class="bl-toolbar">
      <div class="bl-view-btns">
        <div class="bl-vbtn ${_blView==='list'   ?'active':''}" onclick="BL_setView('list')"   title="لیست">☰</div>
        <div class="bl-vbtn ${_blView==='grid'   ?'active':''}" onclick="BL_setView('grid')"   title="گرید">⊞</div>
        <div class="bl-vbtn ${_blView==='compact'?'active':''}" onclick="BL_setView('compact')" title="فشرده">≡</div>
      </div>
      <select class="bl-sort-sel" onchange="BL_setSort(this.value)">
        <option value="default"  ${_blSort==='default' ?'selected':''}>پیش‌فرض</option>
        <option value="alpha"    ${_blSort==='alpha'   ?'selected':''}>الفبا ↑</option>
        <option value="alpha-z"  ${_blSort==='alpha-z' ?'selected':''}>الفبا ↓</option>
        <option value="newest"   ${_blSort==='newest'  ?'selected':''}>جدیدترین</option>
        <option value="oldest"   ${_blSort==='oldest'  ?'selected':''}>قدیمی‌ترین</option>
      </select>
      <span class="bl-cnt">${f.length} لینک</span>
    </div>
    <div id="bl-items"></div>
  `;

  if (!f.length) {
    document.getElementById('bl-items').innerHTML = '<div class="bl-empty"><div style="font-size:28px;margin-bottom:8px;opacity:.3">🔗</div>// لینکی پیدا نشد</div>';
    return;
  }

  /* ── render by view ── */
  if (_blView === 'list')    _blRenderList(f);
  else if (_blView === 'grid')    _blRenderGrid(f);
  else                            _blRenderCompact(f);

  /* رنگ‌آمیزی canvasها بعد از DOM ready */
  requestAnimationFrame(_blPaintCanvases);
}

/* ── LIST ── */
function _blRenderList(f) {
  const el = document.getElementById('bl-items');
  el.className = 'bl-list';
  el.innerHTML = f.map((l, i) => {
    const ck = catKey(l.category);
    const cm = CAT_MAP[ck] || CAT_MAP.other;
    return `<a class="bl-card stagger-item" style="animation-delay:${(i * 0.04).toFixed(2)}s"
               href="${l.url}" target="_blank" rel="noopener">
      <div class="bl-card-bar" style="background:${cm.color}"></div>
      <div class="bl-card-thumb">${_blThumb(l, 'md')}</div>
      <div class="bl-card-info">
        <div class="bl-card-name">${esc(l.name)}</div>
        <div class="bl-card-domain">${getDomain(l.url)}</div>
        <div class="bl-card-meta">
          <span class="bl-badge" style="color:${cm.color};border-color:${cm.color}44;background:${cm.color}11">
            ${cm.icon} ${cm.label}
          </span>
        </div>
      </div>
      <div class="bl-card-arr">›</div>
    </a>`;
  }).join('');
}

/* ── GRID ── */
function _blRenderGrid(f) {
  const el = document.getElementById('bl-items');
  el.className = 'bl-grid';
  el.innerHTML = f.map((l, i) => {
    const ck = catKey(l.category);
    const cm = CAT_MAP[ck] || CAT_MAP.other;
    const domain = getDomain(l.url);
    const hasImg = ck === 'yt' || l.thumbnail;

    return `<a class="bl-gc stagger-item" style="animation-delay:${(i * 0.04).toFixed(2)}s"
               href="${l.url}" target="_blank" rel="noopener">
      <div class="bl-gc-top-bar" style="background:linear-gradient(90deg,${cm.color},${cm.color}66)"></div>
      <div class="bl-gc-thumb">
        ${hasImg
          ? `<img src="${ck === 'yt' ? getYtThumb(l.url) : l.thumbnail}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`
          : _blPhHTML(l, 'grid')
        }
      </div>
      <div class="bl-gc-info">
        <div class="bl-gc-name">${esc(l.name)}</div>
        <div class="bl-gc-domain">${domain}</div>
      </div>
    </a>`;
  }).join('');
}

/* ── COMPACT ── */
function _blRenderCompact(f) {
  const el = document.getElementById('bl-items');
  el.className = 'bl-compact';
  el.innerHTML = f.map((l, i) => {
    const ck = catKey(l.category);
    const cm = CAT_MAP[ck] || CAT_MAP.other;
    return `<a class="bl-crow stagger-item" style="animation-delay:${(i * 0.03).toFixed(2)}s"
               href="${l.url}" target="_blank" rel="noopener">
      ${_blThumb(l, 'sm')}
      <div class="bl-crow-dot" style="background:${cm.color}"></div>
      <div class="bl-crow-name">${esc(l.name)}</div>
      <div class="bl-crow-domain">${getDomain(l.url)}</div>
    </a>`;
  }).join('');
}

/* ══════════ CONTROLS ══════════ */
function BL_setCat(c) {
  _blCat = c;
  try { haptic(6); } catch(e) {}
  BL_render();
}

function BL_setView(v) {
  _blView = v;
  try { haptic(6); } catch(e) {}
  BL_render();
}

function BL_setSort(s) {
  _blSort = s;
  BL_render();
}

// compat
function setLinkCat(c) { BL_setCat(c); }
