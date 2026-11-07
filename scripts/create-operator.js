// 初回の操作キーを生成しCloudflare Secretへ保存。実キーは出力しない。
// .localのHTMLは管理者専用リンクを含むため、Gitへ追加しないこと。
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {API_BASE} from '../config.js';
const root=new URL('../',import.meta.url);
const directory=new URL('.local/',root);
const output=new URL('admin-access.html',directory);
let exists=false;try{await access(output);exists=true;}catch{}
if(exists)throw new Error('専用リンクは作成済みです。既存キーを変更せず終了しました。');
const name=process.argv[2]||'工大祭管理担当';
const key=randomBytes(32).toString('base64url');
const url=`https://comichi12.github.io/koudaisai-2026/admin.html#key=${key}`;
await mkdir(directory,{recursive:true});
await writeFile(output,`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>工大祭 管理画面専用リンク</title><body style="font:16px system-ui;padding:32px;line-height:1.8"><h1>工大祭 管理画面</h1><p>このファイルとリンクは担当者専用です。公開・Gitへの追加はしないでください。</p><p><a href="${url}" rel="noreferrer">進行管理を開く</a></p><p>再読み込みするときも、このリンクから開き直してください。</p></body></html>`,{mode:0o600});
const worker=new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url);
const result=await new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,[fileURLToPath(worker),'secret','put','OPERATOR_KEYS'],{cwd:root,stdio:['pipe','inherit','inherit']});
 child.on('error',reject);child.on('exit',resolve);child.stdin.end(JSON.stringify({[name]:key}));
});
// WindowsでCLIが終了時だけ非ゼロとなる場合があるため、APIの認証結果で判定する。
const response=await fetch(`${API_BASE}/api/history`,{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error(`操作キーをAPIで確認できませんでした(HTTP ${response.status}, CLI ${result})。キーは.localに保持しています。`);
console.log('操作キーを登録しました。専用リンク: .local/admin-access.html');
