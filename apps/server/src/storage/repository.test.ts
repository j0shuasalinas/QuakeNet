import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {MemoryRepository} from './repository.js';
test('reconnect preserves member; rejects impersonation and duplicate/stale packets',()=>{
 const repo=new MemoryRepository();const deviceId=randomUUID();const input={deviceId,displayName:'Maya',roomCode:'HINTON-4'};const joined=repo.join(input);
 assert.throws(()=>repo.join(input));assert.equal(repo.join({...input,sessionToken:joined.sessionToken}).member.memberId,joined.member.memberId);
 const reading={deviceId,timestamp:100000,sequence:1,x:1,y:2,z:3,includesGravity:false,source:'phone' as const};
 assert.equal(repo.ingest(joined.member,reading,100000),true);assert.equal(repo.ingest(joined.member,reading,100000),false);assert.equal(repo.ingest(joined.member,{...reading,sequence:2,timestamp:1},100000),false);
 assert.equal(repo.snapshot(joined.member.communityId).traces.length,1);
});
test('manual event is idempotent and only enrolled members receive mock messages',()=>{
 const repo=new MemoryRepository();const a=repo.join({deviceId:randomUUID(),displayName:'A',roomCode:'HINTON-4'}).member;repo.join({deviceId:randomUUID(),displayName:'B',roomCode:'HINTON-4'});repo.enroll(a,true);repo.createDemo(a);repo.createDemo(a);
 const room=repo.snapshot(a.communityId);assert.equal(room.events.length,1);assert.equal(room.checkins.length,2);assert.equal(room.outbox.length,1);assert.equal(room.outbox[0].delivery,'mock');assert.equal(room.checkins[0].state,'no_response');
});
