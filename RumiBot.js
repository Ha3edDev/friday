/* ═══════════════════════════════════════════════════════════════
   RUMIBOT.JS — آمار ربات تلگرامی رومی
   ⚠️ توجه: ثابت API_RUMI از قبل توی فایل HTML اصلی (index.html)
   تعریف شده — عمداً اینجا دوباره تعریف نشده.
═══════════════════════════════════════════════════════════════ */

async function loadRumiStats(){
  try{
    const r = await fetch(API_RUMI + '?page=rumi_stats', {signal: AbortSignal.timeout(10000)});
    const j = await r.json();
    if(j && j.ok) return j.data;
  }catch(e){}
  return null;
}

function rumiToolRow(tool, idx, maxCount){
  const pct = Math.round((tool.count / maxCount) * 100);
  return `<div class="rb-tool-row">
    <span class="rb-tool-rank">#${idx+1}</span>
    <span class="rb-tool-name">${esc(tool.label)}</span>
    <div class="rb-tool-track"><div class="rb-tool-fill" style="width:${pct}%"></div></div>
    <span class="rb-tool-cnt">${tool.count}</span>
  </div>`;
}

function rumiReferralRow(r, idx){
  const rankIcon = idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'#'+(idx+1);
  const avatarImg = `<img class="rb-avatar" src="${r.avatarUrl}" width="36" height="36" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNjY2MiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMwIiByPSIxNCIgZmlsbD0iIzk5OSIvPjxlbGxpcHNlIGN4PSI0MCIgY3k9IjY4IiByeD0iMjQiIHJ5PSIxOCIgZmlsbD0iIzk5OSIvPjwvc3ZnPg=='">`;

  const nameBlock = r.dmLink
    ? `<a href="${r.dmLink}" target="_blank" rel="noopener" class="rb-ref-namelink">
        <div class="rb-ref-name">${esc(r.name)}</div>
        <div class="rb-ref-username">@${esc(r.username)}</div>
      </a>`
    : `<div class="rb-ref-namelink" style="opacity:.7">
        <div class="rb-ref-name">${esc(r.name)}</div>
        <div class="rb-ref-username">بدون یوزرنیم عمومی</div>
      </div>`;

  return `<div class="rb-ref-row">
    <span class="rb-ref-rank">${rankIcon}</span>
    ${avatarImg}
    ${nameBlock}
    <div class="rb-ref-count">${r.count}</div>
  </div>`;
}

function renderRumiCard(data){
  if(!data) return '<div class="empty">// اتصال به ربات رومی برقرار نشد</div>';
  const t = data.totals;

  const maxToolCount = data.topTools.length ? data.topTools[0].count : 1;
  const toolsHtml = data.topTools.length
    ? data.topTools.slice(0,5).map((tool,i)=>rumiToolRow(tool, i, maxToolCount)).join('')
    : '<div class="empty">// هنوز ابزاری استفاده نشده</div>';

  const ref48 = data.referrals.last48h.length
    ? data.referrals.last48h.map(rumiReferralRow).join('')
    : '<div class="empty">// هنوز رفرالی توی ۴۸ ساعت اخیر نیست</div>';

  const refAll = data.referrals.allTime.length
    ? data.referrals.allTime.map(rumiReferralRow).join('')
    : '<div class="empty">// هنوز رفرالی ثبت نشده</div>';

  return `
    <style>
      .rb-kpi{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:6px;}
      .rb-kpi-card{border-radius:14px;padding:13px 8px;background:var(--card);border:1px solid var(--card-b);text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.04);}
      .rb-kpi-lbl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:1.5px;margin-bottom:5px;}
      .rb-kpi-val{font-family:'Space Mono',monospace;font-size:21px;font-weight:700;color:var(--accent);line-height:1;}
      .rb-kpi-sub{font-size:7px;color:var(--text2);margin-top:3px;}

      .rb-tool-row{display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:12px;background:var(--card);border:1px solid var(--card-b);margin-bottom:6px;}
      .rb-tool-rank{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);width:20px;flex-shrink:0;}
      .rb-tool-name{font-size:10px;color:var(--text1);width:100px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .rb-tool-track{flex:1;height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;}
      .rb-tool-fill{height:100%;border-radius:3px;background:var(--accent);}
      .rb-tool-cnt{font-family:'Space Mono',monospace;font-size:10px;color:var(--accent);width:24px;text-align:left;flex-shrink:0;font-weight:700;}

      .rb-ref-row{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:12px;background:var(--card);border:1px solid var(--card-b);margin-bottom:6px;}
      .rb-ref-rank{font-family:'JetBrains Mono',monospace;font-size:11px;width:22px;flex-shrink:0;text-align:center;}
      .rb-avatar{width:36px;height:36px;border-radius:9px;object-fit:cover;border:1.5px solid var(--border2);flex-shrink:0;background:var(--bg2);}
      .rb-ref-namelink{flex:1;min-width:0;text-decoration:none;}
      .rb-ref-name{font-size:10.5px;font-weight:700;color:var(--text1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .rb-ref-username{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-top:1px;direction:ltr;text-align:right;}
      .rb-ref-count{font-family:'Space Mono',monospace;font-size:14px;font-weight:700;color:var(--accent);flex-shrink:0;}
    </style>

    <div class="rb-kpi">
      <div class="rb-kpi-card"><div class="rb-kpi-lbl">USERS</div><div class="rb-kpi-val">${t.totalUsers}</div><div class="rb-kpi-sub">کل کاربران</div></div>
      <div class="rb-kpi-card"><div class="rb-kpi-lbl">TODAY</div><div class="rb-kpi-val" style="color:var(--accent2)">${t.generationsToday}</div><div class="rb-kpi-sub">تولید امروز</div></div>
      <div class="rb-kpi-card"><div class="rb-kpi-lbl">TOTAL GEN</div><div class="rb-kpi-val" style="color:var(--accent3)">${t.generationsTotal}</div><div class="rb-kpi-sub">کل تولیدشده</div></div>
    </div>

    <div class="sec">پرکاربردترین ابزارها</div>
    ${toolsHtml}

    <div class="sec">رفرال — ۴۸ ساعت اخیر (${t.referralTotal48h} رفرال)</div>
    ${ref48}

    <div class="sec">رفرال — کل زمان (${t.referralTotalAllTime} رفرال)</div>
    ${refAll}
  `;
}

async function RB_load(){
  const wrap = document.getElementById('rumiStatsWrap');
  if(!wrap) return;
  wrap.innerHTML = '<div class="stats-spinner-wrap"><div class="stats-ring"></div><div class="stats-loading-txt">// در حال اتصال به رومی...</div></div>';
  const data = await loadRumiStats();
  wrap.innerHTML = renderRumiCard(data);
}

function reloadRumiStats(){
  RB_load();
}
