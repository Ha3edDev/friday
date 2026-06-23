// ============================================================================
// 🎬 Movies.js — F.R.I.D.A.Y Watchlist v2
// deps: TMDB_KEY, TMDB_IMG, apiFetch, esc (index.html)
// ============================================================================

/* ══════════ INJECT CSS ══════════ */
(function BM_injectCSS() {
  if (document.getElementById('bm-style')) return;
  const s = document.createElement('style');
  s.id = 'bm-style';
  s.textContent = `
/* ── TOOLBAR ── */
.bm-toolbar{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;}
.bm-view-btns{display:flex;gap:4px;flex-shrink:0;}
.bm-vbtn{width:30px;height:30px;border-radius:9px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;transition:all .2s;flex-shrink:0;}
.bm-vbtn.active{background:var(--glow2);border-color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.bm-vbtn:active{transform:scale(.88);}
.bm-sort-sel{background:var(--bg2);border:1px solid var(--border2);border-radius:9px;padding:6px 9px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;}
.bm-cnt{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-right:auto;white-space:nowrap;}

/* ── FILTER BAR ── */
.bm-filters{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;margin-bottom:9px;}
.bm-filters::-webkit-scrollbar{display:none;}
.bm-fp{padding:4px 12px;border-radius:18px;background:var(--surface);border:1px solid var(--border);font-size:8px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0;font-family:'JetBrains Mono',monospace;}
.bm-fp.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.bm-fp:active{transform:scale(.93);}

/* ── GRID ── */
.bm-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
@media(max-width:360px){.bm-grid{grid-template-columns:1fr 1fr;}}
.bm-gc{border-radius:13px;overflow:hidden;position:relative;background:var(--bg2);border:1px solid var(--border);cursor:pointer;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;}
.bm-gc:hover{transform:perspective(400px) rotateY(-6deg) rotateX(3deg) scale(1.06);box-shadow:12px 20px 44px rgba(0,0,0,.7),0 0 24px var(--glow2);}
.bm-gc:active{transform:scale(.92);}
.bm-gc-poster{width:100%;aspect-ratio:2/3;object-fit:cover;display:block;}
.bm-gc-ph{width:100%;aspect-ratio:2/3;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:9px 6px;position:relative;overflow:hidden;}
.bm-gc-ph-bg{position:absolute;inset:0;}
.bm-gc-ph-stripe{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--grad1),var(--grad2),var(--grad3));opacity:.7;}
.bm-gc-ph-deco{position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:32px;opacity:.13;filter:blur(1px);}
.bm-gc-ph-info{position:relative;z-index:1;width:100%;text-align:center;}
.bm-gc-ph-title{font-size:7.5px;font-weight:700;color:var(--text1);line-height:1.3;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;}
.bm-gc-ph-year{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--accent);margin-top:2px;}
.bm-gc-ov{position:absolute;bottom:0;left:0;right:0;padding:24px 7px 7px;background:linear-gradient(to top,rgba(0,0,0,.97) 0%,transparent 100%);}
.bm-gc-title{font-size:7.5px;font-weight:700;color:#fff;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bm-gc-meta{display:flex;align-items:center;justify-content:space-between;margin-top:2px;}
.bm-gc-rate{font-size:6.5px;color:#fbbf24;font-family:'JetBrains Mono',monospace;}
.bm-gc-year{font-size:6px;color:rgba(255,255,255,.4);font-family:'JetBrains Mono',monospace;}
.bm-gc-type{position:absolute;top:6px;right:6px;font-family:'JetBrains Mono',monospace;font-size:6px;padding:2px 5px;border-radius:5px;background:rgba(0,0,0,.7);color:var(--accent);border:1px solid var(--accent);backdrop-filter:blur(4px);}
.bm-gc-status{position:absolute;top:6px;left:6px;font-size:9px;}

/* ── LIST ── */
.bm-list{display:flex;flex-direction:column;gap:7px;}
.bm-lc{display:flex;align-items:stretch;border-radius:14px;overflow:hidden;background:var(--card);border:1px solid var(--card-b);cursor:pointer;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;}
.bm-lc:hover{transform:perspective(500px) rotateX(-2deg) translateZ(7px);box-shadow:0 14px 36px rgba(0,0,0,.5),0 0 18px var(--glow2);}
.bm-lc:active{transform:scale(.97);}
.bm-lc-poster{width:54px;flex-shrink:0;position:relative;overflow:hidden;}
.bm-lc-poster img{width:100%;height:100%;object-fit:cover;display:block;}
.bm-lc-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;position:relative;overflow:hidden;}
.bm-lc-ph-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--bg3),var(--bg2));}
.bm-lc-ph-stripe{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--grad1),var(--grad2));opacity:.6;}
.bm-lc-ph-emoji{position:relative;z-index:1;opacity:.5;}
.bm-lc-info{flex:1;padding:10px 12px;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:3px;}
.bm-lc-title{font-size:11px;font-weight:700;color:var(--text1);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bm-lc-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.bm-lc-rate{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#fbbf24;}
.bm-lc-year{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);}
.bm-lc-badge{font-family:'JetBrains Mono',monospace;font-size:6px;padding:1px 6px;border-radius:5px;background:var(--glow2);color:var(--accent);border:1px solid var(--accent);opacity:.8;}
.bm-lc-arr{color:var(--accent);font-size:16px;padding:0 10px;align-self:center;opacity:.4;transition:opacity .2s,transform .2s;}
.bm-lc:hover .bm-lc-arr{opacity:1;transform:translateX(-2px);}

/* ── MODAL ── */
.bm-modal-bg{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.92);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);display:flex;align-items:flex-end;opacity:0;pointer-events:none;transition:opacity .25s;}
.bm-modal-bg.open{opacity:1;pointer-events:all;}
.bm-sheet{width:100%;background:var(--glass);border:1px solid var(--glass-b);border-radius:24px 24px 0 0;max-height:91vh;overflow-y:auto;transform:translateY(120px);transition:transform .38s cubic-bezier(.34,1.56,.64,1);}
.bm-sheet::-webkit-scrollbar{display:none;}
.bm-modal-bg.open .bm-sheet{transform:translateY(0);}
.bm-sheet-handle{width:32px;height:3px;background:var(--border2);border-radius:2px;margin:12px auto 0;}

/* hero */
.bm-hero{position:relative;width:100%;height:220px;overflow:hidden;flex-shrink:0;}
.bm-hero-img{width:100%;height:100%;object-fit:cover;display:block;}
.bm-hero-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:60px;position:relative;overflow:hidden;}
.bm-hero-ph-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--bg3) 0%,var(--bg2) 60%,rgba(0,0,0,.9) 100%);}
.bm-hero-ph-emoji{position:relative;z-index:1;opacity:.25;filter:blur(2px);}
.bm-hero-grad{position:absolute;bottom:0;left:0;right:0;height:140px;background:linear-gradient(to top,var(--glass) 0%,transparent 100%);}
.bm-hero-top-bar{position:absolute;top:0;left:0;right:0;height:2.5px;background:linear-gradient(90deg,var(--grad1),var(--grad2),var(--grad3));box-shadow:0 0 16px var(--glow);}
.bm-hero-badges{position:absolute;top:12px;right:12px;display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;}
.bm-hero-badge{font-family:'JetBrains Mono',monospace;font-size:7px;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.1);}
.bm-hero-close{position:absolute;top:12px;left:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:13px;transition:all .2s;}
.bm-hero-close:hover{transform:rotate(90deg) scale(1.1);}

/* poster + title row */
.bm-detail-head{display:flex;gap:13px;padding:14px 15px 0;align-items:flex-start;}
.bm-detail-poster{width:72px;flex-shrink:0;border-radius:11px;overflow:hidden;border:2px solid var(--card-b);box-shadow:0 8px 28px rgba(0,0,0,.6);margin-top:-44px;position:relative;z-index:2;}
.bm-detail-poster img{width:100%;display:block;}
.bm-detail-poster-ph{width:72px;height:108px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:28px;border-radius:11px;border:2px solid var(--card-b);margin-top:-44px;position:relative;z-index:2;}
.bm-detail-info{flex:1;min-width:0;padding-top:8px;}
.bm-detail-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:900;color:var(--text1);line-height:1.3;}
.bm-detail-orig{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:2px;direction:ltr;}
.bm-detail-stars{display:flex;align-items:center;gap:5px;margin-top:6px;}
.bm-detail-score{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:#fbbf24;line-height:1;text-shadow:0 0 20px rgba(251,191,36,.5);}
.bm-detail-score-lbl{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.bm-detail-myrate{font-family:'JetBrains Mono',monospace;font-size:9px;padding:2px 8px;border-radius:6px;background:var(--glow2);color:var(--accent);border:1px solid var(--accent);margin-right:4px;}

/* info chips */
.bm-chips{display:flex;gap:5px;flex-wrap:wrap;padding:10px 15px 0;}
.bm-chip{font-family:'JetBrains Mono',monospace;font-size:7px;padding:3px 9px;border-radius:7px;background:var(--bg2);border:1px solid var(--border);color:var(--text2);}
.bm-chip.hl{color:var(--accent);border-color:var(--accent);background:var(--glow2);}

/* overview */
.bm-overview{padding:12px 15px 0;font-size:11.5px;color:var(--text2);line-height:1.9;}
.bm-sec-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2.5px;text-transform:uppercase;padding:14px 15px 6px;display:flex;align-items:center;gap:7px;}
.bm-sec-lbl::after{content:'';flex:1;height:1px;background:linear-gradient(to left,transparent,var(--border));}

/* cast */
.bm-cast{display:flex;gap:8px;overflow-x:auto;padding:0 15px 4px;}
.bm-cast::-webkit-scrollbar{display:none;}
.bm-cast-card{flex-shrink:0;width:58px;text-align:center;}
.bm-cast-img{width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 4px;border:2px solid var(--border);}
.bm-cast-ph{width:52px;height:52px;border-radius:50%;background:var(--bg2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:20px;}
.bm-cast-name{font-size:7.5px;color:var(--text1);font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bm-cast-char{font-size:6.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:1px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}

/* genres */
.bm-genres{display:flex;gap:5px;flex-wrap:wrap;padding:0 15px;}
.bm-genre{font-size:8.5px;padding:4px 11px;border-radius:20px;background:var(--surface2);border:1px solid var(--border2);color:var(--text2);}

/* trailer btn */
.bm-trailer-btn{display:flex;align-items:center;justify-content:center;gap:8px;margin:12px 15px;padding:13px;border-radius:14px;background:linear-gradient(135deg,rgba(255,0,0,.15),rgba(255,0,0,.05));border:1px solid rgba(255,68,68,.3);cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);text-decoration:none;}
.bm-trailer-btn:hover{background:linear-gradient(135deg,rgba(255,0,0,.25),rgba(255,0,0,.1));box-shadow:0 0 24px rgba(255,68,68,.2);transform:translateY(-2px);}
.bm-trailer-btn:active{transform:scale(.97);}
.bm-trailer-icon{width:36px;height:36px;border-radius:50%;background:#ff4444;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 16px rgba(255,68,68,.4);}
.bm-trailer-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text1);letter-spacing:1px;}

/* spinner */
.bm-spin{width:22px;height:22px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto;}
.bm-modal-loading{padding:28px;display:flex;flex-direction:column;align-items:center;gap:10px;}
.bm-modal-loading-txt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);animation:txtBlink 1.5s ease-in-out infinite;}

/* empty */
.bm-empty{text-align:center;padding:44px 0;color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:8.5px;line-height:2.4;}
  `;
  document.head.appendChild(s);

  // modal container یه بار
  if (!document.getElementById('bmModal')) {
    const m = document.createElement('div');
    m.className = 'bm-modal-bg';
    m.id = 'bmModal';
    m.onclick = e => { if (e.target === m) BM_closeModal(); };
    m.innerHTML = `<div class="bm-sheet" id="bmSheet"></div>`;
    document.body.appendChild(m);
  }
})();

/* ══════════ STATE ══════════ */
let _bmData   = [];
let _bmView   = 'grid';   // grid | list
let _bmSort   = 'default';
let _bmFilter = 'all';    // all | movie | tv | watched | unwatched
let _bmTmdbCache = {};    // tmdb_id → data

const BM_EMOJIS = ['🎬','🎥','🎞️','📽️','🎦','🌟','⭐','🎭','🎪','🎠','🔥','💫'];
function _bmEmoji(title) {
  let h = 0;
  for (let i = 0; i < (title||'').length; i++) h = ((h<<5)-h+title.charCodeAt(i))|0;
  return BM_EMOJIS[Math.abs(h) % BM_EMOJIS.length];
}

/* ══════════ TMDB FETCH ══════════ */
async function _bmFetchTmdb(m) {
  const cacheKey = m.tmdb_id ? `id_${m.tmdb_id}` : `q_${m.title}`;
  if (_bmTmdbCache[cacheKey]) return _bmTmdbCache[cacheKey];

  let data = null;
  if (m.tmdb_id) {
    try {
      const r = await fetch(`https://api.themoviedb.org/3/${m.media_type||'movie'}/${m.tmdb_id}?api_key=${TMDB_KEY}&language=fa-IR&append_to_response=credits,videos`);
      data = await r.json();
    } catch(e) {}
  }
  if (!data?.poster_path && m.title) {
    try {
      const r = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(m.title)}&language=fa-IR`);
      const d = await r.json();
      if (d.results?.[0]) {
        const id = d.results[0].id;
        const r2 = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=fa-IR&append_to_response=credits,videos`);
        data = await r2.json();
      }
    } catch(e) {}
  }
  if (data) _bmTmdbCache[cacheKey] = data;
  return data;
}

/* backdrop یا poster */
async function _bmGetBackdrop(m) {
  const d = await _bmFetchTmdb(m);
  if (d?.backdrop_path) return `https://image.tmdb.org/t/p/w780${d.backdrop_path}`;
  if (d?.poster_path)   return `${TMDB_IMG}${d.poster_path}`;
  return null;
}

/* ══════════ ENTRY ══════════ */
async function BM_load() {
  const data = await apiFetch('watchlist_data');
  const el = document.getElementById('moviesWrap');
  if (!data || !data.length) {
    el.innerHTML = '<div class="bm-empty"><div style="font-size:32px;margin-bottom:8px;opacity:.3">🎬</div>// لیست خالیه</div>';
    return;
  }
  _bmData = data;
  BM_render();
}

// compat
function loadMovies() { BM_load(); }

/* ══════════ RENDER ══════════ */
function BM_render() {
  const el = document.getElementById('moviesWrap');

  /* ── فیلتر ── */
  let f = _bmData;
  if (_bmFilter === 'movie')     f = f.filter(m => (m.media_type||'movie') === 'movie');
  else if (_bmFilter === 'tv')   f = f.filter(m => m.media_type === 'tv');
  else if (_bmFilter === 'watched')   f = f.filter(m => m.watched || m.status === 'watched');
  else if (_bmFilter === 'unwatched') f = f.filter(m => !m.watched && m.status !== 'watched');

  /* ── مرتب‌سازی ── */
  f = [...f];
  if (_bmSort === 'alpha')    f.sort((a,b) => (a.title||'').localeCompare(b.title||'','fa'));
  else if (_bmSort === 'rating') f.sort((a,b) => (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0));
  else if (_bmSort === 'year')   f.sort((a,b) => parseInt(b.year||b.release_date||0) - parseInt(a.year||a.release_date||0));

  /* ── toolbar + filter bar ── */
  el.innerHTML = `
    <div class="bm-toolbar">
      <div class="bm-view-btns">
        <div class="bm-vbtn ${_bmView==='grid'?'active':''}" onclick="BM_setView('grid')" title="گرید">⊞</div>
        <div class="bm-vbtn ${_bmView==='list'?'active':''}" onclick="BM_setView('list')" title="لیست">☰</div>
      </div>
      <select class="bm-sort-sel" onchange="BM_setSort(this.value)">
        <option value="default" ${_bmSort==='default'?'selected':''}>پیش‌فرض</option>
        <option value="rating"  ${_bmSort==='rating' ?'selected':''}>بهترین امتیاز</option>
        <option value="year"    ${_bmSort==='year'   ?'selected':''}>جدیدترین</option>
        <option value="alpha"   ${_bmSort==='alpha'  ?'selected':''}>الفبا</option>
      </select>
      <span class="bm-cnt">${f.length} فیلم</span>
    </div>
    <div class="bm-filters">
      <div class="bm-fp ${_bmFilter==='all'      ?'active':''}" onclick="BM_setFilter('all')">همه (${_bmData.length})</div>
      <div class="bm-fp ${_bmFilter==='movie'    ?'active':''}" onclick="BM_setFilter('movie')">🎬 فیلم</div>
      <div class="bm-fp ${_bmFilter==='tv'       ?'active':''}" onclick="BM_setFilter('tv')">📺 سریال</div>
      <div class="bm-fp ${_bmFilter==='watched'  ?'active':''}" onclick="BM_setFilter('watched')">✅ دیده‌شده</div>
      <div class="bm-fp ${_bmFilter==='unwatched'?'active':''}" onclick="BM_setFilter('unwatched')">⏳ ندیده</div>
    </div>
    <div id="bm-items"></div>
  `;

  if (!f.length) {
    document.getElementById('bm-items').innerHTML = '<div class="bm-empty">// چیزی پیدا نشد</div>';
    return;
  }

  if (_bmView === 'grid') _bmRenderGrid(f);
  else                    _bmRenderList(f);
}

/* ── GRID ── */
function _bmRenderGrid(f) {
  const el = document.getElementById('bm-items');
  el.innerHTML = `<div class="bm-grid">${f.map((m,i) => {
    const emoji = _bmEmoji(m.title);
    const year  = m.year || (m.release_date||'').slice(0,4) || '';
    const isTV  = m.media_type === 'tv';
    return `<div class="bm-gc stagger-item" id="bmgc-${i}" style="animation-delay:${(i*0.04).toFixed(2)}s" onclick="BM_openModal(${i})">
      <div class="bm-gc-ph" id="bmp-${i}">
        <div class="bm-gc-ph-bg" style="background:linear-gradient(160deg,var(--bg3),var(--bg2),rgba(0,0,0,.9))"></div>
        <div class="bm-gc-ph-stripe"></div>
        <div class="bm-gc-ph-deco">${emoji}</div>
        <div class="bm-gc-ph-info">
          <div class="bm-gc-ph-title">${esc(m.title)}</div>
          ${year ? `<div class="bm-gc-ph-year">${year}</div>` : ''}
        </div>
      </div>
      <div class="bm-gc-ov">
        <div class="bm-gc-title">${esc(m.title)}</div>
        <div class="bm-gc-meta">
          <span class="bm-gc-rate">${m.rating ? '★ '+m.rating : ''}</span>
          <span class="bm-gc-year">${year}</span>
        </div>
      </div>
      ${isTV ? `<div class="bm-gc-type">TV</div>` : ''}
      ${m.watched||m.status==='watched' ? `<div class="bm-gc-status">✅</div>` : ''}
    </div>`;
  }).join('')}</div>`;

  // پوستر async
  f.forEach(async (m, i) => {
    const ph = document.getElementById('bmp-'+i);
    if (!ph) return;
    const d = await _bmFetchTmdb(m);
    if (d?.poster_path) {
      ph.outerHTML = `<img class="bm-gc-poster" src="${TMDB_IMG}${d.poster_path}" loading="lazy">`;
    }
  });
}

/* ── LIST ── */
function _bmRenderList(f) {
  const el = document.getElementById('bm-items');
  el.innerHTML = `<div class="bm-list">${f.map((m,i) => {
    const emoji = _bmEmoji(m.title);
    const year  = m.year || (m.release_date||'').slice(0,4) || '';
    const isTV  = m.media_type === 'tv';
    return `<div class="bm-lc stagger-item" id="bmlc-${i}" style="animation-delay:${(i*0.04).toFixed(2)}s" onclick="BM_openModal(${i})">
      <div class="bm-lc-poster" id="bmlp-${i}">
        <div class="bm-lc-ph">
          <div class="bm-lc-ph-bg"></div>
          <div class="bm-lc-ph-stripe"></div>
          <div class="bm-lc-ph-emoji">${emoji}</div>
        </div>
      </div>
      <div class="bm-lc-info">
        <div class="bm-lc-title">${esc(m.title)}</div>
        <div class="bm-lc-meta">
          ${m.rating ? `<span class="bm-lc-rate">★ ${m.rating}</span>` : ''}
          ${year     ? `<span class="bm-lc-year">${year}</span>` : ''}
          ${isTV     ? `<span class="bm-lc-badge">TV</span>` : ''}
          ${m.watched||m.status==='watched' ? `<span class="bm-lc-badge">✅ دیده‌شده</span>` : ''}
        </div>
      </div>
      <div class="bm-lc-arr">›</div>
    </div>`;
  }).join('')}</div>`;

  // پوستر async
  f.forEach(async (m, i) => {
    const ph = document.getElementById('bmlp-'+i);
    if (!ph) return;
    const d = await _bmFetchTmdb(m);
    if (d?.poster_path) {
      ph.innerHTML = `<img src="${TMDB_IMG}${d.poster_path}" style="width:100%;height:100%;object-fit:cover;display:block">`;
    }
  });
}

/* ══════════ MODAL ══════════ */
// ایندکس فعلی رو نگه میداریم
let _bmCurrentIdx = -1;

async function BM_openModal(idx) {
  try { haptic(10); } catch(e) {}
  _bmCurrentIdx = idx;
  const m = _bmData[idx];
  if (!m) return;

  const modal = document.getElementById('bmModal');
  const sheet = document.getElementById('bmSheet');
  modal.classList.add('open');

  // loading state
  sheet.innerHTML = `
    <div class="bm-sheet-handle"></div>
    <div class="bm-modal-loading">
      <div class="bm-spin"></div>
      <div class="bm-modal-loading-txt">// در حال بارگذاری...</div>
    </div>`;

  // fetch TMDB
  const d = await _bmFetchTmdb(m);
  const year = m.year || (m.release_date||d?.release_date||'').slice(0,4) || '';
  const emoji = _bmEmoji(m.title);
  const isTV = m.media_type === 'tv' || d?.first_air_date;

  /* ── backdrop / hero ── */
  const backdropURL = d?.backdrop_path ? `https://image.tmdb.org/t/p/w780${d.backdrop_path}` : null;
  const posterURL   = d?.poster_path   ? `${TMDB_IMG}${d.poster_path}` : null;

  const heroHTML = backdropURL
    ? `<img class="bm-hero-img" src="${backdropURL}" loading="lazy">`
    : `<div class="bm-hero-ph">
         <div class="bm-hero-ph-bg"></div>
         <div class="bm-hero-ph-emoji">${emoji}</div>
       </div>`;

  const posterHTML = posterURL
    ? `<div class="bm-detail-poster"><img src="${posterURL}" loading="lazy"></div>`
    : `<div class="bm-detail-poster-ph">${emoji}</div>`;

  /* ── امتیاز TMDB ── */
  const tmdbScore = d?.vote_average ? d.vote_average.toFixed(1) : null;

  /* ── ژانرها ── */
  const genres = d?.genres?.map(g => g.name) || [];

  /* ── بازیگران ── */
  const cast = d?.credits?.cast?.slice(0,10) || [];

  /* ── تریلر ── */
  const trailer = d?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerURL = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  /* ── مدت ── */
  const runtime = d?.runtime ? `${d.runtime} دقیقه` : (d?.episode_run_time?.[0] ? `${d.episode_run_time[0]} دقیقه/قسمت` : null);

  /* ── کشور ── */
  const country = d?.production_countries?.[0]?.name || '';

  /* ── ساخت HTML ── */
  sheet.innerHTML = `
    <div class="bm-sheet-handle"></div>

    <div class="bm-hero">
      ${heroHTML}
      <div class="bm-hero-grad"></div>
      <div class="bm-hero-top-bar"></div>
      <div class="bm-hero-badges">
        ${year     ? `<span class="bm-hero-badge">📅 ${year}</span>` : ''}
        ${isTV     ? `<span class="bm-hero-badge" style="color:var(--accent3)">📺 سریال</span>` : `<span class="bm-hero-badge">🎬 فیلم</span>`}
        ${m.watched||m.status==='watched' ? `<span class="bm-hero-badge" style="color:#22d47a">✅ دیده‌شده</span>` : ''}
      </div>
      <div class="bm-hero-close" onclick="BM_closeModal()">✕</div>
    </div>

    <div class="bm-detail-head">
      ${posterHTML}
      <div class="bm-detail-info">
        <div class="bm-detail-title">${esc(m.title)}</div>
        ${d?.original_title && d.original_title !== m.title ? `<div class="bm-detail-orig">${esc(d.original_title)}</div>` : ''}
        <div class="bm-detail-stars">
          ${tmdbScore ? `<div class="bm-detail-score">★ ${tmdbScore}</div><div class="bm-detail-score-lbl">TMDB</div>` : ''}
          ${m.rating  ? `<div class="bm-detail-myrate">⭐ ${m.rating} من</div>` : ''}
        </div>
      </div>
    </div>

    <div class="bm-chips">
      ${runtime ? `<span class="bm-chip hl">⏱ ${runtime}</span>` : ''}
      ${country ? `<span class="bm-chip">🌍 ${esc(country)}</span>` : ''}
      ${d?.status ? `<span class="bm-chip">${esc(d.status)}</span>` : ''}
      ${d?.vote_count ? `<span class="bm-chip">👥 ${d.vote_count.toLocaleString()} رای</span>` : ''}
    </div>

    ${genres.length ? `
      <div class="bm-sec-lbl">// ژانر</div>
      <div class="bm-genres">
        ${genres.map(g => `<span class="bm-genre">${esc(g)}</span>`).join('')}
      </div>` : ''}

    ${d?.overview ? `
      <div class="bm-sec-lbl">// خلاصه</div>
      <div class="bm-overview">${esc(d.overview)}</div>` : ''}

    ${cast.length ? `
      <div class="bm-sec-lbl">// بازیگران</div>
      <div class="bm-cast">
        ${cast.map(c => `
          <div class="bm-cast-card">
            ${c.profile_path
              ? `<img class="bm-cast-img" src="https://image.tmdb.org/t/p/w185${c.profile_path}" loading="lazy">`
              : `<div class="bm-cast-ph">👤</div>`
            }
            <div class="bm-cast-name">${esc(c.name)}</div>
            <div class="bm-cast-char">${esc(c.character||'')}</div>
          </div>`).join('')}
      </div>` : ''}

    ${trailerURL ? `
      <div class="bm-sec-lbl">// تریلر</div>
      <a class="bm-trailer-btn" href="${trailerURL}" target="_blank" rel="noopener">
        <div class="bm-trailer-icon">▶</div>
        <span class="bm-trailer-lbl">// تماشای تریلر در YouTube</span>
      </a>` : ''}

    <div style="height:24px"></div>
  `;

  sheet.scrollTop = 0;
}

function BM_closeModal() {
  try { haptic(6); } catch(e) {}
  document.getElementById('bmModal')?.classList.remove('open');
}

/* ══════════ CONTROLS ══════════ */
function BM_setView(v)   { _bmView = v;   BM_render(); try{haptic(6);}catch(e){} }
function BM_setSort(s)   { _bmSort = s;   BM_render(); }
function BM_setFilter(f) { _bmFilter = f; BM_render(); try{haptic(6);}catch(e){} }
