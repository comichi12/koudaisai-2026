import {element} from './live.js';
const footer=document.getElementById('site-footer');
if(footer){const link=element('a','footer-logo');link.href='https://grazie.club.nitech.ac.jp/';const image=element('img');image.src='assets/grazie-logo.png';image.alt='Grazie!! 公式サイト';image.width=128;image.height=48;link.append(image);footer.append(link,element('p','',`© 2016-${new Date().getFullYear()} Grazie!! — A Cappella Club, NITech.`));}
