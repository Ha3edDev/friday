/* ══ DAILY TO-DO CHECKLIST ══ */
(function(){
const TODO_STORAGE='fri_todos_v1';
let TODO_tasks=[];
let _todoLastReset='';

const style=document.createElement('style');
style.textContent=`
.todo-card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;padding:12px 13px;margin-bottom:12px;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.todo-progress-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.todo-progress-txt{font-size:10.5px;font-weight:700;color:var(--text1);}
.todo-progress-pct{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--accent);}
.todo-progress-track{height:5px;background:var(--bg2);border-radius:4px;overflow:hidden;margin-bottom:10px;}
.todo-progress-fill{height:100%;background:var(--accent3);border-radius:4px;transition:width .5s cubic-bezier(.22,1,.36,1);}
.todo-list{display:flex;flex-direction:column;gap:5px;}
.todo-item{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;transition:all .2s;}
.todo-item.done{opacity:.5;}
.todo-item:active{transform:scale(.98);}
.todo-check{width:18px;height:18px;border-radius:6px;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;transition:all .2s;}
.todo-item.done .todo-check{background:var(--accent3);border-color:var(--accent3);color:#fff;}
.todo-item-text{flex:1;font-size:9.5px;color:var(--text1);}
.todo-item.done .todo-item-text{text-decoration:line-through;color:var(--text3);}
.todo-item-del{font-size:11px;color:var(--text3);padding:3px;cursor:pointer;opacity:.5;}
.todo-item-del:hover{opacity:1;color:#c04040;}
.todo-add-row{display:flex;gap:6px;margin-top:8px;}
.todo-add-inp{flex:1;background:var(--bg1);border:1px solid var(--border);border-radius:10px;padding:8px 10px;color:var(--text1);font-family:'Vazirmatn',sans-serif;font-size:10.5px;outline:none;}
.todo-add-btn{width:36px;height:36px;border-radius:10px;background:var(--accent);border:none;color:var(--bg0);font-size:16px;cursor:pointer;flex-shrink:0;}
`;
document.head.appendChild(style);

function TODO_todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function TODO_loadStorage(){
  try{
    const raw=JSON.parse(localStorage.getItem(TODO_STORAGE)||'{"tasks":[],"lastReset":""}');
    TODO_tasks=raw.tasks||[];
    _todoLastReset=raw.lastReset||'';
  }catch(e){TODO_tasks=[];_todoLastReset='';}

  const today=TODO_todayKey();
  if(_todoLastReset!==today){
    TODO_tasks.forEach(t=>{if(t.recurring)t.done=false;});
    _todoLastReset=today;
    TODO_save();
  }
}
function TODO_save(){
  try{localStorage.setItem(TODO_STORAGE,JSON.stringify({tasks:TODO_tasks,lastReset:_todoLastReset}));}catch(e){}
}

function TODO_render(){
  const wrap=document.getElementById('todoWrap');
  if(!wrap)return;
  const done=TODO_tasks.filter(t=>t.done).length;
  const total=TODO_tasks.length;
  const pct=total?Math.round((done/total)*100):0;

  const items=TODO_tasks.map(t=>`
    <div class="todo-item${t.done?' done':''}" onclick="TODO_toggle('${t.id}')">
      <div class="todo-check">${t.done?'✓':''}</div>
      <div class="todo-item-text">${esc(t.text)}</div>
      <div class="todo-item-del" onclick="event.stopPropagation();TODO_delete('${t.id}')">✕</div>
    </div>`).join('');

  wrap.innerHTML=`<div class="todo-card">
    <div class="todo-progress-row">
      <div class="todo-progress-txt">${total?`${done} از ${total} کار امروز انجام شد`:'کاری برای امروز ثبت نشده'}</div>
      ${total?`<div class="todo-progress-pct">${pct}%</div>`:''}
    </div>
    ${total?`<div class="todo-progress-track"><div class="todo-progress-fill" style="width:${pct}%"></div></div>`:''}
    <div class="todo-list">${items}</div>
    <div class="todo-add-row">
      <input class="todo-add-inp" id="todo-new-inp" placeholder="کار جدید..." onkeydown="if(event.key==='Enter')TODO_add()">
      <button class="todo-add-btn" onclick="TODO_add()">＋</button>
    </div>
  </div>`;
}

function TODO_add(){
  const inp=document.getElementById('todo-new-inp');
  const text=(inp&&inp.value||'').trim();
  if(!text)return;
  if(typeof haptic==='function')haptic(10);
  TODO_tasks.push({id:'t'+Date.now(),text,done:false,recurring:true,ts:Date.now()});
  TODO_save();TODO_render();
  const newInp=document.getElementById('todo-new-inp');
  if(newInp)newInp.focus();
}
function TODO_toggle(id){
  if(typeof haptic==='function')haptic(8);
  const t=TODO_tasks.find(x=>x.id===id);
  if(t){t.done=!t.done;TODO_save();TODO_render();}
}
function TODO_delete(id){
  if(typeof haptic==='function')haptic(12);
  TODO_tasks=TODO_tasks.filter(t=>t.id!==id);
  TODO_save();TODO_render();
}

window.TODO_load=function(){TODO_loadStorage();TODO_render();};
window.TODO_add=TODO_add;
window.TODO_toggle=TODO_toggle;
window.TODO_delete=TODO_delete;
})();
