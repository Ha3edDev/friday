/* ═══════════════════════════════════════════════════════════════
   STATS — analytics page
   depends on: apiStatsFetch, parseRow, makeAvatar, openPersonModal,
               riskTag, riskLbl, riskCls, pct, fmtDate, esc,
               cleanProfile (from index.html)
═══════════════════════════════════════════════════════════════ */

function reloadStats() {
  loadedPages.stats = false;
  document.getElementById('statsMain').innerHTML =
    '<div class="stats-spinner-wrap"><div class="stats-ring"></div><div class="stats-loading-txt">// RECONNECTING...</div></div>';
  loadStats();
}

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

  const rows = (fd && fd.rows ? fd.rows : []).map(r => parseRow(r));
  const total = sd?.total || rows.length || 0;
  const week = sd?.week || 0, today = sd?.today || 0;

  // ── risk ──
  const riskRows = rows.filter(r => r.risk > 0);
  const avgRisk = riskRows.length
    ? Math.round(riskRows.reduce((s, r) => s + r.risk, 0) / riskRows.length)
    : 0;
  const rLow  = rows.filter(r => r.risk > 0 && r.risk < 40).length;
  const rMid  = rows.filter(r => r.risk >= 40 && r.risk < 70).length;
  const rHigh = rows.filter(r => r.risk >= 70).length;

  // ── speed ──
  const times = rows.map(r => r.totalTime).filter(t => t > 0);
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const minTime = times.length ? Math.round(Math.min(...times)) : 0;
  const maxTime = times.length ? Math.round(Math.max(...times)) : 0;

  // ── province ──
  const provMap = {};
  rows.forEach(r => { if (r.province) provMap[r.province] = (provMap[r.province] || 0) + 1; });
  const topProv = Object.entries(provMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // ── avatar ──
  const avMap = {};
  rows.forEach(r => { if (r.avatar) avMap[r.avatar] = (avMap[r.avatar] || 0) + 1; });
  const topAv = Object.entries(avMap).sort((a, b) => b[1] - a[1]);

  // ── cohort ──
  const cohortMap = {};
  rows.forEach(r => { if (r.cohort) cohortMap[r.cohort] = (cohortMap[r.cohort] || 0) + 1; });

  // ── profile ──
  const profMap = {};
  rows.forEach(r => { const p = cleanProfile(r.profile); if (p) profMap[p] = (profMap[p] || 0) + 1; });

  // ── question stats ──
  const qStatsMap = {};
  if (fd && fd.rows && fd.rows.length > 0) {
    const sampleKeys = Object.keys(fd.rows[0]);
    for (const key of sampleKeys) {
      const m = key.trim().match(/^س(\d+)\s*[–\-]\s*جواب$/);
      if (m) {
        const qId = parseInt(m[1]);
        if (!qStatsMap[qId]) qStatsMap[qId] = { id: qId, answers: {}, times: [] };
      }
    }
    fd.rows.forEach(rawRow => {
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

  // store rows globally for table
  window._tblRows = rows;
  window._tblSort = { col: 'date', dir: -1 };
  window._tblPage = 1;

  const riskColor = avgRisk < 40 ? '#34d499' : avgRisk < 70 ? '#fbbf24' : '#ff4444';
  const riskBadge = avgRisk < 40 ? 'rb-low'  : avgRisk < 70 ? 'rb-mid'  : 'rb-high';

  el.innerHTML = `

  <div class="stat-section">
    <div class="stat-sec-title">// OVERVIEW</div>
    <div class="g2" style="margin-bottom:8px">
      <div class="scard scard-accent">
        <div class="hero-lbl">TOTAL</div>
        <div class="hero-num">${total}</div>
        <div class="hero-sub">کل پاسخ‌دهنده</div>
      </div>
      <div class="scard">
        <div class="hero-lbl">THIS WEEK</div>
        <div class="hero-num c2">${week}</div>
        <div class="hero-sub">این هفته</div>
      </div>
    </div>
    <div class="g2">
      <div class="scard">
        <div class="hero-lbl">TODAY</div>
        <div class="hero-num c3">${today}</div>
      </div>
      <div class="scard">
        <div class="hero-lbl">AVG RISK</div>
        <div class="hero-num c4">${avgRisk}</div>
        <div class="hero-sub">${riskLbl(avgRisk)}</div>
      </div>
    </div>
  </div>

  <div class="stat-section">
    <div class="stat-sec-title">// RISK DISTRIBUTION</div>
    <div class="risk-dist">
      <div class="rcard low"><div class="rn">${rLow}</div><div class="rp">${pct(rLow, total)}%</div><div class="rl">محافظه‌کار</div></div>
      <div class="rcard mid"><div class="rn">${rMid}</div><div class="rp">${pct(rMid, total)}%</div><div class="rl">متعادل</div></div>
      <div class="rcard high"><div class="rn">${rHigh}</div><div class="rp">${pct(rHigh, total)}%</div><div class="rl">ریسک‌پذیر</div></div>
    </div>
    <div class="risk-avg-row">
      <div>
        <div style="font-size:7px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-bottom:3px">AVG SCORE</div>
        <div class="risk-avg-num" style="color:${riskColor}">${avgRisk}</div>
      </div>
      <div style="flex:1">
        <div class="risk-avg-bar">
          <div class="risk-avg-fill" style="width:${avgRisk}%;background:${riskColor}"></div>
        </div>
      </div>
      <span class="risk-badge ${riskBadge}">${riskLbl(avgRisk)}</span>
    </div>
  </div>

  <div class="stat-section">
    <div class="stat-sec-title">// SPEED</div>
    <div class="speed3">
      <div class="sp-c"><div class="sp-v">${avgTime}s</div><div class="sp-l">میانگین</div></div>
      <div class="sp-c"><div class="sp-v">${minTime}s</div><div class="sp-l">سریع‌ترین</div></div>
      <div class="sp-c"><div class="sp-v">${maxTime}s</div><div class="sp-l">کندترین</div></div>
    </div>
  </div>

  ${Object.keys(cohortMap).length ? `
  <div class="stat-section">
    <div class="stat-sec-title">// COHORT</div>
    <div class="cohort-grid">
      ${Object.entries(cohortMap).map(([name, cnt]) => {
        const avgR = Math.round(
          rows.filter(r => r.cohort === name && r.risk > 0)
              .reduce((s, r, _, a) => s + r.risk / a.length, 0)
        );
        return `<div class="co-c">
          <div class="co-name">${esc(name)}</div>
          <div class="co-num">${cnt}</div>
          <div class="co-risk">ریسک: ${avgR || '—'}</div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  ${Object.keys(profMap).length ? `
  <div class="stat-section">
    <div class="stat-sec-title">// PROFILES</div>
    <div class="scard">
      <div class="ilist">
        ${Object.entries(profMap).sort((a, b) => b[1] - a[1]).map(([name, cnt], i) =>
          `<div class="irow">
            <span class="irow-rank">#${i + 1}</span>
            <span class="irow-lbl">${esc(name)}</span>
            <div class="irow-bw"><div class="irow-bf" style="width:${pct(cnt, total)}%"></div></div>
            <span class="irow-cnt">${cnt}</span>
            <span class="irow-pct">${pct(cnt, total)}%</span>
          </div>`
        ).join('')}
      </div>
    </div>
  </div>` : ''}

  ${topProv.length ? `
  <div class="stat-section">
    <div class="stat-sec-title">// TOP PROVINCES</div>
    <div class="scard">
      <div class="ilist">
        ${topProv.map(([name, cnt], i) =>
          `<div class="irow">
            <span class="irow-rank">#${i + 1}</span>
            <span class="irow-lbl">📍${name}</span>
            <div class="irow-bw"><div class="irow-bf" style="width:${pct(cnt, topProv[0][1])}%"></div></div>
            <span class="irow-cnt">${cnt}</span>
            <span class="irow-pct">${pct(cnt, total)}%</span>
          </div>`
        ).join('')}
      </div>
    </div>
  </div>` : ''}

  ${topAv.length ? `
  <div class="stat-section">
    <div class="stat-sec-title">// AVATARS</div>
    <div class="av-grid">
      ${topAv.map(([name, cnt], i) => {
        const img = makeAvatar(name, 44);
        return `<div class="av-card${i === 0 ? ' top' : ''}">
          ${i === 0 ? '<span class="av-crown">👑</span>' : ''}
          ${img
            ? `<img class="av-img" src="${img}" alt="${name}">`
            : `<div class="av-fb">🎭</div>`}
          <div class="av-name">${esc(name)}</div>
          <div class="av-cnt">${cnt}</div>
          <div class="av-pct">${pct(cnt, total)}%</div>
          <div class="av-bw"><div class="av-bf" style="width:${pct(cnt, topAv[0][1])}%"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  ${qList.length ? `
  <div class="stat-section">
    <div class="stat-sec-title">// QUESTIONS BREAKDOWN</div>
    ${qList.map(q => {
      const ansList = Object.entries(q.answers).sort((a, b) => b[1] - a[1]);
      const qTotal  = ansList.reduce((s, [, c]) => s + c, 0);
      const avgT    = q.times.length
        ? Math.round(q.times.reduce((a, b) => a + b, 0) / q.times.length)
        : null;
      return `<div class="q-card">
        <div class="q-head">
          <span class="q-num">// سوال ${q.id}</span>
          ${avgT ? `<span class="q-time">⏱ ${avgT}s</span>` : ''}
          <span class="q-tot">${qTotal} پاسخ</span>
        </div>
        ${ansList.slice(0, 5).map(([ans, cnt]) => `
        <div class="q-ar">
          <span class="q-al" title="${esc(ans)}">${esc(ans.substring(0, 40))}${ans.length > 40 ? '…' : ''}</span>
          <div class="q-bw"><div class="q-bf" style="width:${pct(cnt, qTotal)}%"></div></div>
          <span class="q-pp">${pct(cnt, qTotal)}%</span>
        </div>`).join('')}
      </div>`;
    }).join('')}
  </div>` : ''}

  <div class="stat-section">
    <div class="stat-sec-title">// ALL RESPONDENTS</div>
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
        <thead>
          <tr>
            <th onclick="sortTable('name')">نام</th>
            <th onclick="sortTable('age')">سن</th>
            <th onclick="sortTable('province')">استان</th>
            <th onclick="sortTable('risk')">ریسک</th>
            <th onclick="sortTable('profile')">پروفایل</th>
            <th onclick="sortTable('date')">تاریخ</th>
            <th>آواتار</th>
            <th>جزئیات</th>
          </tr>
        </thead>
        <tbody id="tblBody"></tbody>
      </table>
    </div>
    <div class="pager" id="tblPager"></div>
  </div>`;

  filterTable();
}

/* ═══════════════ TABLE HELPERS ═══════════════ */
function filterTable() {
  if (!window._tblRows) return;
  const q  = (document.getElementById('tblSearch')?.value || '').toLowerCase();
  const rk = document.getElementById('tblRisk')?.value || '';

  let f = window._tblRows.filter(r => {
    const nameOk = !q || (r.name || '').toLowerCase().includes(q) || (r.province || '').toLowerCase().includes(q);
    const riskOk = !rk
      || (rk === 'low'  && r.risk > 0  && r.risk < 40)
      || (rk === 'mid'  && r.risk >= 40 && r.risk < 70)
      || (rk === 'high' && r.risk >= 70);
    return nameOk && riskOk;
  });

  const s = window._tblSort;
  f.sort((a, b) => {
    let av = a[s.col] || '', bv = b[s.col] || '';
    if (s.col === 'risk' || s.col === 'age') { av = parseFloat(av) || 0; bv = parseFloat(bv) || 0; }
    return av > bv ? s.dir : av < bv ? -s.dir : 0;
  });

  document.getElementById('tblCnt').textContent = f.length + ' نفر';

  const pp = 10, pages = Math.ceil(f.length / pp) || 1;
  window._tblPage = Math.min(window._tblPage, pages);
  const slice = f.slice((window._tblPage - 1) * pp, window._tblPage * pp);

  window._tblFiltered = f;

  document.getElementById('tblBody').innerHTML = slice.map((r, idx) => {
    const globalIdx = (window._tblPage - 1) * pp + idx;
    const img = r.avatar ? makeAvatar(r.avatar, 26) : null;
    const profileClean = cleanProfile(r.profile);
    return `<tr>
      <td class="td-name">${esc(r.name)}</td>
      <td>${r.age}</td>
      <td>${r.province || '—'}</td>
      <td class="td-score">${riskTag(r.risk)}</td>
      <td style="font-size:9px;color:var(--text2)">${profileClean ? esc(profileClean) : '—'}</td>
      <td class="td-date">${fmtDate(r.date)}</td>
      <td>${img ? `<img class="td-av" src="${img}" width="26" height="26" title="${esc(r.avatar)}">` : (r.avatar || '—')}</td>
      <td><button class="td-click" onclick="openPersonModal(window._tblFiltered[${globalIdx}])">▾ باز</button></td>
    </tr>`;
  }).join('');

  // pagination
  const pg = document.getElementById('tblPager');
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

function goPage(p) {
  window._tblPage = p;
  filterTable();
}

function sortTable(col) {
  if (!window._tblSort) return;
  if (window._tblSort.col === col) window._tblSort.dir *= -1;
  else { window._tblSort.col = col; window._tblSort.dir = 1; }

  document.querySelectorAll('#mainTbl th').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
  const cols = ['name', 'age', 'province', 'risk', 'profile', 'date'];
  const th = document.querySelector(`#mainTbl th:nth-child(${cols.indexOf(col) + 1})`);
  if (th) th.classList.add(window._tblSort.dir === 1 ? 'sort-asc' : 'sort-desc');
  filterTable();
}
