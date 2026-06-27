// ============================================================================
// 💳 BankTracker.js — ماژول ردیاب بانکی v2.0
// جدید: کارت بانکی بصری، نمودار خطی موجودی، آمار پیشرفته
// ============================================================================

/* ══════════ CONFIG ══════════ */
const BT_API = 'https://script.google.com/macros/s/AKfycbw1p_G2IUuPX0Nkajj6sWoiZb9xac8WLou0MhW6RvvPGM42fZ2yCtkasdFMWmeekOzIgQ/exec';

/* ══════════ STATE ══════════ */
let _btTx          = [];
let _btFilter      = 'all';
let _btLoaded      = false;
let _btActiveBank  = 'all';   // برای کارت‌های بانکی
let _btChartMode   = 'balance'; // balance | flow

/* ══════════ INJECT CSS ══════════ */
(function BT_injectCSS(){
  if(document.getElementById('bt-style')) return;
  const s = document.createElement('style');
  s.id = 'bt-style';
  s.textContent = `

/* ── SUMMARY ── */
.bt-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:10px;}
.bt-sb{border-radius:13px;padding:11px 8px;background:var(--card);border:1px solid var(--card-b);text-align:center;position:relative;overflow:hidden;transition:transform .25s cubic-bezier(.34,1.56,.64,1);}
.bt-sb:hover{transform:perspective(400px) rotateX(-4deg) translateZ(8px);}
.bt-sb::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.bt-sb.bt-in::before{background:#22d47a;}
.bt-sb.bt-out::before{background:#ff4444;}
.bt-sb.bt-net::before{background:var(--accent3);}
.bt-sb-lbl{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);letter-spacing:1.5px;margin-bottom:4px;}
.bt-sb-val{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;line-height:1;}
.bt-sb.bt-in  .bt-sb-val{color:#22d47a;}
.bt-sb.bt-out .bt-sb-val{color:#ff4444;}
.bt-sb.bt-net .bt-sb-val.pos{color:#22d47a;}
.bt-sb.bt-net .bt-sb-val.neg{color:#ff4444;}
.bt-sb-unit{font-size:6px;color:var(--text3);margin-top:1px;font-family:'JetBrains Mono',monospace;}

/* ── FILTER BAR ── */
.bt-filters{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px;}
.bt-filters::-webkit-scrollbar{display:none;}
.bt-fp{padding:4px 12px;border-radius:18px;background:var(--surface);border:1px solid var(--border);font-size:8px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0;font-family:'JetBrains Mono',monospace;}
.bt-fp.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.bt-fp:active{transform:scale(.93);}

/* ══════════════════════════════════
   ── BANK CARDS ──
══════════════════════════════════ */
.bt-cards-scroll{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.bt-cards-scroll::-webkit-scrollbar{display:none;}

.bt-vcard{
  flex-shrink:0;width:220px;height:130px;border-radius:18px;
  position:relative;overflow:hidden;scroll-snap-align:start;
  cursor:pointer;
  transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s;
  box-shadow:0 8px 32px rgba(0,0,0,.5);
}
.bt-vcard:hover{
  transform:perspective(600px) rotateX(-6deg) rotateY(8deg) translateZ(18px) scale(1.03);
  box-shadow:0 24px 56px rgba(0,0,0,.7),0 0 40px var(--glow2);
}
.bt-vcard:active{transform:scale(.96);}
.bt-vcard.active-card{box-shadow:0 0 0 2px var(--accent),0 16px 44px rgba(0,0,0,.6),0 0 30px var(--glow);}

/* gradient overlays per bank */
.bt-vcard-bg{position:absolute;inset:0;}
.bt-vcard-shine{
  position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 50%,rgba(0,0,0,.12) 100%);
  pointer-events:none;
}
.bt-vcard-circuit{
  position:absolute;inset:0;opacity:.08;
  background-image:
    repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(255,255,255,1) 18px,rgba(255,255,255,1) 19px),
    repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(255,255,255,1) 18px,rgba(255,255,255,1) 19px);
}
.bt-vcard-content{position:relative;z-index:2;padding:14px 16px;height:100%;display:flex;flex-direction:column;justify-content:space-between;}
.bt-vcard-top{display:flex;align-items:center;justify-content:space-between;}
.bt-vcard-bank{font-family:'Syne',sans-serif;font-size:13px;font-weight:900;color:rgba(255,255,255,.95);letter-spacing:.5px;text-shadow:0 1px 4px rgba(0,0,0,.3);}
.bt-vcard-chip{width:28px;height:22px;border-radius:4px;background:linear-gradient(135deg,#d4af37,#f5e67d,#b8960c);border:1px solid rgba(255,255,255,.3);position:relative;overflow:hidden;}
.bt-vcard-chip::after{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(0,0,0,.2);}
.bt-vcard-chip::before{content:'';position:absolute;top:0;left:40%;bottom:0;width:1px;background:rgba(0,0,0,.2);}
.bt-vcard-mid{display:flex;flex-direction:column;gap:2px;}
.bt-vcard-num{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:rgba(255,255,255,.9);letter-spacing:3px;text-shadow:0 1px 3px rgba(0,0,0,.4);}
.bt-vcard-bottom{display:flex;align-items:flex-end;justify-content:space-between;}
.bt-vcard-bal-lbl{font-family:'JetBrains Mono',monospace;font-size:5.5px;color:rgba(255,255,255,.55);letter-spacing:1.5px;margin-bottom:2px;}
.bt-vcard-bal{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:#fff;text-shadow:0 0 14px rgba(255,255,255,.4);}
.bt-vcard-logo{font-size:22px;opacity:.9;}
.bt-vcard-txcount{font-family:'JetBrains Mono',monospace;font-size:6px;color:rgba(255,255,255,.5);margin-top:1px;}

/* ── کارت "همه" ── */
.bt-vcard-all{
  background:linear-gradient(135deg,var(--bg3) 0%,var(--bg2) 100%);
  border:1px solid var(--border2);
}

/* ══════════════════════════════════
   ── LINE CHART (SVG) ──
══════════════════════════════════ */
.bt-linechart-wrap{
  border-radius:16px;background:var(--card);border:1px solid var(--card-b);
  padding:14px 12px 10px;margin-bottom:10px;overflow:hidden;
}
.bt-linechart-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.bt-linechart-ttl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:2px;}
.bt-chart-toggle{display:flex;gap:4px;}
.bt-ctbtn{padding:3px 9px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:6.5px;cursor:pointer;transition:all .2s;}
.bt-ctbtn.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);}
.bt-linechart-svg{width:100%;display:block;overflow:visible;}
.bt-lc-tooltip{
  position:absolute;pointer-events:none;
  background:var(--glass);backdrop-filter:blur(16px);
  border:1px solid var(--glass-b);border-radius:10px;
  padding:6px 10px;font-family:'JetBrains Mono',monospace;font-size:7.5px;
  color:var(--text1);white-space:nowrap;
  box-shadow:0 8px 24px rgba(0,0,0,.5);
  opacity:0;transition:opacity .15s;z-index:100;
}
.bt-lc-tooltip.show{opacity:1;}
.bt-linechart-container{position:relative;}

/* ── نمودار ستونی ۷ روز ── */
.bt-chart-wrap{border-radius:14px;background:var(--card);border:1px solid var(--card-b);padding:12px;margin-bottom:10px;}
.bt-chart-ttl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:2px;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.bt-legend{display:flex;gap:8px;margin-right:auto;}
.bt-leg{font-size:6px;color:var(--text3);display:flex;align-items:center;gap:3px;font-family:'JetBrains Mono',monospace;}
.bt-leg-dot{width:6px;height:6px;border-radius:50%;}
.bt-bars{display:flex;align-items:flex-end;gap:4px;height:56px;}
.bt-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;}
.bt-bar-track{flex:1;width:100%;background:var(--bg3);border-radius:4px 4px 0 0;position:relative;min-height:3px;}
.bt-bar-in{position:absolute;bottom:0;left:0;width:48%;border-radius:3px 3px 0 0;background:#22d47a;opacity:.75;transition:height .7s cubic-bezier(.22,1,.36,1);}
.bt-bar-out{position:absolute;bottom:0;right:0;width:48%;border-radius:3px 3px 0 0;background:#ff4444;opacity:.6;transition:height .7s cubic-bezier(.22,1,.36,1);}
.bt-bar-lbl{font-family:'JetBrains Mono',monospace;font-size:5.5px;color:var(--text3);}

/* ══════════════════════════════════
   ── ADVANCED STATS ──
══════════════════════════════════ */
.bt-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px;}
.bt-stat-card{
  border-radius:13px;padding:12px 10px;
  background:var(--card);border:1px solid var(--card-b);
  position:relative;overflow:hidden;
  transition:transform .25s cubic-bezier(.34,1.56,.64,1);
}
.bt-stat-card:hover{transform:perspective(400px) rotateX(-3deg) translateZ(6px);}
.bt-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--grad1),var(--grad2));opacity:.6;}
.bt-stat-icon{font-size:18px;margin-bottom:4px;}
.bt-stat-lbl{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);letter-spacing:1.5px;margin-bottom:3px;}
.bt-stat-val{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--accent);line-height:1;text-shadow:0 0 18px var(--glow);}
.bt-stat-sub{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text2);margin-top:3px;}

/* ── HEATMAP ── */
.bt-heatmap{border-radius:14px;background:var(--card);border:1px solid var(--card-b);padding:12px;margin-bottom:10px;}
.bt-heatmap-ttl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:2px;margin-bottom:8px;}
.bt-hm-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.bt-hm-cell{aspect-ratio:1;border-radius:4px;transition:transform .2s;}
.bt-hm-cell:hover{transform:scale(1.3);z-index:2;}
.bt-hm-labels{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:3px;}
.bt-hm-lbl{font-family:'JetBrains Mono',monospace;font-size:5px;color:var(--text3);text-align:center;}

/* ── BANK BREAKDOWN ── */
.bt-bank-row{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:12px;background:var(--card);border:1px solid var(--card-b);margin-bottom:5px;}
.bt-bank-name{font-size:9.5px;font-weight:700;color:var(--text1);min-width:60px;}
.bt-bank-bar-wrap{flex:1;height:3px;background:var(--bg3);border-radius:3px;overflow:hidden;}
.bt-bank-bar-fill{height:100%;border-radius:3px;background:var(--accent);transition:width .8s cubic-bezier(.22,1,.36,1);}
.bt-bank-meta{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);flex-shrink:0;text-align:left;min-width:54px;}

/* ── TX CARD ── */
.bt-tx{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:14px;background:var(--card);border:1px solid var(--card-b);margin-bottom:6px;position:relative;overflow:hidden;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;}
.bt-tx::before{content:'';position:absolute;right:0;top:0;bottom:0;width:3px;border-radius:0 14px 14px 0;}
.bt-tx.in::before{background:#22d47a;box-shadow:-2px 0 10px rgba(34,212,122,.25);}
.bt-tx.out::before{background:#ff4444;box-shadow:-2px 0 10px rgba(255,68,68,.25);}
.bt-tx:hover{transform:perspective(500px) rotateX(-1deg) translateZ(5px);box-shadow:0 10px 28px rgba(0,0,0,.45),0 0 12px var(--glow2);}
.bt-tx:active{transform:scale(.97);}
.bt-tx-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.bt-tx.in  .bt-tx-icon{background:rgba(34,212,122,.1);border:1px solid rgba(34,212,122,.2);}
.bt-tx.out .bt-tx-icon{background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.2);}
.bt-tx-body{flex:1;min-width:0;}
.bt-tx-top{display:flex;align-items:center;justify-content:space-between;gap:6px;}
.bt-tx-bank{font-size:10px;font-weight:700;color:var(--text1);}
.bt-tx-amount{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;white-space:nowrap;}
.bt-tx.in  .bt-tx-amount{color:#22d47a;}
.bt-tx.out .bt-tx-amount{color:#ff4444;}
.bt-tx-bottom{display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap;}
.bt-chip{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);background:var(--bg3);border:1px solid var(--border);padding:1px 6px;border-radius:5px;}
.bt-chip.card{color:var(--accent2);border-color:var(--accent2);background:var(--glow2);}
.bt-bal{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);margin-right:auto;}

/* ── SPINNER ── */
.bt-spinner-wrap{display:flex;flex-direction:column;align-items:center;padding:44px 0;gap:12px;}
.bt-ring{width:28px;height:28px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;}
.bt-loading-txt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);animation:txtBlink 1.5s ease-in-out infinite;}

/* ── EMPTY ── */
.bt-empty{text-align:center;padding:36px 0;color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:8px;line-height:2.4;}
`;
  document.head.appendChild(s);
})();

/* ══════════ TOOLTIP DOM ══════════ */
(function BT_injectTooltip(){
  if(document.getElementById('bt-tooltip')) return;
  const d = document.createElement('div');
  d.id = 'bt-tooltip';
  d.className = 'bt-lc-tooltip';
  document.body.appendChild(d);
})();

/* ══════════ BANK PALETTES ══════════ */
const BT_BANK_COLORS = {
  'ملت':       ['#1a237e','#283593','#3949ab'],
  'صادرات':    ['#1b5e20','#2e7d32','#388e3c'],
  'خاورمیانه': ['#4a148c','#6a1b9a','#7b1fa2'],
  'سامان':     ['#b71c1c','#c62828','#d32f2f'],
  'پاسارگاد':  ['#e65100','#ef6c00','#f57c00'],
  'تجارت':     ['#006064','#00838f','#0097a7'],
  'رفاه':      ['#33691e','#558b2f','#689f38'],
  'ملی':       ['#0d47a1','#1565c0','#1976d2'],
  'default':   ['#1a1040','#2d1b69','#3730a3'],
};

function _btBankColors(name){
  return BT_BANK_COLORS[name] || BT_BANK_COLORS.default;
}

/* ══════════ HELPERS ══════════ */
function _btEsc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function _btFmtShort(n){
  const v=Number(n||0); if(!v) return '—';
  if(v>=1e9) return (v/1e9).toFixed(1)+' میلیارد';
  if(v>=1e6) return (v/1e6).toFixed(1)+' میلیون';
  return v.toLocaleString('fa-IR');
}
function _btFmtFull(n){ return Number(n||0).toLocaleString('fa-IR'); }
function _btFmtDate(raw){
  if(!raw) return '—';
  try{ const d=new Date(raw); if(isNaN(d)) return String(raw); return d.toLocaleDateString('fa-IR',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'}); }catch(e){ return String(raw); }
}
function _btDaysSince(raw){ try{ return(Date.now()-new Date(raw))/86400000; }catch(e){ return 999; } }

/* ══════════ API ══════════ */
async function BT_load(){
  _btLoaded=false;
  const root=document.getElementById('bt-root');
  if(!root) return;
  root.innerHTML=`<div class="bt-spinner-wrap"><div class="bt-ring"></div><div class="bt-loading-txt">// LOADING TRANSACTIONS...</div></div>`;
  try{
    const res=await fetch(BT_API+'?page=bank_data');
    const json=await res.json();
    if(json.ok&&Array.isArray(json.data)) _btTx=json.data;
    else{ _btTx=_btDemoData(); try{showToast('⚠️ داده نمونه');}catch(e){} }
  }catch(e){ _btTx=_btDemoData(); try{showToast('⚠️ خطا — داده نمونه');}catch(e2){} }
  _btLoaded=true;
  _btRender();
}

function BT_reload(){ _btTx=[]; BT_load(); try{showToast('🔄 بروزرسانی...');}catch(e){} }

/* ══════════ DEMO DATA ══════════ */
function _btDemoData(){
  const banks=['ملت','صادرات','خاورمیانه','سامان','پاسارگاد'];
  const cards ={'ملت':'4371','صادرات':'6037','خاورمیانه':'6362','سامان':'6219','پاسارگاد':'5022'};
  const out=[]; const now=Date.now();
  let bal=12000000;
  for(let i=29;i>=0;i--){
    const cnt=Math.floor(Math.random()*3)+1;
    for(let j=0;j<cnt;j++){
      const type=Math.random()>.45?'واریز':'برداشت';
      const amount=(Math.floor(Math.random()*400)+50)*100000;
      const bank=banks[Math.floor(Math.random()*banks.length)];
      bal+=(type==='واریز'?1:-1)*amount;
      const d=new Date(now-(i*86400000+Math.random()*43200000));
      out.push({ date:d.toISOString(), bank, card:cards[bank]||'1234', type, amount, balance:Math.max(bal,500000),
        txDate:d.toLocaleDateString('fa-IR',{month:'2-digit',day:'2-digit'}),
        txTime:d.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',hour12:false}) });
    }
  }
  return out.sort((a,b)=>new Date(b.date)-new Date(a.date));
}

/* ══════════ FILTER ══════════ */
function _btFiltered(){
  let txs=_btTx;
  if(_btActiveBank!=='all') txs=txs.filter(t=>t.bank===_btActiveBank);
  return txs.filter(tx=>{
    if(_btFilter==='all')   return true;
    if(_btFilter==='in')    return tx.type==='واریز';
    if(_btFilter==='out')   return tx.type==='برداشت';
    if(_btFilter==='today') return _btDaysSince(tx.date)<1;
    if(_btFilter==='week')  return _btDaysSince(tx.date)<7;
    if(_btFilter==='month'){const d=new Date(tx.date),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}
    return true;
  });
}

function BT_setFilter(f,el){
  _btFilter=f;
  document.querySelectorAll('.bt-fp').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  _btRender(); try{haptic(6);}catch(e){}
}

function BT_setBank(bank){
  _btActiveBank=bank;
  _btRender(); try{haptic(8);}catch(e){}
}

function BT_setChartMode(mode){
  _btChartMode=mode;
  _btRender(); try{haptic(6);}catch(e){}
}

/* ══════════ MAIN RENDER ══════════ */
function _btRender(){
  const root=document.getElementById('bt-root');
  if(!root) return;
  const txs=_btFiltered();
  let html='';

  /* ── کارت‌های بانکی ── */
  html+=_btBankCardsHTML();

  /* ── فیلترها ── */
  html+=`<div class="bt-filters">
    <div class="bt-fp ${_btFilter==='all'   ?'active':''}" onclick="BT_setFilter('all',this)">همه</div>
    <div class="bt-fp ${_btFilter==='in'    ?'active':''}" onclick="BT_setFilter('in',this)">🟢 واریز</div>
    <div class="bt-fp ${_btFilter==='out'   ?'active':''}" onclick="BT_setFilter('out',this)">🔴 برداشت</div>
    <div class="bt-fp ${_btFilter==='today' ?'active':''}" onclick="BT_setFilter('today',this)">امروز</div>
    <div class="bt-fp ${_btFilter==='week'  ?'active':''}" onclick="BT_setFilter('week',this)">۷ روز</div>
    <div class="bt-fp ${_btFilter==='month' ?'active':''}" onclick="BT_setFilter('month',this)">این ماه</div>
  </div>`;

  /* ── سامری ── */
  let inSum=0,outSum=0;
  txs.forEach(t=>{if(t.type==='واریز')inSum+=Number(t.amount||0);else outSum+=Number(t.amount||0);});
  const net=inSum-outSum;
  html+=`<div class="bt-summary">
    <div class="bt-sb bt-in"><div class="bt-sb-lbl">INCOME</div><div class="bt-sb-val">${_btFmtShort(inSum)}</div><div class="bt-sb-unit">تومان</div></div>
    <div class="bt-sb bt-out"><div class="bt-sb-lbl">EXPENSE</div><div class="bt-sb-val">${_btFmtShort(outSum)}</div><div class="bt-sb-unit">تومان</div></div>
    <div class="bt-sb bt-net"><div class="bt-sb-lbl">NET</div><div class="bt-sb-val ${net>=0?'pos':'neg'}">${net>=0?'+':'−'}${_btFmtShort(Math.abs(net))}</div><div class="bt-sb-unit">تومان</div></div>
  </div>`;

  if(!txs.length){
    html+=`<div class="bt-empty"><div style="font-size:32px;margin-bottom:8px;opacity:.3">💳</div>// تراکنشی پیدا نشد<br>فیلتر رو تغییر بده</div>`;
    root.innerHTML=html; return;
  }

  /* ── آمار پیشرفته ── */
  html+=_btAdvancedStatsHTML(txs);

  /* ── نمودار خطی موجودی ── */
  html+=_btLineChartHTML(txs);

  /* ── نمودار ستونی ۷ روز ── */
  if(['all','week','month'].includes(_btFilter)) html+=_btBarChartHTML(txs);

  /* ── heatmap فعالیت ── */
  html+=_btHeatmapHTML();

  /* ── تفکیک بانک ── */
  html+=_btBankBreakdownHTML(txs);

  /* ── لیست تراکنش‌ها ── */
  html+=`<div class="sec">تراکنش‌ها <span style="color:var(--text3);font-size:7px">(${txs.length})</span></div>`;
  txs.forEach((tx,i)=>{
    const isIn=tx.type==='واریز';
    html+=`<div class="bt-tx ${isIn?'in':'out'} stagger-item" style="animation-delay:${(i*.03).toFixed(2)}s">
      <div class="bt-tx-icon">${isIn?'⬆️':'⬇️'}</div>
      <div class="bt-tx-body">
        <div class="bt-tx-top">
          <span class="bt-tx-bank">🏦 ${_btEsc(tx.bank||'نامشخص')}</span>
          <span class="bt-tx-amount">${isIn?'+':'−'}${_btFmtFull(tx.amount)} تومان</span>
        </div>
        <div class="bt-tx-bottom">
          ${tx.card?`<span class="bt-chip card">****${_btEsc(tx.card)}</span>`:''}
          <span class="bt-chip">${_btFmtDate(tx.date)}</span>
          ${tx.txTime?`<span class="bt-chip">⏰ ${_btEsc(tx.txTime)}</span>`:''}
          ${tx.balance?`<span class="bt-bal">موجودی: ${_btFmtShort(tx.balance)}</span>`:''}
        </div>
      </div>
    </div>`;
  });

  root.innerHTML=html;
  /* bind chart interactions بعد از DOM ready */
  requestAnimationFrame(()=>{ BT_bindLineChart(); BT_bindCardTilt(); });
}

/* ══════════ کارت‌های بانکی بصری ══════════ */
function _btBankCardsHTML(){
  /* پیدا کردن بانک‌های unique */
  const banks=[...new Set(_btTx.map(t=>t.bank).filter(Boolean))];
  /* آخرین موجودی هر بانک */
  const lastBal={};
  const bankTxCount={};
  const bankCard={};
  _btTx.forEach(t=>{
    if(!lastBal[t.bank]||new Date(t.date)>new Date(lastBal[t.bank].date))
      lastBal[t.bank]={bal:t.balance,date:t.date};
    bankTxCount[t.bank]=(bankTxCount[t.bank]||0)+1;
    if(t.card) bankCard[t.bank]=t.card;
  });
  /* موجودی کل */
  const totalBal=Object.values(lastBal).reduce((s,v)=>s+(Number(v.bal)||0),0);

  let html=`<div class="sec">کارت‌های بانکی</div>
  <div class="bt-cards-scroll">`;

  /* کارت "همه" */
  html+=`<div class="bt-vcard bt-vcard-all ${_btActiveBank==='all'?'active-card':''}" onclick="BT_setBank('all')">
    <div class="bt-vcard-shine"></div>
    <div class="bt-vcard-content">
      <div class="bt-vcard-top">
        <div class="bt-vcard-bank" style="color:var(--accent)">همه بانک‌ها</div>
        <div style="font-size:20px">🏦</div>
      </div>
      <div class="bt-vcard-mid">
        <div class="bt-vcard-num" style="color:var(--text2);font-size:9px">•••• •••• •••• ••••</div>
      </div>
      <div class="bt-vcard-bottom">
        <div>
          <div class="bt-vcard-bal-lbl">موجودی تخمینی</div>
          <div class="bt-vcard-bal" style="color:var(--accent);font-size:12px">${_btFmtShort(totalBal)}</div>
          <div class="bt-vcard-txcount">${_btTx.length} تراکنش</div>
        </div>
        <div style="font-size:26px;opacity:.2">💳</div>
      </div>
    </div>
  </div>`;

  /* کارت هر بانک */
  banks.forEach(bank=>{
    const cols=_btBankColors(bank);
    const bal=lastBal[bank]?.bal||0;
    const cnt=bankTxCount[bank]||0;
    const card=bankCard[bank]||'****';
    const isActive=_btActiveBank===bank;
    html+=`<div class="bt-vcard ${isActive?'active-card':''}" onclick="BT_setBank('${_btEsc(bank)}')" style="background:linear-gradient(135deg,${cols[0]},${cols[1]},${cols[2]})">
      <div class="bt-vcard-shine"></div>
      <div class="bt-vcard-circuit"></div>
      <div class="bt-vcard-content">
        <div class="bt-vcard-top">
          <div class="bt-vcard-bank">${_btEsc(bank)}</div>
          <div class="bt-vcard-chip"></div>
        </div>
        <div class="bt-vcard-mid">
          <div class="bt-vcard-num">**** **** **** ${_btEsc(card)}</div>
        </div>
        <div class="bt-vcard-bottom">
          <div>
            <div class="bt-vcard-bal-lbl">آخرین موجودی</div>
            <div class="bt-vcard-bal">${_btFmtShort(bal)}</div>
            <div class="bt-vcard-txcount">${cnt} تراکنش</div>
          </div>
          <div class="bt-vcard-logo">🏛️</div>
        </div>
      </div>
    </div>`;
  });

  html+=`</div>`;
  return html;
}

/* ══════════ آمار پیشرفته ══════════ */
function _btAdvancedStatsHTML(txs){
  const amounts=txs.map(t=>Number(t.amount||0)).filter(Boolean);
  if(!amounts.length) return '';

  const inTxs  = txs.filter(t=>t.type==='واریز');
  const outTxs = txs.filter(t=>t.type==='برداشت');
  const inAmts  = inTxs.map(t=>Number(t.amount||0));
  const outAmts = outTxs.map(t=>Number(t.amount||0));

  const maxIn  = inAmts.length  ? Math.max(...inAmts)  : 0;
  const maxOut = outAmts.length ? Math.max(...outAmts) : 0;
  const avgIn  = inAmts.length  ? inAmts.reduce((a,b)=>a+b,0)/inAmts.length   : 0;
  const avgOut = outAmts.length ? outAmts.reduce((a,b)=>a+b,0)/outAmts.length : 0;

  /* پرتراکنش‌ترین بانک */
  const bankCnt={};
  txs.forEach(t=>{ bankCnt[t.bank]=(bankCnt[t.bank]||0)+1; });
  const topBank=Object.entries(bankCnt).sort((a,b)=>b[1]-a[1])[0]||['—',0];

  /* میانگین روزانه */
  const days=txs.length>0?((_btDaysSince(txs[txs.length-1].date))||1):1;
  const dailyAvg=(inAmts.reduce((a,b)=>a+b,0)-outAmts.reduce((a,b)=>a+b,0))/Math.max(days,1);

  return `<div class="sec">آمار پیشرفته</div>
  <div class="bt-stats-grid">
    <div class="bt-stat-card">
      <div class="bt-stat-icon">⬆️</div>
      <div class="bt-stat-lbl">بیشترین واریز</div>
      <div class="bt-stat-val">${_btFmtShort(maxIn)}</div>
      <div class="bt-stat-sub">میانگین: ${_btFmtShort(avgIn)}</div>
    </div>
    <div class="bt-stat-card">
      <div class="bt-stat-icon">⬇️</div>
      <div class="bt-stat-lbl">بیشترین برداشت</div>
      <div class="bt-stat-val" style="color:#ff4444;text-shadow:0 0 14px rgba(255,68,68,.3)">${_btFmtShort(maxOut)}</div>
      <div class="bt-stat-sub">میانگین: ${_btFmtShort(avgOut)}</div>
    </div>
    <div class="bt-stat-card">
      <div class="bt-stat-icon">🏦</div>
      <div class="bt-stat-lbl">پرتراکنش‌ترین</div>
      <div class="bt-stat-val" style="font-size:12px">${_btEsc(topBank[0])}</div>
      <div class="bt-stat-sub">${topBank[1]} تراکنش</div>
    </div>
    <div class="bt-stat-card">
      <div class="bt-stat-icon">📊</div>
      <div class="bt-stat-lbl">خالص روزانه</div>
      <div class="bt-stat-val" style="font-size:12px;color:${dailyAvg>=0?'#22d47a':'#ff4444'}">${dailyAvg>=0?'+':''}${_btFmtShort(dailyAvg)}</div>
      <div class="bt-stat-sub">${txs.length} تراکنش کل</div>
    </div>
  </div>`;
}

/* ══════════ نمودار خطی موجودی ══════════ */
function _btLineChartHTML(txs){
  /* مرتب از قدیم به جدید */
  const sorted=[...txs].sort((a,b)=>new Date(a.date)-new Date(b.date));

  /* نقاط: موجودی یا خالص تجمعی */
  let points=[];
  if(_btChartMode==='balance'){
    points=sorted.filter(t=>t.balance!=null&&t.balance>0).map(t=>({
      x:new Date(t.date).getTime(), y:Number(t.balance), lbl:_btFmtDate(t.date), val:t.balance, type:t.type
    }));
  } else {
    let cum=0;
    points=sorted.map(t=>{
      cum+=(t.type==='واریز'?1:-1)*Number(t.amount||0);
      return{x:new Date(t.date).getTime(),y:cum,lbl:_btFmtDate(t.date),val:cum,type:t.type};
    });
  }

  if(points.length<2) return '';

  const W=300,H=90,PAD={t:8,r:8,b:20,l:46};
  const cW=W-PAD.l-PAD.r, cH=H-PAD.t-PAD.b;

  const xs=points.map(p=>p.x); const ys=points.map(p=>p.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs)||1;
  const minY=Math.min(...ys,0); const maxY=Math.max(...ys)||1;
  const rangeX=maxX-minX||1, rangeY=maxY-minY||1;

  const toSvgX=x=>PAD.l+(x-minX)/rangeX*cW;
  const toSvgY=y=>PAD.t+cH-(y-minY)/rangeY*cH;

  /* polyline path */
  const pts=points.map(p=>`${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`).join(' ');

  /* smooth cubic bezier */
  let d='M ';
  points.forEach((p,i)=>{
    const x=toSvgX(p.x),y=toSvgY(p.y);
    if(i===0){ d+=`${x.toFixed(1)},${y.toFixed(1)}`; return; }
    const px=toSvgX(points[i-1].x), py=toSvgY(points[i-1].y);
    const cpx=(px+x)/2;
    d+=` C ${cpx.toFixed(1)},${py.toFixed(1)} ${cpx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  });

  /* area fill path */
  const baseY=toSvgY(Math.max(minY,0)).toFixed(1);
  const areaD=d+` L ${toSvgX(maxX).toFixed(1)},${baseY} L ${toSvgX(minX).toFixed(1)},${baseY} Z`;

  /* Y axis labels */
  const ySteps=3;
  const yLabels=Array.from({length:ySteps+1},(_,i)=>{
    const val=minY+(rangeY/ySteps)*i;
    const sy=toSvgY(val);
    return `<text x="${(PAD.l-4).toFixed(1)}" y="${sy.toFixed(1)}" fill="var(--text3)"
      font-family="JetBrains Mono,monospace" font-size="5" text-anchor="end" dominant-baseline="middle"
    >${_btFmtShort(val)}</text>
    <line x1="${PAD.l}" y1="${sy.toFixed(1)}" x2="${(W-PAD.r)}" y2="${sy.toFixed(1)}"
      stroke="var(--border)" stroke-width=".5" stroke-dasharray="3,3"/>`;
  }).join('');

  /* X axis labels (3 evenly spaced) */
  const xLabels=[0, Math.floor(points.length/2), points.length-1].map(i=>{
    const p=points[Math.min(i,points.length-1)];
    const sx=toSvgX(p.x);
    return `<text x="${sx.toFixed(1)}" y="${(H-3).toFixed(1)}" fill="var(--text3)"
      font-family="JetBrains Mono,monospace" font-size="5" text-anchor="middle">${p.lbl}</text>`;
  }).join('');

  /* interactive dots */
  const dots=points.map((p,i)=>{
    const sx=toSvgX(p.x).toFixed(1), sy=toSvgY(p.y).toFixed(1);
    const col=p.type==='واریز'?'#22d47a':'#ff4444';
    return `<circle cx="${sx}" cy="${sy}" r="3" fill="${col}" stroke="var(--bg0)" stroke-width="1.5"
      style="cursor:pointer"
      onmouseenter="BT_showTooltip(event,'${p.lbl}','${_btFmtShort(p.val)}')"
      onmouseleave="BT_hideTooltip()"/>`;
  }).join('');

  /* accentColor برای gradient */
  const acColor=_btChartMode==='balance'?'var(--accent)':'#22d47a';

  return `<div class="sec">نمودار موجودی
    <div class="bt-chart-toggle" style="margin-right:auto">
      <div class="bt-ctbtn ${_btChartMode==='balance'?'active':''}" onclick="BT_setChartMode('balance')">موجودی</div>
      <div class="bt-ctbtn ${_btChartMode==='flow'?'active':''}" onclick="BT_setChartMode('flow')">جریان</div>
    </div>
  </div>
  <div class="bt-linechart-wrap">
    <div class="bt-linechart-container">
      <svg class="bt-linechart-svg" viewBox="0 0 ${W} ${H}" id="bt-lc-svg">
        <defs>
          <linearGradient id="btAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${acColor}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${acColor}" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${yLabels}
        ${xLabels}
        <!-- area -->
        <path d="${areaD}" fill="url(#btAreaGrad)"/>
        <!-- line -->
        <path d="${d}" fill="none" stroke="${acColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- dots -->
        ${dots}
      </svg>
    </div>
  </div>`;
}

/* ══════════ نمودار ستونی ══════════ */
function _btBarChartHTML(txs){
  const days={};
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const k=d.toLocaleDateString('fa-IR',{month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'});
    days[k]={in:0,out:0,lbl:d.toLocaleDateString('fa-IR',{weekday:'short',timeZone:'Asia/Tehran'})};
  }
  txs.forEach(tx=>{
    if(_btDaysSince(tx.date)>7) return;
    const k=new Date(tx.date).toLocaleDateString('fa-IR',{month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'});
    if(!days[k]) return;
    if(tx.type==='واریز') days[k].in+=Number(tx.amount||0);
    else days[k].out+=Number(tx.amount||0);
  });
  const vals=Object.values(days);
  const maxV=Math.max(...vals.map(d=>Math.max(d.in,d.out)),1);
  const bars=vals.map(d=>`<div class="bt-bar-col">
    <div class="bt-bar-track">
      <div class="bt-bar-in"  style="height:${(d.in /maxV*100).toFixed(1)}%"></div>
      <div class="bt-bar-out" style="height:${(d.out/maxV*100).toFixed(1)}%"></div>
    </div>
    <div class="bt-bar-lbl">${d.lbl}</div>
  </div>`).join('');
  return `<div class="sec">نمودار ۷ روز</div>
  <div class="bt-chart-wrap">
    <div class="bt-chart-ttl">// DAILY FLOW
      <div class="bt-legend">
        <div class="bt-leg"><div class="bt-leg-dot" style="background:#22d47a"></div>واریز</div>
        <div class="bt-leg"><div class="bt-leg-dot" style="background:#ff4444"></div>برداشت</div>
      </div>
    </div>
    <div class="bt-bars">${bars}</div>
  </div>`;
}

/* ══════════ Heatmap فعالیت ۳۰ روز ══════════ */
function _btHeatmapHTML(){
  const counts={};
  _btTx.forEach(t=>{
    if(_btDaysSince(t.date)>30) return;
    const k=new Date(t.date).toLocaleDateString('fa-IR',{month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'});
    counts[k]=(counts[k]||0)+1;
  });
  const maxC=Math.max(...Object.values(counts),1);

  const cells=[];
  const dayLabels=['ش','ی','د','س','چ','پ','ج'];
  for(let i=29;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const k=d.toLocaleDateString('fa-IR',{month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'});
    const c=counts[k]||0;
    const alpha=(c/maxC*.85+.08).toFixed(2);
    cells.push(`<div class="bt-hm-cell" style="background:var(--accent);opacity:${alpha}" title="${k}: ${c} تراکنش"></div>`);
  }

  return `<div class="sec">فعالیت ۳۰ روز</div>
  <div class="bt-heatmap">
    <div class="bt-hm-labels">${dayLabels.map(l=>`<div class="bt-hm-lbl">${l}</div>`).join('')}</div>
    <div class="bt-hm-grid">${cells.join('')}</div>
  </div>`;
}

/* ══════════ تفکیک بانک ══════════ */
function _btBankBreakdownHTML(txs){
  const banks={};
  txs.forEach(tx=>{
    const b=tx.bank||'نامشخص';
    if(!banks[b]) banks[b]={count:0,in:0,out:0};
    banks[b].count++;
    if(tx.type==='واریز') banks[b].in+=Number(tx.amount||0);
    else banks[b].out+=Number(tx.amount||0);
  });
  const sorted=Object.entries(banks).sort((a,b)=>(b[1].in+b[1].out)-(a[1].in+a[1].out));
  const maxVol=(sorted[0]?.[1].in||0)+(sorted[0]?.[1].out||0)||1;
  const rows=sorted.map(([name,b])=>{
    const vol=b.in+b.out;
    const cols=_btBankColors(name);
    return`<div class="bt-bank-row">
      <div class="bt-bank-name">🏦 ${_btEsc(name)}</div>
      <div class="bt-bank-bar-wrap"><div class="bt-bank-bar-fill" style="width:${(vol/maxVol*100).toFixed(1)}%;background:${cols[1]}"></div></div>
      <div class="bt-bank-meta">${b.count} tx · ${_btFmtShort(vol)}</div>
    </div>`;
  }).join('');
  return `<div class="sec">تفکیک بانک</div>${rows}`;
}

/* ══════════ TOOLTIP ══════════ */
function BT_showTooltip(e, date, val){
  const tt=document.getElementById('bt-tooltip');
  if(!tt) return;
  tt.innerHTML=`<span style="color:var(--text3)">${date}</span><br><span style="color:var(--accent);font-weight:700">${val} تومان</span>`;
  tt.style.left=(e.clientX+10)+'px';
  tt.style.top =(e.clientY-36)+'px';
  tt.classList.add('show');
}
function BT_hideTooltip(){
  document.getElementById('bt-tooltip')?.classList.remove('show');
}

/* ══════════ CHART BIND ══════════ */
function BT_bindLineChart(){
  /* چیز اضافه‌ای نیاز نیست — همه inline هندل شده */
}

/* ══════════ CARD 3D TILT ══════════ */
function BT_bindCardTilt(){
  document.querySelectorAll('.bt-vcard').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(600px) rotateX(${(-y*16).toFixed(1)}deg) rotateY(${(x*16).toFixed(1)}deg) translateZ(16px) scale(1.04)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
    });
  });
}
