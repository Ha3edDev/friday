// ============================================================================
// 🌍 WorldClock.js — ماژول ساعت جهانی
// مثل Movies.js / Links.js / Stats.js / BankTracker.js لود میشه
// ============================================================================

/* ══════════ INJECT CSS (یه بار) ══════════ */
(function WC_injectCSS(){
  if(document.getElementById('wc-style')) return;
  const s = document.createElement('style');
  s.id = 'wc-style';
  s.textContent = `
.clock-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.clock-card{
  border-radius:16px;padding:14px;
  background:linear-gradient(145deg,var(--card),var(--bg2));
  border:1px solid var(--card-b);
  position:relative;overflow:hidden;cursor:pointer;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;
}
.clock-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--grad1),var(--grad2));opacity:.6;}
.clock-card:hover{transform:perspective(400px) rotateX(-4deg) rotateY(5deg) translateZ(12px);box-shadow:0 18px 44px rgba(0,0,0,.6),0 0 24px var(--glow2);}
.clock-card:active{transform:scale(.96);}
.clock-city{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;}
.clock-time{font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:700;color:var(--accent);line-height:1;text-shadow:0 0 28px var(--glow);}
.clock-date{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text2);margin-top:3px;}
.clock-tz{font-size:7px;color:var(--text3);margin-top:2px;}
.clock-card.is-home{border-color:var(--accent);box-shadow:0 0 20px var(--glow2);}
.clock-card.is-home .clock-time{color:var(--accent2);}
`;
  document.head.appendChild(s);
})();

/* ══════════ CITIES CONFIG ══════════ */
const WC_CITIES = [
  { city:'تهران',     tz:'Asia/Tehran',        flag:'🇮🇷', home:true  },
  { city:'دبی',      tz:'Asia/Dubai',          flag:'🇦🇪'            },
  { city:'مسکو',     tz:'Europe/Moscow',       flag:'🇷🇺'            },
  { city:'لندن',     tz:'Europe/London',       flag:'🇬🇧'            },
  { city:'نیویورک',  tz:'America/New_York',    flag:'🇺🇸'            },
  { city:'لس‌آنجلس', tz:'America/Los_Angeles', flag:'🇺🇸'            },
  { city:'توکیو',    tz:'Asia/Tokyo',          flag:'🇯🇵'            },
  { city:'سیدنی',    tz:'Australia/Sydney',    flag:'🇦🇺'            },
];

/* ══════════ STATE ══════════ */
let _wcInterval = null;

/* ══════════ ENTRY POINT (صدا زده میشه از loadPage) ══════════ */
function loadWorldClock() {
  WC_render();
  if (!_wcInterval) _wcInterval = setInterval(WC_render, 1000);
}

/* ══════════ RENDER ══════════ */
function WC_render() {
  const el = document.getElementById('clockGrid');
  if (!el) return;

  const now = new Date();

  el.innerHTML = WC_CITIES.map(c => {
    const time = now.toLocaleTimeString('fa-IR', {
      hour:'2-digit', minute:'2-digit', second:'2-digit',
      hour12:false, timeZone:c.tz
    });
    const date = now.toLocaleDateString('fa-IR', {
      weekday:'short', month:'short', day:'numeric',
      timeZone:c.tz
    });
    const isDay = WC_isDaytime(now, c.tz);

    return `
      <div class="clock-card${c.home ? ' is-home' : ''}" onclick="WC_openDetail('${c.city}','${c.tz}','${c.flag}')">
        <div class="clock-city">${c.flag} ${c.city} <span style="font-size:9px;opacity:.5">${isDay ? '☀️' : '🌙'}</span></div>
        <div class="clock-time">${time}</div>
        <div class="clock-date">${date}</div>
      </div>`;
  }).join('');
}

/* ══════════ DAY / NIGHT DETECTION ══════════ */
function WC_isDaytime(now, tz) {
  const h = parseInt(now.toLocaleTimeString('en-US', {
    hour:'2-digit', hour12:false, timeZone:tz
  }));
  return h >= 6 && h < 20;
}

/* ══════════ DETAIL CLICK (برای گسترش بعدی) ══════════ */
function WC_openDetail(city, tz, flag) {
  try { haptic(8); } catch(e) {}
  try { showToast(`${flag} ${city}`); } catch(e) {}
  // TODO: می‌تونی اینجا یه modal با نمودار ۲۴ ساعته یا تبدیل زمان اضافه کنی
}

/* ══════════ ADD CITY (برای گسترش بعدی) ══════════ */
function WC_addCity(city, tz, flag) {
  WC_CITIES.push({ city, tz, flag });
  WC_render();
}

/* ══════════ REMOVE CITY (برای گسترش بعدی) ══════════ */
function WC_removeCity(city) {
  const idx = WC_CITIES.findIndex(c => c.city === city);
  if (idx > -1) { WC_CITIES.splice(idx, 1); WC_render(); }
}

/* ══════════ STOP / CLEANUP ══════════ */
function WC_stop() {
  if (_wcInterval) { clearInterval(_wcInterval); _wcInterval = null; }
}
