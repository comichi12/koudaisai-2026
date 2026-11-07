// 混在文でも和文はそのまま、英数字だけに共通の字間を適用する。
const excluded='script,style,noscript,textarea,input,select,option,svg,.poster-latin,.latin-spacing,[contenteditable]';
function enhance(root){
  if(root.nodeType===Node.TEXT_NODE){
    if(!root.parentElement||root.parentElement.closest(excluded))return;
    const text=root.nodeValue;
    if(!/[A-Za-z\u00C0-\u024F0-9]/.test(text))return;
    const fragment=document.createDocumentFragment();
    for(const part of text.split(/([A-Za-z\u00C0-\u024F0-9:./-]+)/g)){
      if(/[A-Za-z\u00C0-\u024F0-9]/.test(part)){
        const span=document.createElement('span');span.className='latin-spacing';span.textContent=part;fragment.append(span);
      }else fragment.append(document.createTextNode(part));
    }
    root.replaceWith(fragment);
  }else if(root.nodeType===Node.ELEMENT_NODE&&!root.matches(excluded)){
    for(const child of [...root.childNodes])enhance(child);
  }
}
enhance(document.body);
new MutationObserver(records=>{
  for(const record of records){
    if(record.type==='characterData')enhance(record.target);
    else for(const node of record.addedNodes)enhance(node);
  }
}).observe(document.body,{childList:true,subtree:true,characterData:true});
