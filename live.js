import {API_BASE} from './config.js?v=20261107-live';
export const apiUrl=path=>`${API_BASE.replace(/\/$/,'')}${path}`;
export const timeLabel=value=>value?new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value)):'';
export function element(tag,className,text) {const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export async function fetchJson(path,options={}) {
  const response=await fetch(apiUrl(path),{cache:'no-store',...options,signal:AbortSignal.timeout(10000)});
  let body;
  try { body=await response.json(); }
  catch { throw new Error('接続情報の反映を待っています。少し時間をおいて開き直してください。'); }
  if(!response.ok) {const error=new Error(body.error||'接続できません。');error.status=response.status;error.state=body.state;throw error;}
  return body;
}
