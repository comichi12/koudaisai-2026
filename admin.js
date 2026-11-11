import {days,slots,slotById} from './data.js?v=20261107-band-starts';
import {element,fetchJson,apiUrl,timeLabel} from './live.js?v=20261107-letterspacing';
import './footer.js';
import {operatorSession} from './operator-session.js?v=20261109-reload';
// 同じタブの再読込ではsessionStorageから復元する。
let tabStorage;try{tabStorage=sessionStorage;}catch{}
const session=operatorSession({hash:location.hash,storage:tabStorage,scope:location.pathname});
const key=session.key;
if(session.persisted)history.replaceState(null,'',location.pathname+location.search);
const auth={Authorization:`Bearer ${key}`};
const controlDay=document.getElementById('control-day'),controlSlot=document.getElementById('control-slot'),controls=document.getElementById('controls'),message=document.getElementById('admin-message'),csv=document.getElementById('csv'),confirm=document.getElementById('confirm');
let current=null,busy=false,connected=false,timer;
days.forEach(day=>{const option=element('option','',day.label);option.value=day.date;controlDay.append(option);});
const jstToday=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());if(days.some(day=>day.date===jstToday))controlDay.value=jstToday;
function fillSlots(){controlSlot.replaceChildren();slots.filter(slot=>slot.date===controlDay.value).forEach(slot=>{const option=element('option','',`${slot.part?`第${slot.part}部 · `:''}${slot.order?`${slot.order}. `:''}${slot.title}`);option.value=slot.id;controlSlot.append(option);});}
controlDay.addEventListener('change',fillSlots);fillSlots();
function updateState(next){current=next;document.getElementById('admin-current').textContent=slotById(current.slotId)?.title||'未開始';document.getElementById('admin-updated').textContent=current.changedAt?`切り替え ${timeLabel(current.changedAt)}`:'';}
function nextSlot(){const active=slotById(current?.slotId);if(active)return slots[slots.indexOf(active)+1];return slots.find(slot=>slot.date===(days.find(day=>day.date===jstToday)?.date||days[0].date));}
function enable(){controls.disabled=busy||!connected;csv.disabled=busy||!connected;const target=nextSlot();document.getElementById('next').disabled=busy||!connected||!target;document.getElementById('admin-next').textContent=target?`次：${target.date.slice(5).replace('-','/')} ${target.part?`第${target.part}部・`:''}${target.title}`:'すべての進行が終了しました。';}
async function refresh(){
 clearTimeout(timer);
 if(busy||document.hidden){timer=setTimeout(refresh,5000);return;}
 try{
  const [next,history]=await Promise.all([fetchJson('/api/state'),fetchJson('/api/history',{headers:auth})]);
  const latest=history.rows.find(row=>row.version===next.version);
  updateState({...next,changedAt:latest?.changed_at});
  connected=true;message.textContent=`${history.operator} · 接続済み`;
  document.getElementById('history').replaceChildren(...history.rows.map(row=>{
   const item=element('li');
   const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date(row.changed_at));
   item.append(element('time','',`${date} ${timeLabel(row.changed_at)}`),element('strong','',slotById(row.slot_id)?.title||row.slot_id),element('span','muted small',`${row.operator}${row.note?` · ${row.note}`:''}`));return item;
  }));
 }catch(error){connected=false;message.textContent=error.status===401?'担当者用のURLから開き直してください。':error.message;}
 finally{enable();timer=setTimeout(refresh,5000);}
}
async function switchTo(slot,note=''){if(!slot||!connected||busy)return;if(current?.slotId===slot.id){message.textContent='現在と同じ進行です。';return;}busy=true;enable();document.getElementById('confirm-target').textContent=`${slot.date} ${slot.part?`第${slot.part}部 `:''}${slot.title}`;confirm.returnValue='';confirm.showModal();const accepted=await new Promise(resolve=>confirm.addEventListener('close',()=>resolve(confirm.returnValue==='switch'),{once:true}));if(!accepted){busy=false;enable();return;}try{const body={slotId:slot.id,version:current.version,requestId:crypto.randomUUID(),note};const result=await fetchJson('/api/control',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify(body)});updateState(result.state);if(note)document.getElementById('control-note').value='';}catch(error){if(error.state)updateState(error.state);message.textContent=error.message;busy=false;enable();return;}busy=false;await refresh();}
document.getElementById('switch').addEventListener('click',()=>switchTo(slotById(controlSlot.value),document.getElementById('control-note').value));
document.getElementById('next').addEventListener('click',()=>switchTo(nextSlot()));
document.getElementById('reset').addEventListener('click',async()=>{
 if(busy||!connected)return;
 busy=true;enable();
 const dialog=document.getElementById('reset-confirm');
 document.getElementById('reset-word').value='';dialog.returnValue='';dialog.showModal();
 const accepted=await new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='reset'),{once:true}));
 if(!accepted){busy=false;enable();return;}
 try{
  const result=await fetchJson('/api/reset',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({version:current.version,confirm:'RESET'})});
  updateState(result.state);document.getElementById('control-note').value='';
 }catch(error){if(error.state)updateState(error.state);message.textContent=error.message;busy=false;enable();return;}
 busy=false;await refresh();
});
csv.addEventListener('click',async()=>{csv.disabled=true;try{const response=await fetch(apiUrl('/api/history.csv'),{headers:auth,cache:'no-store',signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('CSVを取得できませんでした。');const url=URL.createObjectURL(await response.blob()),link=element('a');link.href=url;link.download='koudaisai-2026-history.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){message.textContent=error.message;}finally{enable();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else refresh();});
if(key.length>=32)refresh();else message.textContent='担当者用のURLから開いてください。';
