/* Adult.js - نسخه بدون iframe (قوی و بدون بلاک) */

function loadAdultPage() {
  const container = document.getElementById('adultResults');
  container.innerHTML = `
    <div style="padding:14px;">
      <input id="adultSearchInput" 
             style="width:100%;padding:14px;border-radius:14px;border:1px solid var(--border);background:var(--card);color:var(--text1);font-size:13.5px;" 
             placeholder="جستجو کن (milf, ایرانی, pov ...)" 
             onkeypress="if(event.key==='Enter') adultSearch(this.value.trim())">

      <div style="margin:16px 0 12px; display:flex; gap:6px; flex-wrap:wrap;">
        <div onclick="adultQuick('milf')" class="cat-pill">MILF</div>
        <div onclick="adultQuick('ایرانی OR persian')" class="cat-pill">🇮🇷 ایرانی</div>
        <div onclick="adultQuick('lesbian')" class="cat-pill">Lesbian</div>
        <div onclick="adultQuick('pov')" class="cat-pill">POV</div>
        <div onclick="adultQuick('amateur')" class="cat-pill">Amateur</div>
        <div onclick="adultQuick('hentai')" class="cat-pill">Hentai</div>
      </div>

      <div id="adultResultsList"></div>
    </div>
  `;
}

function adultQuick(term) {
  document.getElementById('adultSearchInput').value = term;
  adultSearch(term);
}

function adultSearch(query) {
  if (!query) return;
  
  const resultsDiv = document.getElementById('adultResultsList');
  
  const sites = [
    {name: "Pornhub", url: `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`},
    {name: "XVideos", url: `https://www.xvideos.com/?k=${encodeURIComponent(query)}`},
    {name: "XNXX",    url: `https://www.xnxx.com/search/${encodeURIComponent(query)}`},
    {name: "SpankBang", url: `https://spankbang.com/s/${encodeURIComponent(query)}`},
  ];

  let html = `<div style="font-size:9px;color:var(--text3);margin-bottom:8px;">نتایج جستجو برای: <b>${esc(query)}</b></div>`;

  sites.forEach(site => {
    html += `
      <a href="${site.url}" target="_blank" style="display:block; padding:12px; margin-bottom:8px; background:var(--card); border:1px solid var(--border); border-radius:12px; text-decoration:none; color:var(--text1);">
        <strong>${site.name}</strong><br>
        <span style="font-size:8.5px;color:var(--text3);direction:ltr;">${site.url.substring(0,60)}...</span>
      </a>`;
  });

  resultsDiv.innerHTML = html;
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/* ثبت */
window.loadAdultPage = loadAdultPage;
