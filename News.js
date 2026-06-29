// ============================================================================
// 📰 News.js — F.R.I.D.A.Y News Feed v1.0
// کارت‌های خبری از منابع خارجی (فارسی + انگلیسی) — سبک Links Vault
// deps: esc, haptic, showToast, apiFetch (نیازی به این یکی ندارد) از index.html
// ============================================================================

/* ══════════ CORS PROXY ══════════ */
/* چون مرورگر مستقیم نمی‌تونه RSS بخونه (CORS)، از یه پروکسی رایگان استفاده می‌کنیم */
const NF_PROXY = 'https://api.allorigins.win/raw?url=';

/* ══════════ منابع خبری ══════════ */
/* هرکدوم می‌تونی اضافه/کم کنی. lang برای نمایش جهت متن (rtl/ltr) و بج زبان استفاده می‌شه */
const NF_SOURCES = [
  { id: 'bbcfa',   name: 'BBC فارسی',      lang: 'fa', color: '#bb1919', url: 'https://feeds.bbci.co.uk/persian/rss.xml' },
  { id: 'dwfa',    name: 'DW فارسی',       lang: 'fa', color: '#1a1a4e', url: 'https://rss.dw.com/rdf/rss-per-all' },
  { id: 'eurofa',  name: 'یورونیوز فارسی', lang: 'fa', color: '#003366', url: 'https://parsi.euronews.com/rss' },
  { id: 'bbcen',   name: 'BBC World',      lang: 'en', color: '#bb1919', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'aljaz',   name: 'Al Jazeera',     lang: 'en', color: '#fa9000', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'techcr',  name: 'TechCrunch',     lang: 'en', color: '#0aaf02', url: 'https://techcrunch.com/feed/' },
  { id: 'guardian',name: 'The Guardian',   lang: 'en', color: '#052962', url: 'https://www.theguardian.com/world/rss' },
];

/* ══════════ INJECT CSS ══════════ */
(function NF_injectCSS() {
  if (document.getElementById('nf-style')) return;
  const s = document.createElement('style');
  s.id = 'nf-style';
  s.textContent = `
.nf-toolbar{display:flex;align-items:center;gap:6px;margin-bottom:9px;flex-wrap:wrap;}
.nf-cnt{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);margin-right:auto;white-space:nowrap;}
.nf-refresh{width:30px;height:30px;border-radius:9px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;transition:all .2s;flex-shrink:0;}
.nf-refresh:active{transform:scale(.88) rotate(180deg);}
.nf-refresh.spin{animation:nfSpin .6s linear infinite;}
@keyframes nfSpin{to{transform:rotate(360deg);}}

/* source filter pills */
.nf-src-bar{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;margin-bottom:9px;}
.nf-src-bar::-webkit-scrollbar{display:none;}
.nf-spill{padding:4px 12px;border-radius:18px;background:var(--surface);border:1px solid var(--border);font-size:8px;color:var(--text2);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:4px;}
.nf-spill.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);box-shadow:0 0 10px var(--glow2);}
.nf-spill:active{transform:scale(.93);}
.nf-spill-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

/* lang toggle */
.nf-lang-bar{display:flex;gap:5px;margin-bottom:9px;}
.nf-lpill{flex:1;padding:6px;border-radius:11px;background:var(--surface);border:1px solid var(--border);font-size:9px;color:var(--text2);cursor:pointer;transition:all .2s;text-align:center;font-family:'JetBrains Mono',monospace;}
.nf-lpill.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);}

/* news card — single frame per news, image + meta */
.nf-list{display:flex;flex-direction:column;gap:9px;}
.nf-card{
  display:block;border-radius:16px;overflow:hidden;
  background:var(--card);border:1px solid var(--card-b);
  text-decoration:none;position:relative;
  box-shadow:0 1px 8px rgba(0,0,0,.05);
  transition:transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s,border-color .2s;
}
.nf-card:hover{transform:translateY(-3px);box-shadow:0 14px 32px rgba(0,0,0,.18);border-color:var(--accent);}
.nf-card:active{transform:scale(.98);}
.nf-card-top-bar{height:2.5px;}
.nf-card-img-wrap{width:100%;aspect-ratio:16/9;position:relative;overflow:hidden;background:var(--bg2);}
.nf-card-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .35s;}
.nf-card-img-wrap img.loaded{opacity:1;}
.nf-card-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:30px;opacity:.25;}
.nf-card-src-badge{position:absolute;top:8px;right:8px;font-family:'JetBrains Mono',monospace;font-size:6.5px;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);color:#fff;border:1px solid rgba(255,255,255,.15);}
.nf-card-lang-badge{position:absolute;top:8px;left:8px;font-family:'JetBrains Mono',monospace;font-size:6.5px;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);color:#fbbf24;border:1px solid rgba(255,255,255,.15);}
.nf-card-body{padding:11px 13px 12px;}
.nf-card-title{font-size:11.5px;font-weight:700;color:var(--text1);line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.nf-card-title[dir="ltr"]{font-family:'Vazirmatn',sans-serif;}
.nf-card-desc{font-size:9px;color:var(--text2);line-height:1.7;margin-top:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.nf-card-meta{display:flex;align-items:center;gap:7px;margin-top:8px;}
.nf-card-time{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);}
.nf-card-src-name{font-size:7.5px;color:var(--accent);font-weight:700;margin-right:auto;}

/* loading / empty / error */
.nf-loading{display:flex;flex-direction:column;align-items:center;padding:48px 0;gap:12px;}
.nf-ring{width:26px;height:26px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;}
.nf-loading-txt{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);}
.nf-empty{text-align:center;padding:40px 0;color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:8px;line-height:2.4;}
.nf-err-chip{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text3);background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 11px;margin-bottom:6px;}
.nf-skel{height:170px;border-radius:16px;margin-bottom:9px;}
  `;
  document.head.appendChild(s);
})();

/* ══════════ STATE ══════════ */
let _nfItems    = [];   // همه‌ی خبرهای fetch‌شده (ترکیب همه منابع)
let _nfSrcFil   = 'all';
let _nfLangFil  = 'all'; // all | fa | en
let _nfLoading  = false;

/* ══════════ HELPERS ══════════ */
function _nfEsc(s){ return esc ? esc(s) : String(s||''); }
function _nfDecode(str){
  if(!str) return '';
  const ta=document.createElement('textarea');
  ta.innerHTML=str;
  return ta.value;
}
function _nfStrip(html){
  if(!html) return '';
  const d=document.createElement('div');
  d.innerHTML=html;
  return (d.textContent||d.innerText||'').trim();
}
function _nfFirstImg(html){
  if(!html) return null;
  const m=html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
function _nfTimeAgo(dateStr){
  if(!dateStr) return '—';
  const d=new Date(dateStr);
  if(isNaN(d)) return '—';
  const diffMin=Math.floor((Date.now()-d.getTime())/60000);
  if(diffMin<1) return 'هم‌اکنون';
  if(diffMin<60) return `${diffMin} دقیقه پیش`;
  const diffH=Math.floor(diffMin/60);
  if(diffH<24) return `${diffH} ساعت پیش`;
  const diffD=Math.floor(diffH/24);
  if(diffD<30) return `${diffD} روز پیش`;
  return d.toLocaleDateString('fa-IR',{month:'short',day:'numeric'});
}
function _nfIsPersian(text){
  return /[\u0600-\u06FF]/.test(text||'');
}

/* ══════════ FETCH + PARSE یک منبع ══════════ */
async function _nfFetchSource(src){
  try{
    const res = await fetch(NF_PROXY + encodeURIComponent(src.url), { signal: AbortSignal.timeout(9000) });
    const xmlText = await res.text();
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    /* هم RSS (<item>) و هم Atom (<entry>) رو هندل می‌کنیم */
    const items = [...doc.querySelectorAll('item')];
    const entries = items.length ? items : [...doc.querySelectorAll('entry')];

    return entries.slice(0, 12).map(node => {
      const title = _nfDecode(node.querySelector('title')?.textContent || '');
      let link = node.querySelector('link')?.textContent || node.querySelector('link')?.getAttribute('href') || '';
      const pubDate = node.querySelector('pubDate, published, updated, dc\\:date')?.textContent || '';
      const descRaw = node.querySelector('description, summary, content')?.textContent || '';
      const desc = _nfStrip(_nfDecode(descRaw)).slice(0, 160);

      /* تصویر: media:content, enclosure, یا اولین img توی description */
      let img = node.querySelector('media\\:content, media\\:thumbnail')?.getAttribute('url')
             || node.querySelector('enclosure[type^="image"]')?.getAttribute('url')
             || _nfFirstImg(descRaw);

      return {
        title, link, desc, img,
        date: pubDate,
        srcId: src.id, srcName: src.name, srcColor: src.color, srcLang: src.lang,
        isPersian: _nfIsPersian(title) || src.lang === 'fa',
      };
    }).filter(it => it.title && it.link);
  }catch(e){
    console.warn('NF fetch failed:', src.name, e);
    return [];
  }
}

/* ══════════ LOAD ALL ══════════ */
async function NF_load(force=false){
  const wrap = document.getElementById('newsWrap');
  if (!wrap) return;
  if (_nfLoading) return;
  _nfLoading = true;

  if (!_nfItems.length || force) {
    wrap.innerHTML = `
      <div class="nf-loading">
        <div class="nf-ring"></div>
        <div class="nf-loading-txt">// در حال دریافت اخبار از ${NF_SOURCES.length} منبع...</div>
      </div>`;
  }

  const results = await Promise.allSettled(NF_SOURCES.map(s => _nfFetchSource(s)));
  let all = [];
  let failedCount = 0;
  results.forEach((r,i) => {
    if (r.status === 'fulfilled' && r.value.length) all = all.concat(r.value);
    else failedCount++;
  });

  /* مرتب از جدید به قدیم */
  all.sort((a,b) => new Date(b.date) - new Date(a.date));

  _nfItems = all;
  _nfLoading = false;

  if (failedCount === NF_SOURCES.length) {
    wrap.innerHTML = `<div class="nf-empty"><div style="font-size:30px;margin-bottom:8px;opacity:.3">📡</div>
      // اتصال به منابع خبری ناموفق بود<br>اینترنت یا پروکسی رو بررسی کن
      <div style="margin-top:10px"><button class="nf-refresh" style="margin:0 auto;width:auto;padding:6px 16px" onclick="NF_load(true)">↺ تلاش دوباره</button></div>
    </div>`;
    return;
  }

  NF_render(failedCount);
}

// compat با الگوی پروژه
function loadNews() { NF_load(); }

/* ══════════ RENDER ══════════ */
function NF_render(failedCount=0){
  const wrap = document.getElementById('newsWrap');
  if (!wrap) return;

  /* فیلتر */
  let f = _nfItems;
  if (_nfSrcFil !== 'all') f = f.filter(it => it.srcId === _nfSrcFil);
  if (_nfLangFil !== 'all') f = f.filter(it => it.srcLang === _nfLangFil);

  const srcCounts = {};
  _nfItems.forEach(it => { srcCounts[it.srcId] = (srcCounts[it.srcId]||0)+1; });

  wrap.innerHTML = `
    <div class="nf-toolbar">
      <span class="nf-cnt">${f.length} خبر</span>
      <div class="nf-refresh ${_nfLoading?'spin':''}" onclick="NF_load(true)" title="بروزرسانی">↺</div>
    </div>

    <div class="nf-lang-bar">
      <div class="nf-lpill ${_nfLangFil==='all'?'active':''}" onclick="NF_setLang('all')">🌐 همه زبان‌ها</div>
      <div class="nf-lpill ${_nfLangFil==='fa'?'active':''}"  onclick="NF_setLang('fa')">🇮🇷 فارسی</div>
      <div class="nf-lpill ${_nfLangFil==='en'?'active':''}"  onclick="NF_setLang('en')">🇬🇧 English</div>
    </div>

    <div class="nf-src-bar">
      <div class="nf-spill ${_nfSrcFil==='all'?'active':''}" onclick="NF_setSrc('all')">همه (${_nfItems.length})</div>
      ${NF_SOURCES.map(s => `
        <div class="nf-spill ${_nfSrcFil===s.id?'active':''}" onclick="NF_setSrc('${s.id}')">
          <div class="nf-spill-dot" style="background:${s.color}"></div>
          ${_nfEsc(s.name)} ${srcCounts[s.id]?`(${srcCounts[s.id]})`:''}
        </div>`).join('')}
    </div>

    ${failedCount>0 ? `<div class="nf-err-chip">⚠️ ${failedCount} منبع پاسخ نداد — بقیه نمایش داده می‌شن</div>` : ''}

    <div id="nf-items"></div>
  `;

  const itemsEl = document.getElementById('nf-items');
  if (!f.length) {
    itemsEl.innerHTML = '<div class="nf-empty"><div style="font-size:28px;margin-bottom:8px;opacity:.3">📰</div>// خبری با این فیلتر پیدا نشد</div>';
    return;
  }

  itemsEl.innerHTML = `<div class="nf-list">${f.map((it,i) => {
    const dir = it.isPersian ? 'rtl' : 'ltr';
    const langBadge = it.isPersian ? 'فا' : 'EN';
    return `<a class="nf-card stagger-item" style="animation-delay:${(i*0.04).toFixed(2)}s" href="${it.link}" target="_blank" rel="noopener">
      <div class="nf-card-top-bar" style="background:${it.srcColor}"></div>
      <div class="nf-card-img-wrap" id="nfimg-${i}">
        ${it.img
          ? `<img src="${it.img}" loading="lazy" onload="this.classList.add('loaded')" onerror="this.parentElement.innerHTML='<div class=\\'nf-card-ph\\'>📰</div>'">`
          : `<div class="nf-card-ph">📰</div>`}
        <div class="nf-card-src-badge">${_nfEsc(it.srcName)}</div>
        <div class="nf-card-lang-badge">${langBadge}</div>
      </div>
      <div class="nf-card-body">
        <div class="nf-card-title" dir="${dir}">${_nfEsc(it.title)}</div>
        ${it.desc ? `<div class="nf-card-desc" dir="${dir}">${_nfEsc(it.desc)}${it.desc.length>=160?'…':''}</div>` : ''}
        <div class="nf-card-meta">
          <span class="nf-card-src-name">${_nfEsc(it.srcName)}</span>
          <span class="nf-card-time">⏱ ${_nfTimeAgo(it.date)}</span>
        </div>
      </div>
    </a>`;
  }).join('')}</div>`;
}

/* ══════════ CONTROLS ══════════ */
function NF_setSrc(id)  { _nfSrcFil = id;   try{haptic(6);}catch(e){} NF_render(); }
function NF_setLang(l)  { _nfLangFil = l;   try{haptic(6);}catch(e){} NF_render(); }
