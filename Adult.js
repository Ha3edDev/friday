/* Adult.js - نسخه نهایی حرفه‌ای */

function loadAdultPage() {
  const container = document.getElementById('adultResults');
  if (!container) return;

  container.innerHTML = `
    <div style="padding:14px 12px;">
      <!-- جستجو -->
      <div style="position:relative; margin-bottom:14px;">
        <input id="adultInput" type="text" placeholder="جستجو کن (milf, ایرانی, pov...)" 
          style="width:100%; padding:14px 48px 14px 16px; border-radius:16px; border:1px solid var(--border); background:var(--card); color:var(--text1); font-size:13.5px; outline:none;">
        <span onclick="clearAdultInput()" id="adultClear" 
          style="position:absolute; right:16px; top:13px; font-size:18px; color:var(--text3); cursor:pointer; display:none;">✕</span>
      </div>

      <!-- تگ‌های سریع -->
      <div style="margin-bottom:18px;">
        <div style="font-size:9px; color:var(--text3); margin-bottom:8px;">دسته‌بندی‌های داغ</div>
        <div id="adultTags" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
      </div>

      <!-- نتایج -->
      <div id="adultResultsList"></div>
    </div>
  `;

  loadAdultTags();
  setupAdultSearch();
}

function setupAdultSearch() {
  const input = document.getElementById('adultInput');
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') triggerAdultSearch();
  });
  input.addEventListener('input', toggleClearBtn);
}

function toggleClearBtn() {
  const clearBtn = document.getElementById('adultClear');
  const input = document.getElementById('adultInput');
  clearBtn.style.display = input.value.trim() ? 'block' : 'none';
}

function clearAdultInput() {
  document.getElementById('adultInput').value = '';
  toggleClearBtn();
  document.getElementById('adultInput').focus();
}

function loadAdultTags() {
  const tags = ["Milf", "ایرانی", "Lesbian", "POV", "Amateur", "Hentai", "Teen", "Japanese"];
  const container = document.getElementById('adultTags');
  container.innerHTML = tags.map(tag => `
    <span onclick="quickAdultSearch('${tag}')" 
      style="padding:7px 14px; background:var(--card); border:1px solid var(--border); border-radius:999px; font-size:9.5px; cursor:pointer; transition:all .2s;">
      #${tag}
    </span>
  `).join('');
}

function quickAdultSearch(tag) {
  document.getElementById('adultInput').value = tag;
  triggerAdultSearch();
}

function triggerAdultSearch() {
  const query = document.getElementById('adultInput').value.trim();
  if (!query) return;

  const list = document.getElementById('adultResultsList');
  list.innerHTML = `<div style="padding:30px; text-align:center; color:var(--text3);">در حال جستجو...</div>`;

  setTimeout(() => {
    const sites = [
      {name:"Pornhub", url:`https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`},
      {name:"XVideos", url:`https://www.xvideos.com/?k=${encodeURIComponent(query)}`},
      {name:"XNXX", url:`https://www.xnxx.com/search/${encodeURIComponent(query)}`},
      {name:"SpankBang", url:`https://spankbang.com/s/${encodeURIComponent(query)}`},
    ];

    let html = `<div style="font-size:9px; color:var(--text3); margin-bottom:10px;">نتایج برای: <b>${esc(query)}</b></div>`;

    sites.forEach(site => {
      html += `
        <a href="${site.url}" target="_blank" style="display:block; padding:14px; margin-bottom:8px; background:var(--card); border:1px solid var(--border); border-radius:14px; text-decoration:none; color:var(--text1);">
          <strong>${site.name}</strong> <span style="float:right; font-size:11px; color:var(--accent);">باز کردن ↗</span>
        </a>`;
    });

    list.innerHTML = html;
  }, 400);
}

function esc(s) {
  return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
