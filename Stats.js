/* ═══════════════════════════════════════════════════════════════
   STATS.JS — F.R.I.D.A.Y Analytics Engine v2
   deps: D3 v7, apiStatsFetch, parseRow, makeAvatar,
         openPersonModal, riskTag, riskLbl, fmtDate, esc,
         cleanProfile  (from index.html)
═══════════════════════════════════════════════════════════════ */

(function () {
  if (window.d3) return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js';
  document.head.appendChild(s);
})();

function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

function riskColor(v) {
  const n = parseFloat(v) || 0;
  if (n <= 0)   return 'var(--text3)';
  if (n < 1.75) return '#34d499';
  if (n < 2.5)  return '#fbbf24';
  if (n < 3.25) return '#ff8c00';
  return '#ff4444';
}

function riskLabel(v) {
  const n = parseFloat(v) || 0;
  if (n <= 0)   return '—';
  if (n < 1.75) return 'محافظه‌کار';
  if (n < 2.5)  return 'متعادل';
  if (n < 3.25) return 'ریسک‌پذیر';
  return 'جسور';
}

function riskEmoji(v) {
  const n = parseFloat(v) || 0;
  if (n <= 0)   return '◌';
  if (n < 1.75) return '🟢';
  if (n < 2.5)  return '🟡';
  if (n < 3.25) return '🟠';
  return '🔴';
}

function parseIranDate(str) {
  if (!str) return null;
  try { const d = new Date(str); if (!isNaN(d)) return d; } catch (e) {}
  return null;
}

function stdDev(arr) {
  if (!arr.length) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/* ── section wrapper ── */
function section(id, title, inner) {
  return `<div class="s2-section" id="sec-${id}">
    <div class="s2-sec-head">
      <span class="s2-sec-dot"></span>
      <span class="s2-sec-title">${title}</span>
      <div class="s2-sec-line"></div>
    </div>
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

  /* ── risk stats ── */
  const riskRows = rows.filter(r => r.risk > 0);
  const riskVals = riskRows.map(r => r.risk);
  const avgRisk  = riskVals.length
    ? parseFloat((riskVals.reduce((s, v) => s + v, 0) / riskVals.length).toFixed(2)) : 0;
  const medRisk  = parseFloat(median(riskVals).toFixed(2));
  const sdRisk   = parseFloat(stdDev(riskVals).toFixed(2));

  /* ── time stats from answers ── */
  const allTimes = [];
  rows.forEach(r => {
    if (r.answers) r.answers.forEach(a => { if (a.time && a.time > 0) allTimes.push(a.time); });
  });
  const avgTime = allTimes.length ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length) : 0;
  const minTime = allTimes.length ? Math.round(Math.min(...allTimes)) : 0;
  const maxTime = allTimes.length ? Math.round(Math.max(...allTimes)) : 0;

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
  const provMap  = {}, provRisk = {};
  rows.forEach(r => {
    if (!r.province) return;
    provMap[r.province] = (provMap[r.province] || 0) + 1;
  });
  riskRows.forEach(r => {
    if (!r.province) return;
    if (!provRisk[r.province]) provRisk[r.province] = [];
    provRisk[r.province].push(r.risk);
  });
  const topProv = Object.entries(provMap).sort((a, b) => b[1] - a[1]);

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
  const srcMap = {}, srcRisk = {};
  rows.forEach(r => {
    const s = r.source || 'مستقیم';
    srcMap[s] = (srcMap[s] || 0) + 1;
  });
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
    Object.keys(raw[0]).forEach(key => {
      const m = key.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);
      if (m) { const qId = parseInt(m[1]); if (!qStatsMap[qId]) qStatsMap[qId] = { id: qId, answers: {}, times: [] }; }
    });
    raw.forEach(rawRow => {
      Object.keys(qStatsMap).forEach(qId => {
        const qn = parseInt(qId);
        const ansKey  = Object.keys(rawRow).find(k => { const m = k.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);  return m && parseInt(m[1]) === qn; });
        const timeKey = Object.keys(rawRow).find(k => { const m = k.trim().match(/^س(\d+)\s*[–\-]\s*زمان$/); return m && parseInt(m[1]) === qn; });
        if (ansKey)  { const ans = String(rawRow[ansKey]  || '').trim(); if (ans) qStatsMap[qId].answers[ans] = (qStatsMap[qId].answers[ans] || 0) + 1; }
        if (timeKey) { const t = parseFloat(rawRow[timeKey] || 0); if (t > 0) qStatsMap[qId].times.push(t); }
      });
    });
  }
  const qList = Object.values(qStatsMap).sort((a, b) => a.id - b.id);

  /* ── risk distribution ── */
  const riskDist = {
    low:  riskVals.filter(v => v < 1.75).length,
    mid:  riskVals.filter(v => v >= 1.75 && v < 2.5).length,
    high: riskVals.filter(v => v >= 2.5 && v < 3.25).length,
    very: riskVals.filter(v => v >= 3.25).length,
  };

  /* ── age × risk correlation ── */
  const ageRiskData = rows
    .filter(r => r.risk > 0 && parseInt(r.age) > 0)
    .map(r => ({ age: parseInt(r.age), risk: r.risk }));

  /* ── top active hour ── */
  const peakHour = byHour.indexOf(Math.max(...byHour));

  /* ═══ BUILD HTML ═══ */
  el.innerHTML = `
    <style>
      .s2-section{margin-bottom:22px;}
      .s2-sec-head{display:flex;align-items:center;gap:7px;margin-bottom:12px;}
      .s2-sec-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0;box-shadow:0 0 6px var(--glow);}
      .s2-sec-title{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text2);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}
      .s2-sec-line{flex:1;height:1px;background:var(--border);}

      /* ── intel cards ── */
      .intel-feed{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;}
      .intel-card{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border-radius:12px;background:var(--card);border:1px solid var(--card-b);position:relative;overflow:hidden;transition:transform .18s;}
      .intel-card:active{transform:scale(.98);}
      .intel-card::before{content:'';position:absolute;right:0;top:0;bottom:0;width:2px;border-radius:0 12px 12px 0;}
      .intel-card.ic-total::before{background:var(--accent);}
      .intel-card.ic-risk::before{background:var(--accent3);}
      .intel-card.ic-geo::before{background:var(--accent2);}
      .intel-card.ic-trend::before{background:#34d499;}
      .intel-card.ic-warn::before{background:#ff8c00;}
      .intel-icon{font-size:16px;flex-shrink:0;margin-top:1px;}
      .intel-body{flex:1;}
      .intel-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;}
      .intel-main{font-size:12px;color:var(--text1);line-height:1.5;}
      .intel-main strong{color:var(--accent);font-weight:700;}
      .intel-main .hi2{color:var(--accent3);}
      .intel-main .hi3{color:var(--accent2);}
      .intel-main .hi4{color:#34d499;}
      .intel-main .hiwarn{color:#ff8c00;}
      .intel-sub{font-size:9px;color:var(--text3);margin-top:3px;font-family:'JetBrains Mono',monospace;}

      /* ── total card ── */
      .total-hero{padding:16px;border-radius:16px;background:var(--card);border:1px solid var(--card-b);display:flex;align-items:center;gap:16px;margin-bottom:8px;}
      .total-ring-wrap{flex-shrink:0;position:relative;}
      .total-num-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
      .total-big{font-family:'Syne',sans-serif;font-size:24px;font-weight:900;color:var(--accent);line-height:1;text-shadow:0 0 20px var(--glow);}
      .total-unit{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);letter-spacing:1px;}
      .total-info{flex:1;}
      .total-title{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:6px;}
      .total-stats-row{display:flex;gap:12px;flex-wrap:wrap;}
      .total-stat{text-align:center;}
      .total-stat-num{font-family:'Syne',sans-serif;font-size:18px;font-weight:900;line-height:1;}
      .total-stat-lbl{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text3);margin-top:2px;}

      /* ── risk dashboard ── */
      .risk-dashboard{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
      .risk-gauge-card{grid-column:1/-1;padding:14px;border-radius:14px;background:var(--card);border:1px solid var(--card-b);}
      .risk-stat-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);text-align:center;}
      .risk-stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:900;line-height:1;}
      .risk-stat-lbl{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);margin-top:3px;letter-spacing:1.5px;}
      .risk-dist-row{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:10px;}
      .rd-cell{padding:7px 4px;border-radius:9px;text-align:center;}
      .rd-cell.low{background:rgba(52,212,153,.1);border:1px solid rgba(52,212,153,.25);}
      .rd-cell.mid{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);}
      .rd-cell.high{background:rgba(255,140,0,.1);border:1px solid rgba(255,140,0,.25);}
      .rd-cell.very{background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.25);}
      .rd-num{font-family:'Syne',sans-serif;font-size:18px;font-weight:900;line-height:1;}
      .rd-cell.low .rd-num{color:#34d499;}.rd-cell.mid .rd-num{color:#fbbf24;}.rd-cell.high .rd-num{color:#ff8c00;}.rd-cell.very .rd-num{color:#ff4444;}
      .rd-lbl{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:2px;}
      .rd-pct{font-size:7px;font-family:'JetBrains Mono',monospace;margin-top:1px;}
      .rd-cell.low .rd-pct{color:#34d499;}.rd-cell.mid .rd-pct{color:#fbbf24;}.rd-cell.high .rd-pct{color:#ff8c00;}.rd-cell.very .rd-pct{color:#ff4444;}

      /* ── timeline ── */
      .timeline-wrap{width:100%;overflow-x:auto;}

      /* ── geo ── */
      .geo-list{display:flex;flex-direction:column;gap:5px;}
      .geo-row{display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);cursor:default;}
      .geo-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:16px;flex-shrink:0;}
      .geo-name{font-size:10px;color:var(--text1);width:70px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .geo-bar-wrap{flex:1;}
      .geo-bar-track{height:4px;background:var(--bg3);border-radius:3px;overflow:hidden;}
      .geo-bar-fill{height:100%;border-radius:3px;transition:width .6s;}
      .geo-cnt{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--accent);width:22px;text-align:left;flex-shrink:0;font-weight:700;}
      .geo-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:28px;text-align:left;flex-shrink:0;}
      .geo-risk-badge{font-family:'JetBrains Mono',monospace;font-size:7px;padding:2px 6px;border-radius:5px;font-weight:700;flex-shrink:0;}

      /* ── source ── */
      .src-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:7px;}
      .src-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);position:relative;overflow:hidden;}
      .src-top-bar{position:absolute;top:0;left:0;right:0;height:2px;}
      .src-name{font-size:10px;font-weight:700;color:var(--text1);margin-bottom:4px;}
      .src-num{font-family:'Syne',sans-serif;font-size:24px;font-weight:900;line-height:1;}
      .src-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-top:1px;}
      .src-risk-mini{display:flex;align-items:center;gap:4px;margin-top:6px;}

      /* ── demographics ── */
      .demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
      .demo-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);}
      .demo-title{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:10px;}
      .demo-bar-row{display:flex;align-items:center;gap:6px;margin-bottom:6px;}
      .demo-bar-lbl{font-size:9px;color:var(--text2);width:42px;flex-shrink:0;}
      .demo-bar-track{flex:1;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;}
      .demo-bar-fill{height:100%;border-radius:3px;}
      .demo-bar-val{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:24px;text-align:left;flex-shrink:0;}

      /* ── age × risk scatter ── */
      .scatter-wrap{width:100%;overflow-x:auto;margin-top:8px;}

      /* ── segmentation ── */
      .seg-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
      .seg-select{background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:6px 10px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;flex:1;min-width:100px;}
      .seg-result{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);}
      .seg-num{font-family:'Syne',sans-serif;font-size:32px;font-weight:900;color:var(--accent);line-height:1;}
      .seg-desc{font-size:9px;color:var(--text2);margin-top:4px;}
      .seg-risk-row{margin-top:8px;display:flex;align-items:center;gap:8px;}

      /* ── question breakdown ── */
      .q2-card{padding:12px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);margin-bottom:7px;}
      .q2-head{display:flex;align-items:center;gap:8px;margin-bottom:9px;flex-wrap:wrap;}
      .q2-id{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);background:var(--glow2);padding:2px 7px;border-radius:5px;}
      .q2-time{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--accent3);background:rgba(0,212,255,.08);padding:2px 7px;border-radius:5px;}
      .q2-total{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-right:auto;}
      .q2-dom{font-size:7px;color:#34d499;font-family:'JetBrains Mono',monospace;background:rgba(52,212,153,.1);border:1px solid rgba(52,212,153,.2);padding:2px 6px;border-radius:5px;}
      .q2-row{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
      .q2-lbl{font-size:9px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .q2-track{width:80px;flex-shrink:0;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;}
      .q2-fill{height:100%;border-radius:2px;background:var(--accent);}
      .q2-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:28px;text-align:left;flex-shrink:0;}
      .q2-cnt{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--accent);width:20px;flex-shrink:0;}

      /* ── avatars ── */
      .av-grid{display:grid;grid-template-columns:repeat(2,1fr);}
      @media(min-width:400px){.av-grid{grid-template-columns:repeat(3,1fr)}}
      .av-card{padding:10px;border-radius:11px;background:var(--bg2);border:1px solid var(--border);text-align:center;position:relative;}
      .av-card.top{border-color:var(--accent);}
      .av-crown{position:absolute;top:4px;right:6px;font-size:10px;}
      .av-img{width:44px;height:44px;border-radius:9px;image-rendering:pixelated;border:2px solid var(--border2);margin:0 auto 5px;display:block;}
      .av-fb{width:44px;height:44px;border-radius:9px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 5px;}
      .av-name{font-size:9px;font-weight:700;color:var(--text1);}
      .av-cnt{font-family:'Syne',sans-serif;font-size:20px;font-weight:900;color:var(--accent);line-height:1;}
      .av-pct{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
      .av-bw{width:100%;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;margin-top:4px;}
      .av-bf{height:100%;background:var(--accent);border-radius:2px;}

      /* ── profiles ── */
      .ilist{display:flex;flex-direction:column;gap:5px;}
      .irow{display:flex;align-items:center;gap:7px;}
      .irow-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:16px;flex-shrink:0;}
      .irow-lbl{font-size:10px;color:var(--text1);width:80px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .irow-bw{flex:1;height:4px;background:var(--bg3);border-radius:3px;overflow:hidden;}
      .irow-bf{height:100%;border-radius:3px;background:var(--accent);}
      .irow-cnt{font-family:'Syne',sans-serif;font-size:9px;color:var(--accent);width:22px;text-align:left;flex-shrink:0;font-weight:700;}
      .irow-pct{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;width:28px;flex-shrink:0;}

      /* ── cohort ── */
      .cohort-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:7px;}
      .co-c{padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);text-align:center;}
      .co-name{font-size:9px;color:var(--text2);margin-bottom:3px;}
      .co-num{font-family:'Syne',sans-serif;font-size:22px;font-weight:900;color:var(--accent3);line-height:1;}
      .co-risk{font-size:7px;font-family:'JetBrains Mono',monospace;margin-top:2px;}

      /* ── speed ── */
      .spd-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:8px;}
      .spd-card{padding:11px;border-radius:12px;background:var(--bg2);border:1px solid var(--border);text-align:center;}
      .spd-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:900;line-height:1;}
      .spd-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-top:3px;}

      /* ── table ── */
      .tbl-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px;align-items:center;}
      .tbl-search{background:var(--surface);border:1px solid var(--border2);border-radius:9px;padding:7px 11px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:11px;outline:none;flex:1;min-width:130px;transition:border-color .2s;}
      .tbl-search::placeholder{color:var(--text3);}
      .tbl-search:focus{border-color:var(--accent);}
      .tbl-select{background:var(--bg2);border:1px solid var(--border2);border-radius:9px;padding:7px 9px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10px;outline:none;cursor:pointer;}
      .tbl-cnt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
      .tbl-wrap{overflow-x:auto;border-radius:12px;border:1px solid var(--border);}
      table{width:100%;border-collapse:collapse;font-size:10px;min-width:520px;}
      th{background:var(--bg2);color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:1px;padding:9px;text-align:right;border-bottom:1px solid var(--border2);white-space:nowrap;cursor:pointer;user-select:none;transition:color .2s;}
      th:hover{color:var(--accent);}
      th.sort-asc::after{content:' ↑';}th.sort-desc::after{content:' ↓';}
      td{padding:7px 9px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--text2);}
      tr:last-child td{border-bottom:none;}
      tr:hover td{background:rgba(255,255,255,.02);}
      .td-name{color:var(--text1);font-weight:600;white-space:nowrap;}
      .td-date{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
      .td-av{image-rendering:pixelated;border-radius:5px;border:1px solid var(--border2);cursor:pointer;}
      .pager{display:flex;gap:4px;justify-content:center;margin-top:10px;flex-wrap:wrap;}
      .pb{background:var(--card);border:1px solid var(--border);border-radius:7px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:9px;padding:4px 9px;cursor:pointer;transition:all .2s;}
      .pb:hover,.pb.active{background:var(--glow);border-color:var(--accent);color:var(--accent);}

      /* ── scard ── */
      .scard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);border-radius:14px;padding:13px;}
    </style>

    ${buildIntelFeed(rows, total, week, today, avgRisk, topProv, peakHour, riskDist)}
    ${buildTotalHero(total, week, today, byDay)}
    ${buildRiskDashboard(avgRisk, medRisk, sdRisk, riskDist, riskVals)}
    ${buildTimeline(byDay)}
    ${buildGeo(topProv, provRisk, total)}
    ${buildSource(srcMap, srcRisk, total)}
    ${buildDemographics(genderMap, ageGroups, total)}
    ${ageRiskData.length > 3 ? buildAgeRiskScatter(ageRiskData) : ''}
    ${buildSegmentation(rows)}
    ${allTimes.length ? buildSpeed(avgTime, minTime, maxTime, allTimes) : ''}
    ${buildQuestions(qList)}
    ${buildAvatars(topAv, total)}
    ${Object.keys(profMap).length ? buildProfiles(profMap, total) : ''}
    ${Object.keys(cohortMap).length ? buildCohort(cohortMap, rows) : ''}
    ${buildTable(rows)}
  `;

  waitD3(() => {
    drawTimelineD3(byDay);
    drawGaugeD3(avgRisk, riskVals);
    drawTotalRingD3(total, week);
    if (ageRiskData.length > 3) drawScatterD3(ageRiskData);
  });

  window._tblRows     = rows;
  window._tblSort     = { col: 'date', dir: -1 };
  window._tblPage     = 1;
  window._tblFiltered = rows;
  filterTable();
  initSegmentation(rows);
}

function waitD3(cb, tries = 0) {
  if (window.d3) { cb(); return; }
  if (tries > 40) return;
  setTimeout(() => waitD3(cb, tries + 1), 100);
}

/* ═══ INTEL FEED — خلاقانه‌ترین بخش ═══ */
function buildIntelFeed(rows, total, week, today, avgRisk, topProv, peakHour, riskDist) {
  const cards = [];

  /* 1 — total */
  const changeIcon = week > 0 ? '↑' : '◌';
  cards.push(`
    <div class="intel-card ic-total">
      <span class="intel-icon">◈</span>
      <div class="intel-body">
        <div class="intel-label">TOTAL REPORT</div>
        <div class="intel-main"><strong>${total}</strong> نفر تا الان شرکت کردن — این هفته <span class="hi4">${week}</span> نفر جدید</div>
        ${today > 0 ? `<div class="intel-sub">// ${today} نفر امروز ثبت شدن</div>` : ''}
      </div>
    </div>`);

  /* 2 — geo */
  if (topProv && topProv[0]) {
    const top = topProv[0];
    const second = topProv[1];
    cards.push(`
      <div class="intel-card ic-geo">
        <span class="intel-icon">◉</span>
        <div class="intel-body">
          <div class="intel-label">GEO INTEL</div>
          <div class="intel-main">پرتراکم‌ترین استان <strong>${top[0]}</strong> با <span class="hi3">${top[1]}</span> نفر — ${pct(top[1], total)}٪ از کل${second ? ` · بعدی: <span class="hi3">${second[0]}</span> با ${second[1]} نفر` : ''}</div>
        </div>
      </div>`);
  }

  /* 3 — risk */
  if (avgRisk > 0) {
    const rc = avgRisk < 1.75 ? 'hi4' : avgRisk < 2.5 ? '' : 'hiwarn';
    cards.push(`
      <div class="intel-card ic-risk">
        <span class="intel-icon">${riskEmoji(avgRisk)}</span>
        <div class="intel-body">
          <div class="intel-label">RISK PROFILE</div>
          <div class="intel-main">میانگین ریسک <strong>${avgRisk}</strong> — <span class="${rc}">${riskLabel(avgRisk)}</span></div>
          <div class="intel-sub">// ${riskDist.low} محافظه‌کار · ${riskDist.mid} متعادل · ${riskDist.high} ریسک‌پذیر · ${riskDist.very} جسور</div>
        </div>
      </div>`);
  }

  /* 4 — peak hour */
  if (peakHour >= 0) {
    cards.push(`
      <div class="intel-card ic-trend">
        <span class="intel-icon">◷</span>
        <div class="intel-body">
          <div class="intel-label">PEAK ACTIVITY</div>
          <div class="intel-main">بیشترین فعالیت ساعت <strong>${peakHour}:00</strong> — ${peakHour < 12 ? 'صبح' : peakHour < 17 ? 'بعدازظهر' : 'شب'}</div>
        </div>
      </div>`);
  }

  /* 5 — anomaly / insight */
  const maleCount  = rows.filter(r => r.gender === 'مرد').length;
  const femaleCount = rows.filter(r => r.gender === 'زن').length;
  if (maleCount > 0 && femaleCount > 0) {
    const dom = maleCount > femaleCount ? 'مردان' : 'زنان';
    const domN = Math.max(maleCount, femaleCount);
    cards.push(`
      <div class="intel-card ic-warn">
        <span class="intel-icon">◫</span>
        <div class="intel-body">
          <div class="intel-label">DEMOGRAPHIC</div>
          <div class="intel-main"><span class="hiwarn">${dom}</span> اکثریت — ${domN} نفر از ${total} شرکت‌کننده (${pct(domN, total)}٪)</div>
        </div>
      </div>`);
  }

  return section('intel', '// INTEL FEED', `<div class="intel-feed">${cards.join('')}</div>`);
}

/* ═══ TOTAL HERO ═══ */
function buildTotalHero(total, week, today, byDay) {
  const days = Object.entries(byDay).sort((a, b) => a[0] > b[0] ? 1 : -1).slice(-7);
  const maxD = Math.max(...days.map(d => d[1]), 1);
  const todayKey = new Date().toISOString().slice(0, 10);

  const miniBars = days.map(([k, v]) => {
    const h = Math.max(4, Math.round((v / maxD) * 32));
    const isToday = k === todayKey;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
      <div style="width:100%;height:${h}px;background:${isToday ? 'var(--accent)' : 'var(--accent2)'};opacity:${isToday ? 1 : 0.3 + (v / maxD) * 0.5};border-radius:2px 2px 0 0"></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:var(--text3)">${k.slice(8)}</div>
    </div>`;
  }).join('');

  return section('total', 'مجموع شرکت‌کنندگان', `
    <div class="total-hero">
      <svg id="ov-ring-svg" width="80" height="80" style="flex-shrink:0"></svg>
      <div class="total-info">
        <div class="total-title">// RESPONDENTS OVERVIEW</div>
        <div class="total-stats-row">
          <div class="total-stat">
            <div class="total-stat-num" style="color:var(--accent2)">${week}</div>
            <div class="total-stat-lbl">این هفته</div>
          </div>
          <div class="total-stat">
            <div class="total-stat-num" style="color:var(--accent3)">${today}</div>
            <div class="total-stat-lbl">امروز</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-end;gap:3px;height:40px;margin-top:10px;padding:0 2px">
          ${miniBars}
        </div>
      </div>
    </div>
  `);
}

function drawTotalRingD3(total, week) {
  const svg = d3.select('#ov-ring-svg');
  if (!svg.node()) return;
  const w = 80, r = 32, stroke = 6, cx = w / 2, cy = w / 2;
  const pctVal = total > 0 ? Math.min(week / total, 1) : 0;
  const arc = d3.arc().innerRadius(r - stroke).outerRadius(r).startAngle(0);

  svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r - stroke / 2)
     .attr('fill', 'none').attr('stroke', 'var(--border2)').attr('stroke-width', stroke);
  svg.append('g').attr('transform', `translate(${cx},${cy})`)
     .append('path').datum({ endAngle: pctVal * 2 * Math.PI })
     .attr('d', arc).attr('fill', 'var(--accent)');

  svg.append('text').attr('x', cx).attr('y', cy - 4)
     .attr('text-anchor', 'middle').attr('fill', 'var(--accent)')
     .attr('font-size', '18').attr('font-weight', '900')
     .attr('font-family', 'Syne,sans-serif').text(total);
  svg.append('text').attr('x', cx).attr('y', cy + 12)
     .attr('text-anchor', 'middle').attr('fill', 'var(--text3)')
     .attr('font-size', '7').attr('font-family', 'JetBrains Mono,monospace').text('TOTAL');
}

/* ═══ RISK DASHBOARD ═══ */
function buildRiskDashboard(avgRisk, medRisk, sdRisk, riskDist, riskVals) {
  const total = riskVals.length;
  return section('risk', 'تحلیل ریسک', `
    <div class="risk-dashboard">
      <div class="risk-gauge-card">
        <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:8px">// RISK GAUGE · بازه ۱ تا ۴</div>
        <svg id="ov-gauge-svg" width="100%" height="80"></svg>
        <div style="text-align:center;font-size:9px;color:var(--text2);margin-top:4px">${riskLabel(avgRisk)}</div>
      </div>
      <div class="risk-stat-card">
        <div class="risk-stat-lbl">MEDIAN</div>
        <div class="risk-stat-val" style="color:var(--accent2)">${medRisk || '—'}</div>
        <div style="font-size:8px;color:var(--text3);margin-top:3px">میانه</div>
      </div>
      <div class="risk-stat-card">
        <div class="risk-stat-lbl">STD DEV</div>
        <div class="risk-stat-val" style="color:var(--accent3)">${sdRisk || '—'}</div>
        <div style="font-size:8px;color:var(--text3);margin-top:3px">انحراف معیار</div>
      </div>
    </div>
    <div class="risk-dist-row">
      <div class="rd-cell low">
        <div class="rd-num">${riskDist.low}</div>
        <div class="rd-lbl">محافظه‌کار</div>
        <div class="rd-pct">${pct(riskDist.low, total)}٪</div>
      </div>
      <div class="rd-cell mid">
        <div class="rd-num">${riskDist.mid}</div>
        <div class="rd-lbl">متعادل</div>
        <div class="rd-pct">${pct(riskDist.mid, total)}٪</div>
      </div>
      <div class="rd-cell high">
        <div class="rd-num">${riskDist.high}</div>
        <div class="rd-lbl">ریسک‌پذیر</div>
        <div class="rd-pct">${pct(riskDist.high, total)}٪</div>
      </div>
      <div class="rd-cell very">
        <div class="rd-num">${riskDist.very}</div>
        <div class="rd-lbl">جسور</div>
        <div class="rd-pct">${pct(riskDist.very, total)}٪</div>
      </div>
    </div>
  `);
}

function drawGaugeD3(avgRisk, riskVals) {
  const node = document.getElementById('ov-gauge-svg');
  if (!node || !window.d3) return;
  const W = node.getBoundingClientRect().width || 300;
  if (W < 10) return;
  const H = 80, cx = W / 2, cy = H - 8, r = Math.min(cx - 24, 54);
  const col = riskColor(avgRisk);
  const startA = -Math.PI, endA = 0;
  const pctVal = avgRisk > 0 ? Math.min((avgRisk - 1) / 3, 1) : 0;
  const valA = startA + pctVal * Math.PI;

  const arc     = d3.arc().innerRadius(r - 10).outerRadius(r).startAngle(startA).endAngle(endA);
  const arcFill = d3.arc().innerRadius(r - 10).outerRadius(r).startAngle(startA).endAngle(valA);

  const svg = d3.select('#ov-gauge-svg').attr('width', W).attr('height', H);
  const g   = svg.append('g').attr('transform', `translate(${cx},${cy})`);

  /* bg segments */
  const segs = [
    { start: startA, end: startA + Math.PI * 0.33, color: '#34d499' },
    { start: startA + Math.PI * 0.33, end: startA + Math.PI * 0.58, color: '#fbbf24' },
    { start: startA + Math.PI * 0.58, end: startA + Math.PI * 0.83, color: '#ff8c00' },
    { start: startA + Math.PI * 0.83, end: endA, color: '#ff4444' },
  ];
  segs.forEach(seg => {
    const segArc = d3.arc().innerRadius(r - 10).outerRadius(r).startAngle(seg.start).endAngle(seg.end);
    g.append('path').attr('d', segArc({})).attr('fill', seg.color).attr('opacity', .15);
  });

  if (avgRisk > 0) {
    g.append('path').attr('d', arcFill({})).attr('fill', col).attr('opacity', .85);
    const nx = Math.cos(valA - Math.PI / 2) * (r - 14);
    const ny = Math.sin(valA - Math.PI / 2) * (r - 14);
    g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', nx).attr('y2', ny)
     .attr('stroke', col).attr('stroke-width', 2.5).attr('stroke-linecap', 'round');
    g.append('circle').attr('r', 4).attr('fill', col).attr('stroke', 'var(--bg0)').attr('stroke-width', 1.5);
  }

  g.append('text').attr('text-anchor', 'middle').attr('y', -r + 6)
   .attr('fill', col).attr('font-size', '20').attr('font-weight', '900')
   .attr('font-family', 'Syne,sans-serif').text(avgRisk || '—');

  ['۱', '۲', '۳', '۴'].forEach((lbl, i) => {
    const a = startA + (i / 3) * Math.PI;
    const lx = Math.cos(a) * (r + 12), ly = Math.sin(a) * (r + 12);
    g.append('text').attr('x', lx).attr('y', ly + 3)
     .attr('text-anchor', 'middle').attr('fill', 'var(--text3)')
     .attr('font-size', '7').attr('font-family', 'JetBrains Mono,monospace').text(lbl);
  });
}

/* ═══ TIMELINE ═══ */
function buildTimeline(byDay) {
  return section('timeline', 'روند زمانی', `
    <div class="timeline-wrap"><svg id="timeline-svg" width="100%" height="130"></svg></div>
  `);
}

function drawTimelineD3(byDay) {
  const node = document.getElementById('timeline-svg');
  if (!node || !window.d3) return;
  const entries = Object.entries(byDay).sort((a, b) => a[0] > b[0] ? 1 : -1);
  if (!entries.length) return;
  const W = node.getBoundingClientRect().width || 340;
  if (W < 10) return;
  const H = 130, pad = { t: 10, r: 10, b: 28, l: 30 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const data = entries.map(([k, v]) => ({ date: new Date(k), val: v }));
  const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, iW]);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.val) * 1.2]).range([iH, 0]);
  const svg = d3.select('#timeline-svg').attr('width', W).attr('height', H);
  const g   = svg.append('g').attr('transform', `translate(${pad.l},${pad.t})`);

  const gradId = 'tl-g-' + Date.now();
  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', gradId).attr('x1','0').attr('y1','0').attr('x2','0').attr('y2','1');
  grad.append('stop').attr('offset','0%').attr('stop-color','var(--accent)').attr('stop-opacity',.4);
  grad.append('stop').attr('offset','100%').attr('stop-color','var(--accent)').attr('stop-opacity',.02);

  const area = d3.area().x(d=>xScale(d.date)).y0(iH).y1(d=>yScale(d.val)).curve(d3.curveCatmullRom);
  const line = d3.line().x(d=>xScale(d.date)).y(d=>yScale(d.val)).curve(d3.curveCatmullRom);

  g.append('path').datum(data).attr('d', area).attr('fill', `url(#${gradId})`);
  g.append('path').datum(data).attr('d', line).attr('fill','none').attr('stroke','var(--accent)').attr('stroke-width',1.8);
  g.selectAll('circle').data(data).enter().append('circle')
   .attr('cx', d=>xScale(d.date)).attr('cy', d=>yScale(d.val))
   .attr('r', 2.5).attr('fill','var(--accent)').attr('opacity',.8);

  g.append('g').attr('transform', `translate(0,${iH})`).call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%m/%d')))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.append('g').call(d3.axisLeft(yScale).ticks(3))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.selectAll('.domain,.tick line').attr('stroke','var(--border)');
}

/* ═══ GEO — fixed colors ═══ */
function buildGeo(topProv, provRisk, total) {
  if (!topProv.length) return '';
  const maxV = topProv[0][1];

  /* رنگ‌های پیوسته بر اساس ریسک، نه رنگ‌های ثابت دلبخواهی */
  const rows = topProv.map(([name, cnt], i) => {
    const risks = provRisk[name] || [];
    const avgR  = risks.length ? parseFloat((risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(1)) : 0;
    const rc    = riskColor(avgR);
    const barW  = Math.round((cnt / maxV) * 100);

    /* رنگ نوار = همون رنگ ریسک اون استان */
    const barColor = avgR > 0 ? rc : 'var(--accent)';

    const riskBadgeStyle = avgR > 0
      ? `background:${rc}22;color:${rc};border:1px solid ${rc}44`
      : `background:var(--bg3);color:var(--text3);border:1px solid var(--border)`;

    return `<div class="geo-row">
      <span class="geo-rank">#${i+1}</span>
      <span class="geo-name">${esc(name)}</span>
      <div class="geo-bar-wrap">
        <div class="geo-bar-track">
          <div class="geo-bar-fill" style="width:${barW}%;background:${barColor}"></div>
        </div>
      </div>
      <span class="geo-cnt">${cnt}</span>
      <span class="geo-pct">${pct(cnt, total)}٪</span>
      <span class="geo-risk-badge" style="${riskBadgeStyle}">${avgR > 0 ? avgR : '—'}</span>
    </div>`;
  }).join('');

  return section('geo', 'پراکندگی جغرافیایی', `
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:1.5px;margin-bottom:8px;display:flex;gap:12px">
      <span style="color:#34d499">■ محافظه‌کار</span>
      <span style="color:#fbbf24">■ متعادل</span>
      <span style="color:#ff8c00">■ ریسک‌پذیر</span>
      <span style="color:#ff4444">■ جسور</span>
    </div>
    <div class="geo-list">${rows}</div>
  `);
}

/* ═══ SOURCE ═══ */
function buildSource(srcMap, srcRisk, total) {
  const entries = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '';

  const srcColors = {
    'تلگرام':'#26a5e4','telegram':'#26a5e4',
    'اینستاگرام':'#e1306c','instagram':'#e1306c',
    'واتساپ':'#25d366','whatsapp':'#25d366',
    'مستقیم':'var(--accent)','direct':'var(--accent)',
    'ایمیل':'#ea4335','email':'#ea4335',
    'توییتر':'#1d9bf0','twitter':'#1d9bf0',
  };

  const cards = entries.map(([name, cnt]) => {
    const risks = srcRisk[name] || [];
    const avgR  = risks.length ? parseFloat((risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(1)) : 0;
    const col   = srcColors[name] || srcColors[name.toLowerCase()] || 'var(--accent)';
    const rc    = riskColor(avgR);

    return `<div class="src-card">
      <div class="src-top-bar" style="background:${col}"></div>
      <div class="src-name">${esc(name)}</div>
      <div class="src-num" style="color:${col}">${cnt}</div>
      <div class="src-pct">${pct(cnt, total)}٪ از کل</div>
      ${avgR > 0 ? `<div class="src-risk-mini">
        <div style="width:6px;height:6px;border-radius:50%;background:${rc};flex-shrink:0"></div>
        <span style="font-size:8px;color:var(--text2)">ریسک: ${avgR}</span>
      </div>` : ''}
    </div>`;
  }).join('');

  return section('source', 'منبع ورود', `<div class="src-grid">${cards}</div>`);
}

/* ═══ DEMOGRAPHICS ═══ */
function buildDemographics(genderMap, ageGroups, total) {
  const gMax = Math.max(...Object.values(genderMap), 1);
  const aMax = Math.max(...Object.values(ageGroups), 1);

  const gRows = Object.entries(genderMap).sort((a, b) => b[1] - a[1]).map(([g, cnt]) => {
    const icon = g === 'مرد' ? '👨' : g === 'زن' ? '👩' : '👤';
    const col  = g === 'مرد' ? 'var(--accent3)' : g === 'زن' ? '#ff6b9d' : 'var(--accent2)';
    return `<div class="demo-bar-row">
      <span class="demo-bar-lbl">${icon} ${g}</span>
      <div class="demo-bar-track"><div class="demo-bar-fill" style="width:${pct(cnt,gMax)}%;background:${col}"></div></div>
      <span class="demo-bar-val">${pct(cnt,Object.values(genderMap).reduce((a,b)=>a+b,0))}%</span>
    </div>`;
  }).join('');

  const aRows = Object.entries(ageGroups).map(([range, cnt]) =>
    `<div class="demo-bar-row">
      <span class="demo-bar-lbl">${range}</span>
      <div class="demo-bar-track"><div class="demo-bar-fill" style="width:${pct(cnt,aMax)}%;background:var(--accent2)"></div></div>
      <span class="demo-bar-val">${cnt}</span>
    </div>`
  ).join('');

  return section('demo', 'جمعیت‌شناسی', `
    <div class="demo-grid">
      <div class="demo-card"><div class="demo-title">// GENDER</div>${gRows||'<div style="color:var(--text3);font-size:9px">داده‌ای نیست</div>'}</div>
      <div class="demo-card"><div class="demo-title">// AGE</div>${aRows}</div>
    </div>
  `);
}

/* ═══ AGE × RISK SCATTER ═══ */
function buildAgeRiskScatter(data) {
  return section('scatter', 'رابطه سن و ریسک', `
    <div class="scatter-wrap"><svg id="scatter-svg" width="100%" height="140"></svg></div>
  `);
}

function drawScatterD3(data) {
  const node = document.getElementById('scatter-svg');
  if (!node || !window.d3) return;
  const W = node.getBoundingClientRect().width || 340;
  if (W < 10) return;
  const H = 140, pad = { t: 10, r: 10, b: 28, l: 28 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const svg = d3.select('#scatter-svg').attr('width', W).attr('height', H);
  const g   = svg.append('g').attr('transform', `translate(${pad.l},${pad.t})`);
  const xScale = d3.scaleLinear().domain([d3.min(data, d=>d.age)-2, d3.max(data, d=>d.age)+2]).range([0, iW]);
  const yScale = d3.scaleLinear().domain([1, 4]).range([iH, 0]);

  g.selectAll('circle').data(data).enter().append('circle')
   .attr('cx', d=>xScale(d.age)).attr('cy', d=>yScale(d.risk))
   .attr('r', 4).attr('fill', d=>riskColor(d.risk)).attr('opacity', .65);

  g.append('g').attr('transform',`translate(0,${iH})`).call(d3.axisBottom(xScale).ticks(5))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.append('g').call(d3.axisLeft(yScale).ticks(4))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.selectAll('.domain,.tick line').attr('stroke','var(--border)');

  /* trend line */
  const n = data.length;
  const xm = data.reduce((s,d)=>s+d.age,0)/n, ym = data.reduce((s,d)=>s+d.risk,0)/n;
  const num = data.reduce((s,d)=>s+(d.age-xm)*(d.risk-ym),0);
  const den = data.reduce((s,d)=>s+(d.age-xm)**2,0);
  if (den > 0) {
    const slope = num/den, intercept = ym - slope*xm;
    const x0 = d3.min(data,d=>d.age), x1 = d3.max(data,d=>d.age);
    g.append('line')
     .attr('x1',xScale(x0)).attr('y1',yScale(Math.max(1,Math.min(4,slope*x0+intercept))))
     .attr('x2',xScale(x1)).attr('y2',yScale(Math.max(1,Math.min(4,slope*x1+intercept))))
     .attr('stroke','var(--accent2)').attr('stroke-width',1.5).attr('stroke-dasharray','4,3').attr('opacity',.6);
  }
}

/* ═══ SEGMENTATION ═══ */
function buildSegmentation(rows) {
  const provinces = [...new Set(rows.map(r=>r.province).filter(Boolean))].sort();
  const genders   = [...new Set(rows.map(r=>r.gender).filter(Boolean))];
  const cohorts   = [...new Set(rows.map(r=>r.cohort).filter(Boolean))];
  return section('seg', 'فیلتر ترکیبی', `
    <div class="seg-filters">
      <select class="seg-select" id="seg-prov" onchange="updateSeg()">
        <option value="">همه استان‌ها</option>
        ${provinces.map(p=>`<option value="${esc(p)}">${p}</option>`).join('')}
      </select>
      <select class="seg-select" id="seg-gender" onchange="updateSeg()">
        <option value="">همه جنسیت‌ها</option>
        ${genders.map(g=>`<option value="${esc(g)}">${g}</option>`).join('')}
      </select>
      <select class="seg-select" id="seg-age" onchange="updateSeg()">
        <option value="">همه سنی</option>
        <option value="18-25">۱۸–۲۵</option><option value="26-35">۲۶–۳۵</option>
        <option value="36-45">۳۶–۴۵</option><option value="46-55">۴۶–۵۵</option><option value="56-99">۵۶+</option>
      </select>
      ${cohorts.length?`<select class="seg-select" id="seg-cohort" onchange="updateSeg()">
        <option value="">همه کوهورت‌ها</option>
        ${cohorts.map(c=>`<option value="${esc(c)}">${c}</option>`).join('')}
      </select>`:''}
    </div>
    <div class="seg-result" id="seg-result"></div>
  `);
}

function initSegmentation(rows) { window._segRows = rows; updateSeg(); }

function updateSeg() {
  const rows = window._segRows || [];
  const prov = document.getElementById('seg-prov')?.value   || '';
  const gen  = document.getElementById('seg-gender')?.value || '';
  const age  = document.getElementById('seg-age')?.value    || '';
  const coh  = document.getElementById('seg-cohort')?.value || '';
  let f = rows;
  if (prov) f = f.filter(r=>r.province===prov);
  if (gen)  f = f.filter(r=>r.gender===gen);
  if (age)  { const [lo,hi]=age.split('-').map(Number); f=f.filter(r=>{const a=parseInt(r.age);return a>=lo&&a<=hi;}); }
  if (coh)  f = f.filter(r=>r.cohort===coh);
  const riskF = f.filter(r=>r.risk>0);
  const avgR  = riskF.length ? parseFloat((riskF.reduce((s,r)=>s+r.risk,0)/riskF.length).toFixed(2)) : 0;
  const rc = riskColor(avgR);
  const el = document.getElementById('seg-result');
  if (!el) return;
  el.innerHTML=`
    <div class="seg-num">${f.length}</div>
    <div class="seg-desc">${f.length} نفر با این فیلترها — ${pct(f.length,rows.length)}٪ از کل</div>
    ${avgR>0?`<div class="seg-risk-row">
      <div style="width:8px;height:8px;border-radius:50%;background:${rc}"></div>
      <span style="font-size:9px;color:var(--text2)">میانگین ریسک: <strong style="color:${rc}">${avgR}</strong> — ${riskLabel(avgR)}</span>
    </div>`:''}
  `;
}

/* ═══ SPEED ═══ */
function buildSpeed(avgTime, minTime, maxTime, allTimes) {
  const bSize = 15, buckets = {};
  allTimes.forEach(t=>{const b=Math.floor(t/bSize)*bSize;buckets[b]=(buckets[b]||0)+1;});
  const bEntries = Object.entries(buckets).sort((a,b)=>+a[0]-+b[0]);
  const maxB = Math.max(...bEntries.map(b=>b[1]),1);
  const hist = bEntries.map(([b,cnt])=>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
      <div style="width:100%;height:${Math.max(3,Math.round((cnt/maxB)*44))}px;background:var(--accent3);opacity:${0.3+(cnt/maxB)*0.7};border-radius:2px 2px 0 0"></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:var(--text3)">${b}s</div>
    </div>`
  ).join('');

  return section('speed', 'زمان‌سنجی پاسخ‌ها', `
    <div class="spd-grid">
      <div class="spd-card"><div class="spd-val">${avgTime}s</div><div class="spd-lbl">میانگین</div></div>
      <div class="spd-card"><div class="spd-val" style="color:#34d499">${minTime}s</div><div class="spd-lbl">سریع‌ترین</div></div>
      <div class="spd-card"><div class="spd-val" style="color:#ff4444">${maxTime}s</div><div class="spd-lbl">کندترین</div></div>
    </div>
    <div style="display:flex;align-items:flex-end;gap:2px;height:52px;padding:0 2px">${hist}</div>
  `);
}

/* ═══ QUESTIONS ═══ */
function buildQuestions(qList) {
  if (!qList.length) return '';
  const cards = qList.map(q => {
    const ansList = Object.entries(q.answers).sort((a,b)=>b[1]-a[1]);
    const qTotal  = ansList.reduce((s,[,c])=>s+c,0);
    const avgT    = q.times.length ? Math.round(q.times.reduce((a,b)=>a+b,0)/q.times.length) : null;
    const top     = ansList[0];
    const topPctV = top ? pct(top[1],qTotal) : 0;
    return `<div class="q2-card">
      <div class="q2-head">
        <span class="q2-id">س ${q.id}</span>
        ${avgT?`<span class="q2-time">⏱ ${avgT}s</span>`:''}
        <span class="q2-total">${qTotal} پاسخ</span>
        ${top&&topPctV>=50?`<span class="q2-dom">غالب: ${esc(top[0].substring(0,20))} — ${topPctV}%</span>`:''}
      </div>
      ${ansList.slice(0,6).map(([ans,cnt])=>
        `<div class="q2-row">
          <span class="q2-lbl" title="${esc(ans)}">${esc(ans.substring(0,36))}${ans.length>36?'…':''}</span>
          <div class="q2-track"><div class="q2-fill" style="width:${pct(cnt,qTotal)}%"></div></div>
          <span class="q2-cnt">${cnt}</span>
          <span class="q2-pct">${pct(cnt,qTotal)}%</span>
        </div>`
      ).join('')}
    </div>`;
  }).join('');
  return section('questions', 'تحلیل سوال‌ها', cards);
}

/* ═══ AVATARS ═══ */
function buildAvatars(topAv, total) {
  if (!topAv.length) return '';
  const cards = topAv.map(([name,cnt],i)=>{
    const img = makeAvatar(name,44);
    return `<div class="av-card${i===0?' top':''}">
      ${i===0?'<span class="av-crown">👑</span>':''}
      ${img?`<img class="av-img" src="${img}" alt="${name}">`:`<div class="av-fb">🎭</div>`}
      <div class="av-name">${esc(name)}</div>
      <div class="av-cnt">${cnt}</div>
      <div class="av-pct">${pct(cnt,total)}%</div>
      <div class="av-bw"><div class="av-bf" style="width:${pct(cnt,topAv[0][1])}%"></div></div>
    </div>`;
  }).join('');
  return section('avatars', 'آواتارها', `<div class="av-grid">${cards}</div>`);
}

/* ═══ PROFILES ═══ */
function buildProfiles(profMap, total) {
  const entries = Object.entries(profMap).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) return '';
  const maxV = entries[0][1];
  const rows = entries.map(([name,cnt],i)=>
    `<div class="irow">
      <span class="irow-rank">#${i+1}</span>
      <span class="irow-lbl">${esc(name)}</span>
      <div class="irow-bw"><div class="irow-bf" style="width:${pct(cnt,maxV)}%"></div></div>
      <span class="irow-cnt">${cnt}</span>
      <span class="irow-pct">${pct(cnt,total)}%</span>
    </div>`
  ).join('');
  return section('profiles', 'پروفایل‌ها', `<div class="scard"><div class="ilist">${rows}</div></div>`);
}

/* ═══ COHORT ═══ */
function buildCohort(cohortMap, rows) {
  const cards = Object.entries(cohortMap).map(([name,cnt])=>{
    const riskF = rows.filter(r=>r.cohort===name&&r.risk>0);
    const avgR  = riskF.length ? parseFloat((riskF.reduce((s,r)=>s+r.risk,0)/riskF.length).toFixed(1)) : 0;
    const rc = riskColor(avgR);
    return `<div class="co-c">
      <div class="co-name">${esc(name)}</div>
      <div class="co-num">${cnt}</div>
      <div class="co-risk" style="color:${rc}">${avgR?`ریسک: ${avgR}`:'—'}</div>
    </div>`;
  }).join('');
  return section('cohort', 'کوهورت', `<div class="cohort-grid">${cards}</div>`);
}

/* ═══ TABLE — با آواتار اول و کلیک روی ردیف ═══ */
function buildTable(rows) {
  return section('table', 'همه پاسخ‌دهندگان', `
    <div class="tbl-filters">
      <input class="tbl-search" id="tblSearch" placeholder="جستجو نام / استان..." oninput="filterTable()">
      <select class="tbl-select" id="tblRisk" onchange="filterTable()">
        <option value="">همه ریسک</option>
        <option value="low">محافظه‌کار</option>
        <option value="mid">متعادل</option>
        <option value="high">ریسک‌پذیر</option>
        <option value="very">جسور</option>
      </select>
      <select class="tbl-select" id="tblGender" onchange="filterTable()">
        <option value="">همه جنسیت</option>
        <option value="مرد">مرد</option>
        <option value="زن">زن</option>
      </select>
      <span class="tbl-cnt" id="tblCnt">${rows.length} نفر</span>
    </div>
    <div class="tbl-wrap">
      <table id="mainTbl">
        <thead><tr>
          <th style="width:44px">آواتار</th>
          <th onclick="sortTable('name')">نام</th>
          <th onclick="sortTable('age')">سن</th>
          <th onclick="sortTable('province')">استان</th>
          <th onclick="sortTable('risk')">ریسک</th>
          <th onclick="sortTable('profile')">پروفایل</th>
          <th onclick="sortTable('date')">تاریخ</th>
        </tr></thead>
        <tbody id="tblBody"></tbody>
      </table>
    </div>
    <div class="pager" id="tblPager"></div>
  `);
}

function filterTable() {
  if (!window._tblRows) return;
  const q  = (document.getElementById('tblSearch')?.value||'').toLowerCase();
  const rk = document.getElementById('tblRisk')?.value||'';
  const gn = document.getElementById('tblGender')?.value||'';

  let f = window._tblRows.filter(r=>{
    const nameOk = !q || (r.name||'').toLowerCase().includes(q)||(r.province||'').toLowerCase().includes(q);
    const rv = parseFloat(r.risk)||0;
    const riskOk = !rk
      ||(rk==='low'  && rv>0  && rv<1.75)
      ||(rk==='mid'  && rv>=1.75 && rv<2.5)
      ||(rk==='high' && rv>=2.5  && rv<3.25)
      ||(rk==='very' && rv>=3.25);
    const genderOk = !gn || r.gender===gn;
    return nameOk && riskOk && genderOk;
  });

  const s = window._tblSort||{col:'date',dir:-1};
  f.sort((a,b)=>{
    let av=a[s.col]||'',bv=b[s.col]||'';
    if(s.col==='risk'||s.col==='age'){av=parseFloat(av)||0;bv=parseFloat(bv)||0;}
    return av>bv?s.dir:av<bv?-s.dir:0;
  });

  window._tblFiltered = f;
  document.getElementById('tblCnt').textContent = f.length+' نفر';

  const pp=15, pages=Math.ceil(f.length/pp)||1;
  window._tblPage = Math.min(window._tblPage||1, pages);
  const slice = f.slice((window._tblPage-1)*pp, window._tblPage*pp);

  document.getElementById('tblBody').innerHTML = slice.map((r,idx)=>{
    const gi  = (window._tblPage-1)*pp+idx;
    const img = r.avatar ? makeAvatar(r.avatar,32) : null;
    const pc  = cleanProfile(r.profile);
    const rc  = riskColor(r.risk);
    /* کلیک روی کل ردیف */
    return `<tr style="cursor:pointer" onclick="openPersonModal(window._tblFiltered[${gi}])">
      <td style="text-align:center">
        ${img
          ? `<img class="td-av" src="${img}" width="32" height="32" title="${esc(r.avatar||'')}">`
          : `<div style="width:32px;height:32px;border-radius:7px;background:var(--bg3);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--accent);border:1px solid var(--border)">${(r.name||'?').charAt(0)}</div>`
        }
      </td>
      <td class="td-name">${esc(r.name)}</td>
      <td>${r.age||'—'}</td>
      <td>${r.province||'—'}</td>
      <td>${riskTag(r.risk)}</td>
      <td style="font-size:9px;color:var(--text2)">${pc?esc(pc):'—'}</td>
      <td class="td-date">${fmtDate(r.date)}</td>
    </tr>`;
  }).join('');

  const pg = document.getElementById('tblPager');
  if (!pg) return;
  pg.innerHTML='';
  if(pages>1){
    if(window._tblPage>1) pg.innerHTML+=`<button class="pb" onclick="event.stopPropagation();goPage(${window._tblPage-1})">«</button>`;
    for(let i=Math.max(1,window._tblPage-2);i<=Math.min(pages,window._tblPage+2);i++)
      pg.innerHTML+=`<button class="pb${i===window._tblPage?' active':''}" onclick="event.stopPropagation();goPage(${i})">${i}</button>`;
    if(window._tblPage<pages) pg.innerHTML+=`<button class="pb" onclick="event.stopPropagation();goPage(${window._tblPage+1})">»</button>`;
  }
}

function goPage(p){window._tblPage=p;filterTable();}

function sortTable(col){
  if(!window._tblSort)return;
  window._tblSort.dir = window._tblSort.col===col ? window._tblSort.dir*-1 : 1;
  window._tblSort.col = col;
  document.querySelectorAll('#mainTbl th').forEach(th=>th.classList.remove('sort-asc','sort-desc'));
  const cols=['','name','age','province','risk','profile','date'];
  const th=document.querySelector(`#mainTbl th:nth-child(${cols.indexOf(col)+1})`);
  if(th) th.classList.add(window._tblSort.dir===1?'sort-asc':'sort-desc');
  filterTable();
}
