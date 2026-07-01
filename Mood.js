/* ══ MOOD / ENERGY TRACKER ══ */
(function(){
const MOOD_STORAGE='fri_mood_v1';
const MOOD_OPTIONS=[
  {v:1,e:'😞',label:'بد',color:'#c04040'},
  {v:2,e:'😕',label:'نه‌چندان خوب',color:'#c09020'},
  {v:3,e:'😐',label:'معمولی',color:'#a0a040'},
  {v:4,e:'🙂',label:'خوب',color:'#5a9a5a'},
  {v:5,e:'😄',label:'عالی',color:'#2a9060'}
];
let moodData={};

const style=document.createElement('style');
style.textContent=`
.mood-card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;padding:12px 13px;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.mood-picker{display:flex;justify-content:space-between;gap:5px;margin-bottom:10px;}
.mood-opt{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px;border-radius:11px;background:var(--bg2);border:1.5px solid transparent;cursor:pointer;transition:all .2s;}
.mood-opt.active{border-color:var(--mo-color);background:var(--glow2);transform:translateY(-2px);}
.mood-opt:active{transform:scale(.92);}
.mood-emoji{font-size:20px;line-height:1;}
.mood-lbl{font-size:6px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.mood-streak{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.mood-streak-txt{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text3);}
.mood-streak-val{font-family:'Space Mono',monospace;font-size:12px;font-weight:700;color:var(--accent);}
.mood-week{display:flex;align-items:flex-end;gap:4px;height:40px;margin-top:4px;}
.mood-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end;}
.mood-bar{width:100%;border-radius:4px 4px 0 0;min-height:3px;transition:height .5s cubic-bezier(.22,1,.36,1);}
.mood-bar-day{font-size:5.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
`;
document.head.appendChild(style);

/* کلید تاریخ به‌صورت YYYY-MM-DD مستقل از locale */
function todayKey(d){
  d=d||new Date();
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function MOOD_loadStorage(){try{moodData=JSON.parse(localStorage.getItem(MOOD_STORAGE)||'{}');}catch(e){moodData={};}}
function MOOD_save(){try{localStorage.setItem(MOOD_STORAGE,JSON.stringify(moodData));}catch(e){}}

function MOOD_streak(){
  let streak=0,d=new Date();
  while(true){
    const k=todayKey(d);
    if(moodData[k]){streak++;d.setDate(d.getDate()-1);}else break;
  }
  return streak;
}

function MOOD_pick(v){
  if(typeof haptic==='function')haptic(10);
  moodData[todayKey()]={v,ts:Date.now()};
  MOOD_save();
  MOOD_render();
  if(typeof showToast==='function')showToast('✓ حال‌وهوای امروز ثبت شد');
}

function MOOD_render(){
  const wrap=document.getElementById('moodWrap');
  if(!wrap)return;
  const todayVal=moodData[todayKey()]?moodData[todayKey()].v:null;
  const streak=MOOD_streak();

  const picker=MOOD_OPTIONS.map(o=>`
    <div class="mood-opt${todayVal===o.v?' active':''}" style="--mo-color:${o.color}" onclick="MOOD_pick(${o.v})">
      <div class="mood-emoji">${o.e}</div>
      <div class="mood-lbl">${o.label}</div>
    </div>`).join('');

  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const val=moodData[todayKey(d)]?moodData[todayKey(d)].v:0;
    days.push({val,dayLbl:d.toLocaleDateString('fa-IR',{weekday:'short'})});
  }
  const maxH=32;
  const weekBars=days.map(d=>{
    const opt=MOOD_OPTIONS.find(o=>o.v===d.val);
    const h=d.val?Math.round((d.val/5)*maxH):2;
    const col=opt?opt.color:'var(--border)';
    return`<div class="mood-bar-wrap">
      <div class="mood-bar" style="height:${h}px;background:${col}"></div>
      <div class="mood-bar-day">${d.dayLbl}</div>
    </div>`;
  }).join('');

  wrap.innerHTML=`<div class="mood-card">
    <div class="mood-streak">
      <div class="mood-streak-txt">// امروز حالت چطوره؟</div>
      ${streak>0?`<div class="mood-streak-val">🔥 ${streak} روز</div>`:''}
    </div>
    <div class="mood-picker">${picker}</div>
    <div class="mood-week">${weekBars}</div>
  </div>`;
}

window.MOOD_load=function(){MOOD_loadStorage();MOOD_render();};
window.MOOD_pick=MOOD_pick;
})();
