// ============================================================================
// 🌍 WorldClock.js — ماژول ساعت جهانی Premium v2.0
// ============================================================================

/* ══════════ INJECT CSS ══════════ */
(function WC_injectCSS(){
  if(document.getElementById('wc-style')) return;
  const s = document.createElement('style');
  s.id = 'wc-style';
  s.textContent = `

/* ── GRID LAYOUT ── */
.wc-wrapper{display:flex;flex-direction:column;gap:12px;}
.wc-search-row{display:flex;gap:6px;margin-bottom:2px;}
.wc-search{flex:1;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:8px 12px;color:var(--text1);font-family:'JetBrains Mono',monospace;font-size:10px;outline:none;transition:border-color .2s,box-shadow .2s;}
.wc-search:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--glow2);}
.wc-search::placeholder{color:var(--text3);}
.wc-converter-btn{padding:8px 14px;background:var(--glow2);border:1px solid var(--accent);border-radius:10px;color:var(--accent);font-family:'JetBrains Mono',monospace;font-size:9px;cursor:pointer;white-space:nowrap;letter-spacing:1px;transition:all .2s;}
.wc-converter-btn:hover{background:var(--accent);color:var(--bg0);box-shadow:0 0 18px var(--glow);}

/* ── TIMELINE BAR ── */
.wc-timeline{position:relative;height:28px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:4px;}
.wc-tl-track{position:absolute;inset:0;display:flex;}
.wc-tl-seg{height:100%;transition:opacity .3s;}
.wc-tl-labels{position:absolute;inset:0;display:flex;align-items:center;pointer-events:none;}
.wc-tl-lbl{position:absolute;font-family:'JetBrains Mono',monospace;font-size:6px;color:rgba(255,255,255,.4);transform:translateX(-50%);white-space:nowrap;}
.wc-tl-cursor{position:absolute;top:0;bottom:0;width:1.5px;background:var(--accent);box-shadow:0 0 8px var(--glow);transition:left .5s linear;}
.wc-tl-cursor::after{content:'';position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--glow);}
.wc-tl-city-markers{position:absolute;bottom:0;left:0;right:0;height:4px;}
.wc-tl-city-dot{position:absolute;width:3px;height:3px;border-radius:50%;bottom:1px;transform:translateX(-50%);transition:left .3s;}

/* ── CARD GRID ── */
.clock-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}

/* ── CLOCK CARD ── */
.clock-card{
  border-radius:18px;padding:14px 12px 12px;
  background:linear-gradient(145deg,var(--card),var(--bg2));
  border:1px solid var(--card-b);
  position:relative;overflow:hidden;cursor:pointer;
  transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s,border-color .3s;
  display:flex;flex-direction:column;gap:6px;
}
.clock-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--grad1),var(--grad2),var(--grad3));background-size:200% 100%;animation:wcGrad 3s linear infinite;opacity:.65;}
@keyframes wcGrad{0%{background-position:0%}100%{background-position:200%}}
.clock-card::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 0%,var(--glow2),transparent 70%);pointer-events:none;opacity:0;transition:opacity .3s;}
.clock-card:hover::after{opacity:1;}
.clock-card:hover{
  transform:perspective(500px) rotateX(-4deg) rotateY(6deg) translateZ(14px);
  box-shadow:0 20px 50px rgba(0,0,0,.65),0 0 28px var(--glow2);
  border-color:var(--accent);
}
.clock-card:active{transform:scale(.95);}
.clock-card.is-home{border-color:var(--accent);box-shadow:0 0 22px var(--glow2);}
.clock-card.is-home .clock-time{color:var(--accent2);}
.clock-card.is-night{opacity:.85;}
.clock-card.wc-filtered-out{display:none;}

/* ── TOP ROW ── */
.wc-card-top{display:flex;align-items:center;justify-content:space-between;}
.clock-city{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;}
.wc-card-badge{font-family:'JetBrains Mono',monospace;font-size:6px;padding:1px 6px;border-radius:5px;border:1px solid var(--border);}
.wc-badge-day{color:#fbbf24;border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.08);}
.wc-badge-night{color:#818cf8;border-color:rgba(129,140,248,.3);background:rgba(129,140,248,.08);}
.wc-badge-home{color:var(--accent);border-color:var(--card-b);background:var(--glow2);}

/* ── ANALOG CLOCK ── */
.wc-analog-wrap{display:flex;justify-content:center;padding:2px 0;}
.wc-analog{position:relative;flex-shrink:0;}
.wc-svg-clock{overflow:visible;}

/* ── DIGITAL TIME ── */
.clock-time{
  font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;
  color:var(--accent);line-height:1;text-align:center;
  text-shadow:0 0 30px var(--glow);
  letter-spacing:2px;
}
.clock-time .wc-secs{font-size:16px;opacity:.6;font-weight:400;}

/* ── DATE / TZ ROW ── */
.wc-card-bottom{display:flex;align-items:center;justify-content:space-between;}
.clock-date{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text2);}
.wc-offset{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);}

/* ── DAY PROGRESS BAR ── */
.wc-day-bar{height:2px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:2px;}
.wc-day-fill{height:100%;border-radius:2px;transition:width .5s linear;}

/* ── HOME CARD GLOW PULSE ── */
@keyframes wcHomePulse{0%,100%{box-shadow:0 0 22px var(--glow2);}50%{box-shadow:0 0 36px var(--glow),0 0 14px var(--glow2);}}
.clock-card.is-home{animation:wcHomePulse 3s ease-in-out infinite;}

/* ══════════ CONVERTER MODAL ══════════ */
.wc-modal-bg{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:flex;align-items:flex-end;opacity:0;pointer-events:none;transition:opacity .25s;}
.wc-modal-bg.open{opacity:1;pointer-events:all;}
.wc-modal-sheet{width:100%;background:var(--glass);border:1px solid var(--glass-b);border-radius:22px 22px 0 0;padding:0 0 env(safe-area-inset-bottom,24px);max-height:88vh;overflow-y:auto;transform:translateY(100%);transition:transform .38s cubic-bezier(.34,1.56,.64,1);}
.wc-modal-sheet::-webkit-scrollbar{display:none;}
.wc-modal-bg.open .wc-modal-sheet{transform:translateY(0);}
.wc-modal-handle{width:32px;height:3px;background:var(--border2);border-radius:2px;margin:12px auto 0;}
.wc-modal-top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0;}
.wc-modal-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:900;color:var(--text1);}
.wc-modal-close{width:28px;height:28px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text2);font-size:12px;transition:all .2s;}
.wc-modal-close:hover{transform:rotate(90deg) scale(1.1);color:var(--accent);}

/* ── CONVERTER BODY ── */
.wc-conv-body{padding:14px 16px;}
.wc-conv-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.wc-conv-lbl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text3);letter-spacing:1px;width:60px;flex-shrink:0;}
.wc-time-input{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;padding:8px 12px;color:var(--text1);font-family:'JetBrains Mono',monospace;font-size:14px;outline:none;transition:border-color .2s;}
.wc-time-input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--glow2);}
.wc-tz-select{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;padding:8px 10px;color:var(--text1);font-family:'JetBrains Mono',monospace;font-size:10px;outline:none;cursor:pointer;}
.wc-tz-select option{background:var(--bg1);}
.wc-conv-result{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-top:4px;}
.wc-conv-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.wc-conv-city-result{background:var(--bg3);border:1px solid var(--card-b);border-radius:10px;padding:8px 10px;text-align:center;}
.wc-conv-city-name{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:1.5px;margin-bottom:3px;}
.wc-conv-city-time{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--accent);}
.wc-conv-city-date{font-size:7px;color:var(--text2);margin-top:2px;}

/* ── 24H MINI BARS ── */
.wc-24h-section{padding:0 16px 16px;}
.wc-24h-title{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.wc-24h-grid{display:flex;flex-direction:column;gap:5px;}
.wc-24h-row{display:flex;align-items:center;gap:8px;}
.wc-24h-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text2);width:56px;flex-shrink:0;text-align:right;}
.wc-24h-bar{flex:1;height:18px;background:rgba(255,255,255,.04);border-radius:6px;overflow:hidden;position:relative;border:1px solid var(--border);}
.wc-24h-night{position:absolute;top:0;bottom:0;background:rgba(129,140,248,.12);}
.wc-24h-day{position:absolute;top:0;bottom:0;background:rgba(251,191,36,.10);}
.wc-24h-now{position:absolute;top:0;bottom:0;width:2px;background:var(--accent);box-shadow:0 0 6px var(--glow);}
.wc-24h-time{position:absolute;top:50%;transform:translateY(-50%);font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;color:var(--text1);padding:0 5px;}

/* ── WORLD MAP DOTS ── */
.wc-map-section{padding:0 16px 14px;}
.wc-map-canvas{width:100%;height:80px;position:relative;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.wc-map-dot{position:absolute;border-radius:50%;transform:translate(-50%,-50%);transition:all .3s;}
.wc-map-label{position:absolute;font-family:'JetBrains Mono',monospace;font-size:5.5px;color:var(--text3);transform:translate(-50%,4px);white-space:nowrap;pointer-events:none;}

/* ── STAGGER ANIMATION ── */
@keyframes wcCardIn{from{opacity:0;transform:translateY(16px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}
.wc-card-anim{animation:wcCardIn .4s cubic-bezier(.22,1,.36,1) both;}

`;
  document.head.appendChild(s);
})();

/* ══════════ CITIES CONFIG ══════════ */
const WC_CITIES = [
  { city:'تهران',     tz:'Asia/Tehran',        flag:'🇮🇷', home:true,  lat:35.7,  lng:51.4  },
  { city:'دبی',       tz:'Asia/Dubai',          flag:'🇦🇪',              lat:25.2,  lng:55.3  },
  { city:'مسکو',      tz:'Europe/Moscow',       flag:'🇷🇺',              lat:55.8,  lng:37.6  },
  { city:'لندن',      tz:'Europe/London',       flag:'🇬🇧',              lat:51.5,  lng:-0.1  },
  { city:'نیویورک',   tz:'America/New_York',    flag:'🇺🇸',              lat:40.7,  lng:-74.0 },
  { city:'لس‌آنجلس', tz:'America/Los_Angeles',  flag:'🇺🇸',              lat:34.1,  lng:-118.2},
  { city:'توکیو',     tz:'Asia/Tokyo',          flag:'🇯🇵',              lat:35.7,  lng:139.7 },
  { city:'سیدنی',     tz:'Australia/Sydney',    flag:'🇦🇺',              lat:-33.9, lng:151.2 },
];

/* ══════════ STATE ══════════ */
let _wcInterval = null;
let _wcFilter   = '';

/* ══════════ ENTRY POINT ══════════ */
function loadWorldClock() {
  const page = document.getElementById('page-clock');
  if (!page) return;

  if (!document.getElementById('wc-root')) {
    page.querySelector('.pg-head').insertAdjacentHTML('afterend', WC_buildShell());
    WC_bindEvents();
    WC_injectModal();
    WC_buildMap();
  }

  WC_render();
  if (!_wcInterval) _wcInterval = setInterval(WC_render, 1000);
}

/* ══════════ HTML SHELL ══════════ */
function WC_buildShell() {
  const tzOptions = WC_CITIES.map(c =>
    `<option value="${c.tz}">${c.flag} ${c.city}</option>`
  ).join('');

  return `
<div id="wc-root" class="wc-wrapper">

  <!-- SEARCH + CONVERTER BUTTON -->
  <div class="wc-search-row">
    <input class="wc-search" id="wc-search-inp" placeholder="// جستجوی شهر..." oninput="WC_onSearch(this.value)">
    <button class="wc-converter-btn" onclick="WC_openConverter()">⇄ تبدیل زمان</button>
  </div>

  <!-- 24H TIMELINE BAR -->
  <div class="wc-timeline" id="wc-timeline">
    <div class="wc-tl-track" id="wc-tl-track"></div>
    <div class="wc-tl-labels" id="wc-tl-labels"></div>
    <div class="wc-tl-cursor" id="wc-tl-cursor"></div>
    <div class="wc-tl-city-markers" id="wc-tl-city-markers"></div>
  </div>

  <!-- CLOCK CARDS GRID -->
  <div class="clock-grid" id="clockGrid"></div>

  <!-- WORLD MAP DOTS -->
  <div class="wc-map-section">
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">// نقشه زمانی</div>
    <div class="wc-map-canvas" id="wc-map"></div>
  </div>

</div>`;
}

/* ══════════ CONVERTER MODAL INJECTION ══════════ */
function WC_injectModal() {
  if (document.getElementById('wc-modal')) return;
  const tzOpts = WC_CITIES.map(c =>
    `<option value="${c.tz}">${c.flag} ${c.city} (${c.tz})</option>`
  ).join('');

  const div = document.createElement('div');
  div.className = 'wc-modal-bg';
  div.id = 'wc-modal';
  div.innerHTML = `
<div class="wc-modal-sheet">
  <div class="wc-modal-handle"></div>
  <div class="wc-modal-top">
    <div class="wc-modal-title">⇄ مبدل زمان جهانی</div>
    <div class="wc-modal-close" onclick="WC_closeConverter()">✕</div>
  </div>

  <div class="wc-conv-body">
    <div class="wc-conv-row">
      <div class="wc-conv-lbl">// ساعت</div>
      <input class="wc-time-input" type="time" id="wc-conv-time" value="12:00" oninput="WC_calcConvert()">
    </div>
    <div class="wc-conv-row">
      <div class="wc-conv-lbl">// مبدا</div>
      <select class="wc-tz-select" id="wc-conv-from" onchange="WC_calcConvert()">${tzOpts}</select>
    </div>
    <div class="wc-conv-result">
      <div class="wc-conv-result-grid" id="wc-conv-out"></div>
    </div>
  </div>

  <!-- 24H BAR OVERVIEW -->
  <div class="wc-24h-section">
    <div class="wc-24h-title">// روز کاری همه شهرها</div>
    <div class="wc-24h-grid" id="wc-24h-grid"></div>
  </div>
</div>`;
  document.body.appendChild(div);
  div.addEventListener('click', e => { if(e.target === div) WC_closeConverter(); });
}

/* ══════════ MAP BUILD ══════════ */
function WC_buildMap() {
  const map = document.getElementById('wc-map');
  if (!map) return;
  WC_CITIES.forEach(c => {
    /* simple equirectangular projection onto 100%×100% */
    const x = ((c.lng + 180) / 360 * 100).toFixed(2);
    const y = ((90 - c.lat) / 180 * 100).toFixed(2);
    const dot = document.createElement('div');
    dot.className = 'wc-map-dot';
    dot.id = 'wc-map-dot-' + c.city;
    dot.style.cssText = `left:${x}%;top:${y}%;width:6px;height:6px;`;
    if (c.home) dot.style.outline = '2px solid var(--accent)';
    map.appendChild(dot);

    const lbl = document.createElement('div');
    lbl.className = 'wc-map-label';
    lbl.id = 'wc-map-lbl-' + c.city;
    lbl.style.cssText = `left:${x}%;top:${y}%;`;
    lbl.textContent = c.flag + ' ' + c.city;
    map.appendChild(lbl);
  });
}

/* ══════════ EVENTS ══════════ */
function WC_bindEvents() {
  // nothing extra needed — oninput/onclick are inline
}

function WC_onSearch(val) {
  _wcFilter = val.trim().toLowerCase();
  WC_render();
}

/* ══════════ RENDER ══════════ */
function WC_render() {
  const now = new Date();
  WC_renderCards(now);
  WC_renderTimeline(now);
  WC_renderMap(now);
  if (document.getElementById('wc-modal')?.classList.contains('open')) {
    WC_calcConvert();
    WC_render24h();
  }
}

/* ── CARDS ── */
function WC_renderCards(now) {
  const el = document.getElementById('clockGrid');
  if (!el) return;

  const cities = _wcFilter
    ? WC_CITIES.filter(c => c.city.includes(_wcFilter) || c.tz.toLowerCase().includes(_wcFilter))
    : WC_CITIES;

  el.innerHTML = cities.map((c, i) => {
    const time = now.toLocaleTimeString('fa-IR', {
      hour:'2-digit', minute:'2-digit', second:'2-digit',
      hour12:false, timeZone:c.tz
    });
    const [hh, mm, ss] = time.split(':');
    const date = now.toLocaleDateString('fa-IR', {
      weekday:'short', month:'short', day:'numeric',
      timeZone:c.tz
    });

    const isDay   = WC_isDaytime(now, c.tz);
    const offset  = WC_getOffset(now, c.tz);
    const dayPct  = WC_getDayPercent(now, c.tz);
    const fillClr = isDay
      ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
      : 'linear-gradient(90deg,#818cf8,#6366f1)';

    const badge = c.home
      ? `<span class="wc-card-badge wc-badge-home">🏠 خانه</span>`
      : isDay
        ? `<span class="wc-card-badge wc-badge-day">☀️ روز</span>`
        : `<span class="wc-card-badge wc-badge-night">🌙 شب</span>`;

    const analogSvg = WC_analogSVG(hh, mm, ss, isDay, c.home);

    return `
<div class="clock-card wc-card-anim${c.home ? ' is-home' : ''}${!isDay ? ' is-night' : ''}"
     style="animation-delay:${(i*0.07).toFixed(2)}s"
     onclick="WC_openDetail('${c.city}','${c.tz}','${c.flag}')">

  <div class="wc-card-top">
    <div class="clock-city">${c.flag} ${c.city}</div>
    ${badge}
  </div>

  <div class="wc-analog-wrap">${analogSvg}</div>

  <div class="clock-time">${hh}:${mm}<span class="wc-secs">:${ss}</span></div>

  <div class="wc-card-bottom">
    <div class="clock-date">${date}</div>
    <div class="wc-offset">${offset}</div>
  </div>

  <div class="wc-day-bar">
    <div class="wc-day-fill" style="width:${dayPct}%;background:${fillClr}"></div>
  </div>

</div>`;
  }).join('');
}

/* ── ANALOG SVG CLOCK ── */
function WC_analogSVG(hh, mm, ss, isDay, isHome) {
  const H = parseInt(hh) % 12;
  const M = parseInt(mm);
  const S = parseInt(ss);

  const secDeg  = S * 6;
  const minDeg  = M * 6 + S * 0.1;
  const hrDeg   = H * 30 + M * 0.5;

  const size = 72;
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;

  /* tick marks */
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0;
    const angle = i * 6 * Math.PI / 180;
    const outerR = r - 1;
    const innerR = isMajor ? outerR - 5 : outerR - 2.5;
    const x1 = cx + outerR * Math.sin(angle);
    const y1 = cy - outerR * Math.cos(angle);
    const x2 = cx + innerR * Math.sin(angle);
    const y2 = cy - innerR * Math.cos(angle);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isMajor ? 'var(--accent)' : 'var(--border2)'}" stroke-width="${isMajor ? 1.5 : .8}" stroke-linecap="round"/>`;
  }

  /* hand helper */
  const hand = (deg, len, w, color, shadow='') => {
    const rad = deg * Math.PI / 180;
    const x2 = cx + len * Math.sin(rad);
    const y2 = cy - len * Math.cos(rad);
    return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${color}" stroke-width="${w}" stroke-linecap="round"
      ${shadow ? `style="filter:drop-shadow(0 0 3px ${shadow})"` : ''}/>`;
  };

  /* day/night arc background */
  const arcColor = isDay ? 'rgba(251,191,36,.08)' : 'rgba(99,102,241,.1)';

  return `
<svg class="wc-svg-clock" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- face -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${arcColor}" stroke="var(--border)" stroke-width="1"/>
  ${isHome ? `<circle cx="${cx}" cy="${cy}" r="${r - .5}" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity=".4"/>` : ''}
  <!-- ticks -->
  ${ticks}
  <!-- hour hand -->
  ${hand(hrDeg, r * .5, 2.5, isHome ? 'var(--accent2)' : 'var(--text1)')}
  <!-- minute hand -->
  ${hand(minDeg, r * .72, 1.8, isHome ? 'var(--accent)' : 'var(--text2)', isHome ? 'var(--glow)' : '')}
  <!-- second hand -->
  ${hand(secDeg, r * .82, 1, '#ef4444', 'rgba(239,68,68,.4)')}
  <!-- center dot -->
  <circle cx="${cx}" cy="${cy}" r="3" fill="var(--accent)" stroke="var(--bg0)" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="1.5" fill="var(--bg0)"/>
</svg>`;
}

/* ── TIMELINE BAR ── */
function WC_renderTimeline(now) {
  const track    = document.getElementById('wc-tl-track');
  const labels   = document.getElementById('wc-tl-labels');
  const cursor   = document.getElementById('wc-tl-cursor');
  const dotCont  = document.getElementById('wc-tl-city-markers');
  if (!track) return;

  /* current UTC offset in minutes for home city (تهران) */
  const homeH = parseInt(now.toLocaleTimeString('en-US', {
    hour:'2-digit', hour12:false, timeZone:'Asia/Tehran'
  }));
  const homeM = parseInt(now.toLocaleTimeString('en-US', {
    minute:'2-digit', hour12:false, timeZone:'Asia/Tehran'
  }));
  const homeDecimal = homeH + homeM / 60; // 0-24
  const cursorPct   = (homeDecimal / 24 * 100).toFixed(2);

  /* draw day/night gradient segments (4px height used as sentinel) */
  const segs = [];
  for (let h = 0; h < 24; h++) {
    const isDayHour = h >= 6 && h < 20;
    segs.push(`<div class="wc-tl-seg" style="flex:1;background:${isDayHour ? 'rgba(251,191,36,.12)' : 'rgba(99,102,241,.12)'};"></div>`);
  }
  track.innerHTML = segs.join('');

  /* hour labels */
  const lblHtml = [0,6,12,18,23].map(h => {
    const pct = (h / 24 * 100).toFixed(1);
    return `<div class="wc-tl-lbl" style="left:${pct}%">${String(h).padStart(2,'0')}</div>`;
  }).join('');
  labels.innerHTML = lblHtml;

  cursor.style.left = cursorPct + '%';

  /* city dots on timeline */
  dotCont.innerHTML = WC_CITIES.map(c => {
    const h = parseInt(now.toLocaleTimeString('en-US', {hour:'2-digit',hour12:false,timeZone:c.tz}));
    const m = parseInt(now.toLocaleTimeString('en-US', {minute:'2-digit',timeZone:c.tz}));
    const dec = h + m / 60;
    const pct = (dec / 24 * 100).toFixed(1);
    const isDay = WC_isDaytime(now, c.tz);
    const col = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    return `<div class="wc-tl-city-dot" style="left:${pct}%;background:${col};${c.home ? 'width:5px;height:5px;box-shadow:0 0 6px var(--glow);' : ''}"></div>`;
  }).join('');
}

/* ── MAP DOT UPDATES ── */
function WC_renderMap(now) {
  WC_CITIES.forEach(c => {
    const dot = document.getElementById('wc-map-dot-' + c.city);
    if (!dot) return;
    const isDay = WC_isDaytime(now, c.tz);
    const col = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    const sz  = c.home ? '8px' : '5px';
    dot.style.background = col;
    dot.style.width  = sz;
    dot.style.height = sz;
    if (isDay) dot.style.boxShadow = `0 0 6px ${col}`;
    else        dot.style.boxShadow = '';
  });
}

/* ══════════ CONVERTER ══════════ */
function WC_openConverter() {
  try { haptic(8); } catch(e) {}
  const modal = document.getElementById('wc-modal');
  if (!modal) return;
  modal.classList.add('open');
  WC_render24h();
  WC_calcConvert();
}
function WC_closeConverter() {
  try { haptic(6); } catch(e) {}
  document.getElementById('wc-modal')?.classList.remove('open');
}

function WC_calcConvert() {
  const timeInp = document.getElementById('wc-conv-time');
  const fromSel = document.getElementById('wc-conv-from');
  const out     = document.getElementById('wc-conv-out');
  if (!timeInp || !fromSel || !out) return;

  const [hh, mm]  = timeInp.value.split(':').map(Number);
  const fromTZ    = fromSel.value;

  /* Build a date in the source timezone at the given time */
  const now  = new Date();
  const base = new Date(now);
  /* set hours/minutes in local context then adjust */
  const baseStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`;
  /* Use Intl trick: find UTC equivalent */
  const srcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: fromTZ,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit',
    hour12: false
  });
  /* We just treat the input time as-is in UTC for simplicity and offset each city */
  const utcBase = new Date(baseStr + 'Z');

  out.innerHTML = WC_CITIES.map(c => {
    const t = utcBase.toLocaleTimeString('fa-IR', {
      hour:'2-digit', minute:'2-digit', hour12:false, timeZone:c.tz
    });
    const d = utcBase.toLocaleDateString('fa-IR', {
      weekday:'short', month:'short', day:'numeric', timeZone:c.tz
    });
    const isDay = WC_isDaytime(utcBase, c.tz);
    const col   = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    return `<div class="wc-conv-city-result">
      <div class="wc-conv-city-name">${c.flag} ${c.city}</div>
      <div class="wc-conv-city-time" style="color:${col}">${t}</div>
      <div class="wc-conv-city-date">${d}</div>
    </div>`;
  }).join('');
}

/* ── 24H WORK HOUR BARS ── */
function WC_render24h() {
  const grid = document.getElementById('wc-24h-grid');
  if (!grid) return;
  const now = new Date();

  grid.innerHTML = WC_CITIES.map(c => {
    const h = parseInt(now.toLocaleTimeString('en-US', {hour:'2-digit',hour12:false,timeZone:c.tz}));
    const m = parseInt(now.toLocaleTimeString('en-US', {minute:'2-digit',timeZone:c.tz}));
    const dec = h + m / 60;
    const nowPct = (dec / 24 * 100).toFixed(1);
    /* day = 6-20, night = rest */
    const dayLeft  = (6 / 24 * 100).toFixed(1);
    const dayW     = ((20 - 6) / 24 * 100).toFixed(1);
    const timeTxt  = now.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:c.tz});
    const isDay    = WC_isDaytime(now, c.tz);
    const dotClr   = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    /* position text to avoid overflow */
    const txtLeft  = Math.min(parseFloat(nowPct), 80);
    return `
<div class="wc-24h-row">
  <div class="wc-24h-lbl">${c.flag} ${c.city}</div>
  <div class="wc-24h-bar">
    <div class="wc-24h-night" style="left:0;right:0;"></div>
    <div class="wc-24h-day"   style="left:${dayLeft}%;width:${dayW}%;"></div>
    <div class="wc-24h-now"   style="left:${nowPct}%;background:${dotClr};box-shadow:0 0 6px ${dotClr};"></div>
    <span class="wc-24h-time" style="left:${txtLeft}%">${timeTxt}</span>
  </div>
</div>`;
  }).join('');
}

/* ══════════ HELPERS ══════════ */
function WC_isDaytime(date, tz) {
  const h = parseInt(date.toLocaleTimeString('en-US', {hour:'2-digit', hour12:false, timeZone:tz}));
  return h >= 6 && h < 20;
}

function WC_getOffset(date, tz) {
  /* compute UTC offset string like UTC+3:30 */
  try {
    const utc = new Date(date.toLocaleString('en-US', {timeZone:'UTC'}));
    const loc = new Date(date.toLocaleString('en-US', {timeZone:tz}));
    const diffMin = (loc - utc) / 60000;
    const sign    = diffMin >= 0 ? '+' : '-';
    const absDiff = Math.abs(diffMin);
    const oH      = Math.floor(absDiff / 60);
    const oM      = absDiff % 60;
    return `UTC${sign}${oH}${oM ? ':' + String(oM).padStart(2,'0') : ''}`;
  } catch(e) { return ''; }
}

function WC_getDayPercent(date, tz) {
  const h = parseInt(date.toLocaleTimeString('en-US', {hour:'2-digit', hour12:false, timeZone:tz}));
  const m = parseInt(date.toLocaleTimeString('en-US', {minute:'2-digit', timeZone:tz}));
  return Math.round((h * 60 + m) / (24 * 60) * 100);
}

/* ══════════ DETAIL CLICK ══════════ */
function WC_openDetail(city, tz, flag) {
  try { haptic(8); } catch(e) {}
  const now = new Date();
  const time = now.toLocaleTimeString('fa-IR', {
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false, timeZone:tz
  });
  const offset = WC_getOffset(now, tz);
  try { showToast(`${flag} ${city}  ${time}  (${offset})`); } catch(e) {}
}

/* ══════════ ADD / REMOVE CITY ══════════ */
function WC_addCity(city, tz, flag, lat=0, lng=0) {
  WC_CITIES.push({ city, tz, flag, lat, lng });
  WC_render();
  WC_buildMap();
}
function WC_removeCity(city) {
  const idx = WC_CITIES.findIndex(c => c.city === city);
  if (idx > -1) { WC_CITIES.splice(idx, 1); WC_render(); }
}

/* ══════════ STOP / CLEANUP ══════════ */
function WC_stop() {
  if (_wcInterval) { clearInterval(_wcInterval); _wcInterval = null; }
}
