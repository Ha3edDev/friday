/* ═══════════════════════════════════════════════════════════════
   LINKS — vault page
   depends on: apiFetch, esc, catKey, getDomain, CAT_MAP,
               getYtThumb (from index.html)
═══════════════════════════════════════════════════════════════ */

let allLinks = [], linkCat = 'all', linkQ = '';

function linkThumbMini(l) {
  const ck = catKey(l.category);
  if (ck === 'yt') {
    const s = getYtThumb(l.url);
    if (s) return `<img class="link-mini-thumb" src="${s}" loading="lazy">`;
  }
  if (l.thumbnail) return `<img class="link-mini-thumb" src="${l.thumbnail}" loading="lazy">`;
  const cm = CAT_MAP[ck] || CAT_MAP.other;
  return `<div class="link-mini-fb" style="background:${cm.color}22">
    <div style="font-size:18px">${cm.icon}</div>
    <div style="font-size:6px;font-family:'JetBrains Mono',monospace;color:${cm.color}">${getDomain(l.url)}</div>
  </div>`;
}

function linkThumbCard(l) {
  const ck = catKey(l.category);
  if (ck === 'yt') {
    const s = getYtThumb(l.url);
    if (s) return `<img class="lk-thumb" src="${s}" loading="lazy">`;
  }
  if (l.thumbnail) return `<img class="lk-thumb" src="${l.thumbnail}" loading="lazy">`;
  const cm = CAT_MAP[ck] || CAT_MAP.other;
  return `<div class="lk-fb" style="background:${cm.color}22">
    <div style="font-size:13px">${cm.icon}</div>
    <div style="font-size:6px;font-family:'JetBrains Mono',monospace;color:${cm.color}">${getDomain(l.url)}</div>
  </div>`;
}

async function loadLinks() {
  const data = await apiFetch('vault_data');
  if (!data) {
    document.getElementById('linkList').innerHTML = '<div class="empty">// خطا</div>';
    return;
  }
  allLinks = data;
  renderLinks();

  document.getElementById('linkSearch').oninput = e => {
    linkQ = e.target.value.trim();
    renderLinks();
  };
}

function renderLinks() {
  // build category counts
  const cats = { all: allLinks.length };
  allLinks.forEach(l => {
    const k = catKey(l.category);
    cats[k] = (cats[k] || 0) + 1;
  });

  document.getElementById('linkCats').innerHTML = Object.entries(cats).map(([k, v]) =>
    `<div class="cat-pill ${k === linkCat ? 'active' : ''}" onclick="setLinkCat('${k}')">
      ${CAT_MAP[k] ? CAT_MAP[k].label : k} (${v})
    </div>`
  ).join('');

  // filter
  let f = allLinks;
  if (linkCat !== 'all') f = f.filter(l => catKey(l.category) === linkCat);
  if (linkQ) {
    const q = linkQ.toLowerCase();
    f = f.filter(l => l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
  }

  if (!f.length) {
    document.getElementById('linkList').innerHTML = '<div class="empty">// یافت نشد</div>';
    return;
  }

  document.getElementById('linkList').innerHTML = f.map(l =>
    `<a class="lk-card cat-${catKey(l.category)}" href="${l.url}" target="_blank" rel="noopener">
      <div class="lk-bar"></div>
      ${linkThumbCard(l)}
      <div class="lk-info">
        <div class="lk-name">${esc(l.name)}</div>
        <div class="lk-domain">${getDomain(l.url)}</div>
      </div>
    </a>`
  ).join('');
}

function setLinkCat(c) {
  linkCat = c;
  renderLinks();
}
