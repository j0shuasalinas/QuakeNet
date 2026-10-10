import {useEffect,useRef,useState} from 'react';
import type {SensorReading} from '@quakenet/shared';
type MotionPermission=typeof DeviceMotionEvent & {requestPermission?:()=>Promise<string>};
export function useMotion(deviceId:string,send:(reading:SensorReading)=>void){
 const [enabled,setEnabled]=useState(false);const [mode,setMode]=useState<'phone'|'simulation'|null>(null);const [error,setError]=useState('');const [live,setLive]=useState<SensorReading>();
 const callback=useRef(send);callback.current=send;
 const sequence=useRef(Number(localStorage.getItem('quakenet.sequence')||0));
 async function enable(){
  setError('');
  if(!window.isSecureContext){setError('Motion needs HTTPS on phones. Use the HTTPS setup in README.');return;}
  if(typeof DeviceMotionEvent==='undefined'){setError('Motion is unsupported here. Try Safari on iPhone or Chrome on Android; simulation is available for development.');return;}
  try{const request=(DeviceMotionEvent as MotionPermission).requestPermission;if(request&&await request.call(DeviceMotionEvent)!=='granted'){setError('Motion permission denied. Allow Motion & Orientation in browser settings and retry.');return;}setEnabled(true);}catch{setError('Motion permission could not be enabled. Check browser settings and HTTPS.');}
 }
 useEffect(()=>{
  if(!mode)return;
  let last=0;let received=false;
  const publish=(x:number,y:number,z:number,includesGravity:boolean)=>{
   if(Date.now()-last<100)return;last=Date.now();received=true;sequence.current++;
   localStorage.setItem('quakenet.sequence',String(sequence.current));
   const reading:SensorReading={deviceId,timestamp:Date.now(),sequence:sequence.current,x,y,z,includesGravity,source:mode};setLive(reading);callback.current(reading);
  };
  const listener=(event:DeviceMotionEvent)=>{const a=event.acceleration;const linear=a&&a.x!==null&&a.y!==null&&a.z!==null;const value=linear?a:event.accelerationIncludingGravity;if(value&&value.x!==null&&value.y!==null&&value.z!==null)publish(value.x,value.y,value.z,!linear);};
  let interval:ReturnType<typeof setInterval>|undefined;
  if(mode==='phone')window.addEventListener('devicemotion',listener);
  else interval=setInterval(()=>publish(Math.sin(Date.now()/180)*2,Math.cos(Date.now()/200),0.3,false),100);
  const timeout=setTimeout(()=>{if(!received)setError('No motion readings received. Check browser support and motion permission, or try another phone browser.');},4000);
  return()=>{window.removeEventListener('devicemotion',listener);clearInterval(interval);clearTimeout(timeout);};
 },[mode,deviceId]);
 return {enabled,mode,error,live,enable,start:()=>setMode('phone'),simulate:()=>setMode('simulation'),stop:()=>setMode(null)};
}
