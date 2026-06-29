/* ══════════════════════════════════════════
   TELEGRAM.JS — F.R.I.D.A.Y OS
   کپسول کانال‌های تلگرام
══════════════════════════════════════════ */

const TG_BOT_TOKEN = '8277656739:AAFZmqzMFo2k0mK5aU8jDkGZ8eVAzA0Lh0g'; // ← توکن bot خودت رو اینجا بذار
const TG_CHANNELS = [
  { username: 'MeyarAnalytics', label: 'معیار آنالیتیکس' },
  { username: 'FridayOS',       label: 'Friday OS' },
];

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
      cursor: pointer; transition: transform .2s, box-shadow .2s;
    }
    .tg-capsule::before {
      content: ''; position: absolute; right: 0; top: 0; bottom: 0;
      width: 2.5px;
      background: linear-gradient(to bottom, #2aabee, #1a96d4);
    }
    .tg-capsule:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }
    .tg-capsule:active { transform: scale(.98); }

    /* آواتار */
    .tg-avatar {
      width: 46px; height: 46px; border-radius: 50%;
      flex-shrink: 0; position: relative;
      display: flex; align-items: center; justify-content: center;
    }
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
    .tg-info { flex: 1; min-width: 0; }
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

    /* آمار */
    .tg-stats {
      display: flex; flex-direction: column; align-items: flex-end;
      gap: 3px; flex-shrink: 0;
    }
    .tg-members {
      font-family: 'Space Mono', monospace; font-size: 14px;
      font-weight: 700; color: #2aabee; line-height: 1;
    }
    .tg-members-lbl {
      font-family: 'JetBrains Mono', monospace; font-size: 6px;
      color: var(--text3); letter-spacing: 1px;
    }
    .tg-type-badge {
      font-family: 'JetBrains Mono', monospace; font-size: 6px;
      padding: 2px 7px; border-radius: 5px;
      background: rgba(42,171,238,.1); border: 1px solid rgba(42,171,238,.2);
      color: #2aabee;
    }

    /* loading */
    .tg-loading {
      display: flex; align-items: center; gap: 10px;
      padding: 14px; border-radius: 16px;
      background: var(--card); border: 1px solid var(--card-b);
    }
    .tg-spin {
      width: 14px; height: 14px;
      border: 1.5px solid rgba(42,171,238,.2);
      border-top-color: #2aabee;
      border-radius: 50%; animation: spin .6s linear infinite;
      flex-shrink: 0;
    }
    .tg-spin-txt {
      font-family: 'JetBrains Mono', monospace; font-size: 8px;
      color: var(--text3);
    }

    /* error */
    .tg-err {
      padding: 11px 14px; border-radius: 14px;
      background: rgba(200,60,60,.05); border: 1px solid rgba(200,60,60,.12);
      font-family: 'JetBrains Mono', monospace; font-size: 8px;
      color: var(--text3);
    }
  `;
  document.head.appendChild(s);
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

/* ── RENDER ── */
async function TG_loadCapsules() {
  const wrap = document.getElementById('tgCapsules');
  if (!wrap) return;

  // Loading
  wrap.innerHTML = TG_CHANNELS.map(ch => `
    <div class="tg-loading">
      <div class="tg-spin"></div>
      <div class="tg-spin-txt">// دریافت اطلاعات ${ch.label}...</div>
    </div>`).join('');

  // Fetch all
  const results = await Promise.all(TG_CHANNELS.map(async ch => {
    const [chat, count] = await Promise.all([
      TG_fetchChannel(ch.username),
      TG_fetchMemberCount(ch.username),
    ]);
    let photoUrl = null;
    if (chat?.photo?.big_file_id) {
      photoUrl = await TG_fetchPhoto(chat.photo.big_file_id);
    }
    return { ch, chat, count, photoUrl };
  }));

  if (results.every(r => !r.chat)) {
    wrap.innerHTML = `<div class="tg-err">// خطا در اتصال به تلگرام — توکن یا اینترنت رو بررسی کن</div>`;
    return;
  }

  wrap.innerHTML = results.map(({ ch, chat, count, photoUrl }, i) => {
    if (!chat) {
      return `<div class="tg-err">// ${ch.label} — خطا در دریافت</div>`;
    }

    const title = chat.title || ch.label;
    const username = chat.username || ch.username;
    const desc = chat.description || chat.bio || '';
    const memberCount = count || chat.member_count || null;
    const isChannel = chat.type === 'channel';
    const initials = title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    const avatarHtml = photoUrl
      ? `<img src="${photoUrl}" alt="${title}" loading="lazy">`
      : `<div class="tg-avatar-fb">${initials}</div>`;

    return `
      <div class="tg-capsule stagger-item" style="animation-delay:${i * .08}s">
        <div class="tg-avatar">
          ${avatarHtml}
          <div class="tg-badge">✈️</div>
        </div>
        <div class="tg-info">
          <div class="tg-name">
            ${title}
            <span class="tg-verified">✓</span>
          </div>
          <div class="tg-username">@${username}</div>
          ${desc ? `<div class="tg-desc">${desc}</div>` : ''}
        </div>
        <div class="tg-stats">
          <div class="tg-members">${TG_fmtCount(memberCount)}</div>
          <div class="tg-members-lbl">عضو</div>
          <div class="tg-type-badge">${isChannel ? 'CHANNEL' : 'GROUP'}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── HOME INJECTION ── */
// وقتی صفحه خانه لود شد، بخش تلگرام رو اضافه کن
function TG_injectHomeSection() {
  // بعد از briefingWrap و قبل از pulse feed اضافه می‌کنیم
  const pulseSection = document.querySelector('#page-home .sec');
  if (!pulseSection) { setTimeout(TG_injectHomeSection, 500); return; }

  // اگه قبلاً اضافه شده، رد کن
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

// اجرا بعد از لود شدن app
document.addEventListener('DOMContentLoaded', () => {
  // منتظر میمونیم تا app نمایش داده بشه
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

// همچنین وقتی home لود میشه
const _origLoadHome = window.loadHome;
window.loadHome = async function() {
  if (_origLoadHome) await _origLoadHome();
  setTimeout(TG_injectHomeSection, 400);
};
