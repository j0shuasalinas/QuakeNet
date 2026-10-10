import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {JoinSchema,SensorReadingSchema,type Member,type ClientToServerEvents,type ServerToClientEvents} from '@quakenet/shared';
import {MemoryRepository} from './storage/repository.js';
const app=express();const http=createServer(app);const repository=new MemoryRepository();
const io=new Server<ClientToServerEvents,ServerToClientEvents>(http,{cors:{origin:process.env.WEB_ORIGIN||'http://localhost:5173'},maxHttpBufferSize:16384});
app.get('/api/health',(_req,res)=>res.json({ok:true,mode:'demo',messaging:'mock',detection:'scaffold'}));
const broadcast=(member:Member)=>io.to(member.communityId).emit('room:snapshot',repository.snapshot(member.communityId));
io.on('connection',socket=>{
 let member:Member|undefined;let deviceId:string|undefined;let lastPacket=0;
 socket.on('community:join',(input,reply)=>{
  if(typeof reply!=='function')return;
  const parsed=JoinSchema.safeParse(input);if(!parsed.success){reply({ok:false,error:'Enter a name and valid room code.'});return;}
  try{const joined=repository.join(parsed.data);if(member)socket.leave(member.communityId);member=joined.member;deviceId=parsed.data.deviceId;socket.join(member.communityId);reply({ok:true,...joined});broadcast(member);}catch(error){reply({ok:false,error:(error as Error).message});}
 });
 socket.on('sensor:reading',input=>{
  if(!member||Date.now()-lastPacket<40)return;lastPacket=Date.now();
  const parsed=SensorReadingSchema.safeParse(input);if(!parsed.success){socket.emit('app:error','Invalid sensor packet');return;}
  if(parsed.data.deviceId!==deviceId)return;
  if(repository.ingest(member,parsed.data))broadcast(member);
 });
 socket.on('sensor:stop',()=>{if(member&&deviceId){repository.stop(member,deviceId);broadcast(member);}});
 socket.on('messaging:enroll',enabled=>{if(member&&typeof enabled==='boolean'){repository.enroll(member,enabled);broadcast(member);}});
 socket.on('demo:event',()=>{if(member){repository.createDemo(member);broadcast(member);}});
});
http.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log('QuakeNet backend :3001 — demo, mock messaging'));
