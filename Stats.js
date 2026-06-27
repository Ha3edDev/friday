/* ═══════════════════════════════════════════════════════════════
   STATS.JS — F.R.I.D.A.Y Analytics Engine v3
   New: heat map, leaderboard, gender×risk, CSV export,
        animated counters, fixed gauge, better avatars
═══════════════════════════════════════════════════════════════ */

/* ── D3 loader ── */
(function(){
  if(window.d3)return;
  const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js';
  document.head.appendChild(s);
})();

/* ══════ UTILS ══════ */
function pct(a,b){return b?Math.round((a/b)*100):0;}

function riskColor(v){
  const n=parseFloat(v)||0;
  if(n<=0)return'var(--text3)';
  if(n<1.75)return'#2a9060';
  if(n<2.5)return'#c09020';
  if(n<3.25)return'#c05030';
  return'#c03030';
}
function riskLabel(v){
  const n=parseFloat(v)||0;
  if(n<=0)return'—';
  if(n<1.75)return'محافظه‌کار';
  if(n<2.5)return'متعادل';
  if(n<3.25)return'ریسک‌پذیر';
  return'جسور';
}
function riskEmoji(v){
  const n=parseFloat(v)||0;
  if(n<=0)return'◌';
  if(n<1.75)return'🟢';
  if(n<2.5)return'🟡';
  if(n<3.25)return'🟠';
  return'🔴';
}
function parseIranDate(str){
  if(!str)return null;
  try{const d=new Date(str);if(!isNaN(d))return d;}catch(e){}
  return null;
}
function stdDev(arr){
  if(!arr.length)return 0;
  const m=arr.reduce((a,b)=>a+b,0)/arr.length;
  return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length);
}
function median(arr){
  if(!arr.length)return 0;
  const s=[...arr].sort((a,b)=>a-b);
  const m=Math.floor(s.length/2);
  return s.length%2?s[m]:(s[m-1]+s[m])/2;
}

/* animated counter */
function animateCount(el,target,duration=800){
  if(!el)return;
  const start=performance.now();
  const from=parseFloat(el.textContent)||0;
  function step(now){
    const p=Math.min((now-start)/duration,1);
    const ease=1-Math.pow(1-p,3);
    const val=from+(target-from)*ease;
    el.textContent=Number.isInteger(target)?Math.round(val).toLocaleString('en-US'):val.toFixed(2);
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* section wrapper */
function section(id,title,inner,subtitle=''){
  return`<div class="s3-section" id="sec-${id}">
    <div class="s3-sec-head">
      <div class="s3-sec-dot"></div>
      <div>
        <div class="s3-sec-title">${title}</div>
        ${subtitle?`<div class="s3-sec-sub">${subtitle}</div>`:''}
      </div>
      <div class="s3-sec-line"></div>
    </div>
    ${inner}
  </div>`;
}

function waitD3(cb,tries=0){
  if(window.d3){cb();return;}
  if(tries>40)return;
  setTimeout(()=>waitD3(cb,tries+1),100);
}

/* ══════ RELOAD ══════ */
function reloadStats(){
  loadedPages.stats=false;
  document.getElementById('statsMain').innerHTML=
    '<div class="stats-spinner-wrap"><div class="stats-ring"></div><div class="stats-loading-txt">// RECONNECTING...</div></div>';
  loadStats();
}

/* ══════ EXPORT CSV ══════ */
function exportCSV(){
  if(!window._tblRows||!window._tblRows.length){showToast('داده‌ای برای خروجی نیست');return;}
  const rows=window._tblRows;
  const headers=['نام','سن','جنسیت','استان','ریسک','پروفایل','کوهورت','منبع','تاریخ'];
  const lines=[headers.join(',')];
  rows.forEach(r=>{
    lines.push([
      `"${r.name||''}"`,r.age||'',`"${r.gender||''}"`,`"${r.province||''}"`,
      r.risk||'',`"${cleanProfile(r.profile)||''}"`,`"${r.cohort||''}"`,
      `"${r.source||''}"`,`"${r.date||''}"`
    ].join(','));
  });
  const blob=new Blob(['\uFEFF'+lines.join('\n')],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='friday_stats.csv';a.click();
  URL.revokeObjectURL(url);
  showToast('📥 CSV دانلود شد');
}

/* ══════ MAIN LOAD ══════ */
async function BS_load(){
  await loadStats();
}

async function loadStats(){
  const[sd,fd]=await Promise.all([
    apiStatsFetch('stats_data'),
    apiStatsFetch('stats_full')
  ]);
  const el=document.getElementById('statsMain');
  if(!sd&&!fd){el.innerHTML='<div class="empty">// داده‌ای یافت نشد</div>';return;}

  const raw=(fd&&fd.rows)?fd.rows:[];
  const rows=raw.map(r=>parseRow(r));
  const total=sd?.total||rows.length||0;
  const week=sd?.week||0;
  const today=sd?.today||0;

  /* risk */
  const riskRows=rows.filter(r=>r.risk>0);
  const riskVals=riskRows.map(r=>r.risk);
  const avgRisk=riskVals.length?parseFloat((riskVals.reduce((s,v)=>s+v,0)/riskVals.length).toFixed(2)):0;
  const medRisk=parseFloat(median(riskVals).toFixed(2));
  const sdRisk=parseFloat(stdDev(riskVals).toFixed(2));
  const riskDist={
    low:riskVals.filter(v=>v<1.75).length,
    mid:riskVals.filter(v=>v>=1.75&&v<2.5).length,
    high:riskVals.filter(v=>v>=2.5&&v<3.25).length,
    very:riskVals.filter(v=>v>=3.25).length,
  };

  /* time */
  const allTimes=[];
  rows.forEach(r=>{if(r.answers)r.answers.forEach(a=>{if(a.time&&a.time>0)allTimes.push(a.time);});});
  const avgTime=allTimes.length?Math.round(allTimes.reduce((a,b)=>a+b,0)/allTimes.length):0;
  const minTime=allTimes.length?Math.round(Math.min(...allTimes)):0;
  const maxTime=allTimes.length?Math.round(Math.max(...allTimes)):0;

  /* dates */
  const byDay={},byHour=Array(24).fill(0),byWeekday=Array(7).fill(0);
  rows.forEach(r=>{
    const d=parseIranDate(r.date);if(!d)return;
    const key=d.toISOString().slice(0,10);
    byDay[key]=(byDay[key]||0)+1;
    byHour[d.getHours()]++;
    byWeekday[d.getDay()]++;
  });

  /* geo */
  const provMap={},provRisk={};
  rows.forEach(r=>{if(!r.province)return;provMap[r.province]=(provMap[r.province]||0)+1;});
  riskRows.forEach(r=>{if(!r.province)return;if(!provRisk[r.province])provRisk[r.province]=[];provRisk[r.province].push(r.risk);});
  const topProv=Object.entries(provMap).sort((a,b)=>b[1]-a[1]);

  /* gender */
  const genderMap={};
  rows.forEach(r=>{if(r.gender)genderMap[r.gender]=(genderMap[r.gender]||0)+1;});

  /* gender × risk */
  const genderRisk={};
  riskRows.forEach(r=>{
    const g=r.gender||'نامشخص';
    if(!genderRisk[g])genderRisk[g]=[];
    genderRisk[g].push(r.risk);
  });

  /* age */
  const ageGroups={'۱۸-۲۵':0,'۲۶-۳۵':0,'۳۶-۴۵':0,'۴۶-۵۵':0,'۵۶+':0};
  rows.forEach(r=>{
    const a=parseInt(r.age);if(!a)return;
    if(a<=25)ageGroups['۱۸-۲۵']++;
    else if(a<=35)ageGroups['۲۶-۳۵']++;
    else if(a<=45)ageGroups['۳۶-۴۵']++;
    else if(a<=55)ageGroups['۴۶-۵۵']++;
    else ageGroups['۵۶+']++;
  });

  /* source */
  const srcMap={},srcRisk={};
  rows.forEach(r=>{const s=r.source||'مستقیم';srcMap[s]=(srcMap[s]||0)+1;});
  riskRows.forEach(r=>{const s=r.source||'مستقیم';if(!srcRisk[s])srcRisk[s]=[];srcRisk[s].push(r.risk);});

  /* avatar */
  const avMap={};
  rows.forEach(r=>{if(r.avatar)avMap[r.avatar]=(avMap[r.avatar]||0)+1;});
  const topAv=Object.entries(avMap).sort((a,b)=>b[1]-a[1]);

  /* profile */
  const profMap={};
  rows.forEach(r=>{const p=cleanProfile(r.profile);if(p)profMap[p]=(profMap[p]||0)+1;});

  /* cohort */
  const cohortMap={};
  rows.forEach(r=>{if(r.cohort)cohortMap[r.cohort]=(cohortMap[r.cohort]||0)+1;});

  /* questions — from raw sheet format */
  const qStatsMap={};
  if(raw.length&&raw[0]){
    Object.keys(raw[0]).forEach(key=>{
      const m=key.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);
      if(m){const qId=parseInt(m[1]);if(!qStatsMap[qId])qStatsMap[qId]={id:qId,answers:{},times:[]};}
    });
    raw.forEach(rawRow=>{
      Object.keys(qStatsMap).forEach(qId=>{
        const qn=parseInt(qId);
        const ansKey=Object.keys(rawRow).find(k=>{const m=k.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);return m&&parseInt(m[1])===qn;});
        const timeKey=Object.keys(rawRow).find(k=>{const m=k.trim().match(/^س(\d+)\s*[–\-]\s*زمان$/);return m&&parseInt(m[1])===qn;});
        if(ansKey){const ans=String(rawRow[ansKey]||'').trim();if(ans)qStatsMap[qId].answers[ans]=(qStatsMap[qId].answers[ans]||0)+1;}
        if(timeKey){const t=parseFloat(rawRow[timeKey]||0);if(t>0)qStatsMap[qId].times.push(t);}
      });
    });
  }
  /* also parse from new API format answers array */
  if(!Object.keys(qStatsMap).length&&rows.length){
    rows.forEach(r=>{
      if(!r.answers)return;
      r.answers.forEach(a=>{
        if(!qStatsMap[a.qId])qStatsMap[a.qId]={id:a.qId,answers:{},times:[]};
        if(a.answer)qStatsMap[a.qId].answers[a.answer]=(qStatsMap[a.qId].answers[a.answer]||0)+1;
        if(a.time&&a.time>0)qStatsMap[a.qId].times.push(a.time);
      });
    });
  }
  const qList=Object.values(qStatsMap).sort((a,b)=>a.id-b.id);

  /* leaderboard */
  const topRisk=[...riskRows].sort((a,b)=>b.risk-a.risk).slice(0,5);
  const lowRisk=[...riskRows].sort((a,b)=>a.risk-b.risk).slice(0,5);

  /* age×risk */
  const ageRiskData=rows.filter(r=>r.risk>0&&parseInt(r.age)>0).map(r=>({age:parseInt(r.age),risk:r.risk}));

  const peakHour=byHour.indexOf(Math.max(...byHour));

  /* ══ INJECT STYLES ══ */
  el.innerHTML=`
<style>
/* ── base ── */
.s3-section{margin-bottom:20px;}
.s3-sec-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.s3-sec-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;}
.s3-sec-title{font-family:'Space Mono',monospace;font-size:9px;color:var(--text1);letter-spacing:2px;text-transform:uppercase;font-weight:700;}
.s3-sec-sub{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:1px;margin-top:1px;}
.s3-sec-line{flex:1;height:1px;background:var(--border);}

/* ── intel capsules ── */
.s3-intel{display:flex;flex-direction:column;gap:7px;}
.s3-ic{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;background:var(--card);border:1px solid var(--card-b);box-shadow:0 1px 6px rgba(0,0,0,.04);transition:transform .2s;}
.s3-ic:active{transform:scale(.98);}
.s3-ic-icon{font-size:18px;flex-shrink:0;width:26px;text-align:center;}
.s3-ic-body{flex:1;min-width:0;}
.s3-ic-label{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;}
.s3-ic-main{font-size:12px;color:var(--text1);line-height:1.4;font-weight:500;}
.s3-ic-main strong{color:var(--accent);font-weight:700;}
.s3-ic-badge{flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:7.5px;padding:3px 9px;border-radius:999px;background:var(--surface2);border:1px solid var(--border);color:var(--text2);}
.s3-ic-badge.g{background:rgba(42,144,96,.1);border-color:rgba(42,144,96,.2);color:#2a9060;}
.s3-ic-badge.r{background:rgba(192,48,48,.1);border-color:rgba(192,48,48,.2);color:#c03030;}
.s3-ic-badge.y{background:rgba(192,144,32,.1);border-color:rgba(192,144,32,.2);color:#c09020;}

/* ── KPI row ── */
.s3-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;}
.s3-kpi-card{border-radius:14px;padding:14px 10px;background:var(--card);border:1px solid var(--card-b);text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.04);position:relative;overflow:hidden;}
.s3-kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent);opacity:.4;}
.s3-kpi-lbl{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);letter-spacing:1.5px;margin-bottom:5px;}
.s3-kpi-val{font-family:'Space Mono',monospace;font-size:24px;font-weight:700;color:var(--accent);line-height:1;}
.s3-kpi-sub{font-size:7px;color:var(--text2);margin-top:3px;}

/* ── gauge ── */
.s3-gauge-wrap{background:var(--card);border:1px solid var(--card-b);border-radius:16px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-gauge-label{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:2px;text-align:center;margin-bottom:8px;}
.s3-gauge-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:12px;}
.s3-gs{padding:10px;border-radius:11px;background:var(--bg2);border:1px solid var(--border);text-align:center;}
.s3-gs-val{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;line-height:1;}
.s3-gs-lbl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);margin-top:3px;letter-spacing:1px;}

/* ── risk dist ── */
.s3-rdist{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;}
.s3-rd{padding:10px 6px;border-radius:12px;text-align:center;border:1px solid;}
.s3-rd.low{background:rgba(42,144,96,.08);border-color:rgba(42,144,96,.2);}
.s3-rd.mid{background:rgba(192,144,32,.08);border-color:rgba(192,144,32,.2);}
.s3-rd.high{background:rgba(192,80,48,.08);border-color:rgba(192,80,48,.2);}
.s3-rd.very{background:rgba(192,48,48,.08);border-color:rgba(192,48,48,.2);}
.s3-rd-num{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;line-height:1;}
.s3-rd.low .s3-rd-num{color:#2a9060;}.s3-rd.mid .s3-rd-num{color:#c09020;}
.s3-rd.high .s3-rd-num{color:#c05030;}.s3-rd.very .s3-rd-num{color:#c03030;}
.s3-rd-lbl{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:2px;}
.s3-rd-pct{font-size:7px;font-family:'JetBrains Mono',monospace;margin-top:1px;}
.s3-rd.low .s3-rd-pct{color:#2a9060;}.s3-rd.mid .s3-rd-pct{color:#c09020;}
.s3-rd.high .s3-rd-pct{color:#c05030;}.s3-rd.very .s3-rd-pct{color:#c03030;}

/* ── avatar grid ── */
.s3-av-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.s3-av-card{border-radius:16px;padding:14px 10px 12px;background:var(--card);border:1px solid var(--card-b);text-align:center;position:relative;box-shadow:0 2px 10px rgba(0,0,0,.05);transition:transform .2s,box-shadow .2s;}
.s3-av-card.top{border-color:var(--accent);}
.s3-av-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.1);}
.s3-av-crown{position:absolute;top:6px;right:8px;font-size:11px;}
.s3-av-ring{position:relative;width:60px;height:60px;margin:0 auto 8px;}
.s3-av-ring svg{position:absolute;top:0;left:0;width:60px;height:60px;transform:rotate(-90deg);}
.s3-av-img{width:44px;height:44px;border-radius:10px;image-rendering:pixelated;position:absolute;top:8px;left:8px;}
.s3-av-fb{width:44px;height:44px;border-radius:10px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:22px;position:absolute;top:8px;left:8px;}
.s3-av-name{font-size:9.5px;font-weight:700;color:var(--text1);}
.s3-av-cnt{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:var(--accent);line-height:1;margin-top:2px;}
.s3-av-pct{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

/* ── geo ── */
.s3-geo{display:flex;flex-direction:column;gap:5px;}
.s3-geo-row{display:flex;align-items:center;gap:7px;padding:9px 11px;border-radius:11px;background:var(--card);border:1px solid var(--card-b);box-shadow:0 1px 4px rgba(0,0,0,.03);}
.s3-geo-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:16px;flex-shrink:0;}
.s3-geo-name{font-size:10px;color:var(--text1);width:68px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.s3-geo-bar-wrap{flex:1;}
.s3-geo-track{height:5px;background:var(--bg2);border-radius:3px;overflow:hidden;}
.s3-geo-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.22,1,.36,1);}
.s3-geo-cnt{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--accent);width:20px;text-align:left;flex-shrink:0;font-weight:700;}
.s3-geo-badge{font-family:'JetBrains Mono',monospace;font-size:7px;padding:2px 7px;border-radius:999px;flex-shrink:0;font-weight:700;}

/* ── source ── */
.s3-src-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;}
.s3-src-card{padding:12px;border-radius:13px;background:var(--card);border:1px solid var(--card-b);position:relative;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-src-bar{position:absolute;top:0;left:0;right:0;height:2.5px;}
.s3-src-name{font-size:10px;font-weight:700;color:var(--text1);margin-bottom:4px;}
.s3-src-num{font-family:'Space Mono',monospace;font-size:26px;font-weight:700;line-height:1;}
.s3-src-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-top:1px;}
.s3-src-risk{display:flex;align-items:center;gap:4px;margin-top:7px;}

/* ── demo ── */
.s3-demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.s3-demo-card{padding:12px;border-radius:13px;background:var(--card);border:1px solid var(--card-b);box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-demo-title{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:10px;}
.s3-demo-row{display:flex;align-items:center;gap:5px;margin-bottom:6px;}
.s3-demo-lbl{font-size:9px;color:var(--text2);width:40px;flex-shrink:0;}
.s3-demo-track{flex:1;height:5px;background:var(--bg2);border-radius:3px;overflow:hidden;}
.s3-demo-fill{height:100%;border-radius:3px;}
.s3-demo-val{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:22px;text-align:left;flex-shrink:0;}

/* ── gender × risk ── */
.s3-gr-row{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--card-b);margin-bottom:6px;}
.s3-gr-icon{font-size:16px;width:22px;text-align:center;flex-shrink:0;}
.s3-gr-info{flex:1;}
.s3-gr-name{font-size:10px;font-weight:700;color:var(--text1);}
.s3-gr-bar-wrap{flex:2;}
.s3-gr-track{height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;}
.s3-gr-fill{height:100%;border-radius:3px;transition:width .8s;}
.s3-gr-val{font-family:'Space Mono',monospace;font-size:12px;font-weight:700;flex-shrink:0;width:30px;text-align:left;}

/* ── heatmap ── */
.s3-hmap{display:grid;grid-template-columns:repeat(24,1fr);gap:2px;margin-top:6px;}
.s3-hmap-cell{aspect-ratio:1;border-radius:3px;cursor:default;transition:transform .15s;}
.s3-hmap-cell:hover{transform:scale(1.3);}
.s3-hmap-labels{display:flex;justify-content:space-between;margin-top:4px;}
.s3-hmap-lbl{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);}

/* ── leaderboard ── */
.s3-lb-row{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:12px;background:var(--card);border:1px solid var(--card-b);margin-bottom:6px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-lb-row:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.09);}
.s3-lb-rank{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:var(--text3);width:22px;flex-shrink:0;}
.s3-lb-rank.gold{color:#c09020;}.s3-lb-rank.silver{color:#888;}.s3-lb-rank.bronze{color:#a06030;}
.s3-lb-av{flex-shrink:0;}
.s3-lb-info{flex:1;min-width:0;}
.s3-lb-name{font-size:10px;font-weight:700;color:var(--text1);}
.s3-lb-meta{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:1px;}
.s3-lb-risk{font-family:'Space Mono',monospace;font-size:14px;font-weight:700;flex-shrink:0;}

/* ── questions ── */
.s3-q-card{padding:13px;border-radius:14px;background:var(--card);border:1px solid var(--card-b);margin-bottom:8px;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-q-head{display:flex;align-items:center;gap:7px;margin-bottom:10px;flex-wrap:wrap;}
.s3-q-id{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);background:var(--surface2);padding:2px 8px;border-radius:999px;border:1px solid var(--border);}
.s3-q-time{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--accent3);background:var(--surface);padding:2px 7px;border-radius:999px;border:1px solid var(--border);}
.s3-q-total{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-right:auto;}
.s3-q-dom{font-size:7px;color:#2a9060;font-family:'JetBrains Mono',monospace;background:rgba(42,144,96,.08);border:1px solid rgba(42,144,96,.18);padding:2px 7px;border-radius:999px;}
.s3-q-row{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.s3-q-lbl{font-size:9px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.s3-q-track{width:72px;flex-shrink:0;height:5px;background:var(--bg2);border-radius:3px;overflow:hidden;}
.s3-q-fill{height:100%;border-radius:3px;background:var(--accent);}
.s3-q-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:28px;text-align:left;flex-shrink:0;}
.s3-q-cnt{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--accent);width:18px;flex-shrink:0;font-weight:700;}

/* ── profiles ── */
.s3-prof-row{display:flex;align-items:center;gap:7px;padding:9px 11px;border-radius:11px;background:var(--card);border:1px solid var(--card-b);margin-bottom:5px;}
.s3-prof-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:16px;flex-shrink:0;}
.s3-prof-lbl{font-size:10px;color:var(--text1);width:78px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.s3-prof-track{flex:1;height:5px;background:var(--bg2);border-radius:3px;overflow:hidden;}
.s3-prof-fill{height:100%;border-radius:3px;background:var(--accent);}
.s3-prof-cnt{font-family:'Space Mono',monospace;font-size:9px;color:var(--accent);width:22px;text-align:left;flex-shrink:0;font-weight:700;}
.s3-prof-pct{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;width:28px;flex-shrink:0;}

/* ── cohort ── */
.s3-co-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:7px;}
.s3-co-card{padding:11px;border-radius:13px;background:var(--card);border:1px solid var(--card-b);text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-co-name{font-size:8.5px;color:var(--text2);margin-bottom:4px;font-family:'JetBrains Mono',monospace;}
.s3-co-num{font-family:'Space Mono',monospace;font-size:24px;font-weight:700;color:var(--accent);line-height:1;}
.s3-co-risk{font-size:7px;font-family:'JetBrains Mono',monospace;margin-top:4px;}

/* ── speed ── */
.s3-spd{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:10px;}
.s3-spd-card{padding:12px;border-radius:13px;background:var(--card);border:1px solid var(--card-b);text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.s3-spd-val{font-family:'Space Mono',monospace;font-size:20px;font-weight:700;line-height:1;}
.s3-spd-lbl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);margin-top:3px;}

/* ── table ── */
.s3-tbl-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px;align-items:center;}
.s3-tbl-search{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:8px 12px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:11px;outline:none;flex:1;min-width:130px;transition:border-color .2s;}
.s3-tbl-search::placeholder{color:var(--text3);}
.s3-tbl-search:focus{border-color:var(--accent);}
.s3-tbl-select{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:7px 9px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;}
.s3-tbl-cnt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
.s3-tbl-wrap{overflow-x:auto;border-radius:13px;border:1px solid var(--border);}
.s3-tbl-wrap table{width:100%;border-collapse:collapse;font-size:10px;}
.s3-tbl-wrap th{background:var(--bg2);color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:1px;padding:9px 8px;text-align:right;border-bottom:1px solid var(--border);white-space:nowrap;cursor:pointer;user-select:none;transition:color .2s;}
.s3-tbl-wrap th:hover{color:var(--accent);}
.s3-tbl-wrap th.asc::after{content:' ↑';}.s3-tbl-wrap th.desc::after{content:' ↓';}
.s3-tbl-wrap td{padding:7px 8px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--text2);}
.s3-tbl-wrap tr:last-child td{border-bottom:none;}
.s3-tbl-wrap tr:hover td{background:var(--surface);}
.s3-td-name{color:var(--text1);font-weight:600;white-space:nowrap;}
.s3-td-date{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);}
.s3-pager{display:flex;gap:4px;justify-content:center;margin-top:10px;flex-wrap:wrap;}
.s3-pb{background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:9px;padding:4px 10px;cursor:pointer;transition:all .2s;}
.s3-pb:hover,.s3-pb.active{background:var(--accent);border-color:var(--accent);color:var(--bg0);}

/* ── export btn ── */
.s3-export-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;background:var(--card);border:1px solid var(--border);border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text2);cursor:pointer;transition:all .2s;}
.s3-export-btn:hover{border-color:var(--accent);color:var(--accent);}

/* ── timeline ── */
.s3-tl-wrap{width:100%;overflow-x:auto;}

/* ── seg ── */
.s3-seg-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
.s3-seg-sel{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:7px 10px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;flex:1;min-width:90px;}
.s3-seg-result{padding:14px;border-radius:13px;background:var(--card);border:1px solid var(--card-b);}
.s3-seg-num{font-family:'Space Mono',monospace;font-size:36px;font-weight:700;color:var(--accent);line-height:1;}

/* ── scatter ── */
.s3-sc-wrap{width:100%;overflow-x:auto;}
</style>

${buildS3Intel(rows,total,week,today,avgRisk,topProv,peakHour,riskDist)}
${buildS3KPI(total,week,today)}
${buildS3Gauge(avgRisk,medRisk,sdRisk,riskDist,riskVals)}
${buildS3Timeline(byDay)}
${buildS3Heatmap(byHour)}
${buildS3Geo(topProv,provRisk,total)}
${buildS3GenderRisk(genderRisk,genderMap)}
${buildS3Leaderboard(topRisk,lowRisk)}
${buildS3Source(srcMap,srcRisk,total)}
${buildS3Demo(genderMap,ageGroups,total)}
${ageRiskData.length>3?buildS3Scatter(ageRiskData):''}
${buildS3Seg(rows)}
${allTimes.length?buildS3Speed(avgTime,minTime,maxTime,allTimes):''}
${buildS3Questions(qList)}
${buildS3Avatars(topAv,total)}
${Object.keys(profMap).length?buildS3Profiles(profMap,total):''}
${Object.keys(cohortMap).length?buildS3Cohort(cohortMap,rows):''}
${buildS3Table(rows)}
`;

  waitD3(()=>{
    drawS3Gauge(avgRisk);
    drawS3Timeline(byDay);
    if(ageRiskData.length>3)drawS3Scatter(ageRiskData);
  });

  /* animate counters */
  setTimeout(()=>{
    document.querySelectorAll('[data-count]').forEach(el=>{
      animateCount(el,parseFloat(el.dataset.count));
    });
  },100);

  window._tblRows={rows,sort:{col:'date',dir:-1},page:1,filtered:rows};
  s3FilterTable();
  s3InitSeg(rows);
}

/* ══ INTEL CAPSULES ══ */
function buildS3Intel(rows,total,week,today,avgRisk,topProv,peakHour,riskDist){
  const cards=[];
  cards.push(`<div class="s3-ic">
    <span class="s3-ic-icon">📊</span>
    <div class="s3-ic-body">
      <div class="s3-ic-label">TOTAL REPORT</div>
      <div class="s3-ic-main"><strong>${total}</strong> شرکت‌کننده — این هفته <strong>${week}</strong> نفر جدید</div>
    </div>
    ${today>0?`<div class="s3-ic-badge g">+${today} امروز</div>`:''}
  </div>`);

  if(topProv[0]){
    const[name,cnt]=topProv[0];
    cards.push(`<div class="s3-ic">
      <span class="s3-ic-icon">📍</span>
      <div class="s3-ic-body">
        <div class="s3-ic-label">GEO INTEL</div>
        <div class="s3-ic-main">پرتراکم: <strong>${name}</strong> با ${cnt} نفر (${pct(cnt,total)}٪)</div>
      </div>
      <div class="s3-ic-badge">${topProv.length} استان</div>
    </div>`);
  }

  if(avgRisk>0){
    const cls=avgRisk<1.75?'g':avgRisk<2.5?'y':'r';
    cards.push(`<div class="s3-ic">
      <span class="s3-ic-icon">${riskEmoji(avgRisk)}</span>
      <div class="s3-ic-body">
        <div class="s3-ic-label">RISK PROFILE</div>
        <div class="s3-ic-main">میانگین ریسک <strong>${avgRisk}</strong> — ${riskLabel(avgRisk)}</div>
      </div>
      <div class="s3-ic-badge ${cls}">${riskDist.low}🟢 ${riskDist.mid}🟡 ${riskDist.high}🟠 ${riskDist.very}🔴</div>
    </div>`);
  }

  if(peakHour>=0){
    cards.push(`<div class="s3-ic">
      <span class="s3-ic-icon">⏰</span>
      <div class="s3-ic-body">
        <div class="s3-ic-label">PEAK ACTIVITY</div>
        <div class="s3-ic-main">اوج فعالیت ساعت <strong>${peakHour}:00</strong> — ${peakHour<12?'صبح':peakHour<17?'بعدازظهر':'شب'}</div>
      </div>
    </div>`);
  }

  const male=rows.filter(r=>r.gender==='مرد').length;
  const female=rows.filter(r=>r.gender==='زن').length;
  if(male&&female){
    const dom=male>female?'مردان':'زنان';
    const domN=Math.max(male,female);
    cards.push(`<div class="s3-ic">
      <span class="s3-ic-icon">👥</span>
      <div class="s3-ic-body">
        <div class="s3-ic-label">DEMOGRAPHIC</div>
        <div class="s3-ic-main"><strong>${dom}</strong> اکثریت — ${domN} از ${total} (${pct(domN,total)}٪)</div>
      </div>
    </div>`);
  }

  return section('intel','// INTEL FEED',`<div class="s3-intel">${cards.join('')}</div>`);
}

/* ══ KPI ══ */
function buildS3KPI(total,week,today){
  return section('kpi','شاخص‌های کلیدی','','')+`
  <div class="s3-kpi" style="margin-top:-8px">
    <div class="s3-kpi-card">
      <div class="s3-kpi-lbl">TOTAL</div>
      <div class="s3-kpi-val" data-count="${total}">0</div>
      <div class="s3-kpi-sub">شرکت‌کننده</div>
    </div>
    <div class="s3-kpi-card" style="--accent:var(--accent2)">
      <div class="s3-kpi-lbl">THIS WEEK</div>
      <div class="s3-kpi-val" data-count="${week}" style="color:var(--accent2)">0</div>
      <div class="s3-kpi-sub">این هفته</div>
    </div>
    <div class="s3-kpi-card" style="--accent:var(--accent3)">
      <div class="s3-kpi-lbl">TODAY</div>
      <div class="s3-kpi-val" data-count="${today}" style="color:var(--accent3)">0</div>
      <div class="s3-kpi-sub">امروز</div>
    </div>
  </div>`;
}

/* ══ GAUGE ══ */
function buildS3Gauge(avgRisk,medRisk,sdRisk,riskDist,riskVals){
  const t=riskVals.length||1;
  return section('risk','تحلیل ریسک','// Risk Score 1–4',`
    <div class="s3-gauge-wrap">
      <div class="s3-gauge-label">// RISK GAUGE · میانگین: ${avgRisk}</div>
      <svg id="s3-gauge-svg" width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet"></svg>
      <div class="s3-gauge-stats">
        <div class="s3-gs"><div class="s3-gs-val" style="color:var(--accent)" data-count="${avgRisk}">0</div><div class="s3-gs-lbl">AVERAGE</div></div>
        <div class="s3-gs"><div class="s3-gs-val" style="color:var(--accent2)" data-count="${medRisk}">0</div><div class="s3-gs-lbl">MEDIAN</div></div>
        <div class="s3-gs"><div class="s3-gs-val" style="color:var(--accent3)" data-count="${sdRisk}">0</div><div class="s3-gs-lbl">STD DEV</div></div>
      </div>
    </div>
    <div class="s3-rdist">
      <div class="s3-rd low"><div class="s3-rd-num" data-count="${riskDist.low}">0</div><div class="s3-rd-lbl">محافظه‌کار</div><div class="s3-rd-pct">${pct(riskDist.low,t)}٪</div></div>
      <div class="s3-rd mid"><div class="s3-rd-num" data-count="${riskDist.mid}">0</div><div class="s3-rd-lbl">متعادل</div><div class="s3-rd-pct">${pct(riskDist.mid,t)}٪</div></div>
      <div class="s3-rd high"><div class="s3-rd-num" data-count="${riskDist.high}">0</div><div class="s3-rd-lbl">ریسک‌پذیر</div><div class="s3-rd-pct">${pct(riskDist.high,t)}٪</div></div>
      <div class="s3-rd very"><div class="s3-rd-num" data-count="${riskDist.very}">0</div><div class="s3-rd-lbl">جسور</div><div class="s3-rd-pct">${pct(riskDist.very,t)}٪</div></div>
    </div>
  `);
}

function drawS3Gauge(avgRisk){
  const svg=document.getElementById('s3-gauge-svg');
  if(!svg||!window.d3)return;
  const W=300,H=100,cx=150,cy=90,r=72;
  const col=riskColor(avgRisk);
  const startA=-Math.PI,endA=0;
  const pctVal=avgRisk>0?Math.min((avgRisk-1)/3,1):0;
  const needleA=startA+pctVal*Math.PI;

  const d3svg=d3.select('#s3-gauge-svg').attr('viewBox',`0 0 ${W} ${H}`);

  /* colored arc segments */
  const segs=[
    {start:startA,end:startA+Math.PI*0.33,col:'#2a9060'},
    {start:startA+Math.PI*0.33,end:startA+Math.PI*0.58,col:'#c09020'},
    {start:startA+Math.PI*0.58,end:startA+Math.PI*0.83,col:'#c05030'},
    {start:startA+Math.PI*0.83,end:endA,col:'#c03030'},
  ];
  const g=d3svg.append('g').attr('transform',`translate(${cx},${cy})`);
  segs.forEach(seg=>{
    const arc=d3.arc().innerRadius(r-12).outerRadius(r).startAngle(seg.start).endAngle(seg.end);
    g.append('path').attr('d',arc({})).attr('fill',seg.col).attr('opacity',.18);
  });
  /* active fill */
  if(avgRisk>0){
    const arcFill=d3.arc().innerRadius(r-12).outerRadius(r).startAngle(startA).endAngle(needleA);
    g.append('path').attr('d',arcFill({})).attr('fill',col).attr('opacity',.85);
  }
  /* tick marks */
  [1,2,3,4].forEach((v,i)=>{
    const a=startA+(i/3)*Math.PI;
    const x1=Math.cos(a)*(r+4),y1=Math.sin(a)*(r+4);
    const x2=Math.cos(a)*(r+14),y2=Math.sin(a)*(r+14);
    g.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
     .attr('stroke','var(--border2)').attr('stroke-width',1);
    g.append('text').attr('x',Math.cos(a)*(r+22)).attr('y',Math.sin(a)*(r+22)+3)
     .attr('text-anchor','middle').attr('fill','var(--text3)')
     .attr('font-size','8').attr('font-family','JetBrains Mono,monospace').text(v);
  });
  /* needle — اصلاح شده */
  if(avgRisk>0){
    const nx=Math.cos(needleA)*( r-18);
    const ny=Math.sin(needleA)*(r-18);
    /* needle body */
    g.append('line').attr('x1',0).attr('y1',0).attr('x2',nx).attr('y2',ny)
     .attr('stroke',col).attr('stroke-width',2.5).attr('stroke-linecap','round');
    /* needle base */
    g.append('circle').attr('r',5).attr('fill',col).attr('stroke','var(--card)').attr('stroke-width',2);
    /* needle tip */
    g.append('circle').attr('cx',nx).attr('cy',ny).attr('r',2.5).attr('fill',col);
  }
  /* center value */
  g.append('text').attr('text-anchor','middle').attr('y',-r+20)
   .attr('fill',col).attr('font-size','22').attr('font-weight','700')
   .attr('font-family','Space Mono,monospace').text(avgRisk||'—');
  g.append('text').attr('text-anchor','middle').attr('y',-r+32)
   .attr('fill','var(--text3)').attr('font-size','7')
   .attr('font-family','JetBrains Mono,monospace').text(riskLabel(avgRisk));
}

/* ══ TIMELINE ══ */
function buildS3Timeline(byDay){
  return section('timeline','روند زمانی','// Daily registrations',`
    <div class="s3-tl-wrap"><svg id="s3-tl-svg" width="100%" height="120"></svg></div>
  `);
}
function drawS3Timeline(byDay){
  const node=document.getElementById('s3-tl-svg');
  if(!node||!window.d3)return;
  const entries=Object.entries(byDay).sort((a,b)=>a[0]>b[0]?1:-1);
  if(!entries.length)return;
  const W=node.getBoundingClientRect().width||340;
  if(W<10)return;
  const H=120,pad={t:8,r:8,b:24,l:26};
  const iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const data=entries.map(([k,v])=>({date:new Date(k),val:v}));
  const xScale=d3.scaleTime().domain(d3.extent(data,d=>d.date)).range([0,iW]);
  const yScale=d3.scaleLinear().domain([0,d3.max(data,d=>d.val)*1.25]).range([iH,0]);
  const svg=d3.select('#s3-tl-svg').attr('width',W).attr('height',H);
  const g=svg.append('g').attr('transform',`translate(${pad.l},${pad.t})`);
  const gId='tl'+Date.now();
  const defs=svg.append('defs');
  const grad=defs.append('linearGradient').attr('id',gId).attr('x1','0').attr('y1','0').attr('x2','0').attr('y2','1');
  grad.append('stop').attr('offset','0%').attr('stop-color','var(--accent)').attr('stop-opacity',.35);
  grad.append('stop').attr('offset','100%').attr('stop-color','var(--accent)').attr('stop-opacity',.02);
  const area=d3.area().x(d=>xScale(d.date)).y0(iH).y1(d=>yScale(d.val)).curve(d3.curveCatmullRom);
  const line=d3.line().x(d=>xScale(d.date)).y(d=>yScale(d.val)).curve(d3.curveCatmullRom);
  g.append('path').datum(data).attr('d',area).attr('fill',`url(#${gId})`);
  g.append('path').datum(data).attr('d',line).attr('fill','none').attr('stroke','var(--accent)').attr('stroke-width',1.8);
  g.selectAll('.dot').data(data).enter().append('circle')
   .attr('cx',d=>xScale(d.date)).attr('cy',d=>yScale(d.val)).attr('r',2.5)
   .attr('fill','var(--accent)').attr('opacity',.8);
  g.append('g').attr('transform',`translate(0,${iH})`).call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%m/%d')))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px');
  g.append('g').call(d3.axisLeft(yScale).ticks(3))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px');
  g.selectAll('.domain,.tick line').attr('stroke','var(--border)');
}

/* ══ HEATMAP ══ */
function buildS3Heatmap(byHour){
  const maxH=Math.max(...byHour,1);
  const cells=byHour.map((v,h)=>{
    const intensity=v/maxH;
    const alpha=0.06+intensity*0.88;
    return`<div class="s3-hmap-cell" style="background:var(--accent);opacity:${alpha.toFixed(2)}" title="${h}:00 · ${v} نفر"></div>`;
  }).join('');
  return section('hmap','فعالیت ساعتی','// Hour of day heatmap',`
    <div class="s3-hmap">${cells}</div>
    <div class="s3-hmap-labels">
      <span class="s3-hmap-lbl">00</span><span class="s3-hmap-lbl">06</span>
      <span class="s3-hmap-lbl">12</span><span class="s3-hmap-lbl">18</span>
      <span class="s3-hmap-lbl">23</span>
    </div>
  `);
}

/* ══ GEO ══ */
function buildS3Geo(topProv,provRisk,total){
  if(!topProv.length)return'';
  const maxV=topProv[0][1];
  const rows=topProv.map(([name,cnt],i)=>{
    const risks=provRisk[name]||[];
    const avgR=risks.length?parseFloat((risks.reduce((a,b)=>a+b,0)/risks.length).toFixed(1)):0;
    const rc=riskColor(avgR);
    const barW=Math.round((cnt/maxV)*100);
    const badgeStyle=avgR>0?`background:${rc}18;color:${rc};border:1px solid ${rc}33`
      :'background:var(--surface2);color:var(--text3);border:1px solid var(--border)';
    return`<div class="s3-geo-row">
      <span class="s3-geo-rank">#${i+1}</span>
      <span class="s3-geo-name">${esc(name)}</span>
      <div class="s3-geo-bar-wrap">
        <div class="s3-geo-track">
          <div class="s3-geo-fill" style="width:${barW}%;background:${avgR>0?rc:'var(--accent)'}"></div>
        </div>
      </div>
      <span class="s3-geo-cnt">${cnt}</span>
      <span class="s3-geo-badge" style="${badgeStyle}">${avgR>0?avgR:'—'}</span>
    </div>`;
  }).join('');
  return section('geo','پراکندگی جغرافیایی',`<div class="s3-geo">${rows}</div>`);
}

/* ══ GENDER × RISK ══ */
function buildS3GenderRisk(genderRisk,genderMap){
  if(!Object.keys(genderRisk).length)return'';
  const entries=Object.entries(genderRisk).map(([g,vals])=>{
    const avg=parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2));
    const cnt=genderMap[g]||0;
    return{gender:g,avg,cnt,vals};
  }).sort((a,b)=>b.avg-a.avg);
  const maxAvg=Math.max(...entries.map(e=>e.avg),4);
  const rows=entries.map(e=>{
    const icon=e.gender==='مرد'?'👨':e.gender==='زن'?'👩':'👤';
    const col=riskColor(e.avg);
    return`<div class="s3-gr-row">
      <span class="s3-gr-icon">${icon}</span>
      <div class="s3-gr-info">
        <div class="s3-gr-name">${esc(e.gender)}</div>
        <div style="font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace">${e.cnt} نفر · ${riskLabel(e.avg)}</div>
      </div>
      <div class="s3-gr-bar-wrap">
        <div class="s3-gr-track">
          <div class="s3-gr-fill" style="width:${pct(e.avg,4)}%;background:${col}"></div>
        </div>
      </div>
      <div class="s3-gr-val" style="color:${col}">${e.avg}</div>
    </div>`;
  }).join('');
  return section('genderisk','ریسک به تفکیک جنسیت','// Gender × Risk correlation',rows);
}

/* ══ LEADERBOARD ══ */
function buildS3Leaderboard(topRisk,lowRisk){
  if(!topRisk.length)return'';
  function buildRow(r,idx,colorFn){
    const img=r.avatar?makeAvatar(r.avatar,32):null;
    const rankClass=idx===0?'gold':idx===1?'silver':idx===2?'bronze':'';
    const col=colorFn(r.risk);
    return`<div class="s3-lb-row" onclick="openPersonModal(${JSON.stringify({...r}).replace(/</g,'&lt;')})">
      <span class="s3-lb-rank ${rankClass}">${idx+1}</span>
      <div class="s3-lb-av">${img?`<img src="${img}" width="32" height="32" style="border-radius:8px;image-rendering:pixelated;border:1.5px solid var(--border2)">`:`<div style="width:32px;height:32px;border-radius:8px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--accent)">${(r.name||'?').charAt(0)}</div>`}</div>
      <div class="s3-lb-info">
        <div class="s3-lb-name">${esc(r.name)}</div>
        <div class="s3-lb-meta">${r.province||'—'} · ${r.gender||''} · ${r.age||''}ساله</div>
      </div>
      <div class="s3-lb-risk" style="color:${col}">${r.risk}</div>
    </div>`;
  }
  const topHTML=topRisk.map((r,i)=>buildRow(r,i,riskColor)).join('');
  const lowHTML=lowRisk.map((r,i)=>buildRow(r,i,v=>riskColor(v))).join('');
  return section('lb','لیدربورد ریسک','// Top & Bottom risk scores',`
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:8px">🔴 بالاترین ریسک</div>
    ${topHTML}
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin:12px 0 8px">🟢 پایین‌ترین ریسک</div>
    ${lowHTML}
  `);
}

/* ══ SOURCE ══ */
function buildS3Source(srcMap,srcRisk,total){
  const entries=Object.entries(srcMap).sort((a,b)=>b[1]-a[1]);
  if(!entries.length)return'';
  const srcColors={'تلگرام':'#26a5e4','telegram':'#26a5e4','اینستاگرام':'#e1306c','instagram':'#e1306c','واتساپ':'#25d366','whatsapp':'#25d366','مستقیم':'var(--accent)','direct':'var(--accent)','ایمیل':'#ea4335','email':'#ea4335','توییتر':'#1d9bf0'};
  const cards=entries.map(([name,cnt])=>{
    const risks=srcRisk[name]||[];
    const avgR=risks.length?parseFloat((risks.reduce((a,b)=>a+b,0)/risks.length).toFixed(1)):0;
    const col=srcColors[name]||srcColors[name.toLowerCase()]||'var(--accent)';
    const rc=riskColor(avgR);
    return`<div class="s3-src-card">
      <div class="s3-src-bar" style="background:${col}"></div>
      <div class="s3-src-name">${esc(name)}</div>
      <div class="s3-src-num" style="color:${col}">${cnt}</div>
      <div class="s3-src-pct">${pct(cnt,total)}٪ از کل</div>
      ${avgR>0?`<div class="s3-src-risk"><div style="width:6px;height:6px;border-radius:50%;background:${rc};flex-shrink:0"></div><span style="font-size:8px;color:var(--text2)">ریسک: ${avgR}</span></div>`:''}
    </div>`;
  }).join('');
  return section('source','منبع ورود',`<div class="s3-src-grid">${cards}</div>`);
}

/* ══ DEMOGRAPHICS ══ */
function buildS3Demo(genderMap,ageGroups,total){
  const gMax=Math.max(...Object.values(genderMap),1);
  const aMax=Math.max(...Object.values(ageGroups),1);
  const gRows=Object.entries(genderMap).sort((a,b)=>b[1]-a[1]).map(([g,cnt])=>{
    const icon=g==='مرد'?'👨':g==='زن'?'👩':'👤';
    const col=g==='مرد'?'var(--accent3)':g==='زن'?'#c06080':'var(--accent2)';
    return`<div class="s3-demo-row"><span class="s3-demo-lbl">${icon} ${g}</span><div class="s3-demo-track"><div class="s3-demo-fill" style="width:${pct(cnt,gMax)}%;background:${col}"></div></div><span class="s3-demo-val">${pct(cnt,Object.values(genderMap).reduce((a,b)=>a+b,0))}%</span></div>`;
  }).join('');
  const aRows=Object.entries(ageGroups).map(([range,cnt])=>
    `<div class="s3-demo-row"><span class="s3-demo-lbl">${range}</span><div class="s3-demo-track"><div class="s3-demo-fill" style="width:${pct(cnt,aMax)}%;background:var(--accent2)"></div></div><span class="s3-demo-val">${cnt}</span></div>`
  ).join('');
  return section('demo','جمعیت‌شناسی',`
    <div class="s3-demo-grid">
      <div class="s3-demo-card"><div class="s3-demo-title">// GENDER</div>${gRows||'<div style="color:var(--text3);font-size:9px">داده نیست</div>'}</div>
      <div class="s3-demo-card"><div class="s3-demo-title">// AGE</div>${aRows}</div>
    </div>
  `);
}

/* ══ SCATTER ══ */
function buildS3Scatter(data){
  return section('scatter','سن × ریسک','// Age vs Risk scatter',`
    <div class="s3-sc-wrap"><svg id="s3-sc-svg" width="100%" height="130"></svg></div>
  `);
}
function drawS3Scatter(data){
  const node=document.getElementById('s3-sc-svg');
  if(!node||!window.d3)return;
  const W=node.getBoundingClientRect().width||340;
  if(W<10)return;
  const H=130,pad={t:8,r:8,b:26,l:26};
  const iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const svg=d3.select('#s3-sc-svg').attr('width',W).attr('height',H);
  const g=svg.append('g').attr('transform',`translate(${pad.l},${pad.t})`);
  const xScale=d3.scaleLinear().domain([d3.min(data,d=>d.age)-2,d3.max(data,d=>d.age)+2]).range([0,iW]);
  const yScale=d3.scaleLinear().domain([1,4]).range([iH,0]);
  g.selectAll('.sc-dot').data(data).enter().append('circle')
   .attr('cx',d=>xScale(d.age)).attr('cy',d=>yScale(d.risk))
   .attr('r',4).attr('fill',d=>riskColor(d.risk)).attr('opacity',.65).attr('stroke','var(--card)').attr('stroke-width',1);
  g.append('g').attr('transform',`translate(0,${iH})`).call(d3.axisBottom(xScale).ticks(5))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px');
  g.append('g').call(d3.axisLeft(yScale).ticks(4))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px');
  g.selectAll('.domain,.tick line').attr('stroke','var(--border)');
  /* trend */
  const n=data.length;
  const xm=data.reduce((s,d)=>s+d.age,0)/n,ym=data.reduce((s,d)=>s+d.risk,0)/n;
  const num=data.reduce((s,d)=>s+(d.age-xm)*(d.risk-ym),0);
  const den=data.reduce((s,d)=>s+(d.age-xm)**2,0);
  if(den>0){
    const slope=num/den,intercept=ym-slope*xm;
    const x0=d3.min(data,d=>d.age),x1=d3.max(data,d=>d.age);
    g.append('line').attr('x1',xScale(x0)).attr('y1',yScale(Math.max(1,Math.min(4,slope*x0+intercept))))
     .attr('x2',xScale(x1)).attr('y2',yScale(Math.max(1,Math.min(4,slope*x1+intercept))))
     .attr('stroke','var(--accent2)').attr('stroke-width',1.5).attr('stroke-dasharray','4,3').attr('opacity',.6);
  }
}

/* ══ SEGMENTATION ══ */
function buildS3Seg(rows){
  const provinces=[...new Set(rows.map(r=>r.province).filter(Boolean))].sort();
  const genders=[...new Set(rows.map(r=>r.gender).filter(Boolean))];
  const cohorts=[...new Set(rows.map(r=>r.cohort).filter(Boolean))];
  return section('seg','فیلتر ترکیبی','// Segment by demographics',`
    <div class="s3-seg-filters">
      <select class="s3-seg-sel" id="s3-seg-prov" onchange="s3UpdateSeg()">
        <option value="">همه استان‌ها</option>
        ${provinces.map(p=>`<option value="${esc(p)}">${p}</option>`).join('')}
      </select>
      <select class="s3-seg-sel" id="s3-seg-gender" onchange="s3UpdateSeg()">
        <option value="">همه جنسیت‌ها</option>
        ${genders.map(g=>`<option value="${esc(g)}">${g}</option>`).join('')}
      </select>
      <select class="s3-seg-sel" id="s3-seg-age" onchange="s3UpdateSeg()">
        <option value="">همه سنی</option>
        <option value="18-25">۱۸–۲۵</option>
        <option value="26-35">۲۶–۳۵</option>
        <option value="36-45">۳۶–۴۵</option>
        <option value="46-55">۴۶–۵۵</option>
        <option value="56-99">۵۶+</option>
      </select>
      ${cohorts.length?`<select class="s3-seg-sel" id="s3-seg-cohort" onchange="s3UpdateSeg()">
        <option value="">همه کوهورت</option>
        ${cohorts.map(c=>`<option value="${esc(c)}">${c}</option>`).join('')}
      </select>`:''}
    </div>
    <div class="s3-seg-result" id="s3-seg-result"></div>
  `);
}
function s3InitSeg(rows){window._s3SegRows=rows;s3UpdateSeg();}
function s3UpdateSeg(){
  const rows=window._s3SegRows||[];
  const prov=document.getElementById('s3-seg-prov')?.value||'';
  const gen=document.getElementById('s3-seg-gender')?.value||'';
  const age=document.getElementById('s3-seg-age')?.value||'';
  const coh=document.getElementById('s3-seg-cohort')?.value||'';
  let f=rows;
  if(prov)f=f.filter(r=>r.province===prov);
  if(gen)f=f.filter(r=>r.gender===gen);
  if(age){const[lo,hi]=age.split('-').map(Number);f=f.filter(r=>{const a=parseInt(r.age);return a>=lo&&a<=hi;});}
  if(coh)f=f.filter(r=>r.cohort===coh);
  const riskF=f.filter(r=>r.risk>0);
  const avgR=riskF.length?parseFloat((riskF.reduce((s,r)=>s+r.risk,0)/riskF.length).toFixed(2)):0;
  const rc=riskColor(avgR);
  const el=document.getElementById('s3-seg-result');
  if(!el)return;
  el.innerHTML=`
    <div class="s3-seg-num">${f.length}</div>
    <div style="font-size:9px;color:var(--text2);margin-top:4px">${f.length} نفر — ${pct(f.length,rows.length)}٪ از کل</div>
    ${avgR>0?`<div style="display:flex;align-items:center;gap:7px;margin-top:8px">
      <div style="width:8px;height:8px;border-radius:50%;background:${rc}"></div>
      <span style="font-size:9px;color:var(--text2)">میانگین ریسک: <strong style="color:${rc}">${avgR}</strong> — ${riskLabel(avgR)}</span>
    </div>`:''}
  `;
}

/* ══ SPEED ══ */
function buildS3Speed(avgTime,minTime,maxTime,allTimes){
  const bSize=15,buckets={};
  allTimes.forEach(t=>{const b=Math.floor(t/bSize)*bSize;buckets[b]=(buckets[b]||0)+1;});
  const bEntries=Object.entries(buckets).sort((a,b)=>+a[0]-+b[0]);
  const maxB=Math.max(...bEntries.map(b=>b[1]),1);
  const hist=bEntries.map(([b,cnt])=>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
      <div style="width:100%;height:${Math.max(3,Math.round((cnt/maxB)*44))}px;background:var(--accent3);opacity:${0.3+(cnt/maxB)*0.7};border-radius:2px 2px 0 0"></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:var(--text3)">${b}s</div>
    </div>`
  ).join('');
  return section('speed','زمان‌سنجی','// Response time analysis',`
    <div class="s3-spd">
      <div class="s3-spd-card"><div class="s3-spd-val" style="color:var(--accent)">${avgTime}s</div><div class="s3-spd-lbl">AVERAGE</div></div>
      <div class="s3-spd-card"><div class="s3-spd-val" style="color:#2a9060">${minTime}s</div><div class="s3-spd-lbl">FASTEST</div></div>
      <div class="s3-spd-card"><div class="s3-spd-val" style="color:#c03030">${maxTime}s</div><div class="s3-spd-lbl">SLOWEST</div></div>
    </div>
    <div style="display:flex;align-items:flex-end;gap:2px;height:52px;padding:0 2px">${hist}</div>
  `);
}

/* ══ QUESTIONS ══ */
function buildS3Questions(qList){
  if(!qList.length)return'';
  const cards=qList.map(q=>{
    const ansList=Object.entries(q.answers).sort((a,b)=>b[1]-a[1]);
    const qTotal=ansList.reduce((s,[,c])=>s+c,0);
    const avgT=q.times.length?Math.round(q.times.reduce((a,b)=>a+b,0)/q.times.length):null;
    const top=ansList[0];
    const topPctV=top?pct(top[1],qTotal):0;
    return`<div class="s3-q-card">
      <div class="s3-q-head">
        <span class="s3-q-id">س ${q.id}</span>
        ${avgT?`<span class="s3-q-time">⏱ ${avgT}s</span>`:''}
        <span class="s3-q-total">${qTotal} پاسخ</span>
        ${top&&topPctV>=50?`<span class="s3-q-dom">غالب: ${topPctV}%</span>`:''}
      </div>
      ${ansList.slice(0,6).map(([ans,cnt])=>`
        <div class="s3-q-row">
          <span class="s3-q-lbl" title="${esc(ans)}">${esc(ans.substring(0,38))}${ans.length>38?'…':''}</span>
          <div class="s3-q-track"><div class="s3-q-fill" style="width:${pct(cnt,qTotal)}%"></div></div>
          <span class="s3-q-cnt">${cnt}</span>
          <span class="s3-q-pct">${pct(cnt,qTotal)}%</span>
        </div>`).join('')}
    </div>`;
  }).join('');
  return section('questions','تحلیل سوال‌ها',cards);
}

/* ══ AVATARS ══ */
function buildS3Avatars(topAv,total){
  if(!topAv.length)return'';
  const maxCnt=topAv[0][1];
  const cards=topAv.map(([name,cnt],i)=>{
    const img=makeAvatar(name,44);
    const ringPct=pct(cnt,maxCnt);
    const circumference=2*Math.PI*26;
    const dash=circumference*(ringPct/100);
    return`<div class="s3-av-card${i===0?' top':''}">
      ${i===0?'<span class="s3-av-crown">👑</span>':''}
      <div class="s3-av-ring">
        <svg viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" stroke-width="3"/>
          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--accent)" stroke-width="3"
            stroke-dasharray="${dash.toFixed(1)} ${circumference.toFixed(1)}"
            stroke-dashoffset="${(circumference*0.25).toFixed(1)}"
            stroke-linecap="round" opacity=".8"/>
        </svg>
        ${img?`<img class="s3-av-img" src="${img}" alt="${name}">`:`<div class="s3-av-fb">🎭</div>`}
      </div>
      <div class="s3-av-name">${esc(name)}</div>
      <div class="s3-av-cnt">${cnt}</div>
      <div class="s3-av-pct">${pct(cnt,total)}% از کل</div>
    </div>`;
  }).join('');
  return section('avatars','آواتارها','// Personality distribution',`<div class="s3-av-grid">${cards}</div>`);
}

/* ══ PROFILES ══ */
function buildS3Profiles(profMap,total){
  const entries=Object.entries(profMap).sort((a,b)=>b[1]-a[1]);
  if(!entries.length)return'';
  const maxV=entries[0][1];
  const rows=entries.map(([name,cnt],i)=>
    `<div class="s3-prof-row">
      <span class="s3-prof-rank">#${i+1}</span>
      <span class="s3-prof-lbl">${esc(name)}</span>
      <div class="s3-prof-track"><div class="s3-prof-fill" style="width:${pct(cnt,maxV)}%"></div></div>
      <span class="s3-prof-cnt">${cnt}</span>
      <span class="s3-prof-pct">${pct(cnt,total)}%</span>
    </div>`
  ).join('');
  return section('profiles','پروفایل‌ها',rows);
}

/* ══ COHORT ══ */
function buildS3Cohort(cohortMap,rows){
  const cards=Object.entries(cohortMap).map(([name,cnt])=>{
    const riskF=rows.filter(r=>r.cohort===name&&r.risk>0);
    const avgR=riskF.length?parseFloat((riskF.reduce((s,r)=>s+r.risk,0)/riskF.length).toFixed(1)):0;
    const rc=riskColor(avgR);
    return`<div class="s3-co-card">
      <div class="s3-co-name">${esc(name)}</div>
      <div class="s3-co-num">${cnt}</div>
      <div class="s3-co-risk" style="color:${rc}">${avgR?`ریسک: ${avgR}`:'—'}</div>
    </div>`;
  }).join('');
  return section('cohort','کوهورت',`<div class="s3-co-grid">${cards}</div>`);
}

/* ══ TABLE ══ */
function buildS3Table(rows){
  return section('table','همه پاسخ‌دهندگان',`
    <div class="s3-tbl-filters">
      <input class="s3-tbl-search" id="s3-tbl-q" placeholder="جستجو نام / استان..." oninput="s3FilterTable()">
      <select class="s3-tbl-select" id="s3-tbl-risk" onchange="s3FilterTable()">
        <option value="">همه ریسک</option>
        <option value="low">محافظه‌کار</option>
        <option value="mid">متعادل</option>
        <option value="high">ریسک‌پذیر</option>
        <option value="very">جسور</option>
      </select>
      <select class="s3-tbl-select" id="s3-tbl-gender" onchange="s3FilterTable()">
        <option value="">همه جنسیت</option>
        <option value="مرد">مرد</option>
        <option value="زن">زن</option>
      </select>
      <span class="s3-tbl-cnt" id="s3-tbl-cnt">${rows.length} نفر</span>
      <button class="s3-export-btn" onclick="exportCSV()">📥 CSV</button>
    </div>
    <div class="s3-tbl-wrap">
      <table id="s3-main-tbl">
        <thead><tr>
          <th style="width:40px">آواتار</th>
          <th onclick="s3SortTable('name')">نام</th>
          <th onclick="s3SortTable('age')">سن</th>
          <th onclick="s3SortTable('province')">استان</th>
          <th onclick="s3SortTable('risk')">ریسک</th>
          <th onclick="s3SortTable('profile')">پروفایل</th>
          <th onclick="s3SortTable('date')">تاریخ</th>
        </tr></thead>
        <tbody id="s3-tbl-body"></tbody>
      </table>
    </div>
    <div class="s3-pager" id="s3-tbl-pager"></div>
  `);
}

function s3FilterTable(){
  const state=window._tblRows;if(!state)return;
  const q=(document.getElementById('s3-tbl-q')?.value||'').toLowerCase();
  const rk=document.getElementById('s3-tbl-risk')?.value||'';
  const gn=document.getElementById('s3-tbl-gender')?.value||'';
  let f=state.rows.filter(r=>{
    const nameOk=!q||(r.name||'').toLowerCase().includes(q)||(r.province||'').toLowerCase().includes(q);
    const rv=parseFloat(r.risk)||0;
    const riskOk=!rk||(rk==='low'&&rv>0&&rv<1.75)||(rk==='mid'&&rv>=1.75&&rv<2.5)||(rk==='high'&&rv>=2.5&&rv<3.25)||(rk==='very'&&rv>=3.25);
    const genderOk=!gn||r.gender===gn;
    return nameOk&&riskOk&&genderOk;
  });
  const s=state.sort;
  f.sort((a,b)=>{
    let av=a[s.col]||'',bv=b[s.col]||'';
    if(s.col==='risk'||s.col==='age'){av=parseFloat(av)||0;bv=parseFloat(bv)||0;}
    return av>bv?s.dir:av<bv?-s.dir:0;
  });
  state.filtered=f;
  const cntEl=document.getElementById('s3-tbl-cnt');
  if(cntEl)cntEl.textContent=f.length+' نفر';
  const pp=15,pages=Math.ceil(f.length/pp)||1;
  state.page=Math.min(state.page||1,pages);
  const slice=f.slice((state.page-1)*pp,state.page*pp);
  const body=document.getElementById('s3-tbl-body');
  if(!body)return;
  body.innerHTML=slice.map((r,idx)=>{
    const gi=(state.page-1)*pp+idx;
    const img=r.avatar?makeAvatar(r.avatar,30):null;
    const pc=cleanProfile(r.profile);
    return`<tr style="cursor:pointer" onclick="openPersonModal(window._tblRows.filtered[${gi}])">
      <td style="text-align:center">
        ${img?`<img src="${img}" width="30" height="30" style="border-radius:7px;image-rendering:pixelated;border:1px solid var(--border)">`
          :`<div style="width:30px;height:30px;border-radius:7px;background:var(--bg2);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent)">${(r.name||'?').charAt(0)}</div>`}
      </td>
      <td class="s3-td-name">${esc(r.name)}</td>
      <td>${r.age||'—'}</td>
      <td>${r.province||'—'}</td>
      <td>${riskTag(r.risk)}</td>
      <td style="font-size:9px;color:var(--text2)">${pc?esc(pc):'—'}</td>
      <td class="s3-td-date">${fmtDate(r.date)}</td>
    </tr>`;
  }).join('');
  const pg=document.getElementById('s3-tbl-pager');
  if(!pg)return;
  pg.innerHTML='';
  if(pages>1){
    if(state.page>1)pg.innerHTML+=`<button class="s3-pb" onclick="s3GoPage(${state.page-1})">«</button>`;
    for(let i=Math.max(1,state.page-2);i<=Math.min(pages,state.page+2);i++)
      pg.innerHTML+=`<button class="s3-pb${i===state.page?' active':''}" onclick="s3GoPage(${i})">${i}</button>`;
    if(state.page<pages)pg.innerHTML+=`<button class="s3-pb" onclick="s3GoPage(${state.page+1})">»</button>`;
  }
}
function s3GoPage(p){if(window._tblRows)window._tblRows.page=p;s3FilterTable();}
function s3SortTable(col){
  const state=window._tblRows;if(!state)return;
  state.sort.dir=state.sort.col===col?state.sort.dir*-1:1;
  state.sort.col=col;
  document.querySelectorAll('#s3-main-tbl th').forEach(th=>th.classList.remove('asc','desc'));
  const cols=['','name','age','province','risk','profile','date'];
  const th=document.querySelector(`#s3-main-tbl th:nth-child(${cols.indexOf(col)+1})`);
  if(th)th.classList.add(state.sort.dir===1?'asc':'desc');
  s3FilterTable();
}

/* keep old names working */
function filterTable(){s3FilterTable();}
function goPage(p){s3GoPage(p);}
function sortTable(col){s3SortTable(col);}
function updateSeg(){s3UpdateSeg();}
