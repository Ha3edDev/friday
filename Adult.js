/* ══════════════════════════════════════════
   🔞 Adult.js — Professional NSFW Vault
   نسخه قوی: جستجوی چندسایتی، دسته‌بندی، تاریخچه، favorites
══════════════════════════════════════════ */

(function BA_injectCSS() {
  if (document.getElementById('ba-style')) return;
  const s = document.createElement('style');
  s.id = 'ba-style';
  s.textContent = `
.ba-container{padding:12px 14px;}
.ba-search{width:100%;padding:14px 16px;border-radius:16px;border:1px solid var(--border);background:var(--card);color:var(--text1);font-size:13.5px;outline:none;margin-bottom:12px;}
.ba-search:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--glow2);}
.ba-cats{display:flex;gap:6px;overflow-x:auto;padding:6px 0;margin-bottom:14px;}
.ba-cat-pill{padding:6px 16px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:8.5px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .25s;flex-shrink:0;}
.ba-cat-pill.active{background:var(--accent);color:var(--bg0);border-color:var(--accent);box-shadow:0 4px 15px var(--glow);}
.ba-main{min-height:65vh;}
.ba-iframe{width:100%;height:76vh;border:none;border-radius:16px;background:#0a0a0a;box-shadow:0 10px 30px rgba(0,0,0,.6);}
.ba-notice{text-align:center;font-size:8px;color:var(--text3);margin-top:10px;font-family:'JetBrains Mono',monospace;}
.ba-history{margin-top:20px;}
.ba-history-item{padding:10px;border-radius:12px;background:var(--card);margin-bottom:6px;cursor:pointer;font-size:11px;}
`;
  document.head.appendChild(s);
})();

let adultHistory = JSON.parse(localStorage.getItem('adultHistory') || '[]');

function loadAdultPage() {
  const container = document.getElementById('adultResults');
  container.innerHTML = `
    <div class="ba-container">
      <input id="adultSearchInput" class="ba-search" placeholder="جستجو کن (مثلاً: ایرانی, milf, pov...)" autocomplete="off">

      <div class="ba-cats" id="adultCats"></div>

      <div class="ba-main" id="adultMain"></div>

      <div class="ba-history" id="adultHistory"></div>
    </div>
  `;

  renderAdultCats();
  renderAdultHistory();

  // جستجو با Enter
  document.getElementById('adultSearchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) adultSearch(q);
    }
  });
}

function renderAdultCats() {
  const cats = [
    {text: "🔥 جدید", query: "latest"},
    {text: "🇮🇷 ایرانی", query: "ایرانی OR persian"},
    {text: "MILF", query: "milf"},
    {text: "Lesbian", query: "lesbian"},
    {text: "POV", query: "pov"},
    {text: "Amateur", query: "amateur"},
    {text: "Hentai", query: "hentai"}
  ];

  let html = '';
  cats.forEach(cat => {
    html += `<div class="ba-cat-pill" onclick="adultQuickSearch('${cat.query}')">${cat.text}</div>`;
  });
  document.getElementById('adultCats').innerHTML = html;
}

function adultQuickSearch(q) {
  document.getElementById('adultSearchInput').value = q;
  adultSearch(q);
}

function adultSearch(query) {
  const main = document.getElementById('adultMain');
  if (!query) return;

  // ذخیره در تاریخچه
  if (!adultHistory.includes(query)) {
    adultHistory.unshift(query);
    if (adultHistory.length > 8) adultHistory.pop();
    localStorage.setItem('adultHistory', JSON.stringify(adultHistory));
    renderAdultHistory();
  }

  const url = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`;

  main.innerHTML = `
    <iframe class="ba-iframe" src="${url}" allowfullscreen></iframe>
    <div class="ba-notice">در حال نمایش نتایج از Pornhub • برای تجربه بهتر fullscreen بزن</div>
  `;
}

function renderAdultHistory() {
  const el = document.getElementById('adultHistory');
  if (adultHistory.length === 0) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  let html = `<div style="font-size:8px;color:var(--text3);margin-bottom:6px;">تاریخچه جستجو</div>`;
  adultHistory.forEach(q => {
    html += `<div class="ba-history-item" onclick="adultSearch('${q.replace(/'/g, "\\'")}')">${esc(q)}</div>`;
  });
  el.innerHTML = html;
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ثبت تابع */
window.loadAdultPage = loadAdultPage;
