// ============================================================================
// 🔗 Links.js — F.R.I.D.A.Y Vault v3.0
// ویژگی‌های جدید: thumbnail fallback زنجیره‌ای، hover preview card،
// bulk select، export JSON/CSV، copy URL، share، انیمیشن‌های بهتر
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

/* ── BULK BAR ── */
.bl-bulk-bar{
  display:none;align-items:center;gap:7px;padding:8px 12px;
  background:linear-gradient(135deg,var(--glow2),var(--bg2));
  border:1px solid var(--accent);border-radius:12px;margin-bottom:8px;
  animation:blBulkIn .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes blBulkIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}
.bl-bulk-bar.show{display:flex;}
.bl-bulk-cnt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);font-weight:700;margin-left:auto;}
.bl-bulk-btn{padding:5px 11px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:8px;cursor:pointer;white-space:nowrap;transition:all .2s;display:flex;align-items:center;gap:4px;}
.bl-bulk-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--glow2);}
.bl-bulk-btn:active{transform:scale(.93);}
.bl-bulk-btn.danger{border-color:rgba(255,68,68,.3);color:#ff4444;}
.bl-bulk-btn.danger:hover{background:rgba(255,68,68,.1);}

/* ── CAT BAR ── */
.bl-cat-bar{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;margin-bottom:9px;}
.bl-cat-bar::-webkit-scrollbar{display:none;}
.bl-cpill{padding:4px 12px;border-radius:18px;background:var(--surface);border:1px solid var(--border);font-size:8px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:4px;}
.bl-cpill.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.bl-cpill:active{transform:scale(.93);}
.bl-cpill-dot{width:5px;height:5px;border-radius:50%;}

/* ══ THUMBNAIL — fallback chain ══ */
.bl-thumb-wrap{position:relative;overflow:hidden;flex-shrink:0;}
.bl-thumb-wrap img{display:block;width:100%;height:100%;object-fit:cover;}
.bl-thumb-wrap img.loading{opacity:0;}
.bl-thumb-wrap img.loaded{opacity:1;transition:opacity .35s ease;}
.bl-thumb-wrap img.error{display:none;}

/* ── GENERATED PLACEHOLDER ── */
.bl-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative;overflow:hidden;min-height:72px;}
.bl-ph-bg{position:absolute;inset:0;}
.bl-ph-favicon{width:28px;height:28px;border-radius:8px;object-fit:contain;position:relative;z-index:2;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));}
.bl-ph-letter{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:17px;font-weight:900;position:relative;z-index:2;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.18);}
.bl-ph-domain{font-size:5.5px;font-family:'JetBrains Mono',monospace;position:relative;z-index:2;opacity:.75;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}
/* noise layer */
.bl-ph-noise{position:absolute;inset:0;z-index:1;opacity:.055;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:160px;}

/* ══ CARD — LIST MODE ══ */
.bl-list{display:flex;flex-direction:column;gap:7px;}
.bl-card{
  display:flex;align-items:stretch;border-radius:15px;
  background:var(--card);border:1px solid var(--card-b);
  text-decoration:none;overflow:hidden;position:relative;
  transition:transform .32s cubic-bezier(.34,1.56,.64,1),box-shadow .32s,border-color .2s;
}
.bl-card:hover{
  transform:perspective(500px) rotateX(-2deg) translateZ(10px);
  box-shadow:0 18px 44px rgba(0,0,0,.55),0 0 24px var(--glow2);
  border-color:var(--accent);
}
.bl-card:active{transform:scale(.97);}
.bl-card-bar{width:3px;flex-shrink:0;border-radius:15px 0 0 15px;}
.bl-card-thumb-area{width:72px;flex-shrink:0;position:relative;}

/* select checkbox */
.bl-sel-check{
  position:absolute;top:5px;right:5px;z-index:10;
  width:18px;height:18px;border-radius:5px;
  border:1.5px solid var(--border2);background:var(--bg2);
  display:none;align-items:center;justify-content:center;
  cursor:pointer;font-size:10px;transition:all .15s;
}
.bl-select-mode .bl-sel-check{display:flex;}
.bl-sel-check.checked{background:var(--accent);border-color:var(--accent);box-shadow:0 0 8px var(--glow);}

/* quick actions (appear on hover) */
.bl-quick-acts{
  position:absolute;top:6px;left:6px;z-index:10;
  display:flex;gap:4px;opacity:0;pointer-events:none;
  transition:opacity .2s;
}
.bl-card:hover .bl-quick-acts{opacity:1;pointer-events:all;}
.bl-select-mode .bl-quick-acts{display:none;}
.bl-qa-btn{
  width:24px;height:24px;border-radius:7px;
  background:rgba(0,0,0,.75);backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.12);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:11px;
  transition:transform .15s,background .15s;
}
.bl-qa-btn:hover{transform:scale(1.15);background:var(--glow2);}
.bl-qa-btn:active{transform:scale(.88);}

.bl-card-info{flex:1;padding:10px 11px;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px;}
.bl-card-name{font-size:10px;font-weight:700;color:var(--text1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;}
.bl-card-domain{font-size:6.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;direction:ltr;margin-top:1px;}
.bl-card-meta{display:flex;align-items:center;gap:5px;margin-top:4px;flex-wrap:wrap;}
.bl-badge{font-family:'JetBrains Mono',monospace;font-size:6px;padding:1px 6px;border-radius:5px;border:1px solid;white-space:nowrap;}
.bl-card-arr{color:var(--accent);font-size:14px;padding:0 8px;align-self:center;flex-shrink:0;opacity:.5;transition:opacity .2s,transform .2s;}
.bl-card:hover .bl-card-arr{opacity:1;transform:translateX(-2px);}

/* selected state */
.bl-card.bl-selected{border-color:var(--accent);background:linear-gradient(145deg,var(--glow2),var(--card));}

/* ══ HOVER PREVIEW CARD ══ */
.bl-preview-card{
  position:fixed;z-index:9999;pointer-events:none;
  width:220px;border-radius:16px;overflow:hidden;
  background:var(--glass);border:1px solid var(--glass-b);
  backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
  box-shadow:0 24px 60px rgba(0,0,0,.8),0 0 30px var(--glow2);
  opacity:0;transform:scale(.9) translateY(8px);
  transition:opacity .22s cubic-bezier(.22,1,.36,1),transform .22s cubic-bezier(.34,1.56,.64,1);
  display:none;
}
.bl-preview-card.visible{opacity:1;transform:scale(1) translateY(0);display:block;}
.bl-preview-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;}
.bl-preview-thumb-ph{width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;font-size:32px;position:relative;overflow:hidden;}
.bl-preview-thumb-ph-bg{position:absolute;inset:0;}
.bl-preview-body{padding:10px 12px 12px;}
.bl-preview-title{font-size:10px;font-weight:700;color:var(--text1);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bl-preview-url{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);direction:ltr;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bl-preview-badge{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:6px;padding:2px 7px;border-radius:5px;border:1px solid;margin-top:5px;}
.bl-preview-stripe{height:2px;background:linear-gradient(90deg,var(--grad1),var(--grad2),var(--grad3));background-size:200%;animation:blGrad 2s linear infinite;}
@keyframes blGrad{0%{background-position:0%}100%{background-position:200%}}

/* ══ GRID MODE ══ */
.bl-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.bl-gc{border-radius:16px;overflow:hidden;background:var(--card);border:1px solid var(--card-b);text-decoration:none;display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .2s;position:relative;}
.bl-gc:hover{transform:perspective(400px) rotateY(-5deg) rotateX(3deg) scale(1.04);box-shadow:10px 18px 40px rgba(0,0,0,.6),0 0 20px var(--glow2);border-color:var(--accent);}
.bl-gc:active{transform:scale(.94);}
.bl-gc.bl-selected{border-color:var(--accent);background:linear-gradient(145deg,var(--glow2),var(--card));}
.bl-gc-thumb{width:100%;aspect-ratio:16/9;position:relative;overflow:hidden;flex-shrink:0;}
.bl-gc-top-bar{position:absolute;top:0;left:0;right:0;height:2.5px;z-index:3;}
.bl-gc-info{padding:9px 10px;}
.bl-gc-name{font-size:9px;font-weight:700;color:var(--text1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;}
.bl-gc-domain{font-size:6px;color:var(--text3);font-family:'JetBrains Mono',monospace;direction:ltr;margin-top:2px;}
.bl-gc .bl-sel-check{top:7px;right:7px;}
.bl-gc .bl-quick-acts{top:7px;left:7px;}
.bl-gc:hover .bl-quick-acts{opacity:1;pointer-events:all;}
.bl-select-mode .bl-gc .bl-quick-acts{display:none;}

/* ── GC PLACEHOLDER ── */
.bl-gc-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;position:relative;overflow:hidden;}
.bl-gc-ph-bg{position:absolute;inset:0;}
.bl-gc-ph-noise{position:absolute;inset:0;z-index:1;opacity:.055;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:160px;}
.bl-gc-ph-favicon{width:32px;height:32px;border-radius:9px;object-fit:contain;position:relative;z-index:2;filter:drop-shadow(0 2px 8px rgba(0,0,0,.5));}
.bl-gc-ph-letter{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:19px;font-weight:900;position:relative;z-index:2;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.15);}
.bl-gc-ph-domain{font-size:6px;font-family:'JetBrains Mono',monospace;position:relative;z-index:2;opacity:.7;}

/* ══ COMPACT MODE ══ */
.bl-compact{display:flex;flex-direction:column;gap:3px;}
.bl-crow{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;background:var(--card);border:1px solid var(--card-b);text-decoration:none;transition:background .15s,transform .2s,border-color .2s;position:relative;}
.bl-crow:hover{background:var(--surface2);transform:translateX(-2px);border-color:var(--accent);}
.bl-crow:active{transform:scale(.98);}
.bl-crow.bl-selected{border-color:var(--accent);background:var(--glow2);}
.bl-cph-sm{width:26px;height:26px;border-radius:7px;flex-shrink:0;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.bl-cph-sm-bg{position:absolute;inset:0;}
.bl-cph-sm-fav{width:16px;height:16px;border-radius:4px;object-fit:contain;position:relative;z-index:2;}
.bl-cph-sm-letter{font-family:'Syne',sans-serif;font-size:11px;font-weight:900;position:relative;z-index:2;}
.bl-crow-name{font-size:10px;font-weight:600;color:var(--text1);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bl-crow-domain{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);direction:ltr;flex-shrink:0;}
.bl-crow-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}
.bl-crow .bl-sel-check{position:static;display:none;margin-right:2px;}
.bl-select-mode .bl-crow .bl-sel-check{display:flex;}
.bl-crow .bl-qa-btn-inline{width:22px;height:22px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);display:none;align-items:center;justify-content:center;cursor:pointer;font-size:10px;flex-shrink:0;}
.bl-crow:hover .bl-qa-btn-inline{display:flex;}
.bl-select-mode .bl-crow .bl-qa-btn-inline{display:none;}

/* ── EMPTY ── */
.bl-empty{text-align:center;padding:36px 0;color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:8px;line-height:2.4;}

/* ── EXPORT TOAST ── */
@keyframes blFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
`;
  document.head.appendChild(s);
})();

/* ══════════ PREVIEW CARD DOM ══════════ */
(function BL_injectPreview() {
  if (document.getElementById('bl-preview')) return;
  const d = document.createElement('div');
  d.className = 'bl-preview-card';
  d.id = 'bl-preview';
  document.body.appendChild(d);
})();

/* ══════════ STATE ══════════ */
let _blLinks   = [];
let _blCat     = 'all';
let _blQ       = '';
let _blView    = 'list';
let _blSort    = 'default';
let _blSelected = new Set();
let _blSelectMode = false;
let _blPreviewTimer = null;

/* ══════════ PALETTE ══════════ */
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

/* ══════════ YOUTUBE THUMBNAIL — FALLBACK CHAIN ══════════ */
/* کیفیت‌ها به ترتیب اولویت */
const YT_QUALITY_CHAIN = ['maxresdefault','sddefault','hqdefault','mqdefault','default'];

function _blYtThumbChain(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (!m) return null;
  return YT_QUALITY_CHAIN.map(q => `https://img.youtube.com/vi/${m[1]}/${q}.jpg`);
}

/* یه img می‌سازه که اگه خراب شد fallback بعدی رو امتحان کنه */
function _blYtImg(url, className, style) {
  const chain = _blYtThumbChain(url);
  if (!chain) return null;
  const uid = 'yt_' + _blHash(url);
  /* شروع با maxresdefault */
  return `<img id="${uid}" src="${chain[0]}" class="${className} loading" style="${style||''}"
    data-chain='${JSON.stringify(chain)}' data-chain-idx="0"
    onload="this.classList.remove('loading');this.classList.add('loaded')"
    onerror="BL_ytFallback(this)" loading="lazy">`;
}

/* fallback: سراغ کیفیت بعدی می‌ره */
function BL_ytFallback(img) {
  const chain = JSON.parse(img.dataset.chain || '[]');
  let idx = parseInt(img.dataset.chainIdx || '0') + 1;
  if (idx < chain.length) {
    img.dataset.chainIdx = idx;
    img.src = chain[idx];
  } else {
    /* همه خراب بودن — مخفی کن تا placeholder نمایش داشته باشه */
    img.style.display = 'none';
    const ph = img.nextElementSibling;
    if (ph) ph.style.display = '';
  }
}

/* ══════════ FAVICON با fallback ══════════ */
function _blFavImg(domain, className) {
  return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64"
    class="${className}"
    onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='flex')"
    loading="lazy">`;
}

/* ══════════ PLACEHOLDER HTML ══════════ */
function _blBgStyle(colors) {
  return `background:linear-gradient(140deg,${colors[0]}cc,${colors[1]}88)`;
}

function _blPhList(l) {
  const domain  = getDomain(l.url);
  const colors  = _blGetPalette(domain);
  const letter  = (l.name || domain || '?').charAt(0).toUpperCase();
  return `<div class="bl-ph">
    <div class="bl-ph-bg" style="${_blBgStyle(colors)}"></div>
    <div class="bl-ph-noise"></div>
    ${_blFavImg(domain,'bl-ph-favicon')}
    <div class="bl-ph-letter" style="display:none;color:${colors[0]};background:${colors[0]}22">${letter}</div>
    <div class="bl-ph-domain" style="color:${colors[0]}">${domain}</div>
  </div>`;
}

function _blPhGrid(l) {
  const domain  = getDomain(l.url);
  const colors  = _blGetPalette(domain);
  const letter  = (l.name || domain || '?').charAt(0).toUpperCase();
  return `<div class="bl-gc-ph">
    <div class="bl-gc-ph-bg" style="${_blBgStyle(colors)}"></div>
    <div class="bl-gc-ph-noise"></div>
    ${_blFavImg(domain,'bl-gc-ph-favicon')}
    <div class="bl-gc-ph-letter" style="display:none;color:${colors[0]};background:${colors[0]}22">${letter}</div>
    <div class="bl-gc-ph-domain" style="color:${colors[0]}">${domain}</div>
  </div>`;
}

function _blPhSm(l) {
  const domain  = getDomain(l.url);
  const colors  = _blGetPalette(domain);
  const letter  = (l.name || domain || '?').charAt(0).toUpperCase();
  return `<div class="bl-cph-sm">
    <div class="bl-cph-sm-bg" style="${_blBgStyle(colors)}"></div>
    ${_blFavImg(domain,'bl-cph-sm-fav')}
    <div class="bl-cph-sm-letter" style="display:none;color:${colors[0]}">${letter}</div>
  </div>`;
}

/* ══════════ THUMB BUILDER ══════════ */
function _blThumb(l, size) {
  const ck = catKey(l.category);

  /* ── YouTube ── */
  if (ck === 'yt') {
    const chain = _blYtThumbChain(l.url);
    if (chain) {
      if (size === 'list') {
        const uid = 'yt_' + _blHash(l.url + 'l');
        return `<div class="bl-thumb-wrap" style="width:72px;height:100%;min-height:72px">
          <img id="${uid}" src="${chain[0]}" style="width:72px;height:100%;object-fit:cover;display:block" class="loading"
            data-chain='${JSON.stringify(chain)}' data-chain-idx="0"
            onload="this.classList.remove('loading');this.classList.add('loaded')"
            onerror="BL_ytFallback(this)" loading="lazy">
          ${_blPhList(l)}
        </div>`;
      }
      if (size === 'grid') {
        const uid = 'yt_' + _blHash(l.url + 'g');
        return `<div class="bl-thumb-wrap" style="width:100%;height:100%;position:absolute;inset:0">
          <img id="${uid}" src="${chain[0]}" style="width:100%;height:100%;object-fit:cover;display:block" class="loading"
            data-chain='${JSON.stringify(chain)}' data-chain-idx="0"
            onload="this.classList.remove('loading');this.classList.add('loaded')"
            onerror="BL_ytFallback(this)" loading="lazy">
          <div style="display:none">${_blPhGrid(l)}</div>
        </div>`;
      }
      if (size === 'sm') {
        const uid = 'yt_' + _blHash(l.url + 's');
        return `<div class="bl-cph-sm">
          <img id="${uid}" src="${chain[0]}" style="width:26px;height:26px;border-radius:7px;object-fit:cover;display:block" class="loading"
            data-chain='${JSON.stringify(chain)}' data-chain-idx="0"
            onload="this.classList.remove('loading');this.classList.add('loaded')"
            onerror="BL_ytFallback(this)" loading="lazy">
        </div>`;
      }
    }
  }

  /* ── User thumbnail ── */
  if (l.thumbnail) {
    if (size === 'list') return `<div class="bl-thumb-wrap" style="width:72px;height:100%"><img src="${l.thumbnail}" loading="lazy" style="width:72px;height:100%;object-fit:cover;display:block" class="loading" onload="this.classList.remove('loading');this.classList.add('loaded')" onerror="this.style.display='none'"></div>`;
    if (size === 'grid') return `<div style="position:absolute;inset:0"><img src="${l.thumbnail}" loading="lazy" style="width:100%;height:100%;object-fit:cover" class="loading" onload="this.classList.remove('loading');this.classList.add('loaded')" onerror="this.style.display='none'"></div>`;
    if (size === 'sm')   return `<div class="bl-cph-sm"><img src="${l.thumbnail}" style="width:26px;height:26px;border-radius:7px;object-fit:cover" loading="lazy"></div>`;
  }

  /* ── Generated placeholder ── */
  if (size === 'grid') return _blPhGrid(l);
  if (size === 'sm')   return _blPhSm(l);
  return _blPhList(l);
}

/* ══════════ SORT ══════════ */
function _blSorted(arr) {
  const a = [...arr];
  if (_blSort === 'alpha')   return a.sort((x, y) => (x.name||'').localeCompare(y.name||'','fa'));
  if (_blSort === 'alpha-z') return a.sort((x, y) => (y.name||'').localeCompare(x.name||'','fa'));
  if (_blSort === 'newest')  return a.reverse();
  if (_blSort === 'oldest')  return a;
  return a;
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
  const si = document.getElementById('linkSearch');
  if (si) si.oninput = e => { _blQ = e.target.value.trim(); BL_render(); };
}
function loadLinks() { BL_load(); }

/* ══════════ RENDER ══════════ */
function BL_render() {
  /* cat counts */
  const cats = { all: _blLinks.length };
  _blLinks.forEach(l => { const k = catKey(l.category); cats[k] = (cats[k]||0)+1; });

  /* cat bar */
  const catEl = document.getElementById('linkCats');
  if (catEl) {
    catEl.className = 'bl-cat-bar';
    catEl.innerHTML = Object.entries(cats).map(([k, v]) => {
      const cm = CAT_MAP[k]; const color = cm?.color||'var(--accent)';
      return `<div class="bl-cpill ${k===_blCat?'active':''}" onclick="BL_setCat('${k}')">
        <div class="bl-cpill-dot" style="background:${color}"></div>
        ${cm?cm.label:k} <span style="opacity:.5">${v}</span>
      </div>`;
    }).join('');
  }

  /* filter */
  let f = _blLinks;
  if (_blCat !== 'all') f = f.filter(l => catKey(l.category) === _blCat);
  if (_blQ) { const q=_blQ.toLowerCase(); f=f.filter(l=>(l.name||'').toLowerCase().includes(q)||(l.url||'').toLowerCase().includes(q)); }
  f = _blSorted(f);

  /* toolbar */
  const listEl = document.getElementById('linkList');
  const selClass = _blSelectMode ? 'bl-select-mode' : '';
  listEl.innerHTML = `
    <div class="bl-toolbar">
      <div class="bl-view-btns">
        <div class="bl-vbtn ${_blView==='list'    ?'active':''}" onclick="BL_setView('list')"    title="لیست">☰</div>
        <div class="bl-vbtn ${_blView==='grid'    ?'active':''}" onclick="BL_setView('grid')"    title="گرید">⊞</div>
        <div class="bl-vbtn ${_blView==='compact' ?'active':''}" onclick="BL_setView('compact')" title="فشرده">≡</div>
      </div>
      <select class="bl-sort-sel" onchange="BL_setSort(this.value)">
        <option value="default" ${_blSort==='default' ?'selected':''}>پیش‌فرض</option>
        <option value="alpha"   ${_blSort==='alpha'   ?'selected':''}>الفبا ↑</option>
        <option value="alpha-z" ${_blSort==='alpha-z' ?'selected':''}>الفبا ↓</option>
        <option value="newest"  ${_blSort==='newest'  ?'selected':''}>جدیدترین</option>
        <option value="oldest"  ${_blSort==='oldest'  ?'selected':''}>قدیمی‌ترین</option>
      </select>
      <div class="bl-vbtn ${_blSelectMode?'active':''}" onclick="BL_toggleSelectMode()" title="انتخاب چندگانه">☑</div>
      <span class="bl-cnt">${f.length} لینک</span>
    </div>

    <!-- BULK ACTION BAR -->
    <div class="bl-bulk-bar ${_blSelected.size>0&&_blSelectMode?'show':''}" id="bl-bulk-bar">
      <span class="bl-bulk-cnt">${_blSelected.size} انتخاب شده</span>
      <div class="bl-bulk-btn" onclick="BL_bulkCopy()">📋 کپی URL</div>
      <div class="bl-bulk-btn" onclick="BL_bulkShare()">↗ اشتراک</div>
      <div class="bl-bulk-btn" onclick="BL_exportJSON()">⬇ JSON</div>
      <div class="bl-bulk-btn" onclick="BL_exportCSV()">⬇ CSV</div>
      <div class="bl-bulk-btn danger" onclick="BL_clearSel()">✕ لغو</div>
    </div>

    <div id="bl-items" class="${selClass}"></div>
  `;

  if (!f.length) {
    document.getElementById('bl-items').innerHTML = '<div class="bl-empty"><div style="font-size:28px;margin-bottom:8px;opacity:.3">🔗</div>// لینکی پیدا نشد</div>';
    return;
  }

  /* render by view */
  if      (_blView === 'list')    _blRenderList(f);
  else if (_blView === 'grid')    _blRenderGrid(f);
  else                            _blRenderCompact(f);

  /* re-bind hover preview */
  BL_bindPreviews();
}

/* ══════════ LIST ══════════ */
function _blRenderList(f) {
  const el = document.getElementById('bl-items');
  el.className = 'bl-list';
  el.innerHTML = f.map((l, i) => {
    const ck = catKey(l.category); const cm = CAT_MAP[ck]||CAT_MAP.other;
    const sel = _blSelected.has(l.url);
    const idx = _blLinks.indexOf(l);
    return `<a class="bl-card stagger-item${sel?' bl-selected':''}" style="animation-delay:${(i*.04).toFixed(2)}s"
               href="${l.url}" target="_blank" rel="noopener"
               data-url="${esc(l.url)}" data-name="${esc(l.name)}" data-cat="${esc(l.category||'')}">
      <!-- select checkbox -->
      <div class="bl-sel-check ${sel?'checked':''}" onclick="BL_toggleSel(event,'${esc(l.url)}')">${sel?'✓':''}</div>
      <!-- quick copy/share -->
      <div class="bl-quick-acts">
        <div class="bl-qa-btn" onclick="BL_qaCopy(event,'${esc(l.url)}')" title="کپی لینک">📋</div>
        <div class="bl-qa-btn" onclick="BL_qaShare(event,'${esc(l.name)}','${esc(l.url)}')" title="اشتراک">↗</div>
      </div>
      <div class="bl-card-bar" style="background:${cm.color}"></div>
      <div class="bl-card-thumb-area">${_blThumb(l,'list')}</div>
      <div class="bl-card-info">
        <div class="bl-card-name">${esc(l.name)}</div>
        <div class="bl-card-domain">${getDomain(l.url)}</div>
        <div class="bl-card-meta">
          <span class="bl-badge" style="color:${cm.color};border-color:${cm.color}44;background:${cm.color}11">${cm.icon} ${cm.label}</span>
        </div>
      </div>
      <div class="bl-card-arr">›</div>
    </a>`;
  }).join('');
}

/* ══════════ GRID ══════════ */
function _blRenderGrid(f) {
  const el = document.getElementById('bl-items');
  el.className = 'bl-grid';
  el.innerHTML = f.map((l, i) => {
    const ck = catKey(l.category); const cm = CAT_MAP[ck]||CAT_MAP.other;
    const sel = _blSelected.has(l.url);
    const hasMedia = ck==='yt'||l.thumbnail;
    return `<a class="bl-gc stagger-item${sel?' bl-selected':''}" style="animation-delay:${(i*.04).toFixed(2)}s"
               href="${l.url}" target="_blank" rel="noopener"
               data-url="${esc(l.url)}" data-name="${esc(l.name)}">
      <div class="bl-gc-top-bar" style="background:linear-gradient(90deg,${cm.color},${cm.color}66)"></div>
      <div class="bl-sel-check ${sel?'checked':''}" onclick="BL_toggleSel(event,'${esc(l.url)}')">${sel?'✓':''}</div>
      <div class="bl-quick-acts">
        <div class="bl-qa-btn" onclick="BL_qaCopy(event,'${esc(l.url)}')" title="کپی">📋</div>
        <div class="bl-qa-btn" onclick="BL_qaShare(event,'${esc(l.name)}','${esc(l.url)}')" title="اشتراک">↗</div>
      </div>
      <div class="bl-gc-thumb" style="position:relative">
        ${_blThumb(l,'grid')}
      </div>
      <div class="bl-gc-info">
        <div class="bl-gc-name">${esc(l.name)}</div>
        <div class="bl-gc-domain">${getDomain(l.url)}</div>
      </div>
    </a>`;
  }).join('');
}

/* ══════════ COMPACT ══════════ */
function _blRenderCompact(f) {
  const el = document.getElementById('bl-items');
  el.className = 'bl-compact';
  el.innerHTML = f.map((l, i) => {
    const ck = catKey(l.category); const cm = CAT_MAP[ck]||CAT_MAP.other;
    const sel = _blSelected.has(l.url);
    return `<a class="bl-crow stagger-item${sel?' bl-selected':''}" style="animation-delay:${(i*.03).toFixed(2)}s"
               href="${l.url}" target="_blank" rel="noopener"
               data-url="${esc(l.url)}" data-name="${esc(l.name)}">
      <div class="bl-sel-check ${sel?'checked':''}" onclick="BL_toggleSel(event,'${esc(l.url)}')">${sel?'✓':''}</div>
      ${_blThumb(l,'sm')}
      <div class="bl-crow-dot" style="background:${cm.color}"></div>
      <div class="bl-crow-name">${esc(l.name)}</div>
      <div class="bl-crow-domain">${getDomain(l.url)}</div>
      <div class="bl-qa-btn-inline" onclick="BL_qaCopy(event,'${esc(l.url)}')" title="کپی">📋</div>
    </a>`;
  }).join('');
}

/* ══════════ HOVER PREVIEW ══════════ */
function BL_bindPreviews() {
  const pv = document.getElementById('bl-preview');
  if (!pv) return;

  document.querySelectorAll('.bl-card,.bl-gc').forEach(card => {
    card.addEventListener('mouseenter', e => {
      if (_blSelectMode) return;
      clearTimeout(_blPreviewTimer);
      _blPreviewTimer = setTimeout(() => {
        const url  = card.dataset.url;
        const name = card.dataset.name;
        const cat  = card.dataset.cat || '';
        if (!url) return;

        const ck   = catKey(cat);
        const cm   = CAT_MAP[ck] || CAT_MAP.other;
        const colors = _blGetPalette(getDomain(url));
        const domain = getDomain(url);

        /* thumbnail for preview */
        let pvThumb = '';
        if (ck === 'yt') {
          const chain = _blYtThumbChain(url);
          if (chain) {
            const uid = 'pv_' + _blHash(url);
            pvThumb = `<img id="${uid}" src="${chain[0]}" class="bl-preview-thumb loading"
              data-chain='${JSON.stringify(chain)}' data-chain-idx="0"
              onload="this.classList.remove('loading');this.classList.add('loaded')"
              onerror="BL_ytFallback(this)" loading="lazy">`;
          }
        }
        if (!pvThumb) {
          pvThumb = `<div class="bl-preview-thumb-ph">
            <div class="bl-preview-thumb-ph-bg" style="${_blBgStyle(colors)}"></div>
            <span style="position:relative;z-index:1;font-size:28px">${cm.icon}</span>
          </div>`;
        }

        pv.innerHTML = `
          <div class="bl-preview-stripe"></div>
          ${pvThumb}
          <div class="bl-preview-body">
            <div class="bl-preview-title">${esc(name)}</div>
            <div class="bl-preview-url">${url}</div>
            <span class="bl-preview-badge" style="color:${cm.color};border-color:${cm.color}44;background:${cm.color}11">${cm.icon} ${cm.label}</span>
          </div>`;

        /* position */
        const rect = card.getBoundingClientRect();
        const pvW = 220, pvH = 200;
        let left = rect.left - pvW - 10;
        if (left < 8) left = rect.right + 10;
        let top  = rect.top + rect.height/2 - pvH/2;
        top = Math.max(8, Math.min(top, window.innerHeight - pvH - 8));
        pv.style.left = left + 'px';
        pv.style.top  = top + 'px';
        pv.style.display = 'block';
        requestAnimationFrame(() => pv.classList.add('visible'));
      }, 380);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(_blPreviewTimer);
      pv.classList.remove('visible');
      setTimeout(() => { if (!pv.classList.contains('visible')) pv.style.display='none'; }, 230);
    });
  });
}

/* ══════════ QUICK ACTIONS ══════════ */
function BL_qaCopy(e, url) {
  e.preventDefault(); e.stopPropagation();
  try { haptic(10); } catch(_) {}
  navigator.clipboard?.writeText(url).then(() => { try { showToast('📋 لینک کپی شد'); } catch(_) {} });
}

function BL_qaShare(e, name, url) {
  e.preventDefault(); e.stopPropagation();
  try { haptic(8); } catch(_) {}
  if (navigator.share) {
    navigator.share({ title: name, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(url).then(() => { try { showToast('📋 کپی شد (share پشتیبانی نمی‌شه)'); } catch(_) {} });
  }
}

/* ══════════ SELECT MODE ══════════ */
function BL_toggleSelectMode() {
  try { haptic(8); } catch(_) {}
  _blSelectMode = !_blSelectMode;
  if (!_blSelectMode) _blSelected.clear();
  BL_render();
}

function BL_toggleSel(e, url) {
  e.preventDefault(); e.stopPropagation();
  try { haptic(6); } catch(_) {}
  if (_blSelected.has(url)) _blSelected.delete(url);
  else _blSelected.add(url);
  BL_render();
}

function BL_clearSel() {
  _blSelected.clear();
  _blSelectMode = false;
  BL_render();
}

/* ══════════ BULK ACTIONS ══════════ */
function BL_bulkCopy() {
  const urls = [..._blSelected].join('\n');
  navigator.clipboard?.writeText(urls).then(() => {
    try { showToast(`📋 ${_blSelected.size} لینک کپی شد`); } catch(_) {}
  });
}

function BL_bulkShare() {
  const text = _blLinks
    .filter(l => _blSelected.has(l.url))
    .map(l => `${l.name}: ${l.url}`)
    .join('\n');
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text).then(() => {
      try { showToast('📋 لینک‌ها کپی شدن'); } catch(_) {}
    });
  }
}

function BL_exportJSON() {
  const selected = _blLinks.filter(l => _blSelected.size === 0 || _blSelected.has(l.url));
  const json     = JSON.stringify(selected, null, 2);
  _blDownload('links.json', json, 'application/json');
  try { showToast(`⬇ ${selected.length} لینک export شد`); } catch(_) {}
}

function BL_exportCSV() {
  const selected = _blLinks.filter(l => _blSelected.size === 0 || _blSelected.has(l.url));
  const rows = [['name','url','category'],
    ...selected.map(l => [
      `"${(l.name||'').replace(/"/g,'""')}"`,
      `"${(l.url||'').replace(/"/g,'""')}"`,
      `"${(l.category||'').replace(/"/g,'""')}"`,
    ])
  ];
  _blDownload('links.csv', rows.map(r=>r.join(',')).join('\n'), 'text/csv');
  try { showToast(`⬇ ${selected.length} لینک CSV`); } catch(_) {}
}

function _blDownload(filename, content, type) {
  const a   = document.createElement('a');
  const blob = new Blob([content], { type });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ══════════ CONTROLS ══════════ */
function BL_setCat(c)  { _blCat=c;  try{haptic(6);}catch(_){} BL_render(); }
function BL_setView(v) { _blView=v; try{haptic(6);}catch(_){} BL_render(); }
function BL_setSort(s) { _blSort=s; BL_render(); }

/* compat */
function setLinkCat(c) { BL_setCat(c); }
