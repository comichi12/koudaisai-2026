// タブを閉じるまでの保存。localStorageやCookieには操作キーを残さない。
export function operatorSession({hash,storage,scope}){
  const name=`koudaisai-operator:${scope}`;
  const supplied=new URLSearchParams(hash.replace(/^#/,'')).get('key');
  let key=supplied||'',persisted=false;
  try{
    if(supplied!==null){
      if(key.length>=32){storage.setItem(name,key);persisted=true;}
      else storage.removeItem(name);
    }else{key=storage.getItem(name)||'';persisted=true;}
  }catch{/* 保存不可の場合はフラグメントを残して再読込に備える。 */}
  return{key,persisted,clear(){try{storage.removeItem(name);}catch{}}};
}
