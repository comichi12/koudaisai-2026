import test from 'node:test';
import assert from 'node:assert/strict';
import {operatorSession} from '../operator-session.js';
const first='test-only-first-operator-key-1234567890',second='test-only-other-operator-key-1234567890';
function memory(){const values=new Map();return{setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null,removeItem:k=>values.delete(k)};}
test('operator key survives reload within the same tab and page',()=>{
 const storage=memory(),scope='/festival/admin.html';
 const initial=operatorSession({hash:`#key=${first}`,storage,scope});assert(initial.persisted);
 assert.equal(operatorSession({hash:'',storage,scope}).key,first);
 assert.equal(operatorSession({hash:'',storage:memory(),scope}).key,'');
 assert.equal(operatorSession({hash:'',storage,scope:'/other/admin.html'}).key,'');
});
test('a newly supplied key replaces the saved operator and invalid links do not reuse it',()=>{
 const storage=memory(),scope='/admin.html';
 operatorSession({hash:`#key=${first}`,storage,scope});
 assert.equal(operatorSession({hash:`#key=${second}`,storage,scope}).key,second);
 operatorSession({hash:'#key=invalid',storage,scope});
 assert.equal(operatorSession({hash:'',storage,scope}).key,'');
});
test('blocked storage preserves fragment fallback and clearing removes saved access',()=>{
 const blocked={setItem(){throw Error('blocked');},getItem(){throw Error('blocked');}};
 const session=operatorSession({hash:`#key=${first}`,storage:blocked,scope:'/admin.html'});
 assert.equal(session.key,first);assert.equal(session.persisted,false);
 const storage=memory(),saved=operatorSession({hash:`#key=${first}`,storage,scope:'/admin.html'});
 saved.clear();assert.equal(operatorSession({hash:'',storage,scope:'/admin.html'}).key,'');
});
