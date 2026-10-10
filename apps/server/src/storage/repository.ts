import {randomUUID} from 'node:crypto';
import type {JoinInput,Member,RoomSnapshot,SensorReading} from '@quakenet/shared';
export interface Repository {
 join(input:JoinInput):{member:Member;sessionToken:string};
 snapshot(communityId:string):RoomSnapshot;
 ingest(member:Member,reading:SensorReading,now?:number):boolean;
 enroll(member:Member,enabled:boolean):void;
 createDemo(member:Member):void;
 stop(member:Member,deviceId:string):void;
}
export class MemoryRepository implements Repository {
 private rooms=new Map<string,RoomSnapshot>();
 private sessions=new Map<string,{member:Member;token:string}>();
 join(input:JoinInput){
  const existing=this.sessions.get(input.deviceId);
  if(existing){
   if(input.sessionToken!==existing.token)throw new Error('Device already registered; reconnect with saved session token.');
   if(this.snapshot(existing.member.communityId).community.roomCode!==input.roomCode)throw new Error('This device is enrolled in another room.');
   return {member:existing.member,sessionToken:existing.token};
  }
  let room=[...this.rooms.values()].find(r=>r.community.roomCode===input.roomCode);
  if(!room){
   const communityId=randomUUID();
   room={community:{communityId,roomCode:input.roomCode,name:`Community ${input.roomCode}`},members:[],traces:[],events:[],checkins:[],requests:[],state:'Monitoring',outbox:[],resources:[
    {resourceId:randomUUID(),communityId,title:'Sample community garden',category:'garden',description:'Example space for shared planting and neighborhood gatherings.',verificationNote:'Sample data — no local organization or location verified.',sample:true},
    {resourceId:randomUUID(),communityId,title:'Sample shared supply shelf',category:'supplies',description:'Example neighborhood seed and tool sharing shelf.',verificationNote:'Sample data — availability unverified; not an emergency resource.',sample:true}
   ]};this.rooms.set(communityId,room);
  }
  const member:Member={memberId:randomUUID(),communityId:room.community.communityId,displayName:input.displayName,messagingEnrolled:false};
  const token=randomUUID();this.sessions.set(input.deviceId,{member,token});room.members.push(member);
  return {member,sessionToken:token};
 }
 snapshot(communityId:string){const room=this.rooms.get(communityId);if(!room)throw new Error('Unknown community');return room;}
 ingest(member:Member,reading:SensorReading,now=Date.now()){
  if(this.sessions.get(reading.deviceId)?.member.memberId!==member.memberId)return false;
  const room=this.snapshot(member.communityId);
  let trace=room.traces.find(t=>t.deviceId===reading.deviceId);
  const last=trace?.readings.at(-1);
  if(reading.timestamp<now-30000||reading.timestamp>now+5000||(last&&(reading.sequence<=last.sequence||reading.timestamp<last.timestamp)))return false;
  if(!trace){trace={deviceId:reading.deviceId,memberId:member.memberId,communityId:member.communityId,lastReceivedAt:now,source:reading.source,readings:[]};room.traces.push(trace);}
  trace.source=reading.source;trace.lastReceivedAt=now;trace.readings.push({...reading,receivedAt:now});trace.readings=trace.readings.slice(-100);return true;
 }
 stop(member:Member,deviceId:string){const room=this.snapshot(member.communityId);const trace=room.traces.find(t=>t.deviceId===deviceId&&t.memberId===member.memberId);if(trace)trace.lastReceivedAt=0;}
 enroll(member:Member,enabled:boolean){member.messagingEnrolled=enabled;}
 createDemo(member:Member){
  const room=this.snapshot(member.communityId);if(room.events.some(e=>e.status==='checkin_active'))return;
  const eventId=randomUUID();room.events.push({eventId,communityId:member.communityId,timestamp:Date.now(),status:'checkin_active',explanation:'Manually triggered developer demo; no automatic detection.',deviceIds:[]});room.state='Check-in active';
  room.checkins=room.members.map(m=>({eventId,memberId:m.memberId,state:'no_response'}));
  for(const m of room.members.filter(m=>m.messagingEnrolled))room.outbox.push({memberId:m.memberId,text:'DEMO — QuakeNet detected shared motion in your test community. Please reply with your status, or request a community check-in.',timestamp:Date.now(),delivery:'mock'});
 }
}
