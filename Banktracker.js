// ============================================================================
// 💳 BankTracker.js — ماژول ردیاب بانکی
// مثل Movies.js / Links.js / Stats.js لود میشه
// ============================================================================

/* ══════════ CONFIG ══════════ */
const BT_API = 'https://script.google.com/macros/s/AKfycbza2JeMqLyPi2qEe_dpQNFATN2T_yyUNpfITy3Lf66E8DZmSSXKefq1AhITXpzt30m_Zw/exec';

/* ══════════ STATE ══════════ */
let _btTx     = [];
let _btFilter = 'all';
let _btLoaded = false;

/* ══════════ INJECT CSS (یه بار) ══════════ */
(function BT_injectCSS(){
  if(document.getElementById('bt-style')) return;
  const s = document.createElement('style');
  s.id = 'bt-style';
  s.textContent = `
/* ── SUMMARY ── */
.bt-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:10px;}
.bt-sb{border-radius:13px;padding:11px 8px;background:var(--card);border:1px solid var(--card-b);text-align:center;position:relative;overflow:hidden;}
.bt-sb::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.bt-sb.bt-in::before{background:#22d47a;}
.bt-sb.bt-out::before{background:#ff4444;}
.bt-sb.bt-net::before{background:var(--accent3);}
.bt-sb-lbl{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);letter-spacing:1.5px;margin-bottom:4px;}
.bt-sb-val{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;line-height:1;}
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

/* ── CHART ── */
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

/* ══════════ HELPERS ══════════ */
function _btEsc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _btFmtShort(n){
  const v=Number(n||0);
  if(!v) return '—';
  if(v>=1e9)  return (v/1e9).toFixed(1)+'B';
  if(v>=1e6)  return (v/1e6).toFixed(1)+'M';
  if(v>=1000) return (v/1000).toFixed(0)+'K';
  return String(v);
}
function _btFmtFull(n){
  return Number(n||0).toLocaleString('fa-IR');
}
function _btFmtDate(raw){
  if(!raw) return '—';
  try{
    const d=new Date(raw);
    if(isNaN(d)) return String(raw);
    return d.toLocaleDateString('fa-IR',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'});
  }catch(e){return String(raw);}
}
function _btDaysSince(raw){
  try{return(Date.now()-new Date(raw))/86400000;}catch(e){return 999;}
}

/* ══════════ API FETCH ══════════ */
async function BT_load(){
  _btLoaded = false;
  const root = document.getElementById('bt-root');
  if(!root) return;
  root.innerHTML = `<div class="bt-spinner-wrap"><div class="bt-ring"></div><div class="bt-loading-txt">// LOADING TRANSACTIONS...</div></div>`;

  try{
    const res  = await fetch(BT_API + '?page=bank_data');
    const json = await res.json();
    if(json.ok && Array.isArray(json.data)){
      _btTx = json.data;
    } else {
      _btTx = _btDemoData();
      try{ showToast('⚠️ endpoint نیاز به تنظیم داره — داده نمونه'); }catch(e){}
    }
  } catch(e){
    _btTx = _btDemoData();
    try{ showToast('⚠️ خطا در اتصال — داده نمونه'); }catch(e2){}
  }

  _btLoaded = true;
  _btRender();
}

function BT_reload(){
  _btTx = [];
  BT_load();
  try{ showToast('🔄 در حال بروزرسانی...'); }catch(e){}
}

/* ══════════ DEMO DATA ══════════ */
function _btDemoData(){
  const banks=['ملت','صادرات','خاورمیانه','سامان','پاسارگاد'];
  const out=[];
  const now=Date.now();
  for(let i=0;i<25;i++){
    const type=Math.random()>.45?'واریز':'برداشت';
    const amount=(Math.floor(Math.random()*900)+100)*1000000;
    const d=new Date(now-Math.random()*30*86400000);
    out.push({
      date:d.toISOString(),
      bank:banks[Math.floor(Math.random()*banks.length)],
      card:String(Math.floor(Math.random()*9000)+1000),
      type, amount,
      balance:(Math.floor(Math.random()*5000)+500)*1000000,
      txDate:d.toLocaleDateString('fa-IR',{month:'2-digit',day:'2-digit'}),
      txTime:d.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',hour12:false})
    });
  }
  return out.sort((a,b)=>new Date(b.date)-new Date(a.date));
}

/* ══════════ FILTER ══════════ */
function _btFiltered(){
  return _btTx.filter(tx=>{
    if(_btFilter==='all')   return true;
    if(_btFilter==='in')    return tx.type==='واریز';
    if(_btFilter==='out')   return tx.type==='برداشت';
    if(_btFilter==='today') return _btDaysSince(tx.date)<1;
    if(_btFilter==='week')  return _btDaysSince(tx.date)<7;
    if(_btFilter==='month'){
      const d=new Date(tx.date),n=new Date();
      return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();
    }
    return true;
  });
}

function BT_setFilter(f,el){
  _btFilter=f;
  document.querySelectorAll('.bt-fp').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  _btRender();
  try{ haptic(6); }catch(e){}
}

/* ══════════ RENDER ══════════ */
function _btRender(){
  const root=document.getElementById('bt-root');
  if(!root) return;
  const txs=_btFiltered();

  let html='';

  // فیلترها
  html+=`
  <div class="bt-filters">
    <div class="bt-fp ${_btFilter==='all'   ?'active':''}" onclick="BT_setFilter('all',this)">همه</div>
    <div class="bt-fp ${_btFilter==='in'    ?'active':''}" onclick="BT_setFilter('in',this)">🟢 واریز</div>
    <div class="bt-fp ${_btFilter==='out'   ?'active':''}" onclick="BT_setFilter('out',this)">🔴 برداشت</div>
    <div class="bt-fp ${_btFilter==='today' ?'active':''}" onclick="BT_setFilter('today',this)">امروز</div>
    <div class="bt-fp ${_btFilter==='week'  ?'active':''}" onclick="BT_setFilter('week',this)">۷ روز</div>
    <div class="bt-fp ${_btFilter==='month' ?'active':''}" onclick="BT_setFilter('month',this)">این ماه</div>
  </div>`;

  // سامری
  let inSum=0,outSum=0;
  txs.forEach(t=>{ if(t.type==='واریز') inSum+=Number(t.amount||0); else outSum+=Number(t.amount||0); });
  const net=inSum-outSum;
  html+=`
  <div class="bt-summary">
    <div class="bt-sb bt-in">
      <div class="bt-sb-lbl">واریز</div>
      <div class="bt-sb-val">${_btFmtShort(inSum)}</div>
      <div class="bt-sb-unit">ریال</div>
    </div>
    <div class="bt-sb bt-out">
      <div class="bt-sb-lbl">برداشت</div>
      <div class="bt-sb-val">${_btFmtShort(outSum)}</div>
      <div class="bt-sb-unit">ریال</div>
    </div>
    <div class="bt-sb bt-net">
      <div class="bt-sb-lbl">خالص</div>
      <div class="bt-sb-val ${net>=0?'pos':'neg'}">${net>=0?'+':'−'}${_btFmtShort(Math.abs(net))}</div>
      <div class="bt-sb-unit">ریال</div>
    </div>
  </div>`;

  if(!txs.length){
    html+=`<div class="bt-empty"><div style="font-size:32px;margin-bottom:8px;opacity:.3">💳</div>// هیچ تراکنشی پیدا نشد<br>فیلتر رو تغییر بده</div>`;
    root.innerHTML=html; return;
  }

  // نمودار ۷ روز
  if(['all','week','month'].includes(_btFilter)) html+=_btChartHTML(txs);

  // تفکیک بانک
  html+=_btBankHTML(txs);

  // لیست تراکنش‌ها
  html+=`<div class="sec">تراکنش‌ها (${txs.length})</div>`;
  txs.forEach((tx,i)=>{
    const isIn=tx.type==='واریز';
    html+=`
    <div class="bt-tx ${isIn?'in':'out'} stagger-item" style="animation-delay:${(i*0.04).toFixed(2)}s">
      <div class="bt-tx-icon">${isIn?'⬆️':'⬇️'}</div>
      <div class="bt-tx-body">
        <div class="bt-tx-top">
          <span class="bt-tx-bank">🏦 ${_btEsc(tx.bank||'نامشخص')}</span>
          <span class="bt-tx-amount">${isIn?'+':'−'}${_btFmtFull(tx.amount)} ﷼</span>
        </div>
        <div class="bt-tx-bottom">
          ${tx.card?`<span class="bt-chip card">****${_btEsc(tx.card)}</span>`:''}
          <span class="bt-chip">${_btFmtDate(tx.date)}</span>
          ${tx.txTime?`<span class="bt-chip">⏰ ${_btEsc(tx.txTime)}</span>`:''}
          ${tx.balance?`<span class="bt-bal">مانده: ${_btFmtShort(tx.balance)}</span>`:''}
        </div>
      </div>
    </div>`;
  });

  root.innerHTML=html;
}

/* ── نمودار ۷ روز ── */
function _btChartHTML(txs){
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
  const bars=vals.map(d=>`
    <div class="bt-bar-col">
      <div class="bt-bar-track">
        <div class="bt-bar-in"  style="height:${(d.in /maxV*100).toFixed(1)}%"></div>
        <div class="bt-bar-out" style="height:${(d.out/maxV*100).toFixed(1)}%"></div>
      </div>
      <div class="bt-bar-lbl">${d.lbl}</div>
    </div>`).join('');
  return `
  <div class="sec">نمودار ۷ روز</div>
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

/* ── تفکیک بانک ── */
function _btBankHTML(txs){
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
    return`<div class="bt-bank-row">
      <div class="bt-bank-name">🏦 ${_btEsc(name)}</div>
      <div class="bt-bank-bar-wrap"><div class="bt-bank-bar-fill" style="width:${(vol/maxVol*100).toFixed(1)}%"></div></div>
      <div class="bt-bank-meta">${b.count} tx · ${_btFmtShort(vol)}</div>
    </div>`;
  }).join('');
  return `<div class="sec">تفکیک بانک</div>${rows}`;
}
