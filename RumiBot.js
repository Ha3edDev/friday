/* ═══════════════════════════════════════════════════════════════
   RUMIBOT.JS — آمار ربات تلگرامی رومی
   ⚠️ توجه: ثابت API_RUMI از قبل توی فایل HTML اصلی (index.html)
   تعریف شده — عمداً اینجا دوباره تعریف نشده، وگرنه باعث خطای
   "Identifier already declared" میشه و کل این فایل اجرا نمیشه.
═══════════════════════════════════════════════════════════════ */

async function loadRumiStats(){
  try{
    const r = await fetch(API_RUMI + '?page=rumi_stats', {signal: AbortSignal.timeout(10000)});
    const j = await r.json();
    if(j && j.ok) return j.data;
  }catch(e){}
  return null;
}

function rumiReferralRow(r, idx){
  const rankClass = idx===0?'gold':idx===1?'silver':idx===2?'bronze':'';
  const avatarImg = `<img src="${r.avatarUrl}" width="32" height="32" style="border-radius:8px;object-fit:cover;border:1.5px solid var(--border2)" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='">`;
  const nameBlock = r.dmLink
    ? `<a href="${r.dmLink}" target="_blank" rel="noopener" style="text-decoration:none;display:flex;align-items:center;gap:9px;flex:1;min-width:0">
        ${avatarImg}
        <div class="s3-lb-info">
          <div class="s3-lb-name">${esc(r.name)}</div>
          <div class="s3-lb-meta">@${esc(r.username)}</div>
        </div>
      </a>`
    : `<div style="display:flex;align-items:center;gap:9px;flex:1;min-width:0;opacity:.75">
        ${avatarImg}
        <div class="s3-lb-info">
          <div class="s3-lb-name">${esc(r.name)}</div>
          <div class="s3-lb-meta">بدون یوزرنیم عمومی</div>
        </div>
      </div>`;

  return `<div class="s3-lb-row" style="cursor:${r.dmLink?'pointer':'default'}">
    <span class="s3-lb-rank ${rankClass}">${idx+1}</span>
    ${nameBlock}
    <div class="s3-lb-risk" style="color:var(--accent)">${r.count}</div>
  </div>`;
}

function renderRumiCard(data){
  if(!data) return '<div class="empty">// اتصال به ربات رومی برقرار نشد</div>';
  const t = data.totals;

  const toolsHtml = data.topTools.length
    ? data.topTools.slice(0,5).map((tool,i)=>
        `<div class="s3-prof-row">
          <span class="s3-prof-rank">#${i+1}</span>
          <span class="s3-prof-lbl">${esc(tool.label)}</span>
          <div class="s3-prof-track"><div class="s3-prof-fill" style="width:${Math.round((tool.count/data.topTools[0].count)*100)}%"></div></div>
          <span class="s3-prof-cnt">${tool.count}</span>
        </div>`
      ).join('')
    : '<div class="empty">// هنوز ابزاری استفاده نشده</div>';

  const ref48 = data.referrals.last48h.length
    ? data.referrals.last48h.map(rumiReferralRow).join('')
    : '<div class="empty">// هنوز رفرالی توی ۴۸ ساعت اخیر نیست</div>';

  const refAll = data.referrals.allTime.length
    ? data.referrals.allTime.map(rumiReferralRow).join('')
    : '<div class="empty">// هنوز رفرالی ثبت نشده</div>';

  return `
    <div class="s3-kpi" style="margin-bottom:12px">
      <div class="s3-kpi-card"><div class="s3-kpi-lbl">USERS</div><div class="s3-kpi-val">${t.totalUsers}</div><div class="s3-kpi-sub">کل کاربران</div></div>
      <div class="s3-kpi-card"><div class="s3-kpi-lbl">TODAY</div><div class="s3-kpi-val" style="color:var(--accent2)">${t.generationsToday}</div><div class="s3-kpi-sub">تولید امروز</div></div>
      <div class="s3-kpi-card"><div class="s3-kpi-lbl">TOTAL GEN</div><div class="s3-kpi-val" style="color:var(--accent3)">${t.generationsTotal}</div><div class="s3-kpi-sub">کل تولیدشده</div></div>
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
