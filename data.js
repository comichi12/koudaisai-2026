// C/Grazie!!運営/工大祭/タイテ確定版.pdfを基準に、公開可能な出演順と曲目のみ。
// 各バンドの予定時刻・演奏時間・内部担当者情報は含めない。
import {bandPosters} from './band-posters.js?v=20261107-stella';
const definitions = [
  ['2026-11-14','11.14 SAT','1日目',[
    ['第1部','12:00',[
      ['青りんごの森','ライラック / 嘘じゃないよ'],['libertá','悪魔の子'],['EndRolL','ハッピーエンド'],['Re:リデイズ','Wherever you are'],['dusk','プロポーズ / Overdose'],['Scherzando','かくれんぼ'],['Parallel Notes','水平線'],['Viväche','Bunny Girl'],['Boot Leg','感電']]],
    ['第2部','13:08',[
      ['Flügel','青い鳥'],['雫音','ガーネット / 元気を出して'],['そらいろ♪','群青讃歌 / 仮死化'],['追憶の響','君がいれば / 渡月橋〜君想ふ〜'],['コエシカ','忘れてください / ブレーメン'],['8ワレ','夜空ノムコウ'],['佰佰夏衆','群青日和 / ヴィラン'],['ソニオ','HEART BEAT / アドベンチャー'],['燈幻響','115万キロのフィルム'],['月夜見','ray']]],
    ['第3部','14:45',[
      ['霞草','ラストバージン'],['Stella⭐️','星のかけらを探しに行こう / 星座になれたら'],['電話','SHAKE'],['OVA','タッチ / DAN DAN 心惹かれてく'],['トリコロール','三原色 / 赤い糸'],['LUSH','抱きしめたい'],['オムライス','銀河鉄道999'],['クローネ','I want you back'],['And Joy!','ひとりごつ / 勇気100% / あとひとつ']]]]],
  ['2026-11-15','11.15 SUN','2日目',[
    ['第1部','11:00',[
      ['Viväche','明日も / 恋'],['月夜見','ray'],['OVA','タッチ / DAN DAN 心惹かれてく'],['トリコロール','三原色 / 赤い糸'],['タイタニック企画','My heart will go on'],['Flügel','青い鳥'],['雫音','ガーネット / 元気を出して'],['佰佰夏衆','群青日和 / ヴィラン'],['And Joy!','climax jump / 勇気100% / Butter-Fly']]],
    ['第2部','12:38',[
      ['霞草','ラストバージン'],['LUSH','抱きしめたい'],['Scherzando','かくれんぼ'],['ソニオ','HEART BEAT / アドベンチャー'],['Ciel','空も飛べるはず'],['オムライス','銀河鉄道999'],['クローネ','I want you back'],['dusk','プロポーズ / Overdose'],['EndRolL','ハッピーエンド']]],
    ['第3部','13:44',[
      ['そらいろ♪','群青讃歌 / 仮死化'],['8ワレ','夜空ノムコウ'],['電話','SHAKE'],['Stella⭐️','星のかけらを探しに行こう / 星座になれたら'],['コエシカ','忘れてください / ブレーメン'],['追憶の響','美しい鰭 / 星のかがやきよ'],['燈幻響','115万キロのフィルム'],['なつめろん','東京ブギウギ / 赤いスイートピー'],['青りんごの森','コロンブス / 嘘じゃないよ']]]]]
];
const names=[...new Set(definitions.flatMap(day=>day[3].flatMap(section=>section[2].map(row=>row[0]))))];
export const bands=names.map((name,index)=>({id:`band-${String(index+1).padStart(2,'0')}`,name,description:'',members:[],photo:'',poster:bandPosters[name]?`assets/bands/${bandPosters[name]}`:''}));
export const days=definitions.map(([date,label,name,sections])=>({date,label,name,sections:sections.map(([title,start,rows],i)=>({id:`${date}-part-${i+1}`,title,start,slots:rows.map(([bandName,songs],j)=>({id:`${date}-part-${i+1}-${j+1}`,date,part:i+1,order:j+1,bandId:bands.find(b=>b.name===bandName).id,title:bandName,songs,type:'band'}))}))}));
export const slots=days.flatMap(day=>[
  {id:`${day.date}-waiting`,date:day.date,title:'開演前',type:'waiting'},
  ...day.sections.flatMap((section,i)=>[...section.slots,...(i<2?[{id:`${section.id}-break`,date:day.date,part:i+1,title:'休憩',type:'break'}]:[])]),
  {id:`${day.date}-finished`,date:day.date,title:'終演',type:'finished'}
]);
export const slotById=id=>slots.find(slot=>slot.id===id);
