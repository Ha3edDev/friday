/* ══════════════════════════════════════════
   TELEGRAM.JS — F.R.I.D.A.Y OS  (v2 — با دکمه آمار کانال)
   کپسول کانال‌های تلگرام + مودال آمار و روند رشد
══════════════════════════════════════════ */

const TG_BOT_TOKEN = '8277656739:AAFZmqzMFo2k0mK5aU8jDkGZ8eVAzA0Lh0g'; // ← توکن bot خودت رو اینجا بذار
const TG_CHANNELS = [
  { username: 'MeyarAnalytics', label: 'معیار آنالیتیکس' },
  { username: 'FridayOS',       label: 'Friday OS' },
];

/* localStorage key برای ذخیره‌ی تاریخچه‌ی عضو هر کانال */
const TG_HISTORY_KEY = 'fri_tg_history_v1';

/* ── CSS ── */
(function injectTgStyle() {
  const s = document.createElement('style');
  s.textContent = `
    /* ── بخش تلگرام در خانه ── */
    .tg-section { margin-bottom: 4px; }

    .tg-capsules { display: flex; flex-direction: column; gap: 7px; margin-bottom: 4px; }

    .tg-capsule {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 14px; border-radius: 16px;
      background: var(--card); border: 1px solid var(--card-b);
      box-shadow: 0 1px 8px rgba(0,0,0,.05);
      position: relative; overflow: hidden;
      transition: transform .2s, box-shadow .2s;
    }
    .tg-capsule::before {
      content: ''; position: absolute; right: 0; top: 0; bottom: 0;
      width: 2.5px;
      background: linear-gradient(to bottom, #2aabee, #1a96d4);
    }
    .tg-capsule:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }

    /* آواتار — حالا لینک مستقیم به کانال */
    .tg-avatar-link { flex-shrink: 0; text-decoration: none; cursor: pointer; }
    .tg-avatar {
      width: 46px; height: 46px; border-radius: 50%;
      flex-shrink: 0; position: relative;
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s;
    }
    .tg-avatar-link:active .tg-avatar { transform: scale(.9); }
    .tg-avatar img {
      width: 46px; height: 46px; border-radius: 50%;
      object-fit: cover; border: 1.5px solid rgba(42,171,238,.3);
      display: block;
    }
    .tg-avatar-fb {
      width: 46px; height: 46px; border-radius: 50%;
      background: linear-gradient(135deg, #2aabee, #1a72b0);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 900; color: #fff;
      border: 1.5px solid rgba(42,171,238,.4);
      font-family: 'Space Mono', monospace;
    }
    .tg-badge {
      position: absolute; bottom: -2px; right: -2px;
      width: 16px; height: 16px; border-radius: 50%;
      background: #2aabee; border: 2px solid var(--bg0);
      display: flex; align-items: center; justify-content: center;
      font-size: 7px;
    }

    /* اطلاعات */
    .tg-info { flex: 1; min-width: 0; cursor: pointer; }
    .tg-name {
      font-size: 11px; font-weight: 700; color: var(--text1);
      display: flex; align-items: center; gap: 5px; margin-bottom: 2px;
    }
    .tg-verified {
      width: 13px; height: 13px; border-radius: 50%;
      background: #2aabee; color: #fff;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 7px; flex-shrink: 0;
    }
    .tg-username {
      font-family: 'JetBrains Mono', monospace; font-size: 7px;
      color: #2aabee; margin-bottom: 4px;
    }
    .tg-desc {
      font-size: 8.5px; color: var(--text2); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* آمار سمت راست + دکمه آمار کانال */
    .tg-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
    .tg-members { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; color: #2aabee; line-height: 1; }
    .tg-members-lbl { font-family: 'JetBrains Mono', monospace; font-size: 6px; color: var(--text3); letter-spacing: 1px; }
    .tg-type-badge { font-family: 'JetBrains Mono', monospace; font-size: 6px; padding: 2px 7px; border-radius: 5px; background: rgba(42,171,238,.1); border: 1px solid rgba(42,171,238,.2); color: #2aabee; }
    .tg-growth { font-family: 'JetBrains Mono', monospace; font-size: 6.5px; margin-top: 1px; }
    .tg-growth.up   { color: #2a9060; }
    .tg-growth.down { color: #c04040; }
    .tg-growth.flat { color: var(--text3); }

    .tg-stats-btn {
      flex-shrink: 0; width: 30px; height: 30px; border-radius: 10px;
      background: rgba(42,171,238,.08); border: 1px solid rgba(42,171,238,.22);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 13px; transition: all .2s; color: #2aabee;
    }
    .tg-stats-btn:hover { background: rgba(42,171,238,.18); transform: translateY(-1px); }
    .tg-stats-btn:active { transform: scale(.88); }

    /* loading */
    .tg-loading { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 16px; background: var(--card); border: 1px solid var(--card-b); }
    .tg-spin { width: 14px; height: 14px; border: 1.5px solid rgba(42,171,238,.2); border-top-color: #2aabee; border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
    .tg-spin-txt { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text3); }

    /* error */
    .tg-err { padding: 11px 14px; border-radius: 14px; background: rgba(200,60,60,.05); border: 1px solid rgba(200,60,60,.12); font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text3); }

    /* ══ مودال آمار کانال ══ */
    .tg-modal-bg {
      position: fixed; inset: 0; z-index: 550; background: rgba(0,0,0,.7);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      display: flex; align-items: flex-end; opacity: 0; pointer-events: none;
      transition: opacity .22s;
    }
    .tg-modal-bg.open { opacity: 1; pointer-events: all; }
    .tg-sheet {
      width: 100%; background: var(--glass); border: 1px solid var(--glass-b);
      border-radius: 22px 22px 0 0; padding: 0 0 env(safe-area-inset-bottom,24px);
      max-height: 88vh; overflow-y: auto;
      transform: translateY(100%); transition: transform .34s cubic-bezier(.34,1.56,.64,1);
    }
    .tg-sheet::-webkit-scrollbar { display: none; }
    .tg-modal-bg.open .tg-sheet { transform: translateY(0); }
    .tg-sheet-handle { width: 30px; height: 3px; background: var(--border2); border-radius: 2px; margin: 12px auto 0; }

    .tg-sheet-head { display: flex; align-items: center; gap: 12px; padding: 16px 16px 0; }
    .tg-sheet-close {
      width: 28px; height: 28px; border-radius: 50%; background: var(--surface2);
      border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text2); font-size: 12px; flex-shrink: 0; margin-right: auto;
      transition: all .2s;
    }
    .tg-sheet-close:hover { transform: rotate(90deg); }

    .tg-sheet-body { padding: 14px 16px 20px; }

    .tg-stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; margin-bottom: 14px; }
    .tg-stat-card { border-radius: 13px; padding: 11px 8px; background: var(--bg2); border: 1px solid var(--border); text-align: center; }
    .tg-stat-card-lbl { font-family: 'JetBrains Mono', monospace; font-size: 6px; color: var(--text3); letter-spacing: 1.5px; margin-bottom: 4px; }
    .tg-stat-card-val { font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; color: #2aabee; line-height: 1; }

    .tg-sparkline-wrap { background: var(--bg2); border: 1px solid var(--border); border-radius: 14px; padding: 12px; margin-bottom: 14px; }
    .tg-sparkline-lbl { font-family: 'JetBrains Mono', monospace; font-size: 6.5px; color: var(--text3); letter-spacing: 2px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    .tg-sparkline-svg { width: 100%; display: block; overflow: visible; }
    .tg-no-history { text-align: center; padding: 16px 0; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text3); line-height: 1.8; }

    .tg-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--border); }
    .tg-detail-row:last-child { border-bottom: none; }
    .tg-detail-lbl { font-family: 'JetBrains Mono', monospace; font-size: 7.5px; color: var(--text3); letter-spacing: 1px; }
    .tg-detail-val { font-size: 10px; color: var(--text1); font-weight: 600; direction: ltr; }

    .tg-join-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-top: 14px; padding: 13px; border-radius: 14px;
      background: linear-gradient(135deg, #2aabee, #1a96d4); color: #fff;
      font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: 1.5px;
      text-decoration: none; transition: all .2s; box-shadow: 0 4px 20px rgba(42,171,238,.3);
    }
    .tg-join-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(42,171,238,.4); }
    .tg-join-btn:active { transform: scale(.97); }
  `;
  document.head.appendChild(s);
})();

/* ── مودال یکبار به body اضافه می‌شه ── */
(function TG_injectModal() {
  if (document.getElementById('tgModal')) return;
  const d = document.createElement('div');
  d.className = 'tg-modal-bg';
  d.id = 'tgModal';
  d.onclick = e => { if (e.target === d) TG_closeStatsModal(); };
  d.innerHTML = `<div class="tg-sheet" id="tgSheet"></div>`;
  document.body.appendChild(d);
})();

/* ── FETCH ── */
async function TG_fetchChannel(username) {
  const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/getChat?chat_id=@${username}`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const d = await r.json();
    if (!d.ok) throw new Error(d.description || 'API error');
    return d.result;
  } catch (e) {
    console.warn('TG fetch error:', username, e);
    return null;
  }
}

async function TG_fetchMemberCount(username) {
  const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/getChatMemberCount?chat_id=@${username}`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const d = await r.json();
    return d.ok ? d.result : null;
  } catch (e) {
    return null;
  }
}

async function TG_fetchPhoto(fileId) {
  if (!fileId) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile?file_id=${fileId}`, { signal: AbortSignal.timeout(5000) });
    const d = await r.json();
    if (!d.ok || !d.result.file_path) return null;
    return `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${d.result.file_path}`;
  } catch (e) {
    return null;
  }
}

function TG_fmtCount(n) {
  if (!n) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

/* ══════════ تاریخچه‌ی عضو (برای نمودار رشد) ══════════ */
function TG_loadHistory() {
  try { return JSON.parse(localStorage.getItem(TG_HISTORY_KEY) || '{}'); }
  catch (e) { return {}; }
}
function TG_saveHistory(h) {
  try { localStorage.setItem(TG_HISTORY_KEY, JSON.stringify(h)); } catch (e) {}
}
/* هر بار که داده‌ی تازه میاد، یه snapshot ثبت می‌کنیم (حداکثر یکبار در روز برای هر کانال) */
function TG_recordSnapshot(username, count) {
  if (!count) return;
  const hist = TG_loadHistory();
  if (!hist[username]) hist[username] = [];
  const today = new Date().toISOString().slice(0, 10);
  const last = hist[username][hist[username].length - 1];
  if (last && last.date === today) {
    last.count = count; // آپدیت همون روز
  } else {
    hist[username].push({ date: today, count });
  }
  // نگه‌داشتن حداکثر ۹۰ روز
  if (hist[username].length > 90) hist[username] = hist[username].slice(-90);
  TG_saveHistory(hist);
}
function TG_getHistory(username) {
  const hist = TG_loadHistory();
  return hist[username] || [];
}

/* ══════════ RENDER کپسول‌های خانه ══════════ */
let _tgData = []; // کش آخرین نتایج fetch برای استفاده در مودال

async function TG_loadCapsules() {
  const wrap = document.getElementById('tgCapsules');
  if (!wrap) return;

  wrap.innerHTML = TG_CHANNELS.map(ch => `
    <div class="tg-loading">
      <div class="tg-spin"></div>
      <div class="tg-spin-txt">// دریافت اطلاعات ${esc(ch.label)}...</div>
    </div>`).join('');

  const results = await Promise.all(TG_CHANNELS.map(async ch => {
    const [chat, count] = await Promise.all([
      TG_fetchChannel(ch.username),
      TG_fetchMemberCount(ch.username),
    ]);
    let photoUrl = null;
    if (chat?.photo?.big_file_id) {
      photoUrl = await TG_fetchPhoto(chat.photo.big_file_id);
    }
    const memberCount = count || chat?.member_count || null;
    if (memberCount) TG_recordSnapshot(ch.username, memberCount);
    return { ch, chat, count: memberCount, photoUrl };
  }));

  _tgData = results;

  if (results.every(r => !r.chat)) {
    wrap.innerHTML = `<div class="tg-err">// خطا در اتصال به تلگرام — توکن یا اینترنت رو بررسی کن</div>`;
    return;
  }

  wrap.innerHTML = results.map(({ ch, chat, count, photoUrl }, i) => {
    if (!chat) {
      return `<div class="tg-err">// ${esc(ch.label)} — خطا در دریافت</div>`;
    }

    const title = chat.title || ch.label;
    const username = chat.username || ch.username;
    const desc = chat.description || chat.bio || '';
    const isChannel = chat.type === 'channel';
    const initials = title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    const avatarHtml = photoUrl
      ? `<img src="${photoUrl}" alt="${esc(title)}" loading="lazy">`
      : `<div class="tg-avatar-fb">${esc(initials)}</div>`;

    /* محاسبه روند رشد نسبت به اولین snapshot موجود */
    const hist = TG_getHistory(username);
    let growthHtml = '';
    if (hist.length > 1) {
      const diff = hist[hist.length - 1].count - hist[0].count;
      if (diff > 0) growthHtml = `<div class="tg-growth up">▲ +${TG_fmtCount(diff)}</div>`;
      else if (diff < 0) growthHtml = `<div class="tg-growth down">▼ ${TG_fmtCount(diff)}</div>`;
      else growthHtml = `<div class="tg-growth flat">— ثابت</div>`;
    }

    return `
      <div class="tg-capsule stagger-item" style="animation-delay:${i * .08}s">
        <a class="tg-avatar-link" href="https://t.me/${esc(username)}" target="_blank" rel="noopener">
          <div class="tg-avatar">
            ${avatarHtml}
            <div class="tg-badge">✈️</div>
          </div>
        </a>
        <div class="tg-info" onclick="TG_openStatsModal('${esc(username)}')">
          <div class="tg-name">
            ${esc(title)}
            <span class="tg-verified">✓</span>
          </div>
          <div class="tg-username">@${esc(username)}</div>
          ${desc ? `<div class="tg-desc">${esc(desc)}</div>` : ''}
        </div>
        <div class="tg-stats">
          <div class="tg-members">${TG_fmtCount(count)}</div>
          <div class="tg-members-lbl">عضو</div>
          <div class="tg-type-badge">${isChannel ? 'CHANNEL' : 'GROUP'}</div>
          ${growthHtml}
        </div>
        <div class="tg-stats-btn" onclick="TG_openStatsModal('${esc(username)}')" title="آمار کانال">📊</div>
      </div>`;
  }).join('');
}

/* ══════════ مودال آمار کانال ══════════ */
function TG_openStatsModal(username) {
  try { haptic(10); } catch (e) {}
  const entry = _tgData.find(r => (r.chat?.username || r.ch.username) === username);
  if (!entry || !entry.chat) { try { showToast('// اطلاعات کانال موجود نیست'); } catch (e) {} return; }

  const { chat, count, ch } = entry;
  const title = chat.title || ch.label;
  const hist = TG_getHistory(username);

  /* آمار کارت‌های بالا */
  const firstCount = hist.length ? hist[0].count : count;
  const diff = count - firstCount;
  const diffPct = firstCount ? ((diff / firstCount) * 100).toFixed(1) : '0';

  const statGrid = `
    <div class="tg-stat-grid">
      <div class="tg-stat-card">
        <div class="tg-stat-card-lbl">اعضا</div>
        <div class="tg-stat-card-val">${TG_fmtCount(count)}</div>
      </div>
      <div class="tg-stat-card">
        <div class="tg-stat-card-lbl">رشد کل</div>
        <div class="tg-stat-card-val" style="color:${diff>=0?'#2a9060':'#c04040'}">${diff>=0?'+':''}${TG_fmtCount(diff)}</div>
      </div>
      <div class="tg-stat-card">
        <div class="tg-stat-card-lbl">درصد رشد</div>
        <div class="tg-stat-card-val" style="color:${diff>=0?'#2a9060':'#c04040'}">${diff>=0?'+':''}${diffPct}%</div>
      </div>
    </div>`;

  /* sparkline یا پیام نبود تاریخچه */
  let sparkHtml = '';
  if (hist.length > 1) {
    sparkHtml = `<div class="tg-sparkline-wrap">
      <div class="tg-sparkline-lbl"><span>// روند رشد اعضا</span><span>${hist.length} نقطه‌ی ثبت‌شده</span></div>
      <svg class="tg-sparkline-svg" viewBox="0 0 300 70" id="tgSpark-${username}"></svg>
    </div>`;
  } else {
    sparkHtml = `<div class="tg-sparkline-wrap">
      <div class="tg-sparkline-lbl">// روند رشد اعضا</div>
      <div class="tg-no-history">📈 هنوز داده‌ی کافی برای نمودار نیست<br>هر بار که اپ رو باز کنی، یه نقطه‌ی جدید ثبت می‌شه</div>
    </div>`;
  }

  const detailRows = `
    <div class="tg-detail-row"><span class="tg-detail-lbl">// نوع</span><span class="tg-detail-val">${chat.type==='channel'?'کانال':'گروه'}</span></div>
    <div class="tg-detail-row"><span class="tg-detail-lbl">// یوزرنیم</span><span class="tg-detail-val">@${esc(chat.username||ch.username)}</span></div>
    <div class="tg-detail-row"><span class="tg-detail-lbl">// شناسه</span><span class="tg-detail-val">${chat.id||'—'}</span></div>
    ${chat.invite_link?`<div class="tg-detail-row"><span class="tg-detail-lbl">// لینک دعوت</span><span class="tg-detail-val" style="font-size:8px">${esc(chat.invite_link)}</span></div>`:''}
  `;

  const sheet = document.getElementById('tgSheet');
  sheet.innerHTML = `
    <div class="tg-sheet-handle"></div>
    <div class="tg-sheet-head">
      <div class="tg-avatar" style="width:40px;height:40px">
        <div class="tg-avatar-fb" style="width:40px;height:40px;font-size:15px">${esc(title.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase())}</div>
      </div>
      <div>
        <div style="font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:var(--text1)">${esc(title)}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:#2aabee">@${esc(chat.username||ch.username)}</div>
      </div>
      <div class="tg-sheet-close" onclick="TG_closeStatsModal()">✕</div>
    </div>
    <div class="tg-sheet-body">
      ${statGrid}
      ${sparkHtml}
      ${detailRows}
      <a class="tg-join-btn" href="https://t.me/${esc(chat.username||ch.username)}" target="_blank" rel="noopener">
        ✈️ مشاهده در تلگرام
      </a>
    </div>
  `;

  document.getElementById('tgModal').classList.add('open');
  sheet.scrollTop = 0;

  if (hist.length > 1) requestAnimationFrame(() => TG_drawSparkline(username, hist));
}

function TG_closeStatsModal() {
  try { haptic(6); } catch (e) {}
  document.getElementById('tgModal')?.classList.remove('open');
}

/* ══════════ رسم نمودار خطی ساده (بدون نیاز به d3) ══════════ */
function TG_drawSparkline(username, hist) {
  const svg = document.getElementById('tgSpark-' + username);
  if (!svg) return;

  const W = 300, H = 70, PAD = { t: 6, r: 6, b: 16, l: 30 };
  const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b;

  const counts = hist.map(h => h.count);
  const minY = Math.min(...counts), maxY = Math.max(...counts);
  const rangeY = (maxY - minY) || 1;

  const toX = i => PAD.l + (i / (hist.length - 1)) * cW;
  const toY = v => PAD.t + cH - ((v - minY) / rangeY) * cH;

  let d = '';
  hist.forEach((h, i) => {
    const x = toX(i), y = toY(h.count);
    d += (i === 0 ? `M ${x.toFixed(1)},${y.toFixed(1)}` : ` L ${x.toFixed(1)},${y.toFixed(1)}`);
  });

  const areaD = `${d} L ${toX(hist.length-1).toFixed(1)},${(PAD.t+cH).toFixed(1)} L ${toX(0).toFixed(1)},${(PAD.t+cH).toFixed(1)} Z`;

  const dots = hist.map((h, i) => {
    const x = toX(i).toFixed(1), y = toY(h.count).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="#2aabee" stroke="var(--bg0)" stroke-width="1"/>`;
  }).join('');

  /* لیبل تاریخ اول و آخر */
  const firstLbl = hist[0].date.slice(5).replace('-', '/');
  const lastLbl  = hist[hist.length-1].date.slice(5).replace('-', '/');

  svg.innerHTML = `
    <defs>
      <linearGradient id="tgGrad-${username}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2aabee" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#2aabee" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <path d="${areaD}" fill="url(#tgGrad-${username})"/>
    <path d="${d}" fill="none" stroke="#2aabee" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
    <text x="${PAD.l}" y="${H-3}" fill="var(--text3)" font-family="JetBrains Mono,monospace" font-size="6">${firstLbl}</text>
    <text x="${W-PAD.r}" y="${H-3}" fill="var(--text3)" font-family="JetBrains Mono,monospace" font-size="6" text-anchor="end">${lastLbl}</text>
  `;
}

/* ── HOME INJECTION ── */
function TG_injectHomeSection() {
  const pulseSection = document.querySelector('#page-home .sec');
  if (!pulseSection) { setTimeout(TG_injectHomeSection, 500); return; }
  if (document.getElementById('tgSection')) return;

  const section = document.createElement('div');
  section.innerHTML = `
    <div class="sec" id="tgSection">کانال‌های تلگرام</div>
    <div class="tg-capsules" id="tgCapsules">
      <div class="tg-loading">
        <div class="tg-spin"></div>
        <div class="tg-spin-txt">// در حال اتصال...</div>
      </div>
    </div>
  `;
  pulseSection.parentNode.insertBefore(section, pulseSection);
  TG_loadCapsules();
}

document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const app = document.getElementById('app');
    if (app && app.style.display !== 'none') {
      observer.disconnect();
      setTimeout(TG_injectHomeSection, 800);
    }
  });
  observer.observe(document.getElementById('app') || document.body, {
    attributes: true, attributeFilter: ['style']
  });
});

const _origLoadHome = window.loadHome;
window.loadHome = async function() {
  if (_origLoadHome) await _origLoadHome();
  setTimeout(TG_injectHomeSection, 400);
};
