import {days,slots,slotById} from './data.js';
import {element,fetchJson,timeLabel} from './live.js?v=20261107-live';
import './footer.js';
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
const requestedDay=new URLSearchParams(location.search).get('day');
let selected=days.find(day=>day.date===requestedDay)?.date||days.find(day=>day.date===today)?.date||days[0].date,current=null,received=false,timer;
const tabs=document.querySelector('.day-tabs'),schedule=document.getElementById('schedule');
days.forEach(day=>{const button=element('button','day-tab',day.label);button.type='button';button.role='tab';button.id=`tab-${day.date}`;button.setAttribute('aria-controls','schedule');button.addEventListener('click',()=>{selected=day.date;renderSchedule();});tabs.append(button);});
function renderSchedule(){
 tabs.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-selected',String(days[i].date===selected)));
 schedule.replaceChildren();schedule.role='tabpanel';schedule.setAttribute('aria-labelledby',`tab-${selected}`);
 const currentIndex=slots.findIndex(slot=>slot.id===current?.slotId);
 days.find(day=>day.date===selected).sections.forEach(section=>{
  const block=element('section','schedule-part'),heading=element('div','part-heading');
  heading.append(element('h3','',section.title),element('span','part-time',`${section.start} 開始予定`));block.append(heading);
  section.slots.forEach(slot=>{
   const live=current?.slotId===slot.id,ended=currentIndex>=0&&slots.indexOf(slot)<currentIndex;
   const row=element('a',`schedule-row ${live?'is-live':ended?'is-ended':''}`);row.id=`slot-${slot.id}`;row.href=`band.html?id=${slot.bandId}`;
   row.append(element('span','slot-order',String(slot.order).padStart(2,'0')));
   const content=element('div','slot-content');content.append(element('h4','',slot.title));
   if(slot.songs)content.append(element('p','slot-songs',slot.songs));row.append(content);
   row.append(element('span',`slot-status ${live?'on-air':''}`,live?'出演中':ended?'終了':'↗'));block.append(row);
  });schedule.append(block);
 });
}
function renderLive(){
 const box=document.getElementById('now-playing'),slot=slotById(current?.slotId);box.replaceChildren();
 if(!slot){box.append(element('h2','','開演をお楽しみに'),element('p','','当日の進行はこちらでご案内します。'));return;}
 box.append(element('p','live-date',`${slot.date.slice(5).replace('-','/')} · ${slot.type==='band'?'NOW ON STAGE':slot.type==='break'?'INTERMISSION':slot.type==='waiting'?'OPENING SOON':'THANK YOU'}`));
 const heading=element('h2','',slot.title);if(slot.bandId){const link=element('a','',slot.title);link.href=`band.html?id=${slot.bandId}`;heading.replaceChildren(link);}box.append(heading);
 const next=slots.slice(slots.indexOf(slot)+1).find(item=>item.date===slot.date&&item.type==='band');
 if(next)box.append(element('p','up-next',`UP NEXT  ${next.title}`));
 if(slot.type==='band'){const jump=element('button','text-link','出演中の枠を見る ↓');jump.type='button';jump.addEventListener('click',()=>{selected=slot.date;renderSchedule();document.getElementById(`slot-${slot.id}`)?.scrollIntoView({behavior:'smooth',block:'center'});});box.append(jump);}
}
async function refresh(){clearTimeout(timer);if(document.hidden)return;const connection=document.getElementById('connection');try{const next=await fetchJson('/api/state');if(!received||next.version!==current?.version){current=next;renderLive();renderSchedule();}received=true;connection.textContent=`更新確認 ${timeLabel(new Date().toISOString())}`;connection.classList.remove('offline');}catch{connection.textContent=received?'接続待ち · 最後の進行を表示中':'進行情報に接続できません';connection.classList.add('offline');}finally{timer=setTimeout(refresh,5000);}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else refresh();});
renderSchedule();
if(location.hash.startsWith('#slot-'))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'center'}));
refresh();
