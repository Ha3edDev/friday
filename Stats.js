/* ═══════════════════════════════════════════════════════════════
   STATS.JS — F.R.I.D.A.Y Analytics Engine v3
   Clean UI · No bar charts · Normal number fonts
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

function waitD3(cb, tries = 0) {
  if (window.d3) { cb(); return; }
  if (tries > 40) return;
  setTimeout(() => waitD3(cb, tries + 1), 100);
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

  const riskRows = rows.filter(r => r.risk > 0);
  const riskVals = riskRows.map(r => r.risk);
  const avgRisk  = riskVals.length
    ? parseFloat((riskVals.reduce((s, v) => s + v, 0) / riskVals.length).toFixed(2)) : 0;
  const medRisk  = parseFloat(median(riskVals).toFixed(2));
  const sdRisk   = parseFloat(stdDev(riskVals).toFixed(2));

  const riskDist = {
    low:  riskVals.filter(v => v < 1.75).length,
    mid:  riskVals.filter(v => v >= 1.75 && v < 2.5).length,
    high: riskVals.filter(v => v >= 2.5 && v < 3.25).length,
    very: riskVals.filter(v => v >= 3.25).length,
  };

  const byDay = {}, byWeekday = Array(7).fill(0), byHour = Array(24).fill(0);
  rows.forEach(r => {
    const d = parseIranDate(r.date);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
    byWeekday[d.getDay()]++;
    byHour[d.getHours()]++;
  });

  const provMap = {}, provRisk = {};
  rows.forEach(r => { if (!r.province) return; provMap[r.province] = (provMap[r.province] || 0) + 1; });
  riskRows.forEach(r => {
    if (!r.province) return;
    if (!provRisk[r.province]) provRisk[r.province] = [];
    provRisk[r.province].push(r.risk);
  });
  const topProv = Object.entries(provMap).sort((a, b) => b[1] - a[1]);

  const genderMap = {};
  rows.forEach(r => { if (r.gender) genderMap[r.gender] = (genderMap[r.gender] || 0) + 1; });

  const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
  rows.forEach(r => {
    const a = parseInt(r.age);
    if (!a) return;
    if (a <= 25) ageGroups['18-25']++;
    else if (a <= 35) ageGroups['26-35']++;
    else if (a <= 45) ageGroups['36-45']++;
    else if (a <= 55) ageGroups['46-55']++;
    else ageGroups['56+']++;
  });

  const srcMap = {}, srcRisk = {};
  rows.forEach(r => { const s = r.source || 'مستقیم'; srcMap[s] = (srcMap[s] || 0) + 1; });
  riskRows.forEach(r => {
    const s = r.source || 'مستقیم';
    if (!srcRisk[s]) srcRisk[s] = [];
    srcRisk[s].push(r.risk);
  });

  const avMap = {};
  rows.forEach(r => { if (r.avatar) avMap[r.avatar] = (avMap[r.avatar] || 0) + 1; });
  const topAv = Object.entries(avMap).sort((a, b) => b[1] - a[1]);

  const profMap = {};
  rows.forEach(r => { const p = cleanProfile(r.profile); if (p) profMap[p] = (profMap[p] || 0) + 1; });

  const cohortMap = {};
  rows.forEach(r => { if (r.cohort) cohortMap[r.cohort] = (cohortMap[r.cohort] || 0) + 1; });

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

  const ageRiskData = rows
    .filter(r => r.risk > 0 && parseInt(r.age) > 0)
    .map(r => ({ age: parseInt(r.age), risk: r.risk }));

  const peakHour = byHour.indexOf(Math.max(...byHour));
  const maleCount   = rows.filter(r => r.gender === 'مرد').length;
  const femaleCount = rows.filter(r => r.gender === 'زن').length;

  /* ═══ CSS ═══ */
  el.innerHTML = `
<style>
/* ── reset numbers to normal weight ── */
.s3 *{box-sizing:border-box;}

/* ── layout ── */
.s3-block{margin-bottom:16px;}
.s3-label{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text3);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.s3-label::after{content:'';flex:1;height:1px;background:var(--border);}

/* ── stat grid ── */
.s3-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.s3-kpi-grid.g2{grid-template-columns:repeat(2,1fr);}
.s3-kpi-grid.g4{grid-template-columns:repeat(4,1fr);}
@media(max-width:360px){.s3-kpi-grid.g4{grid-template-columns:repeat(2,1fr)}}

/* ── kpi card ── */
.s3-kpi{
  padding:14px 12px;
  border-radius:12px;
  background:var(--bg1);
  border:1px solid var(--border);
  display:flex;
  flex-direction:column;
  gap:4px;
  position:relative;
  overflow:hidden;
}
.s3-kpi::after{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:2px;
  border-radius:12px 12px 0 0;
}
.s3-kpi.ac-1::after{background:var(--accent);}
.s3-kpi.ac-2::after{background:var(--accent2);}
.s3-kpi.ac-3::after{background:var(--accent3);}
.s3-kpi.ac-g::after{background:#34d499;}
.s3-kpi.ac-y::after{background:#fbbf24;}
.s3-kpi.ac-r::after{background:#ff4444;}

.s3-kpi-tag{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;}
.s3-kpi-num{
  font-family:'Vazirmatn',sans-serif;
  font-size:28px;
  font-weight:700;
  line-height:1.1;
  color:var(--text1);
  letter-spacing:-0.5px;
}
.s3-kpi-num.colored{color:var(--accent);}
.s3-kpi-num.c2{color:var(--accent2);}
.s3-kpi-num.c3{color:var(--accent3);}
.s3-kpi-num.cg{color:#34d499;}
.s3-kpi-num.cy{color:#fbbf24;}
.s3-kpi-num.cr{color:#ff4444;}
.s3-kpi-sub{font-size:9px;color:var(--text2);}

/* ── wide card ── */
.s3-wide{
  padding:14px;
  border-radius:12px;
  background:var(--bg1);
  border:1px solid var(--border);
  position:relative;
  overflow:hidden;
}
.s3-wide::after{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:12px 12px 0 0;background:var(--accent);
}

/* ── row item ── */
.s3-row-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  border-radius:10px;
  background:var(--bg1);
  border:1px solid var(--border);
  margin-bottom:6px;
}
.s3-row-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:18px;flex-shrink:0;text-align:center;}
.s3-row-name{font-size:11px;color:var(--text1);font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.s3-row-bar{flex:1;height:3px;background:var(--border2,rgba(255,255,255,0.1));border-radius:2px;overflow:hidden;}
.s3-row-fill{height:100%;border-radius:2px;transition:width .6s;}
.s3-row-cnt{font-family:'Vazirmatn',sans-serif;font-size:11px;font-weight:700;color:var(--text1);width:28px;text-align:center;flex-shrink:0;}
.s3-row-pct{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);width:30px;text-align:left;flex-shrink:0;}
.s3-row-badge{
  font-family:'JetBrains Mono',monospace;font-size:7.5px;
  padding:2px 7px;border-radius:5px;font-weight:600;flex-shrink:0;
}

/* ── gender pill ── */
.s3-gender-row{display:flex;gap:8px;}
.s3-gender-pill{
  flex:1;padding:12px;border-radius:10px;
  background:var(--bg1);border:1px solid var(--border);
  display:flex;align-items:center;gap:10px;
}
.s3-gender-icon{font-size:20px;}
.s3-gender-name{font-size:9px;color:var(--text2);}
.s3-gender-num{font-family:'Vazirmatn',sans-serif;font-size:20px;font-weight:700;color:var(--text1);line-height:1;}
.s3-gender-pct{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);}

/* ── age bar ── */
.s3-age-rows{display:flex;flex-direction:column;gap:6px;}
.s3-age-row{display:flex;align-items:center;gap:8px;}
.s3-age-lbl{font-size:9px;color:var(--text2);width:38px;flex-shrink:0;text-align:right;}
.s3-age-track{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.s3-age-fill{height:100%;border-radius:2px;background:var(--accent2);}
.s3-age-val{font-family:'Vazirmatn',sans-serif;font-size:9px;font-weight:600;color:var(--text2);width:20px;flex-shrink:0;}

/* ── risk dist row ── */
.s3-risk-dist{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.s3-rd{
  padding:10px 6px;border-radius:10px;text-align:center;
  background:var(--bg1);border:1px solid var(--border);
}
.s3-rd-num{font-family:'Vazirmatn',sans-serif;font-size:22px;font-weight:700;line-height:1;}
.s3-rd-lbl{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:3px;}
.s3-rd-pct{font-size:7px;font-family:'JetBrains Mono',monospace;margin-top:2px;}
.s3-rd.low .s3-rd-num,.s3-rd.low .s3-rd-pct{color:#34d499;}
.s3-rd.mid .s3-rd-num,.s3-rd.mid .s3-rd-pct{color:#fbbf24;}
.s3-rd.hi  .s3-rd-num,.s3-rd.hi  .s3-rd-pct{color:#ff8c00;}
.s3-rd.vhi .s3-rd-num,.s3-rd.vhi .s3-rd-pct{color:#ff4444;}
.s3-rd.low{border-color:rgba(52,212,153,.25);}
.s3-rd.mid{border-color:rgba(251,191,36,.25);}
.s3-rd.hi{border-color:rgba(255,140,0,.25);}
.s3-rd.vhi{border-color:rgba(255,68,68,.25);}

/* ── timeline ── */
.s3-timeline-wrap{overflow-x:auto;}

/* ── gauge wrap ── */
.s3-gauge-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;}

/* ── source tag cloud ── */
.s3-src-grid{display:flex;flex-direction:column;gap:6px;}
.s3-src-row{
  display:flex;align-items:center;gap:10px;
  padding:10px 12px;border-radius:10px;
  background:var(--bg1);border:1px solid var(--border);
}
.s3-src-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.s3-src-name{font-size:10px;color:var(--text1);font-weight:600;flex:1;}
.s3-src-cnt{font-family:'Vazirmatn',sans-serif;font-size:13px;font-weight:700;color:var(--text1);}
.s3-src-pct{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);width:30px;}
.s3-src-risk{font-size:8px;font-family:'JetBrains Mono',monospace;padding:2px 6px;border-radius:4px;}

/* ── q card ── */
.s3-q{
  padding:12px;border-radius:11px;
  background:var(--bg1);border:1px solid var(--border);
  margin-bottom:6px;
}
.s3-q-head{display:flex;align-items:center;gap:7px;margin-bottom:9px;flex-wrap:wrap;}
.s3-q-id{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);background:var(--glow2);padding:2px 8px;border-radius:5px;}
.s3-q-total{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-right:auto;}
.s3-q-dom{font-size:7px;color:#34d499;font-family:'JetBrains Mono',monospace;background:rgba(52,212,153,.1);border:1px solid rgba(52,212,153,.2);padding:2px 7px;border-radius:5px;}
.s3-q-row{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.s3-q-lbl{font-size:9px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.s3-q-track{width:80px;flex-shrink:0;height:3px;background:var(--border);border-radius:2px;overflow:hidden;}
.s3-q-fill{height:100%;border-radius:2px;background:var(--accent);}
.s3-q-cnt{font-family:'Vazirmatn',sans-serif;font-size:9px;font-weight:700;color:var(--text1);width:20px;text-align:center;flex-shrink:0;}
.s3-q-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:28px;flex-shrink:0;}

/* ── avatar grid ── */
.s3-av-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;}
@media(min-width:380px){.s3-av-grid{grid-template-columns:repeat(3,1fr)}}
.s3-av-card{
  padding:11px 8px;border-radius:11px;
  background:var(--bg1);border:1px solid var(--border);
  text-align:center;position:relative;
}
.s3-av-card.top{border-color:var(--accent);}
.s3-av-crown{position:absolute;top:5px;right:7px;font-size:9px;}
.s3-av-img{width:40px;height:40px;border-radius:8px;image-rendering:pixelated;border:1.5px solid var(--border);margin:0 auto 6px;display:block;}
.s3-av-fb{width:40px;height:40px;border-radius:8px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:18px;margin:0 auto 6px;}
.s3-av-name{font-size:8.5px;font-weight:700;color:var(--text1);margin-bottom:2px;}
.s3-av-cnt{font-family:'Vazirmatn',sans-serif;font-size:18px;font-weight:700;color:var(--accent);line-height:1;}
.s3-av-pct{font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

/* ── profile list ── */
.s3-prof-list{display:flex;flex-direction:column;gap:5px;}
.s3-prof-row{display:flex;align-items:center;gap:8px;}
.s3-prof-rank{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:16px;text-align:center;flex-shrink:0;}
.s3-prof-name{font-size:10px;color:var(--text1);font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.s3-prof-bar-wrap{width:70px;flex-shrink:0;height:3px;background:var(--border);border-radius:2px;overflow:hidden;}
.s3-prof-bar-fill{height:100%;border-radius:2px;background:var(--accent);}
.s3-prof-cnt{font-family:'Vazirmatn',sans-serif;font-size:10px;font-weight:700;color:var(--text1);width:22px;text-align:center;flex-shrink:0;}
.s3-prof-pct{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);width:28px;flex-shrink:0;}

/* ── cohort ── */
.s3-cohort-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:7px;}
.s3-co{
  padding:11px 8px;border-radius:10px;
  background:var(--bg1);border:1px solid var(--border);text-align:center;
}
.s3-co-name{font-size:8.5px;color:var(--text2);margin-bottom:3px;}
.s3-co-num{font-family:'Vazirmatn',sans-serif;font-size:22px;font-weight:700;color:var(--accent3);line-height:1;}
.s3-co-risk{font-size:7.5px;font-family:'JetBrains Mono',monospace;margin-top:3px;}

/* ── segmentation ── */
.s3-seg-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
.s3-seg-select{
  background:var(--bg2);border:1px solid var(--border);border-radius:8px;
  padding:7px 10px;color:var(--text1);font-family:'Vazirmatn',sans-serif;
  font-size:10px;outline:none;cursor:pointer;flex:1;min-width:100px;
}
.s3-seg-result{
  padding:14px;border-radius:11px;
  background:var(--bg1);border:1px solid var(--border);
}
.s3-seg-num{font-family:'Vazirmatn',sans-serif;font-size:32px;font-weight:700;color:var(--accent);line-height:1;}
.s3-seg-desc{font-size:9px;color:var(--text2);margin-top:5px;}
.s3-seg-risk{display:flex;align-items:center;gap:6px;margin-top:8px;}

/* ── table ── */
.s3-tbl-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px;align-items:center;}
.s3-tbl-search{
  background:var(--bg1);border:1px solid var(--border);border-radius:9px;
  padding:7px 11px;color:var(--text1);font-family:'Vazirmatn',sans-serif;
  font-size:11px;outline:none;flex:1;min-width:130px;transition:border-color .2s;
}
.s3-tbl-search::placeholder{color:var(--text3);}
.s3-tbl-search:focus{border-color:var(--accent);}
.s3-tbl-select{
  background:var(--bg1);border:1px solid var(--border);border-radius:9px;
  padding:7px 9px;color:var(--text1);font-family:'Vazirmatn',sans-serif;
  font-size:10px;outline:none;cursor:pointer;
}
.s3-tbl-cnt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
.s3-tbl-wrap{overflow-x:auto;border-radius:11px;border:1px solid var(--border);}
table.s3-tbl{width:100%;border-collapse:collapse;font-size:10px;min-width:500px;}
table.s3-tbl th{
  background:var(--bg2);color:var(--text3);
  font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:1px;
  padding:9px;text-align:right;border-bottom:1px solid var(--border);
  white-space:nowrap;cursor:pointer;user-select:none;transition:color .2s;
}
table.s3-tbl th:hover{color:var(--accent);}
table.s3-tbl th.sort-asc::after{content:' ↑';}
table.s3-tbl th.sort-desc::after{content:' ↓';}
table.s3-tbl td{
  padding:8px 9px;border-bottom:1px solid var(--border);
  vertical-align:middle;color:var(--text2);
}
table.s3-tbl tr:last-child td{border-bottom:none;}
table.s3-tbl tr:hover td{background:rgba(255,255,255,.02);}
.s3-td-name{color:var(--text1);font-weight:600;white-space:nowrap;}
.s3-td-date{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);white-space:nowrap;}
.s3-tbl-pager{display:flex;gap:4px;justify-content:center;margin-top:10px;flex-wrap:wrap;}
.s3-pb{
  background:var(--bg1);border:1px solid var(--border);border-radius:7px;
  color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:9px;
  padding:4px 10px;cursor:pointer;transition:all .18s;
}
.s3-pb:hover,.s3-pb.active{background:var(--glow);border-color:var(--accent);color:var(--accent);}

/* ── scatter ── */
.s3-scatter-wrap{overflow-x:auto;}

/* ── speed ── */
.s3-spd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.s3-spd{
  padding:12px 8px;border-radius:10px;text-align:center;
  background:var(--bg1);border:1px solid var(--border);
}
.s3-spd-val{font-family:'Vazirmatn',sans-serif;font-size:22px;font-weight:700;line-height:1;}
.s3-spd-lbl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-top:4px;}

/* ── divider ── */
.s3-divider{height:1px;background:var(--border);margin:4px 0 16px;}
</style>

<div class="s3">

  ${buildS3Overview(total, week, today, avgRisk, peakHour)}
  ${buildS3RiskDashboard(avgRisk, medRisk, sdRisk, riskDist, riskVals)}
  ${buildS3Timeline(byDay)}
  ${buildS3Geo(topProv, provRisk, total)}
  ${buildS3Demographics(genderMap, ageGroups, total)}
  ${ageRiskData.length > 3 ? buildS3Scatter(ageRiskData) : ''}
  ${buildS3Source(srcMap, srcRisk, total)}
  ${buildS3Segmentation(rows)}
  ${buildS3Questions(qList)}
  ${buildS3Avatars(topAv, total)}
  ${Object.keys(profMap).length ? buildS3Profiles(profMap, total) : ''}
  ${Object.keys(cohortMap).length ? buildS3Cohort(cohortMap, rows) : ''}
  ${buildS3Table(rows)}

</div>
  `;

  waitD3(() => {
    drawS3Timeline(byDay);
    drawS3Gauge(avgRisk, riskVals);
    if (ageRiskData.length > 3) drawS3Scatter(ageRiskData);
  });

  window._tblRows     = rows;
  window._tblSort     = { col: 'date', dir: -1 };
  window._tblPage     = 1;
  window._tblFiltered = rows;
  filterTable();
  initS3Seg(rows);
}

/* ── helpers ── */
function s3block(label, inner) {
  return `<div class="s3-block"><div class="s3-label">${label}</div>${inner}</div>`;
}

/* ═══ OVERVIEW ═══ */
function buildS3Overview(total, week, today, avgRisk, peakHour) {
  const rc = riskColor(avgRisk);
  return s3block('مجموع شرکت‌کنندگان', `
    <div class="s3-kpi-grid">
      <div class="s3-kpi ac-1">
        <span class="s3-kpi-tag">TOTAL</span>
        <span class="s3-kpi-num colored">${total}</span>
        <span class="s3-kpi-sub">کل پاسخ‌دهندگان</span>
      </div>
      <div class="s3-kpi ac-3">
        <span class="s3-kpi-tag">این هفته</span>
        <span class="s3-kpi-num c3">${week}</span>
        <span class="s3-kpi-sub">نفر جدید</span>
      </div>
      <div class="s3-kpi ac-g">
        <span class="s3-kpi-tag">امروز</span>
        <span class="s3-kpi-num cg">${today}</span>
        <span class="s3-kpi-sub">ثبت شده</span>
      </div>
    </div>
  `);
}

/* ═══ RISK DASHBOARD ═══ */
function buildS3RiskDashboard(avgRisk, medRisk, sdRisk, riskDist, riskVals) {
  const total = riskVals.length;
  return s3block('تحلیل ریسک', `
    <div class="s3-wide" style="margin-bottom:8px">
      <div class="s3-gauge-wrap">
        <svg id="s3-gauge-svg" width="100%" height="90"></svg>
        <div style="font-size:9px;color:var(--text2)">${riskEmoji(avgRisk)} ${riskLabel(avgRisk)}</div>
      </div>
    </div>
    <div class="s3-kpi-grid g4" style="margin-bottom:8px">
      <div class="s3-kpi">
        <span class="s3-kpi-tag">MEDIAN</span>
        <span class="s3-kpi-num c2">${medRisk||'—'}</span>
        <span class="s3-kpi-sub">میانه</span>
      </div>
      <div class="s3-kpi">
        <span class="s3-kpi-tag">STD DEV</span>
        <span class="s3-kpi-num c3">${sdRisk||'—'}</span>
        <span class="s3-kpi-sub">انحراف معیار</span>
      </div>
      <div class="s3-kpi">
        <span class="s3-kpi-tag">AVG RISK</span>
        <span class="s3-kpi-num" style="color:${riskColor(avgRisk)}">${avgRisk||'—'}</span>
        <span class="s3-kpi-sub">میانگین</span>
      </div>
      <div class="s3-kpi">
        <span class="s3-kpi-tag">COUNT</span>
        <span class="s3-kpi-num colored">${riskVals.length}</span>
        <span class="s3-kpi-sub">با ریسک</span>
      </div>
    </div>
    <div class="s3-risk-dist">
      <div class="s3-rd low">
        <div class="s3-rd-num">${riskDist.low}</div>
        <div class="s3-rd-lbl">محافظه‌کار</div>
        <div class="s3-rd-pct">${pct(riskDist.low,total)}٪</div>
      </div>
      <div class="s3-rd mid">
        <div class="s3-rd-num">${riskDist.mid}</div>
        <div class="s3-rd-lbl">متعادل</div>
        <div class="s3-rd-pct">${pct(riskDist.mid,total)}٪</div>
      </div>
      <div class="s3-rd hi">
        <div class="s3-rd-num">${riskDist.high}</div>
        <div class="s3-rd-lbl">ریسک‌پذیر</div>
        <div class="s3-rd-pct">${pct(riskDist.high,total)}٪</div>
      </div>
      <div class="s3-rd vhi">
        <div class="s3-rd-num">${riskDist.very}</div>
        <div class="s3-rd-lbl">جسور</div>
        <div class="s3-rd-pct">${pct(riskDist.very,total)}٪</div>
      </div>
    </div>
  `);
}

function drawS3Gauge(avgRisk, riskVals) {
  const node = document.getElementById('s3-gauge-svg');
  if (!node || !window.d3) return;
  const W = node.getBoundingClientRect().width || 300;
  if (W < 10) return;
  const H = 90, cx = W / 2, cy = H - 8, r = Math.min(cx - 28, 60);
  const col = riskColor(avgRisk);
  const startA = -Math.PI, endA = 0;
  const pctVal = avgRisk > 0 ? Math.min((avgRisk - 1) / 3, 1) : 0;
  const valA = startA + pctVal * Math.PI;

  const segs = [
    { s: startA, e: startA + Math.PI * 0.33, c: '#34d499' },
    { s: startA + Math.PI * 0.33, e: startA + Math.PI * 0.58, c: '#fbbf24' },
    { s: startA + Math.PI * 0.58, e: startA + Math.PI * 0.83, c: '#ff8c00' },
    { s: startA + Math.PI * 0.83, e: endA, c: '#ff4444' },
  ];

  const svg = d3.select('#s3-gauge-svg').attr('width', W).attr('height', H);
  const g   = svg.append('g').attr('transform', `translate(${cx},${cy})`);

  segs.forEach(seg => {
    const a = d3.arc().innerRadius(r-10).outerRadius(r).startAngle(seg.s).endAngle(seg.e);
    g.append('path').attr('d', a({})).attr('fill', seg.c).attr('opacity', .18);
  });

  if (avgRisk > 0) {
    const aFill = d3.arc().innerRadius(r-10).outerRadius(r).startAngle(startA).endAngle(valA);
    g.append('path').attr('d', aFill({})).attr('fill', col).attr('opacity', .85);
    const nx = Math.cos(valA - Math.PI/2) * (r - 14);
    const ny = Math.sin(valA - Math.PI/2) * (r - 14);
    g.append('line').attr('x1',0).attr('y1',0).attr('x2',nx).attr('y2',ny)
     .attr('stroke',col).attr('stroke-width',2.5).attr('stroke-linecap','round');
    g.append('circle').attr('r',4).attr('fill',col).attr('stroke','var(--bg1)').attr('stroke-width',2);
  }

  g.append('text').attr('text-anchor','middle').attr('y',-r+8)
   .attr('fill',col).attr('font-size','22').attr('font-weight','700')
   .attr('font-family','Vazirmatn,sans-serif').text(avgRisk||'—');

  ['۱','۲','۳','۴'].forEach((lbl,i) => {
    const a = startA + (i/3)*Math.PI;
    const lx = Math.cos(a)*(r+14), ly = Math.sin(a)*(r+14);
    g.append('text').attr('x',lx).attr('y',ly+3)
     .attr('text-anchor','middle').attr('fill','var(--text3)')
     .attr('font-size','7').attr('font-family','JetBrains Mono,monospace').text(lbl);
  });
}

/* ═══ TIMELINE ═══ */
function buildS3Timeline(byDay) {
  return s3block('روند زمانی', `
    <div class="s3-wide" style="padding:10px 10px 6px">
      <div class="s3-timeline-wrap"><svg id="s3-tl-svg" width="100%" height="120"></svg></div>
    </div>
  `);
}

function drawS3Timeline(byDay) {
  const node = document.getElementById('s3-tl-svg');
  if (!node || !window.d3) return;
  const entries = Object.entries(byDay).sort((a,b) => a[0]>b[0]?1:-1);
  if (!entries.length) return;
  const W = node.getBoundingClientRect().width || 300;
  if (W < 10) return;
  const H = 120, pad = {t:8,r:8,b:26,l:26};
  const iW = W-pad.l-pad.r, iH = H-pad.t-pad.b;
  const data = entries.map(([k,v]) => ({date:new Date(k),val:v}));
  const xScale = d3.scaleTime().domain(d3.extent(data,d=>d.date)).range([0,iW]);
  const yScale = d3.scaleLinear().domain([0,d3.max(data,d=>d.val)*1.25]).range([iH,0]);
  const svg = d3.select('#s3-tl-svg').attr('width',W).attr('height',H);
  const g   = svg.append('g').attr('transform',`translate(${pad.l},${pad.t})`);

  const gId = 'tl-g-'+Date.now();
  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id',gId).attr('x1','0').attr('y1','0').attr('x2','0').attr('y2','1');
  grad.append('stop').attr('offset','0%').attr('stop-color','var(--accent)').attr('stop-opacity',.35);
  grad.append('stop').attr('offset','100%').attr('stop-color','var(--accent)').attr('stop-opacity',0);

  const area = d3.area().x(d=>xScale(d.date)).y0(iH).y1(d=>yScale(d.val)).curve(d3.curveCatmullRom);
  const line = d3.line().x(d=>xScale(d.date)).y(d=>yScale(d.val)).curve(d3.curveCatmullRom);

  g.append('path').datum(data).attr('d',area).attr('fill',`url(#${gId})`);
  g.append('path').datum(data).attr('d',line).attr('fill','none').attr('stroke','var(--accent)').attr('stroke-width',1.8);
  g.selectAll('circle').data(data).enter().append('circle')
   .attr('cx',d=>xScale(d.date)).attr('cy',d=>yScale(d.val))
   .attr('r',2.5).attr('fill','var(--accent)').attr('opacity',.85);

  g.append('g').attr('transform',`translate(0,${iH})`)
   .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%m/%d')))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.append('g').call(d3.axisLeft(yScale).ticks(3))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.selectAll('.domain,.tick line').attr('stroke','var(--border)');
}

/* ═══ GEO ═══ */
function buildS3Geo(topProv, provRisk, total) {
  if (!topProv.length) return '';
  const maxV = topProv[0][1];
  const rows = topProv.map(([name,cnt],i) => {
    const risks = provRisk[name]||[];
    const avgR  = risks.length ? parseFloat((risks.reduce((a,b)=>a+b,0)/risks.length).toFixed(1)) : 0;
    const rc    = riskColor(avgR);
    const barColor = avgR > 0 ? rc : 'var(--accent)';
    const badgeStyle = avgR>0 ? `background:${rc}22;color:${rc};border:1px solid ${rc}44` : `background:var(--bg2);color:var(--text3);border:1px solid var(--border)`;
    return `<div class="s3-row-item">
      <span class="s3-row-rank">#${i+1}</span>
      <span class="s3-row-name">${esc(name)}</span>
      <div class="s3-row-bar"><div class="s3-row-fill" style="width:${Math.round(cnt/maxV*100)}%;background:${barColor}"></div></div>
      <span class="s3-row-cnt">${cnt}</span>
      <span class="s3-row-pct">${pct(cnt,total)}٪</span>
      <span class="s3-row-badge" style="${badgeStyle}">${avgR||'—'}</span>
    </div>`;
  }).join('');
  return s3block('پراکندگی جغرافیایی', `
    <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap">
      <span style="color:#34d499">● محافظه‌کار</span>
      <span style="color:#fbbf24">● متعادل</span>
      <span style="color:#ff8c00">● ریسک‌پذیر</span>
      <span style="color:#ff4444">● جسور</span>
    </div>
    ${rows}
  `);
}

/* ═══ DEMOGRAPHICS ═══ */
function buildS3Demographics(genderMap, ageGroups, total) {
  const gTotal = Object.values(genderMap).reduce((a,b)=>a+b,0)||1;
  const gMax   = Math.max(...Object.values(genderMap),1);
  const aMax   = Math.max(...Object.values(ageGroups),1);

  const genderHtml = Object.entries(genderMap).sort((a,b)=>b[1]-a[1]).map(([g,cnt]) => {
    const icon = g==='مرد'?'👨':g==='زن'?'👩':'👤';
    const col  = g==='مرد'?'var(--accent3)':g==='زن'?'#ff6b9d':'var(--accent2)';
    return `<div class="s3-gender-pill">
      <span class="s3-gender-icon">${icon}</span>
      <div>
        <div class="s3-gender-name">${g}</div>
        <div class="s3-gender-num" style="color:${col}">${cnt}</div>
        <div class="s3-gender-pct">${pct(cnt,gTotal)}٪</div>
      </div>
    </div>`;
  }).join('');

  const ageHtml = Object.entries(ageGroups).map(([range,cnt]) =>
    `<div class="s3-age-row">
      <span class="s3-age-lbl">${range}</span>
      <div class="s3-age-track"><div class="s3-age-fill" style="width:${pct(cnt,aMax)}%"></div></div>
      <span class="s3-age-val">${cnt}</span>
    </div>`
  ).join('');

  return s3block('جمعیت‌شناسی', `
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="s3-gender-row">${genderHtml||'<span style="color:var(--text3);font-size:9px">داده‌ای نیست</span>'}</div>
      <div class="s3-wide" style="padding:12px">
        <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);letter-spacing:2px;margin-bottom:9px">// AGE GROUPS</div>
        <div class="s3-age-rows">${ageHtml}</div>
      </div>
    </div>
  `);
}

/* ═══ SCATTER ═══ */
function buildS3Scatter(data) {
  return s3block('رابطه سن و ریسک', `
    <div class="s3-wide" style="padding:10px 10px 6px">
      <div class="s3-scatter-wrap"><svg id="s3-scatter-svg" width="100%" height="130"></svg></div>
    </div>
  `);
}

function drawS3Scatter(data) {
  const node = document.getElementById('s3-scatter-svg');
  if (!node || !window.d3) return;
  const W = node.getBoundingClientRect().width || 300;
  if (W < 10) return;
  const H = 130, pad = {t:8,r:8,b:26,l:26};
  const iW = W-pad.l-pad.r, iH = H-pad.t-pad.b;
  const svg = d3.select('#s3-scatter-svg').attr('width',W).attr('height',H);
  const g   = svg.append('g').attr('transform',`translate(${pad.l},${pad.t})`);
  const xScale = d3.scaleLinear().domain([d3.min(data,d=>d.age)-2,d3.max(data,d=>d.age)+2]).range([0,iW]);
  const yScale = d3.scaleLinear().domain([1,4]).range([iH,0]);

  g.selectAll('circle').data(data).enter().append('circle')
   .attr('cx',d=>xScale(d.age)).attr('cy',d=>yScale(d.risk))
   .attr('r',4).attr('fill',d=>riskColor(d.risk)).attr('opacity',.6);

  g.append('g').attr('transform',`translate(0,${iH})`)
   .call(d3.axisBottom(xScale).ticks(5))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.append('g').call(d3.axisLeft(yScale).ticks(4))
   .selectAll('text').attr('fill','var(--text3)').style('font-size','7px').style('font-family','JetBrains Mono,monospace');
  g.selectAll('.domain,.tick line').attr('stroke','var(--border)');

  const n=data.length, xm=data.reduce((s,d)=>s+d.age,0)/n, ym=data.reduce((s,d)=>s+d.risk,0)/n;
  const num=data.reduce((s,d)=>s+(d.age-xm)*(d.risk-ym),0), den=data.reduce((s,d)=>s+(d.age-xm)**2,0);
  if (den>0) {
    const slope=num/den, intc=ym-slope*xm;
    const x0=d3.min(data,d=>d.age), x1=d3.max(data,d=>d.age);
    g.append('line')
     .attr('x1',xScale(x0)).attr('y1',yScale(Math.max(1,Math.min(4,slope*x0+intc))))
     .attr('x2',xScale(x1)).attr('y2',yScale(Math.max(1,Math.min(4,slope*x1+intc))))
     .attr('stroke','var(--accent2)').attr('stroke-width',1.5).attr('stroke-dasharray','4,3').attr('opacity',.6);
  }
}

/* ═══ SOURCE ═══ */
function buildS3Source(srcMap, srcRisk, total) {
  const entries = Object.entries(srcMap).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) return '';
  const srcColors = {
    'تلگرام':'#26a5e4','telegram':'#26a5e4',
    'اینستاگرام':'#e1306c','instagram':'#e1306c',
    'واتساپ':'#25d366','whatsapp':'#25d366',
    'مستقیم':'var(--accent)','direct':'var(--accent)',
    'ایمیل':'#ea4335','email':'#ea4335',
    'توییتر':'#1d9bf0','twitter':'#1d9bf0',
  };
  const rows = entries.map(([name,cnt]) => {
    const risks = srcRisk[name]||[];
    const avgR  = risks.length ? parseFloat((risks.reduce((a,b)=>a+b,0)/risks.length).toFixed(1)) : 0;
    const col   = srcColors[name]||srcColors[name.toLowerCase()]||'var(--accent)';
    const rc    = riskColor(avgR);
    return `<div class="s3-src-row">
      <div class="s3-src-dot" style="background:${col}"></div>
      <span class="s3-src-name">${esc(name)}</span>
      <span class="s3-src-cnt">${cnt}</span>
      <span class="s3-src-pct">${pct(cnt,total)}٪</span>
      ${avgR>0?`<span class="s3-src-risk" style="background:${rc}22;color:${rc};border:1px solid ${rc}44">${avgR}</span>`:''}
    </div>`;
  }).join('');
  return s3block('منبع ورود', `<div class="s3-src-grid">${rows}</div>`);
}

/* ═══ SEGMENTATION ═══ */
function buildS3Segmentation(rows) {
  const provinces = [...new Set(rows.map(r=>r.province).filter(Boolean))].sort();
  const genders   = [...new Set(rows.map(r=>r.gender).filter(Boolean))];
  const cohorts   = [...new Set(rows.map(r=>r.cohort).filter(Boolean))];
  return s3block('فیلتر ترکیبی', `
    <div class="s3-seg-filters">
      <select class="s3-seg-select" id="seg-prov" onchange="updateSeg()">
        <option value="">همه استان‌ها</option>
        ${provinces.map(p=>`<option value="${esc(p)}">${p}</option>`).join('')}
      </select>
      <select class="s3-seg-select" id="seg-gender" onchange="updateSeg()">
        <option value="">همه جنسیت‌ها</option>
        ${genders.map(g=>`<option value="${esc(g)}">${g}</option>`).join('')}
      </select>
      <select class="s3-seg-select" id="seg-age" onchange="updateSeg()">
        <option value="">همه سنی</option>
        <option value="18-25">18–25</option><option value="26-35">26–35</option>
        <option value="36-45">36–45</option><option value="46-55">46–55</option>
        <option value="56-99">56+</option>
      </select>
      ${cohorts.length?`<select class="s3-seg-select" id="seg-cohort" onchange="updateSeg()">
        <option value="">همه کوهورت‌ها</option>
        ${cohorts.map(c=>`<option value="${esc(c)}">${c}</option>`).join('')}
      </select>`:''}
    </div>
    <div class="s3-seg-result" id="seg-result"></div>
  `);
}

function initS3Seg(rows) { window._segRows = rows; updateSeg(); }

function updateSeg() {
  const rows = window._segRows||[];
  const prov = document.getElementById('seg-prov')?.value||'';
  const gen  = document.getElementById('seg-gender')?.value||'';
  const age  = document.getElementById('seg-age')?.value||'';
  const coh  = document.getElementById('seg-cohort')?.value||'';
  let f = rows;
  if (prov) f=f.filter(r=>r.province===prov);
  if (gen)  f=f.filter(r=>r.gender===gen);
  if (age)  { const [lo,hi]=age.split('-').map(Number); f=f.filter(r=>{const a=parseInt(r.age);return a>=lo&&a<=hi;}); }
  if (coh)  f=f.filter(r=>r.cohort===coh);
  const riskF=f.filter(r=>r.risk>0);
  const avgR=riskF.length?parseFloat((riskF.reduce((s,r)=>s+r.risk,0)/riskF.length).toFixed(2)):0;
  const rc=riskColor(avgR);
  const el=document.getElementById('seg-result');
  if (!el) return;
  el.innerHTML=`
    <div class="s3-seg-num">${f.length}</div>
    <div class="s3-seg-desc">${f.length} نفر با این فیلترها — ${pct(f.length,rows.length)}٪ از کل</div>
    ${avgR>0?`<div class="s3-seg-risk">
      <div style="width:7px;height:7px;border-radius:50%;background:${rc}"></div>
      <span style="font-size:9px;color:var(--text2)">میانگین ریسک: <strong style="color:${rc}">${avgR}</strong> — ${riskLabel(avgR)}</span>
    </div>`:''}
  `;
}

/* ═══ QUESTIONS ═══ */
function buildS3Questions(qList) {
  if (!qList.length) return '';
  const cards = qList.map(q => {
    const ansList = Object.entries(q.answers).sort((a,b)=>b[1]-a[1]);
    const qTotal  = ansList.reduce((s,[,c])=>s+c,0);
    const top     = ansList[0];
    const topP    = top?pct(top[1],qTotal):0;
    return `<div class="s3-q">
      <div class="s3-q-head">
        <span class="s3-q-id">سوال ${q.id}</span>
        <span class="s3-q-total">${qTotal} پاسخ</span>
        ${top&&topP>=50?`<span class="s3-q-dom">غالب ${topP}٪</span>`:''}
      </div>
      ${ansList.slice(0,6).map(([ans,cnt])=>
        `<div class="s3-q-row">
          <span class="s3-q-lbl" title="${esc(ans)}">${esc(ans.substring(0,38))}${ans.length>38?'…':''}</span>
          <div class="s3-q-track"><div class="s3-q-fill" style="width:${pct(cnt,qTotal)}%"></div></div>
          <span class="s3-q-cnt">${cnt}</span>
          <span class="s3-q-pct">${pct(cnt,qTotal)}٪</span>
        </div>`
      ).join('')}
    </div>`;
  }).join('');
  return s3block('تحلیل سوال‌ها', cards);
}

/* ═══ AVATARS ═══ */
function buildS3Avatars(topAv, total) {
  if (!topAv.length) return '';
  const cards = topAv.map(([name,cnt],i) => {
    const img = makeAvatar(name,40);
    return `<div class="s3-av-card${i===0?' top':''}">
      ${i===0?'<span class="s3-av-crown">👑</span>':''}
      ${img?`<img class="s3-av-img" src="${img}" alt="${esc(name)}">`:`<div class="s3-av-fb">🎭</div>`}
      <div class="s3-av-name">${esc(name)}</div>
      <div class="s3-av-cnt">${cnt}</div>
      <div class="s3-av-pct">${pct(cnt,total)}٪</div>
    </div>`;
  }).join('');
  return s3block('آواتارها', `<div class="s3-av-grid">${cards}</div>`);
}

/* ═══ PROFILES ═══ */
function buildS3Profiles(profMap, total) {
  const entries = Object.entries(profMap).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) return '';
  const maxV = entries[0][1];
  const rows = entries.map(([name,cnt],i) =>
    `<div class="s3-prof-row">
      <span class="s3-prof-rank">#${i+1}</span>
      <span class="s3-prof-name">${esc(name)}</span>
      <div class="s3-prof-bar-wrap"><div class="s3-prof-bar-fill" style="width:${pct(cnt,maxV)}%"></div></div>
      <span class="s3-prof-cnt">${cnt}</span>
      <span class="s3-prof-pct">${pct(cnt,total)}٪</span>
    </div>`
  ).join('');
  return s3block('پروفایل‌ها', `
    <div class="s3-wide" style="padding:12px">
      <div class="s3-prof-list">${rows}</div>
    </div>
  `);
}

/* ═══ COHORT ═══ */
function buildS3Cohort(cohortMap, rows) {
  const cards = Object.entries(cohortMap).map(([name,cnt]) => {
    const riskF=rows.filter(r=>r.cohort===name&&r.risk>0);
    const avgR=riskF.length?parseFloat((riskF.reduce((s,r)=>s+r.risk,0)/riskF.length).toFixed(1)):0;
    const rc=riskColor(avgR);
    return `<div class="s3-co">
      <div class="s3-co-name">${esc(name)}</div>
      <div class="s3-co-num">${cnt}</div>
      <div class="s3-co-risk" style="color:${rc}">${avgR?`ریسک: ${avgR}`:'—'}</div>
    </div>`;
  }).join('');
  return s3block('کوهورت', `<div class="s3-cohort-grid">${cards}</div>`);
}

/* ═══ TABLE ═══ */
function buildS3Table(rows) {
  return s3block('همه پاسخ‌دهندگان', `
    <div class="s3-tbl-filters">
      <input class="s3-tbl-search" id="tblSearch" placeholder="جستجو نام / استان..." oninput="filterTable()">
      <select class="s3-tbl-select" id="tblRisk" onchange="filterTable()">
        <option value="">همه ریسک</option>
        <option value="low">محافظه‌کار</option>
        <option value="mid">متعادل</option>
        <option value="high">ریسک‌پذیر</option>
        <option value="very">جسور</option>
      </select>
      <select class="s3-tbl-select" id="tblGender" onchange="filterTable()">
        <option value="">همه جنسیت</option>
        <option value="مرد">مرد</option>
        <option value="زن">زن</option>
      </select>
      <span class="s3-tbl-cnt" id="tblCnt">${rows.length} نفر</span>
    </div>
    <div class="s3-tbl-wrap">
      <table class="s3-tbl" id="mainTbl">
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
    <div class="s3-tbl-pager" id="tblPager"></div>
  `);
}

function filterTable() {
  if (!window._tblRows) return;
  const q  = (document.getElementById('tblSearch')?.value||'').toLowerCase();
  const rk = document.getElementById('tblRisk')?.value||'';
  const gn = document.getElementById('tblGender')?.value||'';

  let f = window._tblRows.filter(r => {
    const nameOk = !q||(r.name||'').toLowerCase().includes(q)||(r.province||'').toLowerCase().includes(q);
    const rv=parseFloat(r.risk)||0;
    const riskOk = !rk
      ||(rk==='low'  && rv>0    && rv<1.75)
      ||(rk==='mid'  && rv>=1.75 && rv<2.5)
      ||(rk==='high' && rv>=2.5  && rv<3.25)
      ||(rk==='very' && rv>=3.25);
    const genderOk = !gn||r.gender===gn;
    return nameOk&&riskOk&&genderOk;
  });

  const s=window._tblSort||{col:'date',dir:-1};
  f.sort((a,b)=>{
    let av=a[s.col]||'',bv=b[s.col]||'';
    if(s.col==='risk'||s.col==='age'){av=parseFloat(av)||0;bv=parseFloat(bv)||0;}
    return av>bv?s.dir:av<bv?-s.dir:0;
  });

  window._tblFiltered=f;
  const cntEl=document.getElementById('tblCnt');
  if(cntEl) cntEl.textContent=f.length+' نفر';

  const pp=15, pages=Math.ceil(f.length/pp)||1;
  window._tblPage=Math.min(window._tblPage||1,pages);
  const slice=f.slice((window._tblPage-1)*pp,window._tblPage*pp);

  const body=document.getElementById('tblBody');
  if(!body) return;
  body.innerHTML=slice.map((r,idx)=>{
    const gi=(window._tblPage-1)*pp+idx;
    const img=r.avatar?makeAvatar(r.avatar,32):null;
    const pc=cleanProfile(r.profile);
    return `<tr style="cursor:pointer" onclick="openPersonModal(window._tblFiltered[${gi}])">
      <td style="text-align:center">
        ${img
          ?`<img src="${img}" width="32" height="32" style="border-radius:7px;border:1px solid var(--border);image-rendering:pixelated" title="${esc(r.avatar||'')}">`
          :`<div style="width:32px;height:32px;border-radius:7px;background:var(--bg3);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--accent);border:1px solid var(--border)">${(r.name||'?').charAt(0)}</div>`
        }
      </td>
      <td class="s3-td-name">${esc(r.name)}</td>
      <td>${r.age||'—'}</td>
      <td>${r.province||'—'}</td>
      <td>${riskTag(r.risk)}</td>
      <td style="font-size:9px;color:var(--text2)">${pc?esc(pc):'—'}</td>
      <td class="s3-td-date">${fmtDate(r.date)}</td>
    </tr>`;
  }).join('');

  const pg=document.getElementById('tblPager');
  if(!pg) return;
  pg.innerHTML='';
  if(pages>1){
    if(window._tblPage>1) pg.innerHTML+=`<button class="s3-pb" onclick="event.stopPropagation();goPage(${window._tblPage-1})">«</button>`;
    for(let i=Math.max(1,window._tblPage-2);i<=Math.min(pages,window._tblPage+2);i++)
      pg.innerHTML+=`<button class="s3-pb${i===window._tblPage?' active':''}" onclick="event.stopPropagation();goPage(${i})">${i}</button>`;
    if(window._tblPage<pages) pg.innerHTML+=`<button class="s3-pb" onclick="event.stopPropagation();goPage(${window._tblPage+1})">»</button>`;
  }
}

function goPage(p){window._tblPage=p;filterTable();}

function sortTable(col){
  if(!window._tblSort) return;
  window._tblSort.dir=window._tblSort.col===col?window._tblSort.dir*-1:1;
  window._tblSort.col=col;
  document.querySelectorAll('#mainTbl th').forEach(th=>th.classList.remove('sort-asc','sort-desc'));
  const cols=['','name','age','province','risk','profile','date'];
  const th=document.querySelector(`#mainTbl th:nth-child(${cols.indexOf(col)+1})`);
  if(th) th.classList.add(window._tblSort.dir===1?'sort-asc':'sort-desc');
  filterTable();
}
