// 元のPNGは保持し、内容・縦横比を変えず表示用WebPを生成する。
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {stat} from 'node:fs/promises';
let original=0,optimized=0;
for(let i=1;i<=31;i++){
  const source=new URL(`../assets/bands/${i}.png`,import.meta.url);
  original+=(await stat(source)).size;
  for(const width of [540,1080]){
    const target=new URL(`../assets/bands/${i}-${width}.webp`,import.meta.url);
    await sharp(fileURLToPath(source)).resize({width}).webp({quality:85,effort:6}).toFile(fileURLToPath(target));
    if(width===1080)optimized+=(await stat(target)).size;
  }
}
console.log(JSON.stringify({original,optimized,savedPercent:Math.round((1-optimized/original)*100)}));
