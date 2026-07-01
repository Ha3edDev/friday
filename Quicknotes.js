/* ══ QUICK NOTES ══ */
/* از مودال dl-modal-bg/dlSheet که برای Decision Log در index.html هست استفاده می‌کند
   (نیازی به مارک‌آپ اضافه در index.html نیست) */
(function(){
const QN_STORAGE='fri_notes_v1';
const QN_COLORS=['#5090e0','#c04a4a','#4ac870','#f0a030','#9060e0','#00c0a0','#e04080','#888888'];
let QN_notes=[];
let _qnEditId=null;

const style=document.createElement('style');
style.textContent=`
.qn-wrap{display:flex;flex-direction:column;gap:6px;}
.qn-card{border-radius:14px;background:var(--card);border:1px solid var(--card-b);padding:10px 12px;box-shadow:0 1px 6px rgba(0,0,0,.05);cursor:pointer;transition:transform .2s;position:relative;overflow:hidden;}
.qn-card:active{transform:scale(.98);}
.qn-card::before{content:'';position:absolute;right:0;top:0;bottom:0;width:2.5px;background:var(--qn-color,var(--accent));}
.qn-pin{position:absolute;top:8px;left:10px;font-size:9px;opacity:.7;}
.qn-text{font-size:10px;color:var(--text1);line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;padding-left:14px;}
.qn-meta{display:flex;justify-content:space-between;align-items:center;margin-top:6px;}
.qn-date{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);}
.qn-tags{display:flex;gap:4px;flex-wrap:wrap;}
.qn-tag{font-family:'JetBrains Mono',monospace;font-size:6px;padding:1px 6px;border-radius:5px;background:var(--surface2);border:1px solid var(--border);color:var(--text3);}
.qn-add{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;border-radius:14px;background:var(--surface);border:1px dashed var(--border2);color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:8px;cursor:pointer;transition:all .2s;letter-spacing:1px;margin-bottom:6px;}
.qn-add:hover{background:var(--surface2);color:var(--accent);border-color:var(--accent);}
.qn-pin-btn{font-size:13px;background:var(--surface2);border:1px solid var(--border);border-radius:9px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
.qn-pin-btn.active{background:var(--glow2);border-color:var(--accent);color:var(--accent);}
`;
document.head.appendChild(style);

function QN_loadStorage(){try{QN_notes=JSON.parse(localStorage.getItem(QN_STORAGE)||'[]');}catch(e){QN_notes=[];}}
function QN_save(){try{localStorage.setItem(QN_STORAGE,JSON.stringify(QN_notes));}catch(e){}}

function QN_render(){
  const wrap=document.getElementById('notesWrap');
  if(!wrap)return;
  const sorted=[...QN_notes].sort((a,b)=>{
    if(!!a.pinned!==!!b.pinned)return a.pinned?-1:1;
    return b.ts-a.ts;
  }).slice(0,6);
  let html='<div class="qn-add" onclick="QN_openAdd()">＋ یادداشت جدید</div>';
  html+='<div class="qn-wrap">'+sorted.map((n,i)=>`
    <div class="qn-card stagger-item" style="--qn-color:${n.color||'#5090e0'};animation-delay:${(i*0.06).toFixed(2)}s" onclick="QN_openDetail('${n.id}')">
      ${n.pinned?'<div class="qn-pin">📌</div>':''}
      <div class="qn-text">${esc(n.text)}</div>
      <div class="qn-meta">
        <div class="qn-date">${n.date||''}</div>
        <div class="qn-tags">${(n.tags||[]).slice(0,3).map(t=>`<span class="qn-tag">${esc(t)}</span>`).join('')}</div>
      </div>
    </div>`).join('')+'</div>';
  wrap.innerHTML=html;
}

function QN_openAdd(){
  if(typeof haptic==='function')haptic(8);
  _qnEditId=null;
  document.getElementById('dlSheetTitle').textContent='یادداشت جدید';
  document.getElementById('dlSheetContent').innerHTML=QN_buildForm();
  document.getElementById('dlModal').classList.add('open');
  document.getElementById('dlSheet').scrollTop=0;
}

function QN_buildForm(n){
  n=n||{};
  const colorBtns=QN_COLORS.map((c,i)=>`<div class="dl-color-btn${n.color===c||(!n.color&&i===0)?' active':''}" style="background:${c}" onclick="QN_setColor(${i})"></div>`).join('');
  return`<div class="dl-form">
    <div class="dl-form-row">
      <div class="dl-form-lbl">// متن یادداشت</div>
      <textarea class="dl-inp" id="qn-text" rows="4" placeholder="چی تو ذهنته؟">${esc(n.text||'')}</textarea>
    </div>
    <div class="dl-form-row">
      <div class="dl-form-lbl">// برچسب‌ها (با کاما جدا کن)</div>
      <input class="dl-inp" id="qn-tags" placeholder="ایده، کار، یادآوری..." value="${esc((n.tags||[]).join(', '))}">
    </div>
    <div class="dl-form-row" style="display:flex;align-items:center;gap:10px">
      <div class="qn-pin-btn${n.pinned?' active':''}" id="qn-pin-btn" onclick="QN_togglePinField()">📌</div>
      <div style="font-size:9px;color:var(--text3)">پین بالای لیست</div>
    </div>
    <div class="dl-form-row">
      <div class="dl-form-lbl">// رنگ</div>
      <div class="dl-color-row">${colorBtns}</div>
    </div>
    <input type="hidden" id="qn-color" value="${n.color||QN_COLORS[0]}">
    <input type="hidden" id="qn-pinned-val" value="${n.pinned?'1':'0'}">
    <button class="dl-save-btn" onclick="QN_saveCurrent()">ذخیره ✓</button>
  </div>`;
}

function QN_setColor(i){
  document.querySelectorAll('#dlSheetContent .dl-color-btn').forEach((b,j)=>b.classList.toggle('active',j===i));
  const inp=document.getElementById('qn-color');if(inp)inp.value=QN_COLORS[i];
}
function QN_togglePinField(){
  const btn=document.getElementById('qn-pin-btn');
  const inp=document.getElementById('qn-pinned-val');
  const active=btn.classList.toggle('active');
  inp.value=active?'1':'0';
}

function QN_saveCurrent(){
  if(typeof haptic==='function')haptic(12);
  const text=(document.getElementById('qn-text')?.value||'').trim();
  if(!text){if(typeof showToast==='function')showToast('// متن خالی است');return;}
  const tagsRaw=(document.getElementById('qn-tags')?.value||'').trim();
  const tags=tagsRaw?tagsRaw.split(',').map(t=>t.trim()).filter(Boolean):[];
  const color=document.getElementById('qn-color')?.value||QN_COLORS[0];
  const pinned=document.getElementById('qn-pinned-val')?.value==='1';
  const now=new Date();
  const date=now.toLocaleDateString('fa-IR',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'});
  if(_qnEditId){
    const idx=QN_notes.findIndex(n=>n.id===_qnEditId);
    if(idx>-1)QN_notes[idx]={...QN_notes[idx],text,tags,color,pinned};
  }else{
    QN_notes.push({id:'n'+Date.now(),text,tags,color,pinned,date,ts:Date.now()});
  }
  QN_save();QN_render();QN_closeModal();
  if(typeof showToast==='function')showToast('✓ یادداشت ذخیره شد');
}

function QN_openDetail(id){
  if(typeof haptic==='function')haptic(8);
  _qnEditId=id;
  const n=QN_notes.find(x=>x.id===id);
  if(!n)return;
  document.getElementById('dlSheetTitle').textContent='جزئیات یادداشت';
  document.getElementById('dlSheetContent').innerHTML=`<div class="dl-detail-body">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <div style="width:10px;height:10px;border-radius:50%;background:${n.color||'#5090e0'}"></div>
      ${n.pinned?'<span style="font-size:11px">📌</span>':''}
    </div>
    <div class="dl-detail-text" style="font-size:11.5px;margin-bottom:10px">${esc(n.text)}</div>
    ${n.tags&&n.tags.length?`<div class="qn-tags" style="margin-bottom:10px">${n.tags.map(t=>`<span class="qn-tag">${esc(t)}</span>`).join('')}</div>`:''}
    <div class="dl-detail-lbl">// تاریخ</div>
    <div class="dl-detail-text">${n.date||'—'}</div>
    <div class="dl-detail-actions">
      <button class="dl-delete-btn" onclick="QN_delete('${n.id}')">حذف ✕</button>
      <button class="dl-save-btn" style="flex:1;background:var(--surface2);color:var(--text1)" onclick="QN_togglePin('${n.id}')">${n.pinned?'برداشتن پین':'پین کردن 📌'}</button>
      <button class="dl-save-btn" style="flex:2" onclick="QN_openEdit('${n.id}')">ویرایش ✏</button>
    </div>
  </div>`;
  document.getElementById('dlModal').classList.add('open');
  document.getElementById('dlSheet').scrollTop=0;
}

function QN_openEdit(id){
  const n=QN_notes.find(x=>x.id===id);if(!n)return;
  _qnEditId=id;
  document.getElementById('dlSheetTitle').textContent='ویرایش یادداشت';
  document.getElementById('dlSheetContent').innerHTML=QN_buildForm(n);
}
function QN_togglePin(id){
  const idx=QN_notes.findIndex(n=>n.id===id);
  if(idx>-1){QN_notes[idx].pinned=!QN_notes[idx].pinned;QN_save();QN_render();QN_closeModal();}
}
function QN_delete(id){
  if(typeof haptic==='function')haptic(15);
  QN_notes=QN_notes.filter(n=>n.id!==id);
  QN_save();QN_render();QN_closeModal();
  if(typeof showToast==='function')showToast('// یادداشت حذف شد');
}
function QN_closeModal(){
  if(typeof haptic==='function')haptic(6);
  document.getElementById('dlModal').classList.remove('open');
}

window.QN_load=function(){QN_loadStorage();QN_render();};
window.QN_openAdd=QN_openAdd;
window.QN_setColor=QN_setColor;
window.QN_togglePinField=QN_togglePinField;
window.QN_saveCurrent=QN_saveCurrent;
window.QN_openDetail=QN_openDetail;
window.QN_openEdit=QN_openEdit;
window.QN_togglePin=QN_togglePin;
window.QN_delete=QN_delete;
window.QN_closeModal=QN_closeModal;
})();
