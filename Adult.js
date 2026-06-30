// --- Advanced Adult Search Engine Engine ---

function loadAdult() {
  const container = document.getElementById('adultContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="padding:16px 12px; max-width:600px; margin:0 auto; direction:rtl;">
      
      <!-- هدر و تایتل بخش -->
      <div style="display:flex; justify-content:between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:16px; color:var(--text1); font-weight:900; letter-spacing:-0.5px;">
          🔞 موتور جستجوی بزرگسالان <span style="font-size:10px; color:var(--accent); font-weight:normal; vertical-align:middle;">v2.5</span>
        </h3>
      </div>

      <!-- باکس جستجوی هوشمند و پیشرفته -->
      <div style="position:relative; margin-bottom:16px;">
        <input type="text" id="adultInput" placeholder="نام بازیگر، ژانر یا عبارت مورد نظر..." 
          style="width:100%; padding:14px 42px 14px 14px; background:var(--card); border:1px solid var(--card-b); border-radius:16px; color:var(--text1); font-size:13px; outline:none; box-sizing:border-box; transition:all 0.2s;"
          onkeyup="if(event.key==='Enter') triggerAdultSearch(); else toggleAdultClearBtn();">
        
        <!-- آیکون ذره‌بین (سمت راست) -->
        <span style="position:absolute; right:14px; top:14px; color:var(--text3); font-size:14px; pointer-events:none;">🔍</span>
        
        <!-- دکمه پاکسازی سریع (سمت چپ) -->
        <span id="adultClearBtn" onclick="clearAdultSearch()" 
          style="position:absolute; left:14px; top:13px; color:var(--text3); font-size:16px; cursor:pointer; display:none; user-select:none;">✕</span>
      </div>

      <!-- دکمه اکشن اصلی -->
      <button onclick="triggerAdultSearch()" 
        style="width:100%; padding:14px; background:var(--accent); color:#fff; border:none; border-radius:16px; font-size:13px; font-weight:bold; cursor:pointer; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1); transition:opacity 0.2s;"
        onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
        جستجوی حتمی در دیتابیس جهانی
      </button>

      <!-- دسته‌بندی‌های سریع و داغ (پیل‌ها) -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px; color:var(--text3); margin-bottom:10px; font-weight:bold;">دسته‌بندی‌های پیشنهادی (بدون نیاز به تایپ):</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;" id="adultTags">
          <!-- تگ‌ها به صورت خودکار لود می‌شوند -->
        </div>
      </div>

      <!-- لیست نتایج نهایی -->
      <div id="adultResultsList" style="min-height:100px;"></div>
    </div>
  `;

  // بارگذاری تگ‌های داغ
  loadAdultTrends();
  
  // بررسی اگر از قبل کوئری وجود داشته لود شود
  const savedQuery = document.getElementById('adultInput')?.value;
  if(!savedQuery) {
     document.getElementById('adultResultsList').innerHTML = `
       <div class="stagger-item" style="text-align:center; padding:30px 10px; color:var(--text3); font-size:11px; border:1px dashed var(--card-b); border-radius:14px; background:rgba(0,0,0,0.02);">
         عبارت خود را وارد کنید یا یکی از تگ‌های پیشنهادی بالا را انتخاب کنید.
       </div>`;
  }
}

// لیست تگ‌های داغ و هوشمند
function loadAdultTrends() {
  const trends = ["Milf", "Amateur", "POV", "Teen", "Japanese", "Anal", "Latina", "Cosplay"];
  const tagsContainer = document.getElementById('adultTags');
  if (!tagsContainer) return;

  tagsContainer.innerHTML = trends.map(tag => `
    <span class="cat-pill" onclick="quickAdultSearch('${tag}')" 
      style="padding:6px 12px; background:var(--card); border:1px solid var(--card-b); border-radius:20px; font-size:11px; color:var(--text2); cursor:pointer; transition:all 0.15s; user-select:none;">
      #${tag}
    </span>
  `).join('');
}

// کنترل نمایش دکمه حذف متن
function toggleAdultClearBtn() {
  const input = document.getElementById('adultInput');
  const clearBtn = document.getElementById('adultClearBtn');
  if(input && clearBtn) {
    clearBtn.style.display = input.value.trim().length > 0 ? 'block' : 'none';
  }
}

// پاکسازی اینپوت
function clearAdultSearch() {
  const input = document.getElementById('adultInput');
  if(input) {
    input.value = '';
    toggleAdultClearBtn();
    input.focus();
  }
}

// جستجوی سریع با کلیک روی تگ‌ها
function quickAdultSearch(tag) {
  const input = document.getElementById('adultInput');
  if(input) {
    input.value = tag;
    toggleAdultClearBtn();
    generateAdultResults(tag);
  }
}

// تریگر کردن جستجوی اصلی
function triggerAdultSearch() {
  const input = document.getElementById('adultInput');
  if (input && input.value.trim() !== '') {
    generateAdultResults(input.value.trim());
  }
}

// پردازش و تولید قطعی نتایج سایبرپانکی
function generateAdultResults(query) {
  const resultsDiv = document.getElementById('adultResultsList');
  if (!resultsDiv) return;

  // افکت لودینگ موقت برای حس زنده بودن سیستم عامل
  resultsDiv.innerHTML = `<div style="text-align:center; padding:20px; color:var(--accent); font-size:12px;">در حال پردازش پایگاه داده...</div>`;

  // فرمت‌سازی عبارت برای موتورها (جایگزینی فضا با پلاس برای دقت ۱۰۰٪)
  const cleanQuery = encodeURIComponent(query);

  // دیتابیس منابع اصلی همراه با آیکون و بهینه‌سازی موتور جستجوی اختصاصی هر سایت
  const networks = [
    { name: "Pornhub", icon: "🟧", url: `https://www.pornhub.com/video/search?search=${cleanQuery}`, desc: "بزرگترین آرشیو ویدیوهای بزرگسالان جهان" },
    { name: "XVideos", icon: "🟥", url: `https://www.xvideos.com/?k=${cleanQuery}`, desc: "بالاترین سرعت لود و دسترسی مستقیم" },
    { name: "XNXX", icon: "🟦", url: `https://www.xnxx.com/search/${cleanQuery}`, desc: "موتور جستجوی فرعی با سرورهای پرسرعت" },
    { name: "SpankBang", icon: "🟪", url: `https://spankbang.com/s/${cleanQuery}/`, desc: "کیفیت‌های بالا (Ultra HD / 4K)" },
    { name: "Chaturbate", icon: "🟩", url: `https://chaturbate.com/in/?tour=Nj66&p=4&b=1&c=${cleanQuery}`, desc: "بخش کمدی و لایو استریم‌های زنده جهانی" }
  ];

  setTimeout(() => {
    let html = `
      <div style="font-size:10px; color:var(--text3); margin: 12px 0 8px; padding-right:4px;">
        نتایج رمزگذاری شده برای: <b style="color:var(--accent); font-weight:bold;">${esc(query)}</b>
      </div>
    `;

    networks.forEach(net => {
      html += `
        <a href="${net.url}" target="_blank" rel="noopener noreferrer" class="stagger-item" 
          style="display:flex; align-items:center; gap:12px; padding:14px; margin-bottom:10px; background:var(--card); border:1px solid var(--card-b); border-radius:16px; text-decoration:none; color:var(--text1); box-shadow:0 2px 8px rgba(0,0,0,0.02); transition:all 0.2s;"
          onmouseover="this.style.borderColor='var(--accent)'; this.style.transform='translateY(-2px)';" 
          onmouseout="this.style.borderColor='var(--card-b)'; this.style.transform='translateY(0)';">
          
          <!-- بخش آیکون دیسک/سایت -->
          <div style="font-size:22px; width:40px; height:40px; background:rgba(0,0,0,0.04); border-radius:12px; display:flex; align-items:center; justify-content:center;">
            ${net.icon}
          </div>
          
          <!-- بخش متون -->
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:14px; font-weight:700; color:var(--text1);">${net.name}</strong>
              <span style="font-size:10px; color:var(--accent); background:rgba(0,0,0,0.03); padding:2px 6px; border-radius:6px;">OPEN ↗</span>
            </div>
            <div style="font-size:11px; color:var(--text3); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${net.desc}
            </div>
          </div>
        </a>
      `;
    });

    resultsDiv.innerHTML = html;
  }, 250); // یک تاخیر کوتاه ۲۵۰ میلی‌ثانیه‌ای برای شبیه‌سازی لودینگ OS
}

// تابع امن‌ساز متون برای جلوگیری از باگ‌های HTML injection
function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
