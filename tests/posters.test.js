import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bands,days} from '../data.js';

test('all 31 bands have distinct original PNG introductions',()=>{
  assert.equal(bands.length,31);
  assert.equal(new Set(bands.map(band=>band.poster)).size,31);
  for(const band of bands){
    assert(band.poster,band.name);
    const png=readFileSync(new URL(`../${band.poster}`,import.meta.url));
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),1080);
    assert.equal(png.readUInt32BE(20),1350);
  }
});
test('appearance numbers restart within each part and use timetable slots',()=>{
  for(const day of days)for(const section of day.sections){
    assert.deepEqual(section.slots.map(slot=>slot.order),section.slots.map((_,index)=>index+1));
  }
});
