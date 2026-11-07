import {bands,days} from './data.js?v=20261107-stella';
import {element} from './live.js?v=20261107-letterspacing';
import './footer.js';
const appearances=band=>days.flatMap(day=>day.sections.flatMap(section=>section.slots.filter(slot=>slot.bandId===band.id).map(slot=>({day,section,slot}))));
const normalize=value=>value.normalize('NFKC').toLocaleLowerCase('ja-JP');
const list=document.getElementById('band-list');
if(list){const search=document.getElementById('band-search');const render=()=>{list.replaceChildren();const matches=bands.filter(band=>normalize(band.name).includes(normalize(search.value.trim())));document.getElementById('search-count').textContent=`${matches.length} バンド`;matches.forEach(band=>{const card=element('a','band-card');card.href=`band.html?id=${band.id}`;card.append(element('h2','',band.name),element('p','muted small',appearances(band).map(({day,section})=>`${day.label.slice(0,5)} ${section.title}`).join(' / ')));list.append(card);});if(!matches.length)list.append(element('p','muted','該当するバンドはありません。'));};search.addEventListener('input',render);render();}
const detail=document.getElementById('band-detail');
if(detail){
  const band=bands.find(band=>band.id===new URLSearchParams(location.search).get('id'));
  if(!band){
    detail.append(element('h1','','バンドが見つかりません'),element('p','','出演バンド一覧からお選びください。'));
  }else{
    document.title=`${band.name} | Grazie!! 工大祭2026`;
    detail.append(element('div','eyebrow','BAND PROFILE'),element('h1','band-title',band.name));
    if(band.poster){
      const image=element('img','band-poster');
      const stem=band.poster.replace(/\.png$/,'');
      image.src=`${stem}-1080.webp`;
      image.srcset=`${stem}-540.webp 540w, ${stem}-1080.webp 1080w`;
      image.sizes='(max-width: 480px) calc(100vw - 40px), (max-width: 848px) calc(100vw - 48px), 800px';
      image.fetchPriority='high';image.alt=`${band.name}のバンド紹介`;
      image.width=1080;image.height=1350;image.decoding='async';
      image.style.cssText='display:block;width:100%;max-width:100%;height:auto;margin-top:24px;border-radius:16px';
      detail.append(image);
    }
    detail.append(element('h2','subheading','出演・演奏曲'));
    appearances(band).forEach(({day,section,slot})=>{
      const date=new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',weekday:'short',timeZone:'Asia/Tokyo'}).format(new Date(`${day.date}T12:00:00+09:00`));
      const card=element('section','appearance');
      card.append(element('p','eyebrow',date),element('h3','',`${section.title}・${String(slot.order).padStart(2,'0')}`),element('p','',slot.songs));
      const link=element('a','text-link','タイムテーブルを見る ↗');
      link.href=`./?day=${day.date}#slot-${slot.id}`;
      card.append(link);detail.append(card);
    });
  }
}
