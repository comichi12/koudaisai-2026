import {API_BASE} from './config.js';
export const apiUrl=path=>`${API_BASE.replace(/\/$/,'')}${path}`;
export const timeLabel=value=>value?new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value)):'';
export function element(tag,className,text) {const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export async function fetchJson(path,options={}) {
  const response=await fetch(apiUrl(path),{cache:'no-store',...options,signal:AbortSignal.timeout(10000)});
  const body=await response.json();
  if(!response.ok) {const error=new Error(body.error||'接続できません。');error.status=response.status;error.state=body.state;throw error;}
  return body;
}
