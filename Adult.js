/* ══════════════════════════════════════════
   🔞 Adult.js — F.R.I.D.A.Y NSFW Vault
   جستجوی مستقیم داخل Pornhub + iframe پخش
══════════════════════════════════════════ */
(function BA_injectCSS() {
  if (document.getElementById('ba-style')) return;
  const s = document.createElement('style');
  s.id = 'ba-style';
  s.textContent = `
.ba-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;}
.ba-search{width:100%;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:10px 14px;color:var(--text1);font-size:12px;outline:none;}
.ba-cat-bar{display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;}
.ba-cat-pill{padding:5px 14px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:8.5px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .2s;}
.ba-cat-pill.active{background:var(--accent);color:var(--bg0);border-color:var(--accent);}
.ba-results iframe{width:100%;height:78vh;border:none;border-radius:16px;background:#000;}
.ba-notice{font-size:8px;color:var(--text3);text-align:center;margin-top:8px;font-family:'JetBrains Mono',monospace;}
`;
  document.head.appendChild(s);
})();

function loadAdultPage() {
  const wrap = document.getElementById('adultResults') || document.createElement('div');
  if (!document.getElementById('adultResults')) {
    const page = document.getElementById('page-adult');
    if (page) {
      const content = document.createElement('div');
      content.id = 'adultResults';
      page.appendChild(content);
    }
  }

  const html = `
    <div class="ba-toolbar">
      <input id="adultSearchInput" class="ba-search" placeholder="جستجو در Pornhub، Xvideos... (مثلاً persian OR ایرانی)" onkeypress="if(event.key==='Enter') adultSearch(this.value.trim())">
    </div>
    <div class="ba-cat-bar" id="adultCats"></div>
    <div id="adultMain"></div>
  `;

  const results = document.getElementById('adultResults');
  results.innerHTML = html;

  // دسته‌بندی‌ها
  const catsHTML = `
    <div class="ba-cat-pill active" onclick="adultQuick('')">همه</div>
    <div class="ba-cat-pill" onclick="adultQuick('ایرانی OR persian')">ایرانی</div>
    <div class="ba-cat-pill" onclick="adultQuick('milf')">MILF</div>
    <div class="ba-cat-pill" onclick="adultQuick('amateur')">Amateur</div>
    <div class="ba-cat-pill" onclick="adultQuick('lesbian')">Lesbian</div>
    <div class="ba-cat-pill" onclick="adultQuick('pov')">POV</div>
    <div class="ba-cat-pill" onclick="adultQuick('new')">جدید</div>
  `;
  document.getElementById('adultCats').innerHTML = catsHTML;
}

function adultQuick(term) {
  document.getElementById('adultSearchInput').value = term;
  adultSearch(term);
}

function adultSearch(query) {
  const main = document.getElementById('adultMain');
  if (!query) {
    main.innerHTML = `<div class="empty">// چیزی تایپ کنید</div>`;
    return;
  }

  const searchUrl = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`;

  main.innerHTML = `
    <div class="ba-results">
      <iframe src="${searchUrl}" allowfullscreen></iframe>
      <div class="ba-notice">نتایج از Pornhub — برای پخش کامل روی ویدیوها کلیک کنید</div>
    </div>
  `;
}

/* ثبت در loadPage */
const originalLoadPage = loadPage;
loadPage = function(p) {
  if (p === 'adult') {
    loadAdultPage();
  } else if (originalLoadPage) {
    originalLoadPage(p);
  }
};
