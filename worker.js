import {slotById} from './data.js';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
const state=db=>db.prepare('SELECT version, slot_id AS slotId, changed_at AS changedAt FROM live_state WHERE id=1').first();
export function csvCell(value) {let text=String(value??'');if(/^\s*[=+\-@]/.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`;}
export function historyCsv(rows) {
  const table=[['記録番号','切替時刻(JST)','日程','種別','部','バンド・進行','次の切替時刻(JST)','この状態の継続秒数','操作担当','備考']];
  const jst=value=>value?new Date(Date.parse(value)+9*3600000).toISOString().replace('T',' ').slice(0,19):'';
  rows.forEach((row,index)=>{const slot=slotById(row.slot_id),next=rows[index+1];table.push([row.id,jst(row.changed_at),slot?.date,slot?.type,slot?.part,slot?.title,jst(next?.changed_at),next?Math.round((Date.parse(next.changed_at)-Date.parse(row.changed_at))/1000):'',row.operator,row.note]);});
  return '\ufeff'+table.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
async function operatorFor(request,env) {
  const supplied=request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{32,200})$/)?.[1];if(!supplied)return null;
  let keys;try{keys=JSON.parse(env.OPERATOR_KEYS||'{}');}catch{return null;}
  if(!keys||typeof keys!=='object'||Array.isArray(keys))return null;
  const digest=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const actual=await digest(supplied);
  for(const [name,key]of Object.entries(keys)) {if(typeof key!=='string'||key.length<32)continue;const expected=await digest(key);let diff=0;for(let i=0;i<actual.length;i++)diff|=actual[i]^expected[i];if(!diff)return name;}
  return null;
}
export async function handleRequest(request,env) {
  const {pathname}=new URL(request.url);
  if(pathname==='/api/state'&&request.method==='GET'){const current=await state(env.DB);return json({version:current.version,slotId:current.slotId});}
  if(!['/api/control','/api/reset','/api/history','/api/history.csv'].includes(pathname))return json({error:'ページが見つかりません。'},404);
  const operator=await operatorFor(request,env);if(!operator)return json({error:'操作用URLを確認してください。'},401);
  if(request.method==='GET'&&pathname==='/api/history'){const rows=await env.DB.prepare('SELECT * FROM transitions ORDER BY id DESC LIMIT 100').all();return json({operator,rows:rows.results});}
  if(request.method==='GET'&&pathname==='/api/history.csv'){const rows=await env.DB.prepare('SELECT * FROM transitions ORDER BY id').all();return new Response(historyCsv(rows.results),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="koudaisai-2026-history.csv"'}});}
  if(request.method!=='POST'||!['/api/control','/api/reset'].includes(pathname))return json({error:'許可されていない操作です。'},405);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSONで送信してください。'},415);
  const text=await request.text();if(text.length>4096)return json({error:'入力が長すぎます。'},413);
  let body;try{body=JSON.parse(text);}catch{return json({error:'入力内容を確認してください。'},400);}
  if(pathname==='/api/reset'){
    if(!body||body.confirm!=='RESET'||!Number.isSafeInteger(body.version)||body.version<0)return json({error:'リセットの確認内容を確認してください。'},400);
    const result=await env.DB.batch([
      env.DB.prepare('DELETE FROM transitions WHERE EXISTS (SELECT 1 FROM live_state WHERE id=1 AND version=?)').bind(body.version),
      env.DB.prepare('UPDATE live_state SET version=version+1,slot_id=NULL,changed_at=NULL WHERE id=1 AND version=?').bind(body.version)
    ]);
    const current=await state(env.DB);
    if(!result[1].meta.changes)return json({error:'進行が更新されています。最新状態を確認してからリセットしてください。',state:current},409);
    return json({state:current});
  }
  if(!body||!slotById(body.slotId)||!Number.isSafeInteger(body.version)||body.version<0||typeof body.requestId!=='string'||!/^[a-zA-Z0-9-]{20,80}$/.test(body.requestId)||(body.note!==undefined&&(typeof body.note!=='string'||body.note.length>500)))return json({error:'入力内容を確認してください。'},400);
  const existing=await env.DB.prepare('SELECT slot_id, operator FROM transitions WHERE request_id=?').bind(body.requestId).first();
  if(existing){if(existing.slot_id!==body.slotId||existing.operator!==operator)return json({error:'操作IDが重複しています。'},409);return json({state:await state(env.DB),replayed:true});}
  const changedAt=new Date().toISOString();
  const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO transitions (request_id,version,slot_id,changed_at,operator,note) SELECT ?,version+1,?,?,?,? FROM live_state WHERE id=1 AND version=? AND (slot_id IS NULL OR slot_id!=?)').bind(body.requestId,body.slotId,changedAt,operator,body.note||'',body.version,body.slotId),
    env.DB.prepare('UPDATE live_state SET version=?,slot_id=?,changed_at=? WHERE id=1 AND version=? AND EXISTS (SELECT 1 FROM transitions WHERE request_id=? AND version=?)').bind(body.version+1,body.slotId,changedAt,body.version,body.requestId,body.version+1)
  ]);
  const current=await state(env.DB);
  if(!result[0].meta.changes)return json({error:'進行が更新済みです。最新状態を確認して操作し直してください。',state:current},409);
  return json({state:current});
}
export default {async fetch(request,env){
  const origin=request.headers.get('Origin'),allowed=(env.PUBLIC_ORIGIN||'').split(',').map(s=>s.trim());
  if(origin&&!allowed.includes(origin))return json({error:'許可されていない接続元です。'},403);
  let response;
  if(request.method==='OPTIONS')response=new Response(null,{status:204});else{try{response=await handleRequest(request,env);}catch{response=json({error:'現在、接続できません。時間をおいて再度お試しください。'},503);}}
  const next=new Headers(response.headers);if(origin)next.set('Access-Control-Allow-Origin',origin);next.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');next.set('Access-Control-Allow-Headers','Authorization, Content-Type');next.set('Vary','Origin');
  return new Response(response.body,{status:response.status,headers:next});
}};
