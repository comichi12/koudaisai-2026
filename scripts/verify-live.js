// 本番を変更しない疎通確認。キーや履歴本文は出力しない。
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {API_BASE} from '../config.js';
const privateFile=await readFile(new URL('../.local/admin-access.html',import.meta.url),'utf8');
const key=privateFile.match(/#key=([A-Za-z0-9_-]{32,200})/)?.[1];
if(!key)throw new Error('専用リンクが見つかりません。');
const origin='https://comichi12.github.io';
const request=(path,options={})=>fetch(`${API_BASE}${path}`,{...options,signal:AbortSignal.timeout(15000)});
try {
 const response=await request('/api/state',{headers:{Origin:origin}});
 assert.equal(response.status,200);
 assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
 const current=await response.json();assert.deepEqual(Object.keys(current).sort(),['slotId','version']);
 const history=await request('/api/history',{headers:{Authorization:`Bearer ${key}`,Origin:origin}});assert.equal(history.status,200);
 const historyBody=await history.json();assert(Array.isArray(historyBody.rows));
 const csv=await request('/api/history.csv',{headers:{Authorization:`Bearer ${key}`}});assert.equal(csv.status,200);assert(csv.headers.get('Content-Type').startsWith('text/csv'));
 const denied=await request('/api/history');assert.equal(denied.status,401);
 const invalid=await request('/api/control',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json',Origin:origin},body:JSON.stringify({slotId:'invalid-probe',version:0,requestId:crypto.randomUUID()})});assert.equal(invalid.status,400);
 console.log(`本番APIの疎通・CORS・管理キー・CSV・権限拒否・不正入力拒否を確認。履歴は${historyBody.rows.length}件（更新なし）。`);
} catch(error) {
 console.error(`疎通確認未完了: ${error.code||error.cause?.code||error.message}`);
 process.exitCode=1;
}
