/* ═══════════════════════════════════════════════════════════════
   STATS.JS — Full Analytics Engine
   deps: D3 v7, apiStatsFetch, parseRow, makeAvatar,
         openPersonModal, riskTag, riskLbl, fmtDate, esc,
         cleanProfile, pct  (from index.html)
═══════════════════════════════════════════════════════════════ */

/* ── inject D3 once ── */
(function () {
  if (window.d3) return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js';
  document.head.appendChild(s);
})();

/* ── tiny helpers ── */
function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

function riskColor(v) {
  const n = parseFloat(v) || 0;
  if (n <= 0) return 'var(--text3)';
  if (n < 1.75) return '#34d499';
  if (n < 2.5)  return '#fbbf24';
  if (n < 3.25) return '#ff8c00';
  return '#ff4444';
}

function riskLabel(v) {
  const n = parseFloat(v) || 0;
  if (n <= 0) return '—';
  if (n < 1.75) return 'محافظه‌کار';
  if (n < 2.5)  return 'متعادل';
  if (n < 3.25) return 'ریسک‌پذیر';
  return 'جسور';
}

function parseIranDate(str) {
  if (!str) return null;
  try {
    const d = new Date(str);
    if (!isNaN(d)) return d;
  } catch (e) {}
  return null;
}

/* ── section wrapper ── */
function section(title, inner) {
  return `<div class="s2-section">
    <div class="s2-sec-head"><span class="s2-sec-dot"></span><span class="s2-sec-title">${title}</span><div class="s2-sec-line"></div></div>
    ${inner}
  </div>`;
}

/* ═══ RELOAD ═══ */
function reloadStats() {
  loadedPages.stats = false;
  document.getElementById('statsMain').innerHTML =
    '<div class="stats-spinner-wrap"><div class="stats-ring"></div><div class="stats-loading-txt">// RECONNECTING...</div></div>';
  loadStats();
}

/* ═══ MAIN LOAD ═══ */
async function loadStats() {
  const [sd, fd] = await Promise.all([
    apiStatsFetch('stats_data'),
    apiStatsFetch('stats_full')
  ]);

  const el = document.getElementById('statsMain');
  if (!sd && !fd) {
    el.innerHTML = '<div class="empty">// داده‌ای یافت نشد</div>';
    return;
  }

  const raw   = (fd && fd.rows) ? fd.rows : [];
  const rows  = raw.map(r => parseRow(r));
  const total = sd?.total || rows.length || 0;
  const week  = sd?.week  || 0;
  const today = sd?.today || 0;

  /* ── derived ── */
  const riskRows  = rows.filter(r => r.risk > 0);
  const avgRisk   = riskRows.length
    ? parseFloat((riskRows.reduce((s, r) => s + r.risk, 0) / riskRows.length).toFixed(2))
    : 0;

  const times   = rows.map(r => parseFloat(r['⏳ جمع زمان (ثانیه)'] || 0)).filter(t => t > 0);
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const minTime = times.length ? Math.round(Math.min(...times)) : 0;
  const maxTime = times.length ? Math.round(Math.max(...times)) : 0;

  /* ── date buckets ── */
  const byDay = {}, byWeekday = Array(7).fill(0), byHour = Array(24).fill(0);
  rows.forEach(r => {
    const d = parseIranDate(r.date);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
    byWeekday[d.getDay()]++;
    byHour[d.getHours()]++;
  });

  /* ── province ── */
  const provMap = {};
  rows.forEach(r => { if (r.province) provMap[r.province] = (provMap[r.province] || 0) + 1; });
  const topProv = Object.entries(provMap).sort((a, b) => b[1] - a[1]);

  /* province + avg risk ── */
  const provRisk = {};
  riskRows.forEach(r => {
    if (!r.province) return;
    if (!provRisk[r.province]) provRisk[r.province] = [];
    provRisk[r.province].push(r.risk);
  });

  /* ── gender ── */
  const genderMap = {};
  rows.forEach(r => { if (r.gender) genderMap[r.gender] = (genderMap[r.gender] || 0) + 1; });

  /* ── age groups ── */
  const ageGroups = { '۱۸-۲۵': 0, '۲۶-۳۵': 0, '۳۶-۴۵': 0, '۴۶-۵۵': 0, '۵۶+': 0 };
  rows.forEach(r => {
    const a = parseInt(r.age);
    if (!a) return;
    if (a <= 25) ageGroups['۱۸-۲۵']++;
    else if (a <= 35) ageGroups['۲۶-۳۵']++;
    else if (a <= 45) ageGroups['۳۶-۴۵']++;
    else if (a <= 55) ageGroups['۴۶-۵۵']++;
    else ageGroups['۵۶+']++;
  });

  /* ── source ── */
  const srcMap = {};
  rows.forEach(r => {
    const s = r.source || 'مستقیم';
    srcMap[s] = (srcMap[s] || 0) + 1;
  });
  const srcRisk = {};
  riskRows.forEach(r => {
    const s = r.source || 'مستقیم';
    if (!srcRisk[s]) srcRisk[s] = [];
    srcRisk[s].push(r.risk);
  });

  /* ── avatar ── */
  const avMap = {};
  rows.forEach(r => { if (r.avatar) avMap[r.avatar] = (avMap[r.avatar] || 0) + 1; });
  const topAv = Object.entries(avMap).sort((a, b) => b[1] - a[1]);

  /* ── profile ── */
  const profMap = {};
  rows.forEach(r => { const p = cleanProfile(r.profile); if (p) profMap[p] = (profMap[p] || 0) + 1; });

  /* ── cohort ── */
  const cohortMap = {};
  rows.forEach(r => { if (r.cohort) cohortMap[r.cohort] = (cohortMap[r.cohort] || 0) + 1; });

  /* ── question stats ── */
  const qStatsMap = {};
  if (raw.length) {
    const sampleKeys = Object.keys(raw[0]);
    for (const key of sampleKeys) {
      const m = key.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);
      if (m) {
        const qId = parseInt(m[1]);
        if (!qStatsMap[qId]) qStatsMap[qId] = { id: qId, answers: {}, times: [] };
      }
    }
    raw.forEach(rawRow => {
      for (const qId of Object.keys(qStatsMap)) {
        const qn = parseInt(qId);
        const ansKey  = Object.keys(rawRow).find(k => { const m = k.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);  return m && parseInt(m[1]) === qn; });
        const timeKey = Object.keys(rawRow).find(k => { const m = k.trim().match(/^س(\d+)\s*[–\-]\s*زمان$/); return m && parseInt(m[1]) === qn; });
        if (ansKey)  { const ans = String(rawRow[ansKey]  || '').trim(); if (ans) qStatsMap[qId].answers[ans] = (qStatsMap[qId].answers[ans] || 0) + 1; }
        if (timeKey) { const t   = parseFloat(rawRow[timeKey] || 0);     if (t > 0) qStatsMap[qId].times.push(t); }
      }
    });
  }
  const qList = Object.values(qStatsMap).sort((a, b) => a.id - b.id);

  /* ── speed insight ── */
  const speedCategory = rows.map(r => r['📊 سرعت'] || '').filter(Boolean);
  const speedMap = {};
  speedCategory.forEach(s => speedMap[s] = (speedMap[s] || 0) + 1);

  /* ── insight string ── */
  const prevWeek = sd?.prevWeek || 0;
  const growthPct = prevWeek > 0 ? Math.round(((week - prevWeek) / prevWeek) * 100) : null;
  const growthStr = growthPct !== null
    ? (growthPct >= 0 ? `↑ ${growthPct}٪ نسبت به هفته قبل` : `↓ ${Math.abs(growthPct)}٪ نسبت به هفته قبل`)
    : '';

  /* ═══ BUILD HTML ═══ */
  el.innerHTML = `
    <style>
      /* ── section ── */
      .s2-section{margin-bottom:26px;}
      .s2-sec-head{display:flex;align-items:center;gap:7px;margin-bottom:12px;}
      .s2-sec-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0;box-shadow:0 0 6px var(--glow);}
      .s2-sec-title{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text2);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}
      .s2-sec-line{flex:1;height:1px;background:var(--border);}

      /* ── overview cards ── */
      .ov-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
      .ov-card{border-radius:14px;padding:14px;background:var(--card);border:1px solid var(--card-b);position:relative;overflow:hidden;}

      /* total — big ring */
      .ov-total{grid-column:1/-1;display:flex;align-items:center;gap:14px;}
      .ov-ring-wrap{position:relative;flex-shrink:0;}
      .ov-ring-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:22px;font-weight:900;color:var(--accent);}
      .ov-total-info{}
      .ov-total-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:4px;}
      .ov-total-sub{font-size:9px;color:var(--text2);line-height:1.6;}
      .ov-total-growth{display:inline-block;margin-top:5px;font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 8px;border-radius:6px;}
      .ov-growth-up{background:rgba(52,212,153,.12);color:#34d499;border:1px solid rgba(52,212,153,.25);}
      .ov-growth-dn{background:rgba(255,68,68,.12);color:#ff4444;border:1px solid rgba(255,68,68,.25);}
      .ov-growth-neu{background:var(--surface2);color:var(--text3);border:1px solid var(--border);}

      /* week — timeline bar */
      .ov-week-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:900;color:var(--accent2);line-height:1;}
      .ov-week-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:6px;}
      .ov-mini-bars{display:flex;align-items:flex-end;gap:3px;height:24px;margin-top:8px;}
      .ov-mini-bar{flex:1;border-radius:2px 2px 0 0;background:var(--accent2);opacity:.4;min-height:2px;transition:opacity .2s;}
      .ov-mini-bar.today{opacity:1;}

      /* today — clock-style */
      .ov-today-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:900;color:var(--accent3);line-height:1;}
      .ov-today-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:6px;}
      .ov-hour-dots{display:flex;flex-wrap:wrap;gap:2px;margin-top:8px;}
      .ov-hdot{width:6px;height:6px;border-radius:1px;background:var(--border2);}
      .ov-hdot.active{background:var(--accent3);}

      /* risk — gauge */
      .ov-risk-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:6px;}
      .ov-gauge-wrap{position:relative;}
      .ov-gauge-num{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-family:'Syne',sans-serif;font-size:20px;font-weight:900;line-height:1;}
      .ov-gauge-sub{font-size:8px;color:var(--text2);margin-top:4px;}

      /* ── insight bar ── */
      .insight-bar{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:11px;background:rgba(123,97,255,.06);border:1px solid rgba(123,97,255,.15);margin-bottom:8px;}
      .insight-icon{font-size:14px;flex-shrink:0;}
      .insight-txt{font-size:10px;color:var(--text2);line-height:1.5;flex:1;}
      .insight-txt strong{color:var(--text1);}

      /* ── timeline ── */
      .timeline-wrap{width:100%;overflow-x:auto;}
      .timeline-wrap svg text{font-family:'JetBrains Mono',monospace;}

      /* ── heatmap ── */
      .heatmap-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
      .hm-day-label{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);text-align:center;margin-bottom:4px;}
      .hm-cell{aspect-ratio:1;border-radius:3px;min-height:10px;}
      .hm-hour-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:2px;margin-top:6px;}
      .hm-hour-cell{aspect-ratio:1;border-radius:2px;}
      .hm-hour-label{font-family:'JetBrains Mono',monospace;font-size:5.5px;color:var(--text3);text-align:center;margin-top:2px;}

      /* ── geo ── */
      .geo-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
      .geo-row{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);}
      .geo-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:14px;flex-shrink:0;}
      .geo-name{font-size:10px;color:var(--text1);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .geo-bar-wrap{width:44px;flex-shrink:0;}
      .geo-bar-track{height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;}
      .geo-bar-fill{height:100%;border-radius:2px;}
      .geo-cnt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);width:18px;text-align:left;flex-shrink:0;}
      .geo-risk-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}

      /* ── source ── */
      .src-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:7px;}
      .src-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);position:relative;overflow:hidden;}
      .src-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
      .src-name{font-size:10px;font-weight:700;color:var(--text1);margin-bottom:5px;}
      .src-num{font-family:'Syne',sans-serif;font-size:24px;font-weight:900;line-height:1;color:var(--accent);}
      .src-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);}
      .src-risk-row{display:flex;align-items:center;gap:4px;margin-top:6px;}
      .src-risk-lbl{font-size:8px;color:var(--text2);}

      /* ── demographics ── */
      .demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
      .demo-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);}
      .demo-title{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:10px;}
      .demo-bar-row{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
      .demo-bar-lbl{font-size:9px;color:var(--text2);width:38px;flex-shrink:0;text-align:left;}
      .demo-bar-track{flex:1;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;}
      .demo-bar-fill{height:100%;border-radius:3px;}
      .demo-bar-val{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:20px;text-align:left;flex-shrink:0;}

      /* ── segmentation ── */
      .seg-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
      .seg-select{background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:6px 10px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;flex:1;min-width:100px;}
      .seg-result{padding:10px;border-radius:11px;background:var(--bg2);border:1px solid var(--border);}
      .seg-num{font-family:'Syne',sans-serif;font-size:32px;font-weight:900;color:var(--accent);line-height:1;}
      .seg-desc{font-size:9px;color:var(--text2);margin-top:4px;}
      .seg-risk-row{margin-top:8px;display:flex;align-items:center;gap:8px;}

      /* ── speed ── */
      .spd-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:8px;}
      .spd-card{padding:11px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);text-align:center;}
      .spd-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:900;color:var(--accent3);line-height:1;}
      .spd-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-top:3px;}

      /* ── question breakdown ── */
      .q2-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);margin-bottom:7px;}
      .q2-head{display:flex;align-items:center;gap:8px;margin-bottom:9px;}
      .q2-id{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);background:var(--glow2);padding:2px 7px;border-radius:5px;}
      .q2-time{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--accent3);background:rgba(0,212,255,.08);padding:2px 7px;border-radius:5px;}
      .q2-total{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-right:auto;}
      .q2-row{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
      .q2-lbl{font-size:9px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .q2-track{width:70px;flex-shrink:0;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;}
      .q2-fill{height:100%;border-radius:2px;background:var(--accent);}
      .q2-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:26px;text-align:left;flex-shrink:0;}

      /* ── table ── */
      .tbl-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px;align-items:center;}
      .tbl-search{background:var(--surface);border:1px solid var(--border2);border-radius:9px;padding:7px 11px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:11px;outline:none;flex:1;min-width:130px;transition:border-color .2s;}
      .tbl-search::placeholder{color:var(--text3);}
      .tbl-search:focus{border-color:var(--accent);}
      .tbl-select{background:var(--bg2);border:1px solid var(--border2);border-radius:9px;padding:7px 9px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;}
      .tbl-cnt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
      .tbl-wrap{overflow-x:auto;border-radius:12px;border:1px solid var(--border);}
      table{width:100%;border-collapse:collapse;font-size:10px;min-width:480px;}
      th{background:var(--bg2);color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:1px;padding:9px;text-align:right;border-bottom:1px solid var(--border2);white-space:nowrap;cursor:pointer;user-select:none;transition:color .2s;}
      th:hover{color:var(--accent);}
      th.sort-asc::after{content:' ↑';}th.sort-desc::after{content:' ↓';}
      td{padding:7px 9px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--text2);}
      tr:last-child td{border-bottom:none;}
      tr:hover td{background:rgba(255,255,255,.02);}
      .td-name{color:var(--text1);font-weight:600;white-space:nowrap;}
      .td-date{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
      .td-av{image-rendering:pixelated;border-radius:5px;border:1px solid var(--border2);}
      .td-click{font-size:9px;color:var(--accent);cursor:pointer;font-family:'JetBrains Mono',monospace;background:var(--glow2);border:none;padding:2px 7px;border-radius:5px;}
      .td-click:active{transform:scale(.9);}
      .pager{display:flex;gap:4px;justify-content:center;margin-top:10px;flex-wrap:wrap;}
      .pb{background:var(--card);border:1px solid var(--border);border-radius:7px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:9px;padding:4px 9px;cursor:pointer;transition:all .2s;}
      .pb:hover,.pb.active{background:var(--glow);border-color:var(--accent);color:var(--accent);}
    </style>

    ${buildInsightBar(rows, total, week, today, growthStr, avgRisk)}
    ${buildOverview(total, week, today, avgRisk, byDay, byHour, growthStr)}
    ${buildTimeline(byDay)}
    ${buildHeatmap(byWeekday, byHour)}
    ${buildGeo(topProv, provRisk, total)}
    ${buildSource(srcMap, srcRisk, total)}
    ${buildDemographics(genderMap, ageGroups, total)}
    ${buildSegmentation(rows)}
    ${buildSpeed(avgTime, minTime, maxTime, speedMap, times)}
    ${buildQuestions(qList)}
    ${buildAvatars(topAv, total)}
    ${topAv.length || Object.keys(profMap).length ? buildProfiles(profMap, total) : ''}
    ${Object.keys(cohortMap).length ? buildCohort(cohortMap, rows) : ''}
    ${buildTable(rows)}
  `;

  /* ── post-render D3 charts ── */
  waitD3(() => {
    drawTimelineD3(byDay);
    drawGaugeD3(avgRisk);
    drawTotalRingD3(total, week);
  });

  /* ── table init ── */
  window._tblRows    = rows;
  window._tblSort    = { col: 'date', dir: -1 };
  window._tblPage    = 1;
  window._tblFiltered = rows;
  filterTable();

  /* ── segmentation ── */
  initSegmentation(rows);
}

/* ═══ WAIT FOR D3 ═══ */
function waitD3(cb, tries = 0) {
  if (window.d3) { cb(); return; }
  if (tries > 30) return;
  setTimeout(() => waitD3(cb, tries + 1), 100);
}

/* ═══ INSIGHT BAR ═══ */
function buildInsightBar(rows, total, week, today, growthStr, avgRisk) {
  const topProv = (() => {
    const m = {};
    rows.forEach(r => { if (r.province) m[r.province] = (m[r.province] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  })();

  const insights = [];
  if (total > 0) insights.push(`<strong>${total}</strong> نفر تا الان شرکت کردن`);
  if (growthStr) insights.push(growthStr);
  if (topProv) insights.push(`پرتراکم‌ترین استان: <strong>${topProv[0]}</strong> با ${topProv[1]} نفر`);
  if (avgRisk > 0) insights.push(`میانگین ریسک: <strong>${avgRisk}</strong> — ${riskLabel(avgRisk)}`);

  return insights.map(t =>
    `<div class="insight-bar"><span class="insight-icon">◈</span><span class="insight-txt">${t}</span></div>`
  ).join('');
}

/* ═══ OVERVIEW ═══ */
function buildOverview(total, week, today, avgRisk, byDay, byHour, growthStr) {
  const growthClass = growthStr.startsWith('↑') ? 'ov-growth-up' : growthStr.startsWith('↓') ? 'ov-growth-dn' : 'ov-growth-neu';

  /* mini bars for last 7 days */
  const days = Object.entries(byDay).sort((a, b) => a[0] > b[0] ? 1 : -1).slice(-7);
  const maxD  = Math.max(...days.map(d => d[1]), 1);
  const todayKey = new Date().toISOString().slice(0, 10);
  const miniBars = days.map(([k, v]) =>
    `<div class="ov-mini-bar${k === todayKey ? ' today' : ''}" style="height:${Math.max(2, Math.round((v / maxD) * 24))}px;opacity:${k === todayKey ? 1 : 0.35 + (v / maxD) * 0.45}"></div>`
  ).join('');

  /* hour dots (0-23 hours, highlight active) */
  const maxH = Math.max(...byHour, 1);
  const hourDots = byHour.map((v, i) =>
    `<div class="ov-hdot${v > 0 ? ' active' : ''}" style="${v > 0 ? `opacity:${0.3 + (v / maxH) * 0.7};background:var(--accent3)` : ''}" title="${i}:00"></div>`
  ).join('');

  const rc = riskColor(avgRisk);

  return section('نگاه کلی', `
    <div class="ov-grid">
      <div class="ov-card ov-total">
        <svg id="ov-ring-svg" width="72" height="72" style="flex-shrink:0"></svg>
        <div class="ov-total-info">
          <div class="ov-total-label">TOTAL RESPONDENTS</div>
          <div class="ov-total-sub">مجموع پاسخ‌دهندگان<br>از ابتدای جمع‌آوری داده</div>
          ${growthStr ? `<div class="ov-total-growth ${growthClass}">${growthStr}</div>` : ''}
        </div>
      </div>

      <div class="ov-card">
        <div class="ov-week-label">THIS WEEK</div>
        <div class="ov-week-num">${week}</div>
        <div class="ov-mini-bars">${miniBars}</div>
      </div>

      <div class="ov-card">
        <div class="ov-today-label">TODAY</div>
        <div class="ov-today-num">${today}</div>
        <div class="ov-hour-dots">${hourDots}</div>
      </div>

      <div class="ov-card" style="grid-column:1/-1">
        <div class="ov-risk-label">AVG RISK SCORE · ۱ تا ۴</div>
        <svg id="ov-gauge-svg" width="100%" height="70"></svg>
        <div class="ov-gauge-sub" style="text-align:center;color:${rc}">${riskLabel(avgRisk)}</div>
      </div>
    </div>
  `);
}

/* ═══ D3: TOTAL RING ═══ */
function drawTotalRingD3(total, week) {
  const svg = d3.select('#ov-ring-svg');
  const w = 72, r = 30, stroke = 5;
  const cx = w / 2, cy = w / 2;
  const pct = Math.min(total > 0 ? (week / total) : 0, 1);
  const arc = d3.arc().innerRadius(r - stroke).outerRadius(r).startAngle(0);

  svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r - stroke / 2)
     .attr('fill', 'none').attr('stroke', 'var(--border2)').attr('stroke-width', stroke);

  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
  g.append('path').datum({ endAngle: pct * 2 * Math.PI })
   .attr('d', arc).attr('fill', 'var(--accent)');

  svg.append('text').attr('x', cx).attr('y', cy + 5)
     .attr('text-anchor', 'middle').attr('fill', 'var(--accent)')
     .attr('font-size', '16').attr('font-weight', '900')
     .attr('font-family', 'Syne, sans-serif').text(total);
}

/* ═══ D3: GAUGE ═══ */
function drawGaugeD3(avgRisk) {
  const svg = d3.select('#ov-gauge-svg');
  const node = document.getElementById('ov-gauge-svg');
  if (!node) return;
  const W = node.getBoundingClientRect().width || 300;
  const H = 70, cx = W / 2, cy = H - 10, r = Math.min(cx - 20, 50);

  const col = riskColor(avgRisk);
  const startA = -Math.PI, endA = 0;
  const pct = avgRisk > 0 ? Math.min((avgRisk - 1) / 3, 1) : 0;
  const valA  = startA + pct * Math.PI;

  const arc = d3.arc().innerRadius(r - 8).outerRadius(r).startAngle(startA).endAngle(endA);
  const arcFill = d3.arc().innerRadius(r - 8).outerRadius(r).startAngle(startA).endAngle(valA);

  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
  g.append('path').attr('d', arc({})).attr('fill', 'var(--bg3)');
  if (avgRisk > 0) g.append('path').attr('d', arcFill({})).attr('fill', col);

  /* needle */
  if (avgRisk > 0) {
    const nx = Math.cos(valA - Math.PI / 2) * (r - 12);
    const ny = Math.sin(valA - Math.PI / 2) * (r - 12);
    g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', nx).attr('y2', ny)
     .attr('stroke', col).attr('stroke-width', 2).attr('stroke-linecap', 'round');
    g.append('circle').attr('r', 4).attr('fill', col);
  }

  g.append('text').attr('text-anchor', 'middle').attr('y', -r + 4)
   .attr('fill', col).attr('font-size', '18').attr('font-weight', '900')
   .attr('font-family', 'Syne,sans-serif').text(avgRisk || '—');

  /* scale labels */
  ['۱', '۲', '۳', '۴'].forEach((lbl, i) => {
    const a = startA + (i / 3) * Math.PI;
    const lx = Math.cos(a) * (r + 10), ly = Math.sin(a) * (r + 10);
    g.append('text').attr('x', lx).attr('y', ly + 3)
     .attr('text-anchor', 'middle').attr('fill', 'var(--text3)')
     .attr('font-size', '7').attr('font-family', 'JetBrains Mono,monospace').text(lbl);
  });
}

/* ═══ TIMELINE ═══ */
function buildTimeline(byDay) {
  return section('روند زمانی', `
    <div class="timeline-wrap"><svg id="timeline-svg" width="100%" height="130"></svg></div>
  `);
}

function drawTimelineD3(byDay) {
  const node = document.getElementById('timeline-svg');
  if (!node || !window.d3) return;

  const entries = Object.entries(byDay).sort((a, b) => a[0] > b[0] ? 1 : -1);
  if (!entries.length) { d3.select('#timeline-svg').append('text').attr('x', 10).attr('y', 20).attr('fill', 'var(--text3)').attr('font-size', 9).text('// داده‌ای وجود ندارد'); return; }

  const W = node.getBoundingClientRect().width || 340;
  const H = 130, pad = { t: 10, r: 10, b: 28, l: 28 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;

  const data = entries.map(([k, v]) => ({ date: new Date(k), val: v }));
  const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, iW]);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.val) * 1.15]).range([iH, 0]);

  const svg = d3.select('#timeline-svg').attr('width', W).attr('height', H);
  const g   = svg.append('g').attr('transform', `translate(${pad.l},${pad.t})`);

  /* area */
  const area = d3.area().x(d => xScale(d.date)).y0(iH).y1(d => yScale(d.val)).curve(d3.curveCatmullRom);
  const line = d3.line().x(d => xScale(d.date)).y(d => yScale(d.val)).curve(d3.curveCatmullRom);

  const gradId = 'tl-grad-' + Date.now();
  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
  grad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--accent)').attr('stop-opacity', .35);
  grad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--accent)').attr('stop-opacity', .02);

  g.append('path').datum(data).attr('d', area).attr('fill', `url(#${gradId})`);
  g.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', 'var(--accent)').attr('stroke-width', 1.5);

  /* dots on hover */
  g.selectAll('circle').data(data).enter().append('circle')
   .attr('cx', d => xScale(d.date)).attr('cy', d => yScale(d.val))
   .attr('r', 2.5).attr('fill', 'var(--accent)').attr('opacity', .7);

  /* axes */
  const xAxis = d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%m/%d'));
  const yAxis = d3.axisLeft(yScale).ticks(3).tickFormat(d => d);

  g.append('g').attr('transform', `translate(0,${iH})`).call(xAxis)
   .selectAll('text, line, path').attr('stroke', 'var(--border2)').attr('fill', 'var(--text3)')
   .style('font-size', '7px').style('font-family', 'JetBrains Mono,monospace');
  g.append('g').call(yAxis)
   .selectAll('text, line, path').attr('stroke', 'var(--border2)').attr('fill', 'var(--text3)')
   .style('font-size', '7px').style('font-family', 'JetBrains Mono,monospace');

  g.selectAll('.domain').attr('stroke', 'var(--border)');
  g.selectAll('.tick line').attr('stroke', 'var(--border)');
}

/* ═══ HEATMAP ═══ */
function buildHeatmap(byWeekday, byHour) {
  const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const maxW = Math.max(...byWeekday, 1);
  const maxH = Math.max(...byHour, 1);

  const weekCells = byWeekday.map((v, i) => {
    const op = v > 0 ? 0.15 + (v / maxW) * 0.85 : 0.06;
    return `<div>
      <div class="hm-day-label">${dayNames[i]}</div>
      <div class="hm-cell" style="background:var(--accent);opacity:${op.toFixed(2)}" title="${v} نفر"></div>
    </div>`;
  }).join('');

  const hourCells = byHour.map((v, i) => {
    const op = v > 0 ? 0.12 + (v / maxH) * 0.88 : 0.05;
    return `<div>
      <div class="hm-hour-cell" style="background:var(--accent3);opacity:${op.toFixed(2)}" title="${i}:00 — ${v} نفر"></div>
      ${i % 3 === 0 ? `<div class="hm-hour-label">${i}</div>` : '<div style="height:8px"></div>'}
    </div>`;
  }).join('');

  return section('الگوی فعالیت', `
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:1.5px;margin-bottom:6px">// روزهای هفته</div>
    <div class="heatmap-grid">${weekCells}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:1.5px;margin-top:12px;margin-bottom:6px">// ساعات شبانه‌روز</div>
    <div class="hm-hour-grid">${hourCells}</div>
  `);
}

/* ═══ GEO ═══ */
function buildGeo(topProv, provRisk, total) {
  if (!topProv.length) return '';
  const maxV = topProv[0][1];

  const rows = topProv.map(([name, cnt], i) => {
    const risks = provRisk[name] || [];
    const avgR  = risks.length ? parseFloat((risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(1)) : 0;
    const col   = riskColor(avgR);
    const pctBar = Math.round((cnt / maxV) * 100);

    return `<div class="geo-row">
      <span class="geo-rank">#${i + 1}</span>
      <span class="geo-name">${name}</span>
      <div class="geo-bar-wrap">
        <div class="geo-bar-track"><div class="geo-bar-fill" style="width:${pctBar}%;background:var(--accent)"></div></div>
      </div>
      <span class="geo-cnt">${cnt}</span>
      <div class="geo-risk-dot" style="background:${col};box-shadow:0 0 4px ${col}" title="ریسک: ${avgR || '—'}"></div>
    </div>`;
  }).join('');

  return section('پراکندگی جغرافیایی', `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3)">
      <span>● تعداد</span>
      <span style="display:flex;align-items:center;gap:3px">نقطه رنگی = میانگین ریسک استان
        <span style="width:6px;height:6px;border-radius:50%;background:#34d499;display:inline-block"></span>کم
        <span style="width:6px;height:6px;border-radius:50%;background:#fbbf24;display:inline-block"></span>متوسط
        <span style="width:6px;height:6px;border-radius:50%;background:#ff4444;display:inline-block"></span>بالا
      </span>
    </div>
    <div class="geo-grid">${rows}</div>
  `);
}

/* ═══ SOURCE ═══ */
function buildSource(srcMap, srcRisk, total) {
  const entries = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '';

  const srcColors = {
    'تلگرام': '#26a5e4', 'telegram': '#26a5e4',
    'اینستاگرام': '#f09433', 'instagram': '#f09433',
    'واتساپ': '#25d366', 'whatsapp': '#25d366',
    'مستقیم': 'var(--accent)', 'direct': 'var(--accent)',
    'ایمیل': '#ea4335', 'email': '#ea4335',
  };

  const cards = entries.map(([name, cnt]) => {
    const risks = srcRisk[name] || [];
    const avgR  = risks.length ? parseFloat((risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(1)) : 0;
    const col   = srcColors[name] || srcColors[name.toLowerCase()] || 'var(--accent)';
    const rc    = riskColor(avgR);

    return `<div class="src-card" style="border-color:${col}22">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${col}"></div>
      <div class="src-name">${esc(name)}</div>
      <div class="src-num" style="color:${col}">${cnt}</div>
      <div class="src-pct">${pct(cnt, total)}٪ از کل</div>
      ${avgR > 0 ? `<div class="src-risk-row"><div style="width:6px;height:6px;border-radius:50%;background:${rc}"></div><span class="src-risk-lbl">ریسک: ${avgR}</span></div>` : ''}
    </div>`;
  }).join('');

  return section('منبع ورود', `<div class="src-grid">${cards}</div>`);
}

/* ═══ DEMOGRAPHICS ═══ */
function buildDemographics(genderMap, ageGroups, total) {
  const genderTotal = Object.values(genderMap).reduce((a, b) => a + b, 0);
  const genderMax   = Math.max(...Object.values(genderMap), 1);
  const ageMax      = Math.max(...Object.values(ageGroups), 1);

  const gRows = Object.entries(genderMap).sort((a, b) => b[1] - a[1]).map(([g, cnt]) => {
    const icon = g === 'مرد' ? '👨' : g === 'زن' ? '👩' : '👤';
    const col  = g === 'مرد' ? 'var(--accent3)' : g === 'زن' ? '#ff6b9d' : 'var(--accent2)';
    return `<div class="demo-bar-row">
      <span class="demo-bar-lbl">${icon} ${g}</span>
      <div class="demo-bar-track"><div class="demo-bar-fill" style="width:${pct(cnt, genderMax)}%;background:${col}"></div></div>
      <span class="demo-bar-val">${pct(cnt, genderTotal)}%</span>
    </div>`;
  }).join('');

  const aRows = Object.entries(ageGroups).map(([range, cnt]) =>
    `<div class="demo-bar-row">
      <span class="demo-bar-lbl">${range}</span>
      <div class="demo-bar-track"><div class="demo-bar-fill" style="width:${pct(cnt, ageMax)}%;background:var(--accent2)"></div></div>
      <span class="demo-bar-val">${cnt}</span>
    </div>`
  ).join('');

  return section('جمعیت‌شناسی', `
    <div class="demo-grid">
      <div class="demo-card">
        <div class="demo-title">// GENDER</div>
        ${gRows || '<div style="color:var(--text3);font-size:9px">داده‌ای نیست</div>'}
      </div>
      <div class="demo-card">
        <div class="demo-title">// AGE</div>
        ${aRows}
      </div>
    </div>
  `);
}

/* ═══ SEGMENTATION ═══ */
function buildSegmentation(rows) {
  const provinces = [...new Set(rows.map(r => r.province).filter(Boolean))].sort();
  const genders   = [...new Set(rows.map(r => r.gender).filter(Boolean))];
  const cohorts   = [...new Set(rows.map(r => r.cohort).filter(Boolean))];

  return section('فیلتر ترکیبی', `
    <div class="seg-filters">
      <select class="seg-select" id="seg-prov" onchange="updateSeg()">
        <option value="">همه استان‌ها</option>
        ${provinces.map(p => `<option value="${esc(p)}">${p}</option>`).join('')}
      </select>
      <select class="seg-select" id="seg-gender" onchange="updateSeg()">
        <option value="">همه جنسیت‌ها</option>
        ${genders.map(g => `<option value="${esc(g)}">${g}</option>`).join('')}
      </select>
      <select class="seg-select" id="seg-age" onchange="updateSeg()">
        <option value="">همه سنی</option>
        <option value="18-25">۱۸–۲۵</option>
        <option value="26-35">۲۶–۳۵</option>
        <option value="36-45">۳۶–۴۵</option>
        <option value="46-55">۴۶–۵۵</option>
        <option value="56-99">۵۶+</option>
      </select>
      ${cohorts.length ? `<select class="seg-select" id="seg-cohort" onchange="updateSeg()">
        <option value="">همه کوهورت‌ها</option>
        ${cohorts.map(c => `<option value="${esc(c)}">${c}</option>`).join('')}
      </select>` : ''}
    </div>
    <div class="seg-result" id="seg-result">
      <div class="seg-num">${rows.length}</div>
      <div class="seg-desc">همه پاسخ‌دهندگان انتخاب شده‌اند</div>
    </div>
  `);
}

function initSegmentation(rows) {
  window._segRows = rows;
  updateSeg();
}

function updateSeg() {
  const rows  = window._segRows || [];
  const prov  = document.getElementById('seg-prov')?.value   || '';
  const gen   = document.getElementById('seg-gender')?.value || '';
  const age   = document.getElementById('seg-age')?.value    || '';
  const coh   = document.getElementById('seg-cohort')?.value || '';

  let f = rows;
  if (prov) f = f.filter(r => r.province === prov);
  if (gen)  f = f.filter(r => r.gender   === gen);
  if (age) {
    const [lo, hi] = age.split('-').map(Number);
    f = f.filter(r => { const a = parseInt(r.age); return a >= lo && a <= hi; });
  }
  if (coh) f = f.filter(r => r.cohort === coh);

  const riskF = f.filter(r => r.risk > 0);
  const avgR  = riskF.length
    ? parseFloat((riskF.reduce((s, r) => s + r.risk, 0) / riskF.length).toFixed(2))
    : 0;
  const rc = riskColor(avgR);

  const el = document.getElementById('seg-result');
  if (!el) return;
  el.innerHTML = `
    <div class="seg-num">${f.length}</div>
    <div class="seg-desc">${f.length} نفر با این فیلترها</div>
    ${avgR > 0 ? `<div class="seg-risk-row">
      <div style="width:8px;height:8px;border-radius:50%;background:${rc}"></div>
      <span style="font-size:9px;color:var(--text2)">میانگین ریسک: <strong style="color:${rc}">${avgR}</strong> — ${riskLabel(avgR)}</span>
    </div>` : ''}
  `;
}

/* ═══ SPEED ═══ */
function buildSpeed(avgTime, minTime, maxTime, speedMap, times) {
  /* histogram buckets */
  if (!times.length) return '';
  const bucketSize = 30, buckets = {};
  times.forEach(t => {
    const b = Math.floor(t / bucketSize) * bucketSize;
    buckets[b] = (buckets[b] || 0) + 1;
  });
  const bucketEntries = Object.entries(buckets).sort((a, b) => +a[0] - +b[0]);
  const maxBucket = Math.max(...bucketEntries.map(b => b[1]), 1);

  const histBars = bucketEntries.map(([b, cnt]) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
      <div style="width:100%;height:${Math.max(3, Math.round((cnt / maxBucket) * 48))}px;background:var(--accent3);opacity:${0.3 + (cnt / maxBucket) * 0.7};border-radius:2px 2px 0 0"></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3)">${b}s</div>
    </div>`
  ).join('');

  const speedRows = Object.entries(speedMap).sort((a, b) => b[1] - a[1]).map(([name, cnt]) =>
    `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:9px;color:var(--text2)">${esc(name)}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent)">${cnt}</span>
    </div>`
  ).join('');

  return section('زمان‌سنجی', `
    <div class="spd-grid">
      <div class="spd-card">
        <div class="spd-val">${avgTime}s</div>
        <div class="spd-lbl">میانگین</div>
      </div>
      <div class="spd-card">
        <div class="spd-val" style="color:#34d499">${minTime}s</div>
        <div class="spd-lbl">سریع‌ترین</div>
      </div>
      <div class="spd-card">
        <div class="spd-val" style="color:#ff4444">${maxTime}s</div>
        <div class="spd-lbl">کندترین</div>
      </div>
    </div>
    <div style="display:flex;align-items:flex-end;gap:2px;height:60px;padding:0 2px;margin-bottom:4px">
      ${histBars}
    </div>
    ${speedRows ? `<div style="margin-top:8px">${speedRows}</div>` : ''}
  `);
}

/* ═══ QUESTIONS ═══ */
function buildQuestions(qList) {
  if (!qList.length) return '';

  const cards = qList.map(q => {
    const ansList  = Object.entries(q.answers).sort((a, b) => b[1] - a[1]);
    const qTotal   = ansList.reduce((s, [, c]) => s + c, 0);
    const avgT     = q.times.length
      ? Math.round(q.times.reduce((a, b) => a + b, 0) / q.times.length)
      : null;
    const top      = ansList[0];
    const topPct   = top ? Math.round((top[1] / qTotal) * 100) : 0;

    return `<div class="q2-card">
      <div class="q2-head">
        <span class="q2-id">س ${q.id}</span>
        ${avgT ? `<span class="q2-time">⏱ ${avgT}s</span>` : ''}
        <span class="q2-total">${qTotal} پاسخ</span>
      </div>
      ${ansList.slice(0, 5).map(([ans, cnt]) =>
        `<div class="q2-row">
          <span class="q2-lbl" title="${esc(ans)}">${esc(ans.substring(0, 35))}${ans.length > 35 ? '…' : ''}</span>
          <div class="q2-track"><div class="q2-fill" style="width:${pct(cnt, qTotal)}%"></div></div>
          <span class="q2-pct">${pct(cnt, qTotal)}%</span>
        </div>`
      ).join('')}
    </div>`;
  }).join('');

  return section('تحلیل سوال‌ها', cards);
}

/* ═══ AVATARS ═══ */
function buildAvatars(topAv, total) {
  if (!topAv.length) return '';

  const cards = topAv.map(([name, cnt], i) => {
    const img = makeAvatar(name, 44);
    return `<div class="av-card${i === 0 ? ' top' : ''}">
      ${i === 0 ? '<span class="av-crown">👑</span>' : ''}
      ${img ? `<img class="av-img" src="${img}" alt="${name}">` : `<div class="av-fb">🎭</div>`}
      <div class="av-name">${esc(name)}</div>
      <div class="av-cnt">${cnt}</div>
      <div class="av-pct">${pct(cnt, total)}%</div>
      <div class="av-bw"><div class="av-bf" style="width:${pct(cnt, topAv[0][1])}%"></div></div>
    </div>`;
  }).join('');

  return section('آواتارها', `<div class="av-grid">${cards}</div>`);
}

/* ═══ PROFILES ═══ */
function buildProfiles(profMap, total) {
  const entries = Object.entries(profMap).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '';
  const maxV = entries[0][1];

  const rows = entries.map(([name, cnt], i) =>
    `<div class="irow">
      <span class="irow-rank">#${i + 1}</span>
      <span class="irow-lbl">${esc(name)}</span>
      <div class="irow-bw"><div class="irow-bf" style="width:${pct(cnt, maxV)}%"></div></div>
      <span class="irow-cnt">${cnt}</span>
      <span class="irow-pct">${pct(cnt, total)}%</span>
    </div>`
  ).join('');

  return section('پروفایل‌ها', `<div class="scard"><div class="ilist">${rows}</div></div>`);
}

/* ═══ COHORT ═══ */
function buildCohort(cohortMap, rows) {
  const cards = Object.entries(cohortMap).map(([name, cnt]) => {
    const riskF = rows.filter(r => r.cohort === name && r.risk > 0);
    const avgR  = riskF.length
      ? parseFloat((riskF.reduce((s, r) => s + r.risk, 0) / riskF.length).toFixed(1))
      : 0;
    const rc = riskColor(avgR);
    return `<div class="co-c">
      <div class="co-name">${esc(name)}</div>
      <div class="co-num">${cnt}</div>
      <div class="co-risk" style="color:${rc}">${avgR ? `ریسک: ${avgR}` : '—'}</div>
    </div>`;
  }).join('');

  return section('کوهورت', `<div class="cohort-grid">${cards}</div>`);
}

/* ═══ TABLE ═══ */
function buildTable(rows) {
  return section('همه پاسخ‌دهندگان', `
    <div class="tbl-filters">
      <input class="tbl-search" id="tblSearch" placeholder="جستجو نام / استان..." oninput="filterTable()">
      <select class="tbl-select" id="tblRisk" onchange="filterTable()">
        <option value="">همه ریسک</option>
        <option value="low">محافظه‌کار</option>
        <option value="mid">متعادل</option>
        <option value="high">ریسک‌پذیر</option>
      </select>
      <span class="tbl-cnt" id="tblCnt">${rows.length} نفر</span>
    </div>
    <div class="tbl-wrap">
      <table id="mainTbl">
        <thead><tr>
          <th onclick="sortTable('name')">نام</th>
          <th onclick="sortTable('age')">سن</th>
          <th onclick="sortTable('province')">استان</th>
          <th onclick="sortTable('risk')">ریسک</th>
          <th onclick="sortTable('profile')">پروفایل</th>
          <th onclick="sortTable('date')">تاریخ</th>
          <th>آواتار</th>
          <th></th>
        </tr></thead>
        <tbody id="tblBody"></tbody>
      </table>
    </div>
    <div class="pager" id="tblPager"></div>
  `);
}

/* ═══ TABLE HELPERS ═══ */
function filterTable() {
  if (!window._tblRows) return;
  const q  = (document.getElementById('tblSearch')?.value || '').toLowerCase();
  const rk = document.getElementById('tblRisk')?.value || '';

  let f = window._tblRows.filter(r => {
    const nameOk = !q || (r.name || '').toLowerCase().includes(q) || (r.province || '').toLowerCase().includes(q);
    const rv = parseFloat(r.risk) || 0;
    const riskOk = !rk
      || (rk === 'low'  && rv > 0 && rv < 1.75)
      || (rk === 'mid'  && rv >= 1.75 && rv < 2.5)
      || (rk === 'high' && rv >= 2.5);
    return nameOk && riskOk;
  });

  const s = window._tblSort || { col: 'date', dir: -1 };
  f.sort((a, b) => {
    let av = a[s.col] || '', bv = b[s.col] || '';
    if (s.col === 'risk' || s.col === 'age') { av = parseFloat(av) || 0; bv = parseFloat(bv) || 0; }
    return av > bv ? s.dir : av < bv ? -s.dir : 0;
  });

  window._tblFiltered = f;
  document.getElementById('tblCnt').textContent = f.length + ' نفر';

  const pp = 12, pages = Math.ceil(f.length / pp) || 1;
  window._tblPage = Math.min(window._tblPage || 1, pages);
  const slice = f.slice((window._tblPage - 1) * pp, window._tblPage * pp);

  document.getElementById('tblBody').innerHTML = slice.map((r, idx) => {
    const gi  = (window._tblPage - 1) * pp + idx;
    const img = r.avatar ? makeAvatar(r.avatar, 26) : null;
    const pc  = cleanProfile(r.profile);
    return `<tr>
      <td class="td-name">${esc(r.name)}</td>
      <td>${r.age || '—'}</td>
      <td>${r.province || '—'}</td>
      <td>${riskTag(r.risk)}</td>
      <td style="font-size:9px;color:var(--text2)">${pc ? esc(pc) : '—'}</td>
      <td class="td-date">${fmtDate(r.date)}</td>
      <td>${img ? `<img class="td-av" src="${img}" width="26" height="26" title="${esc(r.avatar)}">` : (r.avatar || '—')}</td>
      <td><button class="td-click" onclick="openPersonModal(window._tblFiltered[${gi}])">▾</button></td>
    </tr>`;
  }).join('');

  const pg = document.getElementById('tblPager');
  if (!pg) return;
  pg.innerHTML = '';
  if (pages > 1) {
    if (window._tblPage > 1)
      pg.innerHTML += `<button class="pb" onclick="goPage(${window._tblPage - 1})">«</button>`;
    for (let i = Math.max(1, window._tblPage - 2); i <= Math.min(pages, window._tblPage + 2); i++)
      pg.innerHTML += `<button class="pb${i === window._tblPage ? ' active' : ''}" onclick="goPage(${i})">${i}</button>`;
    if (window._tblPage < pages)
      pg.innerHTML += `<button class="pb" onclick="goPage(${window._tblPage + 1})">»</button>`;
  }
}

function goPage(p) { window._tblPage = p; filterTable(); }

function sortTable(col) {
  if (!window._tblSort) return;
  window._tblSort.dir = window._tblSort.col === col ? window._tblSort.dir * -1 : 1;
  window._tblSort.col = col;
  document.querySelectorAll('#mainTbl th').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
  const cols = ['name', 'age', 'province', 'risk', 'profile', 'date'];
  const th = document.querySelector(`#mainTbl th:nth-child(${cols.indexOf(col) + 1})`);
  if (th) th.classList.add(window._tblSort.dir === 1 ? 'sort-asc' : 'sort-desc');
  filterTable();
}
