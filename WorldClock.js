// ============================================================================
// 🌍 WorldClock.js — Premium v3.0  (no-flicker, DOM-diff)
// ============================================================================

/* ══════════ INJECT CSS ══════════ */
(function WC_injectCSS(){
  if(document.getElementById('wc-style')) return;
  const s = document.createElement('style');
  s.id = 'wc-style';
  s.textContent = `

/* ── WRAPPER ── */
.wc-wrapper{display:flex;flex-direction:column;gap:12px;}
.wc-search-row{display:flex;gap:6px;margin-bottom:2px;}
.wc-search{
  flex:1;background:rgba(255,255,255,0.04);border:1px solid var(--border);
  border-radius:10px;padding:8px 12px;color:var(--text1);
  font-family:'JetBrains Mono',monospace;font-size:10px;outline:none;
  transition:border-color .2s,box-shadow .2s;
}
.wc-search:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--glow2);}
.wc-search::placeholder{color:var(--text3);}
.wc-converter-btn{
  padding:8px 14px;background:var(--glow2);border:1px solid var(--accent);
  border-radius:10px;color:var(--accent);font-family:'JetBrains Mono',monospace;
  font-size:9px;cursor:pointer;white-space:nowrap;letter-spacing:1px;transition:all .2s;
}
.wc-converter-btn:hover{background:var(--accent);color:var(--bg0);box-shadow:0 0 18px var(--glow);}

/* ── ALARM BUTTON ── */
.wc-alarm-btn{
  padding:8px 12px;background:var(--surface);border:1px solid var(--border);
  border-radius:10px;color:var(--text2);font-family:'JetBrains Mono',monospace;
  font-size:9px;cursor:pointer;white-space:nowrap;letter-spacing:1px;transition:all .2s;
}
.wc-alarm-btn:hover{background:var(--surface2);color:var(--accent);}
.wc-alarm-btn.active{background:rgba(239,68,68,.15);border-color:#ef4444;color:#ef4444;}

/* ── TIMELINE BAR ── */
.wc-timeline{
  position:relative;height:28px;background:rgba(255,255,255,0.03);
  border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:4px;
}
.wc-tl-track{position:absolute;inset:0;display:flex;}
.wc-tl-seg{height:100%;}
.wc-tl-labels{position:absolute;inset:0;display:flex;align-items:center;pointer-events:none;}
.wc-tl-lbl{
  position:absolute;font-family:'JetBrains Mono',monospace;font-size:6px;
  color:rgba(255,255,255,.4);transform:translateX(-50%);white-space:nowrap;
}
.wc-tl-cursor{
  position:absolute;top:0;bottom:0;width:1.5px;background:var(--accent);
  box-shadow:0 0 8px var(--glow);transition:left .5s linear;
}
.wc-tl-cursor::after{
  content:'';position:absolute;top:-3px;left:50%;transform:translateX(-50%);
  width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--glow);
}
.wc-tl-city-markers{position:absolute;bottom:0;left:0;right:0;height:4px;}
.wc-tl-city-dot{
  position:absolute;width:3px;height:3px;border-radius:50%;bottom:1px;
  transform:translateX(-50%);transition:left .3s;
}

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
.clock-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--grad1),var(--grad2),var(--grad3));
  background-size:200% 100%;animation:wcGrad 3s linear infinite;opacity:.65;
}
@keyframes wcGrad{0%{background-position:0%}100%{background-position:200%}}
.clock-card::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 70% 50% at 50% 0%,var(--glow2),transparent 70%);
  pointer-events:none;opacity:0;transition:opacity .3s;
}
.clock-card:hover::after{opacity:1;}
.clock-card:hover{
  transform:perspective(500px) rotateX(-4deg) rotateY(6deg) translateZ(14px);
  box-shadow:0 20px 50px rgba(0,0,0,.65),0 0 28px var(--glow2);
  border-color:var(--accent);
}
.clock-card:active{transform:scale(.95);}
.clock-card.is-home{border-color:var(--accent);animation:wcHomePulse 3s ease-in-out infinite;}
.clock-card.is-night{opacity:.85;}
@keyframes wcHomePulse{
  0%,100%{box-shadow:0 0 22px var(--glow2);}
  50%{box-shadow:0 0 36px var(--glow),0 0 14px var(--glow2);}
}

/* ── TOP ROW ── */
.wc-card-top{display:flex;align-items:center;justify-content:space-between;}
.clock-city{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;}
.wc-card-badge{font-family:'JetBrains Mono',monospace;font-size:6px;padding:1px 6px;border-radius:5px;border:1px solid var(--border);}
.wc-badge-day{color:#fbbf24;border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.08);}
.wc-badge-night{color:#818cf8;border-color:rgba(129,140,248,.3);background:rgba(129,140,248,.08);}
.wc-badge-home{color:var(--accent);border-color:var(--card-b);background:var(--glow2);}

/* ── ANALOG CLOCK ── */
.wc-analog-wrap{display:flex;justify-content:center;padding:2px 0;}
.wc-svg-clock{overflow:visible;}

/* ── DIGITAL TIME ── */
.clock-time{
  font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;
  color:var(--accent);line-height:1;text-align:center;
  text-shadow:0 0 30px var(--glow);letter-spacing:2px;
}
.clock-time .wc-secs{font-size:16px;opacity:.6;font-weight:400;}

/* ── BOTTOM ROW ── */
.wc-card-bottom{display:flex;align-items:center;justify-content:space-between;}
.clock-date{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text2);}
.wc-offset{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);}

/* ── DAY PROGRESS BAR ── */
.wc-day-bar{height:2px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:2px;}
.wc-day-fill{height:100%;border-radius:2px;transition:width .5s linear;}

/* ── STOPWATCH SECTION ── */
.wc-sw-wrap{
  background:var(--card);border:1px solid var(--card-b);border-radius:16px;
  padding:14px;display:flex;flex-direction:column;gap:10px;
}
.wc-sw-title{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;}
.wc-sw-display{
  font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;
  color:var(--accent);text-align:center;letter-spacing:3px;
  text-shadow:0 0 20px var(--glow);
}
.wc-sw-display .wc-sw-ms{font-size:18px;opacity:.5;}
.wc-sw-btns{display:flex;gap:7px;}
.wc-sw-btn{
  flex:1;padding:10px;border-radius:12px;
  background:var(--surface2);border:1px solid var(--border2);
  color:var(--text1);font-family:'JetBrains Mono',monospace;font-size:9px;
  letter-spacing:1.5px;cursor:pointer;transition:all .2s;
}
.wc-sw-btn:hover{background:var(--accent);color:var(--bg0);border-color:var(--accent);}
.wc-sw-btn:active{transform:scale(.94);}
.wc-sw-btn.danger{color:#ef4444;border-color:rgba(239,68,68,.3);}
.wc-sw-btn.danger:hover{background:#ef4444;color:#fff;}
.wc-sw-laps{max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;}
.wc-sw-laps::-webkit-scrollbar{display:none;}
.wc-sw-lap{
  display:flex;justify-content:space-between;align-items:center;
  padding:4px 8px;border-radius:7px;background:var(--bg2);
  font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text2);
  border:1px solid var(--border);
}
.wc-sw-lap-num{color:var(--accent);font-size:7px;}

/* ── ALARM ── */
.wc-alarm-wrap{
  background:var(--card);border:1px solid var(--card-b);border-radius:16px;
  padding:14px;display:flex;flex-direction:column;gap:10px;
}
.wc-alarm-row{display:flex;align-items:center;gap:8px;}
.wc-alarm-inp{
  flex:1;background:var(--surface);border:1px solid var(--border);border-radius:10px;
  padding:8px 12px;color:var(--text1);font-family:'JetBrains Mono',monospace;
  font-size:13px;outline:none;transition:border-color .2s;
}
.wc-alarm-inp:focus{border-color:var(--accent);}
.wc-alarm-set-btn{
  padding:8px 14px;background:var(--accent);border:none;border-radius:10px;
  color:var(--bg0);font-family:'JetBrains Mono',monospace;font-size:9px;
  letter-spacing:1px;cursor:pointer;transition:all .2s;
}
.wc-alarm-set-btn:hover{opacity:.85;}
.wc-alarm-active{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
  border-radius:10px;
}
.wc-alarm-active-time{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:#ef4444;}
.wc-alarm-cancel{
  padding:4px 10px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);
  border-radius:7px;color:#ef4444;font-family:'JetBrains Mono',monospace;
  font-size:7.5px;cursor:pointer;transition:all .2s;
}
.wc-alarm-cancel:hover{background:#ef4444;color:#fff;}
@keyframes wcAlarmRing{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
.wc-alarm-ringing{animation:wcAlarmRing .4s ease-in-out infinite;}

/* ── TABS ── */
.wc-tabs{display:flex;gap:5px;overflow-x:auto;padding-bottom:1px;}
.wc-tabs::-webkit-scrollbar{display:none;}
.wc-tab{
  padding:5px 12px;border-radius:999px;background:var(--card);
  border:1px solid var(--border);font-size:8px;color:var(--text2);
  white-space:nowrap;cursor:pointer;transition:all .2s;
  font-family:'JetBrains Mono',monospace;flex-shrink:0;
}
.wc-tab.active{background:var(--accent);border-color:var(--accent);color:var(--bg0);}

/* ── MAP ── */
.wc-map-canvas{
  width:100%;height:80px;position:relative;
  background:rgba(255,255,255,.02);border:1px solid var(--border);
  border-radius:10px;overflow:hidden;
}
.wc-map-dot{position:absolute;border-radius:50%;transform:translate(-50%,-50%);transition:all .3s;}
.wc-map-label{
  position:absolute;font-family:'JetBrains Mono',monospace;font-size:5.5px;
  color:var(--text3);transform:translate(-50%,4px);white-space:nowrap;pointer-events:none;
}

/* ── 24H BARS ── */
.wc-24h-grid{display:flex;flex-direction:column;gap:5px;}
.wc-24h-row{display:flex;align-items:center;gap:8px;}
.wc-24h-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text2);width:56px;flex-shrink:0;text-align:right;}
.wc-24h-bar{flex:1;height:18px;background:rgba(255,255,255,.04);border-radius:6px;overflow:hidden;position:relative;border:1px solid var(--border);}
.wc-24h-night{position:absolute;top:0;bottom:0;background:rgba(129,140,248,.12);}
.wc-24h-day{position:absolute;top:0;bottom:0;background:rgba(251,191,36,.10);}
.wc-24h-now{position:absolute;top:0;bottom:0;width:2px;background:var(--accent);box-shadow:0 0 6px var(--glow);}
.wc-24h-time{position:absolute;top:50%;transform:translateY(-50%);font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;color:var(--text1);padding:0 5px;}

/* ── SECTION LABEL ── */
.wc-sec-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;}

/* ── CONVERTER MODAL ── */
.wc-modal-bg{
  position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.88);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  display:flex;align-items:flex-end;opacity:0;pointer-events:none;transition:opacity .25s;
}
.wc-modal-bg.open{opacity:1;pointer-events:all;}
.wc-modal-sheet{
  width:100%;background:var(--glass);border:1px solid var(--glass-b);
  border-radius:22px 22px 0 0;padding:0 0 env(safe-area-inset-bottom,24px);
  max-height:88vh;overflow-y:auto;
  transform:translateY(100%);transition:transform .38s cubic-bezier(.34,1.56,.64,1);
}
.wc-modal-sheet::-webkit-scrollbar{display:none;}
.wc-modal-bg.open .wc-modal-sheet{transform:translateY(0);}
.wc-modal-handle{width:32px;height:3px;background:var(--border2);border-radius:2px;margin:12px auto 0;}
.wc-modal-top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0;}
.wc-modal-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:900;color:var(--text1);}
.wc-modal-close{
  width:28px;height:28px;border-radius:50%;background:var(--surface2);
  border:1px solid var(--border);display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--text2);font-size:12px;transition:all .2s;
}
.wc-modal-close:hover{transform:rotate(90deg) scale(1.1);color:var(--accent);}
.wc-conv-body{padding:14px 16px;}
.wc-conv-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.wc-conv-lbl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text3);letter-spacing:1px;width:60px;flex-shrink:0;}
.wc-time-input{
  flex:1;background:rgba(255,255,255,.04);border:1px solid var(--border);
  border-radius:10px;padding:8px 12px;color:var(--text1);
  font-family:'JetBrains Mono',monospace;font-size:14px;outline:none;transition:border-color .2s;
}
.wc-time-input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--glow2);}
.wc-tz-select{
  flex:1;background:rgba(255,255,255,.04);border:1px solid var(--border);
  border-radius:10px;padding:8px 10px;color:var(--text1);
  font-family:'JetBrains Mono',monospace;font-size:10px;outline:none;cursor:pointer;
}
.wc-tz-select option{background:var(--bg1);}
.wc-conv-result{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-top:4px;}
.wc-conv-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.wc-conv-city-result{background:var(--bg3);border:1px solid var(--card-b);border-radius:10px;padding:8px 10px;text-align:center;}
.wc-conv-city-name{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:1.5px;margin-bottom:3px;}
.wc-conv-city-time{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--accent);}
.wc-conv-city-date{font-size:7px;color:var(--text2);margin-top:2px;}
.wc-24h-section{padding:0 16px 16px;}

/* ── CARD ENTRY ANIMATION (one-time) ── */
@keyframes wcCardIn{from{opacity:0;transform:translateY(16px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}
.wc-card-anim{animation:wcCardIn .4s cubic-bezier(.22,1,.36,1) both;}
`;
  document.head.appendChild(s);
})();

/* ══════════ CITIES ══════════ */
const WC_CITIES = [
  { city:'تهران',     tz:'Asia/Tehran',          flag:'🇮🇷', home:true,  lat:35.7,  lng:51.4  },
  { city:'دبی',       tz:'Asia/Dubai',            flag:'🇦🇪',             lat:25.2,  lng:55.3  },
  { city:'مسکو',      tz:'Europe/Moscow',         flag:'🇷🇺',             lat:55.8,  lng:37.6  },
  { city:'لندن',      tz:'Europe/London',         flag:'🇬🇧',             lat:51.5,  lng:-0.1  },
  { city:'نیویورک',   tz:'America/New_York',      flag:'🇺🇸',             lat:40.7,  lng:-74.0 },
  { city:'لس‌آنجلس', tz:'America/Los_Angeles',   flag:'🇺🇸',             lat:34.1,  lng:-118.2},
  { city:'توکیو',     tz:'Asia/Tokyo',            flag:'🇯🇵',             lat:35.7,  lng:139.7 },
  { city:'سیدنی',     tz:'Australia/Sydney',      flag:'🇦🇺',             lat:-33.9, lng:151.2 },
];

/* ══════════ STATE ══════════ */
let _wcInterval   = null;
let _wcFilter     = '';
let _wcActiveTab  = 'clocks'; // clocks | stopwatch | alarm | converter

// Stopwatch state
let _swRunning    = false;
let _swStart      = 0;
let _swElapsed    = 0;
let _swTick       = null;
let _swLaps       = [];

// Alarm state
let _alarmTime    = null;  // "HH:MM" string
let _alarmFired   = false;
let _alarmAudio   = null;

/* ══════════ ENTRY POINT ══════════ */
function loadWorldClock() {
  const page = document.getElementById('page-clock');
  if (!page) return;

  if (!document.getElementById('wc-root')) {
    page.querySelector('.pg-head').insertAdjacentHTML('afterend', WC_buildShell());
    WC_injectModal();
    WC_buildMap();
    WC_buildCards();          // one-time card scaffolding
    WC_buildTimeline();       // one-time timeline structure
    WC_build24hBars();
  }

  // Start tick — only updates changing parts, no innerHTML recreation
  WC_tick();
  if (!_wcInterval) _wcInterval = setInterval(WC_tick, 1000);
}

/* ══════════ SHELL ══════════ */
function WC_buildShell() {
  return `
<div id="wc-root" class="wc-wrapper">

  <!-- TABS -->
  <div class="wc-tabs">
    <div class="wc-tab active" data-tab="clocks"    onclick="WC_switchTab('clocks')">🕐 ساعت‌ها</div>
    <div class="wc-tab"        data-tab="stopwatch" onclick="WC_switchTab('stopwatch')">⏱ کرونومتر</div>
    <div class="wc-tab"        data-tab="alarm"     onclick="WC_switchTab('alarm')">⏰ آلارم</div>
    <div class="wc-tab"        data-tab="converter" onclick="WC_switchTab('converter')">⇄ تبدیل</div>
  </div>

  <!-- CLOCKS PANEL -->
  <div id="wc-panel-clocks">
    <div class="wc-search-row">
      <input class="wc-search" id="wc-search-inp" placeholder="// جستجوی شهر..." oninput="WC_onSearch(this.value)">
    </div>

    <!-- 24H TIMELINE -->
    <div class="wc-timeline" id="wc-timeline">
      <div class="wc-tl-track"         id="wc-tl-track"></div>
      <div class="wc-tl-labels"        id="wc-tl-labels"></div>
      <div class="wc-tl-cursor"        id="wc-tl-cursor"></div>
      <div class="wc-tl-city-markers"  id="wc-tl-city-markers"></div>
    </div>

    <!-- CARD GRID -->
    <div class="clock-grid" id="clockGrid"></div>

    <!-- WORLD MAP -->
    <div>
      <div class="wc-sec-lbl" style="margin-top:8px">// نقشه زمانی</div>
      <div class="wc-map-canvas" id="wc-map"></div>
    </div>

    <!-- 24H BARS -->
    <div>
      <div class="wc-sec-lbl" style="margin-top:8px">// بازه روز کاری</div>
      <div class="wc-24h-grid" id="wc-24h-grid-main"></div>
    </div>
  </div>

  <!-- STOPWATCH PANEL -->
  <div id="wc-panel-stopwatch" style="display:none">
    <div class="wc-sw-wrap">
      <div class="wc-sw-title">// STOPWATCH</div>
      <div class="wc-sw-display" id="wc-sw-display">00:00<span class="wc-sw-ms">.00</span></div>
      <div class="wc-sw-btns">
        <button class="wc-sw-btn" id="wc-sw-start" onclick="WC_swToggle()">▶ START</button>
        <button class="wc-sw-btn" onclick="WC_swLap()">⊙ LAP</button>
        <button class="wc-sw-btn danger" onclick="WC_swReset()">↺ RESET</button>
      </div>
      <div class="wc-sw-laps" id="wc-sw-laps"></div>
    </div>
  </div>

  <!-- ALARM PANEL -->
  <div id="wc-panel-alarm" style="display:none">
    <div class="wc-alarm-wrap">
      <div class="wc-sw-title">// ALARM</div>
      <div class="wc-alarm-row">
        <input class="wc-alarm-inp" type="time" id="wc-alarm-time">
        <button class="wc-alarm-set-btn" onclick="WC_setAlarm()">SET ▶</button>
      </div>
      <div id="wc-alarm-status"></div>
    </div>
  </div>

  <!-- CONVERTER PANEL (inline, no modal) -->
  <div id="wc-panel-converter" style="display:none">
    <div class="wc-alarm-wrap">
      <div class="wc-sw-title">// TIME CONVERTER</div>
      <div class="wc-conv-body" style="padding:0">
        <div class="wc-conv-row">
          <div class="wc-conv-lbl">// ساعت</div>
          <input class="wc-time-input" type="time" id="wc-conv-time2" value="12:00" oninput="WC_calcConvert2()">
        </div>
        <div class="wc-conv-row">
          <div class="wc-conv-lbl">// مبدا</div>
          <select class="wc-tz-select" id="wc-conv-from2" onchange="WC_calcConvert2()">
            ${WC_CITIES.map(c=>`<option value="${c.tz}">${c.flag} ${c.city}</option>`).join('')}
          </select>
        </div>
        <div class="wc-conv-result" style="margin-top:8px">
          <div class="wc-conv-result-grid" id="wc-conv-out2"></div>
        </div>
      </div>
    </div>
    <!-- 24H BARS in converter -->
    <div class="wc-alarm-wrap" style="margin-top:8px">
      <div class="wc-sw-title">// روز کاری شهرها</div>
      <div class="wc-24h-grid" id="wc-24h-grid-conv"></div>
    </div>
  </div>

</div>`;
}

/* ══════════ TAB SWITCHING ══════════ */
function WC_switchTab(tab) {
  try { haptic(8); } catch(e) {}
  _wcActiveTab = tab;
  ['clocks','stopwatch','alarm','converter'].forEach(t => {
    const panel = document.getElementById('wc-panel-'+t);
    const btn   = document.querySelector(`.wc-tab[data-tab="${t}"]`);
    if (panel) panel.style.display = t === tab ? '' : 'none';
    if (btn)   btn.classList.toggle('active', t === tab);
  });
  if (tab === 'converter') { WC_calcConvert2(); WC_build24hBarsConv(); }
}

/* ══════════ ONE-TIME CARD BUILD ══════════ */
function WC_buildCards() {
  const grid = document.getElementById('clockGrid');
  if (!grid) return;
  grid.innerHTML = WC_CITIES.map((c, i) => `
<div class="clock-card wc-card-anim${c.home ? ' is-home' : ''}"
     id="wc-card-${i}"
     style="animation-delay:${(i*0.07).toFixed(2)}s"
     onclick="WC_openDetail('${c.city}','${c.tz}','${c.flag}')">

  <div class="wc-card-top">
    <div class="clock-city">${c.flag} <span id="wc-cc-city-${i}">${c.city}</span></div>
    <div id="wc-cc-badge-${i}" class="wc-card-badge ${c.home ? 'wc-badge-home' : 'wc-badge-day'}">
      ${c.home ? '🏠 خانه' : '☀️ روز'}
    </div>
  </div>

  <div class="wc-analog-wrap" id="wc-cc-svg-${i}">
    ${WC_analogSVG(0, 0, 0, true, c.home)}
  </div>

  <div class="clock-time" id="wc-cc-time-${i}">
    00:00<span class="wc-secs">:00</span>
  </div>

  <div class="wc-card-bottom">
    <div class="clock-date" id="wc-cc-date-${i}">—</div>
    <div class="wc-offset"  id="wc-cc-offset-${i}"></div>
  </div>

  <div class="wc-day-bar">
    <div class="wc-day-fill" id="wc-cc-bar-${i}" style="width:0%"></div>
  </div>

</div>`).join('');
}

/* ══════════ ONE-TIME TIMELINE BUILD ══════════ */
function WC_buildTimeline() {
  const track  = document.getElementById('wc-tl-track');
  const labels = document.getElementById('wc-tl-labels');
  const dots   = document.getElementById('wc-tl-city-markers');
  if (!track) return;

  // static segments
  track.innerHTML = Array.from({length:24}, (_,h) =>
    `<div class="wc-tl-seg" style="flex:1;background:${h>=6&&h<20?'rgba(251,191,36,.12)':'rgba(99,102,241,.12)'}"></div>`
  ).join('');

  // static hour labels
  labels.innerHTML = [0,6,12,18,23].map(h =>
    `<div class="wc-tl-lbl" style="left:${(h/24*100).toFixed(1)}%">${String(h).padStart(2,'0')}</div>`
  ).join('');

  // city dot placeholders
  dots.innerHTML = WC_CITIES.map((c,i) =>
    `<div class="wc-tl-city-dot" id="wc-tl-dot-${i}" style="left:0%;background:var(--border2)"></div>`
  ).join('');
}

/* ══════════ ONE-TIME 24H BARS (main) ══════════ */
function WC_build24hBars() {
  const grid = document.getElementById('wc-24h-grid-main');
  if (!grid) return;
  const dayLeft = (6/24*100).toFixed(1);
  const dayW    = ((20-6)/24*100).toFixed(1);
  grid.innerHTML = WC_CITIES.map((c,i) => `
<div class="wc-24h-row">
  <div class="wc-24h-lbl">${c.flag} ${c.city}</div>
  <div class="wc-24h-bar">
    <div class="wc-24h-night" style="left:0;right:0"></div>
    <div class="wc-24h-day"   style="left:${dayLeft}%;width:${dayW}%"></div>
    <div class="wc-24h-now"   id="wc-24h-now-${i}" style="left:0%"></div>
    <span class="wc-24h-time" id="wc-24h-time-${i}">—</span>
  </div>
</div>`).join('');
}

/* ══════════ 24H BARS — CONVERTER PANEL ══════════ */
function WC_build24hBarsConv() {
  const grid = document.getElementById('wc-24h-grid-conv');
  if (!grid || grid.dataset.built) return;
  grid.dataset.built = '1';
  const dayLeft = (6/24*100).toFixed(1);
  const dayW    = ((20-6)/24*100).toFixed(1);
  grid.innerHTML = WC_CITIES.map((c,i) => `
<div class="wc-24h-row">
  <div class="wc-24h-lbl">${c.flag} ${c.city}</div>
  <div class="wc-24h-bar">
    <div class="wc-24h-night" style="left:0;right:0"></div>
    <div class="wc-24h-day"   style="left:${dayLeft}%;width:${dayW}%"></div>
    <div class="wc-24h-now"   id="wc-24hc-now-${i}" style="left:0%"></div>
    <span class="wc-24h-time" id="wc-24hc-time-${i}">—</span>
  </div>
</div>`).join('');
  WC_update24hBarsConv(new Date());
}

/* ══════════ MAP BUILD ══════════ */
function WC_buildMap() {
  const map = document.getElementById('wc-map');
  if (!map) return;
  WC_CITIES.forEach((c,i) => {
    const x = ((c.lng + 180) / 360 * 100).toFixed(2);
    const y = ((90 - c.lat) / 180 * 100).toFixed(2);
    const dot = document.createElement('div');
    dot.className = 'wc-map-dot';
    dot.id = 'wc-map-dot-'+i;
    dot.style.cssText = `left:${x}%;top:${y}%;width:6px;height:6px;`;
    if (c.home) dot.style.outline = '2px solid var(--accent)';
    map.appendChild(dot);
    const lbl = document.createElement('div');
    lbl.className = 'wc-map-label';
    lbl.style.cssText = `left:${x}%;top:${y}%;`;
    lbl.textContent = c.flag+' '+c.city;
    map.appendChild(lbl);
  });
}

/* ══════════ MAIN TICK — only patches DOM ══════════ */
function WC_tick() {
  const now = new Date();
  if (_wcActiveTab === 'clocks') {
    WC_updateCards(now);
    WC_updateTimeline(now);
    WC_updateMap(now);
    WC_update24hBars(now);
  }
  WC_checkAlarm(now);
}

/* ══════════ UPDATE CARDS (patch only) ══════════ */
function WC_updateCards(now) {
  const q = _wcFilter.toLowerCase();
  WC_CITIES.forEach((c, i) => {
    const card = document.getElementById('wc-card-'+i);
    if (!card) return;
    const visible = !q || c.city.includes(q) || c.tz.toLowerCase().includes(q);
    card.style.display = visible ? '' : 'none';
    if (!visible) return;

    const isDay  = WC_isDaytime(now, c.tz);
    const [hh,mm,ss] = WC_getTimeParts(now, c.tz);

    // time
    const timeEl = document.getElementById('wc-cc-time-'+i);
    if (timeEl) timeEl.innerHTML = `${hh}:${mm}<span class="wc-secs">:${ss}</span>`;

    // date (changes at most once a minute — guard it)
    const dateEl = document.getElementById('wc-cc-date-'+i);
    if (dateEl) {
      const dateStr = now.toLocaleDateString('fa-IR', {weekday:'short',month:'short',day:'numeric',timeZone:c.tz});
      if (dateEl.textContent !== dateStr) dateEl.textContent = dateStr;
    }

    // offset (static, but set once)
    const offEl = document.getElementById('wc-cc-offset-'+i);
    if (offEl && !offEl.dataset.set) { offEl.textContent = WC_getOffset(now, c.tz); offEl.dataset.set='1'; }

    // badge
    const badgeEl = document.getElementById('wc-cc-badge-'+i);
    if (badgeEl && !c.home) {
      const newClass = 'wc-card-badge ' + (isDay ? 'wc-badge-day' : 'wc-badge-night');
      const newTxt   = isDay ? '☀️ روز' : '🌙 شب';
      if (badgeEl.className !== newClass) badgeEl.className = newClass;
      if (badgeEl.textContent !== newTxt) badgeEl.textContent = newTxt;
    }

    // day/night class on card
    if (!c.home) {
      card.classList.toggle('is-night', !isDay);
    }

    // day progress bar
    const barEl = document.getElementById('wc-cc-bar-'+i);
    if (barEl) {
      const pct = WC_getDayPercent(now, c.tz);
      const fill = isDay
        ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
        : 'linear-gradient(90deg,#818cf8,#6366f1)';
      barEl.style.width = pct + '%';
      if (barEl.dataset.fill !== fill) { barEl.style.background = fill; barEl.dataset.fill = fill; }
    }

    // analog clock hands — patch SVG hand transforms directly
    WC_updateAnalogHands(i, parseInt(hh), parseInt(mm), parseInt(ss));
  });
}

/* ══════════ ANALOG SVG — initial render ══════════ */
function WC_analogSVG(H, M, S, isDay, isHome) {
  const size = 72, cx = size/2, cy = size/2, r = size/2 - 2;
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0;
    const angle  = i * 6 * Math.PI / 180;
    const outerR = r - 1, innerR = isMajor ? outerR-5 : outerR-2.5;
    const x1 = cx + outerR * Math.sin(angle), y1 = cy - outerR * Math.cos(angle);
    const x2 = cx + innerR * Math.sin(angle), y2 = cy - innerR * Math.cos(angle);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isMajor ? 'var(--accent)' : 'var(--border2)'}"
      stroke-width="${isMajor ? 1.5 : .8}" stroke-linecap="round"/>`;
  }
  const arcColor = isDay ? 'rgba(251,191,36,.08)' : 'rgba(99,102,241,.1)';
  const secDeg = S * 6, minDeg = M * 6 + S * 0.1, hrDeg = (H%12) * 30 + M * 0.5;
  return `
<svg class="wc-svg-clock" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${arcColor}" stroke="var(--border)" stroke-width="1"/>
  ${isHome ? `<circle cx="${cx}" cy="${cy}" r="${r-.5}" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity=".4"/>` : ''}
  ${ticks}
  <line id="" x1="${cx}" y1="${cy}"
    x2="${(cx+r*.5*Math.sin(hrDeg*Math.PI/180)).toFixed(1)}"
    y2="${(cy-r*.5*Math.cos(hrDeg*Math.PI/180)).toFixed(1)}"
    stroke="${isHome ? 'var(--accent2)' : 'var(--text1)'}" stroke-width="2.5" stroke-linecap="round"
    class="wc-hand-hr"/>
  <line x1="${cx}" y1="${cy}"
    x2="${(cx+r*.72*Math.sin(minDeg*Math.PI/180)).toFixed(1)}"
    y2="${(cy-r*.72*Math.cos(minDeg*Math.PI/180)).toFixed(1)}"
    stroke="${isHome ? 'var(--accent)' : 'var(--text2)'}" stroke-width="1.8" stroke-linecap="round"
    ${isHome ? 'style="filter:drop-shadow(0 0 3px var(--glow))"' : ''}
    class="wc-hand-min"/>
  <line x1="${cx}" y1="${cy}"
    x2="${(cx+r*.82*Math.sin(secDeg*Math.PI/180)).toFixed(1)}"
    y2="${(cy-r*.82*Math.cos(secDeg*Math.PI/180)).toFixed(1)}"
    stroke="#ef4444" stroke-width="1" stroke-linecap="round"
    style="filter:drop-shadow(0 0 2px rgba(239,68,68,.4))"
    class="wc-hand-sec"/>
  <circle cx="${cx}" cy="${cy}" r="3" fill="var(--accent)" stroke="var(--bg0)" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="1.5" fill="var(--bg0)"/>
</svg>`;
}

/* Update only the SVG hand endpoints — zero innerHTML recreation */
function WC_updateAnalogHands(idx, H, M, S) {
  const svg = document.querySelector(`#wc-cc-svg-${idx} svg`);
  if (!svg) return;
  const size = 72, cx = size/2, cy = size/2, r = size/2 - 2;
  const secDeg = S * 6;
  const minDeg = M * 6 + S * 0.1;
  const hrDeg  = (H % 12) * 30 + M * 0.5;

  const hrHand  = svg.querySelector('.wc-hand-hr');
  const minHand = svg.querySelector('.wc-hand-min');
  const secHand = svg.querySelector('.wc-hand-sec');

  if (hrHand) {
    hrHand.setAttribute('x2', (cx + r*.5 * Math.sin(hrDeg*Math.PI/180)).toFixed(1));
    hrHand.setAttribute('y2', (cy - r*.5 * Math.cos(hrDeg*Math.PI/180)).toFixed(1));
  }
  if (minHand) {
    minHand.setAttribute('x2', (cx + r*.72 * Math.sin(minDeg*Math.PI/180)).toFixed(1));
    minHand.setAttribute('y2', (cy - r*.72 * Math.cos(minDeg*Math.PI/180)).toFixed(1));
  }
  if (secHand) {
    secHand.setAttribute('x2', (cx + r*.82 * Math.sin(secDeg*Math.PI/180)).toFixed(1));
    secHand.setAttribute('y2', (cy - r*.82 * Math.cos(secDeg*Math.PI/180)).toFixed(1));
  }
}

/* ══════════ TIMELINE UPDATE (patch cursor + dots only) ══════════ */
function WC_updateTimeline(now) {
  const cursor = document.getElementById('wc-tl-cursor');
  const [hh,mm] = WC_getTimeParts(now, 'Asia/Tehran');
  const dec = parseInt(hh) + parseInt(mm)/60;
  if (cursor) cursor.style.left = (dec/24*100).toFixed(2) + '%';

  WC_CITIES.forEach((c,i) => {
    const dot = document.getElementById('wc-tl-dot-'+i);
    if (!dot) return;
    const [ch,cm] = WC_getTimeParts(now, c.tz);
    const cdec = parseInt(ch) + parseInt(cm)/60;
    const isDay = WC_isDaytime(now, c.tz);
    const col = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    dot.style.left = (cdec/24*100).toFixed(1)+'%';
    dot.style.background = col;
    if (c.home) dot.style.cssText += ';width:5px;height:5px;box-shadow:0 0 6px var(--glow);';
  });
}

/* ══════════ MAP UPDATE ══════════ */
function WC_updateMap(now) {
  WC_CITIES.forEach((c,i) => {
    const dot = document.getElementById('wc-map-dot-'+i);
    if (!dot) return;
    const isDay = WC_isDaytime(now, c.tz);
    const col = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    const sz  = c.home ? '8px' : '5px';
    dot.style.background = col;
    dot.style.width  = sz;
    dot.style.height = sz;
    dot.style.boxShadow = isDay ? `0 0 6px ${col}` : '';
  });
}

/* ══════════ 24H BARS UPDATE ══════════ */
function WC_update24hBars(now) {
  WC_CITIES.forEach((c,i) => {
    const nowEl  = document.getElementById('wc-24h-now-'+i);
    const timeEl = document.getElementById('wc-24h-time-'+i);
    if (!nowEl) return;
    const [ch,cm] = WC_getTimeParts(now, c.tz);
    const dec = parseInt(ch) + parseInt(cm)/60;
    const pct = (dec/24*100).toFixed(1);
    const isDay = WC_isDaytime(now, c.tz);
    const col = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    nowEl.style.left = pct+'%';
    nowEl.style.background = col;
    nowEl.style.boxShadow = `0 0 6px ${col}`;
    if (timeEl) {
      const t = now.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:c.tz});
      if (timeEl.textContent !== t) {
        timeEl.textContent = t;
        timeEl.style.left = Math.min(parseFloat(pct), 80)+'%';
      }
    }
  });
}

function WC_update24hBarsConv(now) {
  WC_CITIES.forEach((c,i) => {
    const nowEl  = document.getElementById('wc-24hc-now-'+i);
    const timeEl = document.getElementById('wc-24hc-time-'+i);
    if (!nowEl) return;
    const [ch,cm] = WC_getTimeParts(now, c.tz);
    const dec = parseInt(ch) + parseInt(cm)/60;
    const pct = (dec/24*100).toFixed(1);
    const isDay = WC_isDaytime(now, c.tz);
    const col = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    nowEl.style.left = pct+'%';
    nowEl.style.background = col;
    nowEl.style.boxShadow = `0 0 6px ${col}`;
    if (timeEl) {
      const t = now.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:c.tz});
      if (timeEl.textContent !== t) {
        timeEl.textContent = t;
        timeEl.style.left = Math.min(parseFloat(pct), 80)+'%';
      }
    }
  });
}

/* ══════════ STOPWATCH ══════════ */
function WC_swToggle() {
  if (_swRunning) {
    _swElapsed += Date.now() - _swStart;
    clearInterval(_swTick);
    _swRunning = false;
    document.getElementById('wc-sw-start').textContent = '▶ START';
  } else {
    _swStart = Date.now();
    _swRunning = true;
    document.getElementById('wc-sw-start').textContent = '⏸ PAUSE';
    _swTick = setInterval(WC_swRender, 50);
  }
}
function WC_swLap() {
  if (!_swRunning) return;
  const total = _swElapsed + (Date.now() - _swStart);
  _swLaps.unshift({ n: _swLaps.length+1, ms: total });
  WC_swRenderLaps();
  try { haptic(10); } catch(e){}
}
function WC_swReset() {
  clearInterval(_swTick);
  _swRunning = false; _swElapsed = 0; _swLaps = [];
  document.getElementById('wc-sw-start').textContent = '▶ START';
  document.getElementById('wc-sw-display').innerHTML = '00:00<span class="wc-sw-ms">.00</span>';
  document.getElementById('wc-sw-laps').innerHTML = '';
}
function WC_swRender() {
  const total = _swElapsed + (Date.now() - _swStart);
  const ms  = Math.floor((total % 1000) / 10);
  const s   = Math.floor(total / 1000) % 60;
  const m   = Math.floor(total / 60000) % 60;
  const h   = Math.floor(total / 3600000);
  const el  = document.getElementById('wc-sw-display');
  if (!el) return;
  const main = h
    ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.innerHTML = `${main}<span class="wc-sw-ms">.${String(ms).padStart(2,'0')}</span>`;
}
function WC_swRenderLaps() {
  const el = document.getElementById('wc-sw-laps');
  if (!el) return;
  el.innerHTML = _swLaps.map((lap,i) => {
    const prev = _swLaps[i+1];
    const split = prev ? lap.ms - prev.ms : lap.ms;
    return `<div class="wc-sw-lap">
      <span class="wc-sw-lap-num">LAP ${lap.n}</span>
      <span>${WC_fmtMs(split)}</span>
      <span style="color:var(--text3)">${WC_fmtMs(lap.ms)}</span>
    </div>`;
  }).join('');
}
function WC_fmtMs(ms) {
  const s  = Math.floor(ms/1000) % 60;
  const m  = Math.floor(ms/60000) % 60;
  const cs = Math.floor((ms%1000)/10);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

/* ══════════ ALARM ══════════ */
function WC_setAlarm() {
  const inp = document.getElementById('wc-alarm-time');
  if (!inp || !inp.value) return;
  _alarmTime  = inp.value;
  _alarmFired = false;
  WC_renderAlarmStatus();
  try { haptic(15); } catch(e){}
  try { showToast('⏰ آلارم تنظیم شد: '+_alarmTime); } catch(e){}
}
function WC_cancelAlarm() {
  _alarmTime = null; _alarmFired = false;
  if (_alarmAudio) { _alarmAudio.pause(); _alarmAudio = null; }
  document.getElementById('wc-alarm-status').innerHTML = '';
  document.querySelector('#wc-panel-alarm .wc-alarm-wrap')?.classList.remove('wc-alarm-ringing');
}
function WC_checkAlarm(now) {
  if (!_alarmTime || _alarmFired) return;
  const hhmm = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Tehran'});
  const [ah, am] = _alarmTime.split(':');
  const [ch, cm] = hhmm.split(':');
  if (parseInt(ch)===parseInt(ah) && parseInt(cm)===parseInt(am)) {
    _alarmFired = true;
    WC_fireAlarm();
  }
}
function WC_fireAlarm() {
  try { haptic([200,100,200,100,200]); } catch(e){}
  // Web Audio beep
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.3;
      o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5);
      o.stop(ctx.currentTime+0.5);
    };
    beep(); setTimeout(beep, 600); setTimeout(beep, 1200);
  } catch(e){}
  document.querySelector('#wc-panel-alarm .wc-alarm-wrap')?.classList.add('wc-alarm-ringing');
  try { showToast('⏰ آلارم! '+_alarmTime); } catch(e){}
  WC_renderAlarmStatus(true);
}
function WC_renderAlarmStatus(ringing=false) {
  const el = document.getElementById('wc-alarm-status');
  if (!el) return;
  if (!_alarmTime) { el.innerHTML=''; return; }
  el.innerHTML = `<div class="wc-alarm-active${ringing?' wc-alarm-ringing':''}">
    <div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-bottom:3px">آلارم فعال</div>
      <div class="wc-alarm-active-time">⏰ ${_alarmTime}</div>
    </div>
    <button class="wc-alarm-cancel" onclick="WC_cancelAlarm()">لغو ✕</button>
  </div>`;
}

/* ══════════ CONVERTER ══════════ */
function WC_calcConvert2() {
  const timeInp = document.getElementById('wc-conv-time2');
  const out     = document.getElementById('wc-conv-out2');
  if (!timeInp || !out) return;
  const [hh,mm] = timeInp.value.split(':').map(Number);
  const now = new Date();
  const baseStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00Z`;
  const utcBase = new Date(baseStr);
  out.innerHTML = WC_CITIES.map(c => {
    const t = utcBase.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:c.tz});
    const d = utcBase.toLocaleDateString('fa-IR', {weekday:'short',month:'short',day:'numeric',timeZone:c.tz});
    const isDay = WC_isDaytime(utcBase, c.tz);
    const col   = c.home ? 'var(--accent)' : isDay ? '#fbbf24' : '#818cf8';
    return `<div class="wc-conv-city-result">
      <div class="wc-conv-city-name">${c.flag} ${c.city}</div>
      <div class="wc-conv-city-time" style="color:${col}">${t}</div>
      <div class="wc-conv-city-date">${d}</div>
    </div>`;
  }).join('');
}

/* ══════════ CONVERTER MODAL (kept for backward compat) ══════════ */
function WC_injectModal() {
  // modal no longer needed — converter is inline tab
  // keep empty to avoid errors from any external call
}
function WC_openConverter()  { WC_switchTab('converter'); }
function WC_closeConverter() { WC_switchTab('clocks'); }

/* ══════════ SEARCH ══════════ */
function WC_onSearch(val) {
  _wcFilter = val.trim().toLowerCase();
  // filter is applied in WC_updateCards on next tick
  WC_tick();
}

/* ══════════ DETAIL TOAST ══════════ */
function WC_openDetail(city, tz, flag) {
  try { haptic(8); } catch(e){}
  const now = new Date();
  const time   = now.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:tz});
  const offset = WC_getOffset(now, tz);
  try { showToast(`${flag} ${city}  ${time}  (${offset})`); } catch(e){}
}

/* ══════════ HELPERS ══════════ */
function WC_getTimeParts(date, tz) {
  // returns [hh, mm, ss] as zero-padded strings
  const s = date.toLocaleTimeString('en-US', {
    hour:'2-digit', minute:'2-digit', second:'2-digit',
    hour12:false, timeZone:tz
  });
  // format: "HH:MM:SS"
  return s.split(':');
}

function WC_isDaytime(date, tz) {
  const h = parseInt(WC_getTimeParts(date, tz)[0]);
  return h >= 6 && h < 20;
}

function WC_getOffset(date, tz) {
  try {
    const utc = new Date(date.toLocaleString('en-US', {timeZone:'UTC'}));
    const loc = new Date(date.toLocaleString('en-US', {timeZone:tz}));
    const diffMin = (loc - utc) / 60000;
    const sign    = diffMin >= 0 ? '+' : '-';
    const absDiff = Math.abs(diffMin);
    const oH      = Math.floor(absDiff / 60);
    const oM      = absDiff % 60;
    return `UTC${sign}${oH}${oM ? ':'+String(oM).padStart(2,'0') : ''}`;
  } catch(e) { return ''; }
}

function WC_getDayPercent(date, tz) {
  const [h, m] = WC_getTimeParts(date, tz);
  return Math.round((parseInt(h)*60 + parseInt(m)) / (24*60) * 100);
}

/* ══════════ CLEANUP ══════════ */
function WC_stop() {
  if (_wcInterval) { clearInterval(_wcInterval); _wcInterval = null; }
  if (_swTick)     { clearInterval(_swTick);     _swTick = null; }
}

/* ══════════ ADD / REMOVE (public API) ══════════ */
function WC_addCity(city, tz, flag, lat=0, lng=0) {
  WC_CITIES.push({city, tz, flag, lat, lng});
  // rebuild since structure changed
  WC_buildCards();
  WC_buildMap();
  WC_build24hBars();
  WC_tick();
}
function WC_removeCity(city) {
  const idx = WC_CITIES.findIndex(c => c.city === city);
  if (idx > -1) { WC_CITIES.splice(idx, 1); WC_buildCards(); WC_build24hBars(); WC_tick(); }
}
