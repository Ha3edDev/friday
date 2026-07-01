/* ══ WEEKLY WEATHER (5-DAY FORECAST) ══ */
/* از WX_KEY / WX_LAT / WX_LON که در اسکریپت اصلی index.html تعریف شده استفاده می‌کند */
(function(){
const style=document.createElement('style');
style.textContent=`
.w5-scroll{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;}
.w5-scroll::-webkit-scrollbar{display:none;}
.w5-card{flex-shrink:0;width:64px;border-radius:13px;background:var(--card);border:1px solid var(--card-b);padding:10px 6px;text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.04);}
.w5-day{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text3);margin-bottom:5px;}
.w5-icon{font-size:18px;margin-bottom:5px;}
.w5-max{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:var(--text1);}
.w5-min{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text3);margin-top:1px;}
`;
document.head.appendChild(style);

const WX_ICONS_5={'01d':'☀️','01n':'🌙','02d':'⛅','02n':'☁️','03d':'☁️','03n':'☁️','04d':'🌥️','04n':'🌥️','09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌧️','11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️'};

async function fetchForecast5(){
  try{
    const r=await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${WX_LAT}&lon=${WX_LON}&appid=${WX_KEY}&units=metric&lang=fa`,{signal:AbortSignal.timeout(6000)});
    const d=await r.json();
    if(!d.list)return null;
    const byDay={};
    d.list.forEach(item=>{
      const dt=new Date(item.dt*1000);
      const key=dt.toDateString();
      if(!byDay[key])byDay[key]={temps:[],icons:[],date:dt};
      byDay[key].temps.push(item.main.temp);
      byDay[key].icons.push({icon:item.weather[0].icon,hour:dt.getHours()});
    });
    return Object.values(byDay).slice(0,5).map(day=>{
      const min=Math.round(Math.min(...day.temps));
      const max=Math.round(Math.max(...day.temps));
      const mid=day.icons.find(i=>i.hour>=11&&i.hour<=14)||day.icons[Math.floor(day.icons.length/2)];
      return{date:day.date,min,max,icon:WX_ICONS_5[mid.icon]||'🌡️'};
    });
  }catch(e){return null;}
}

async function W5_render(){
  const wrap=document.getElementById('weather5Wrap');
  if(!wrap)return;
  wrap.innerHTML='<div class="w5-scroll">'+
    '<div class="sk sk-sq" style="width:64px;aspect-ratio:auto;height:90px"></div>'+
    '<div class="sk sk-sq" style="width:64px;aspect-ratio:auto;height:90px"></div>'+
    '<div class="sk sk-sq" style="width:64px;aspect-ratio:auto;height:90px"></div></div>';
  const data=await fetchForecast5();
  if(!data||!data.length){wrap.innerHTML='<div class="empty">// پیش‌بینی دریافت نشد</div>';return;}
  wrap.innerHTML='<div class="w5-scroll">'+data.map((d,i)=>{
    const dayLbl=i===0?'امروز':d.date.toLocaleDateString('fa-IR',{weekday:'short'});
    return`<div class="w5-card stagger-item" style="animation-delay:${(i*0.06).toFixed(2)}s">
      <div class="w5-day">${dayLbl}</div>
      <div class="w5-icon">${d.icon}</div>
      <div class="w5-max">${d.max}°</div>
      <div class="w5-min">${d.min}°</div>
    </div>`;
  }).join('')+'</div>';
}

window.W5_load=function(){W5_render();};
})();
