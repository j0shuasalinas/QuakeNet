import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {io,type Socket} from 'socket.io-client';
import type {ClientToServerEvents,ServerToClientEvents,RoomSnapshot,JoinInput,Member} from '@quakenet/shared';
import {useMotion} from './features/sensor/useMotion';
import {Panel} from './components/Panel';
import './styles/theme.css';
const socket:Socket<ServerToClientEvents,ClientToServerEvents>=io({autoConnect:false});
// randomUUID is unavailable on some HTTP LAN origins; allow joining there while
// motion capture still enforces HTTPS. getRandomValues retains random identity.
function identity(){
 let id=localStorage.getItem('quakenet.device');
 if(!id){
  const bytes=crypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  id=`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  localStorage.setItem('quakenet.device',id);
 }
 return id;
}
const deviceId=identity();
function App(){
 const [name,setName]=useState(localStorage.getItem('quakenet.name')||'');const [roomCode,setRoomCode]=useState(localStorage.getItem('quakenet.room')||'HINTON-4');
 const [room,setRoom]=useState<RoomSnapshot>();const [member,setMember]=useState<Member>();const [connected,setConnected]=useState(false);const [error,setError]=useState('');const [joining,setJoining]=useState(false);const [tab,setTab]=useState<'phone'|'dashboard'>('phone');const [clock,setClock]=useState(Date.now());
 const motion=useMotion(deviceId,reading=>{if(socket.connected&&member)socket.emit('sensor:reading',reading);});
 useEffect(()=>{
  const join=()=>{setConnected(true);const input:JoinInput={displayName:localStorage.getItem('quakenet.name')||'',roomCode:localStorage.getItem('quakenet.room')||'HINTON-4',deviceId,sessionToken:localStorage.getItem('quakenet.session')||undefined};
   socket.emit('community:join',input,result=>{setJoining(false);if(result.ok){setMember(result.member);localStorage.setItem('quakenet.session',result.sessionToken);setError('');}else setError(result.error);});};
  const disconnect=()=>setConnected(false);const failure=()=>{setJoining(false);setError('Cannot connect to backend. Check server startup and network.');};
  socket.on('connect',join);socket.on('disconnect',disconnect);socket.on('connect_error',failure);socket.on('room:snapshot',setRoom);socket.on('app:error',setError);
  const timer=setInterval(()=>setClock(Date.now()),1000);
  return()=>{clearInterval(timer);socket.off('connect',join);socket.off('disconnect',disconnect);socket.off('connect_error',failure);socket.off('room:snapshot',setRoom);socket.off('app:error',setError);socket.disconnect();};
 },[]);
 function submit(event:React.FormEvent){event.preventDefault();setJoining(true);localStorage.setItem('quakenet.name',name.trim());localStorage.setItem('quakenet.room',roomCode.toUpperCase());socket.connect();}
 return <main><header><div className="brand">◉ QuakeNet</div><span className="pill">Experimental community demo</span><h1>A little motion.<br/>A closer community.</h1><p>Shared phone traces and neighbor check-ins, together.</p></header>
 <p className="notice">No earthquake prediction or verified emergency detection. Room membership does not prove physical proximity.</p>
 {error&&<p role="alert" className="notice">{error}</p>}
 {!member?<Panel title="Join your test community"><form onSubmit={submit}><label>Display name<input required maxLength={40} value={name} onChange={e=>setName(e.target.value)} autoComplete="nickname"/></label><label>Room code<input required pattern="[A-Za-z0-9-]{3,24}" value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())} autoCapitalize="characters"/></label><button disabled={joining}>{joining?'Connecting…':'Join community'}</button></form><p>You can join without sharing motion. Messaging enrollment is separate.</p></Panel>:<>
 <nav aria-label="Views"><button aria-pressed={tab==='phone'} onClick={()=>setTab('phone')}>My phone</button><button aria-pressed={tab==='dashboard'} onClick={()=>setTab('dashboard')}>Live dashboard</button></nav>
 <div className="connection" role="status">{connected?'● Connected':'○ Reconnecting…'} · {room?.community.roomCode} · {member.displayName}</div>
 {tab==='phone'?<div className="phone"><Panel title="Share motion, by choice"><p>Keep this page open while sharing. Start with your phone resting on a table.</p><button onClick={motion.enable} disabled={motion.enabled}>Enable motion</button><button onClick={motion.start} disabled={!motion.enabled||!connected||motion.mode!==null}>Start sharing</button><button onClick={()=>{motion.stop();socket.emit('sensor:stop');}} disabled={!motion.mode}>Stop sharing</button><p role="status">{motion.mode==='simulation'?'SIMULATED SENSOR — developer data':motion.mode==='phone'?'Sharing phone motion':motion.enabled?'Motion enabled; sharing stopped':'Motion is off'}</p>{motion.error&&<p role="alert">{motion.error}</p>}<div className="readings">{['x','y','z'].map(axis=><div key={axis}><span>{axis.toUpperCase()} · m/s²</span><strong>{motion.live?.[axis as 'x'|'y'|'z'].toFixed(2)??'—'}</strong></div>)}</div><p>{motion.live?.includesGravity?'Includes gravity — uncalibrated':'Linear acceleration when available — uncalibrated'}</p><details><summary>Developer sensor simulation</summary><p>Simulated data never counts as real phone evidence.</p><button onClick={motion.simulate} disabled={!connected||!!motion.mode}>Start labeled simulation</button></details></Panel>
 <Panel title="Messaging participation"><label className="check"><input type="checkbox" checked={room?.members.find(m=>m.memberId===member.memberId)?.messagingEnrolled??false} onChange={e=>socket.emit('messaging:enroll',e.target.checked)}/>Enroll in developer mock check-ins</label><p>Independent of sensors. No phone number collected; real iMessage enrollment remains to be implemented.</p></Panel></div>:<div className="grid">
 <Panel title="Live community traces"><span className="pill">{room?.state||'Monitoring'}</span><p>Detection scaffold — thresholds and correlation are not implemented.</p>{!room?.traces.length&&<p>Start sharing on a phone in this room to see its trace.</p>}{room?.traces.map(trace=><article key={trace.deviceId}><h3>{room.members.find(m=>m.memberId===trace.memberId)?.displayName} <span className="pill">{trace.source==='simulation'?'SIMULATION':'Phone'}</span></h3><p>{clock-trace.lastReceivedAt>5000?'Stopped / stale':'Receiving'} · {trace.deviceId.slice(0,8)}</p><svg viewBox="0 0 400 100" role="img" aria-label="Acceleration magnitude trace in meters per second squared"><line x1="0" y1="90" x2="400" y2="90" stroke="#bccdd5"/><polyline fill="none" stroke={trace.source==='simulation'?'#8b4b11':'#087c8a'} strokeWidth="3" points={trace.readings.map((r,i)=>`${i*400/99},${90-Math.min(80,Math.hypot(r.x,r.y,r.z)*5)}`).join(' ')}/></svg><small>Magnitude 0–16+ m/s² · last 100 readings · {trace.readings.at(-1)?.includesGravity?'includes gravity':'linear acceleration'}</small></article>)}</Panel>
 <Panel title="Event & check-in board"><p>No response means no reply received. It says nothing about safety.</p><button onClick={()=>socket.emit('demo:event')} disabled={!connected||room?.state==='Check-in active'}>Create manual DEMO check-in</button>{room?.events.map(e=><p key={e.eventId}>{e.explanation}</p>)}{room?.checkins.map(c=><div className="board-row" key={`${c.eventId}-${c.memberId}`}><strong>{room.members.find(m=>m.memberId===c.memberId)?.displayName}</strong><span>{c.state.replaceAll('_',' ')}</span></div>)}<p>Reply interpretation, confirmed requests and volunteer acknowledgment are teammate work. Acknowledgment will not mean completion.</p></Panel>
 <Panel title="Community Nature & Resources"><p>Curated sample data · not verified emergency shelters or evacuation locations.</p>{room?.resources.map(resource=><article key={resource.resourceId}><span className="pill">{resource.category} · sample</span><h3>♧ {resource.title}</h3><p>{resource.description}</p><small>{resource.verificationNote}</small></article>)}</Panel>
 <Panel title="Developer mock outbox"><p>MOCK ONLY — no real message sent or delivered.</p>{!room?.outbox.length&&<p>Enroll in mock messaging, then create a manual event.</p>}{room?.outbox.map((message,i)=><article key={i}><strong>{room.members.find(m=>m.memberId===message.memberId)?.displayName} · simulated delivery</strong><p>{message.text}</p></article>)}</Panel></div>}
 </>}<footer>QuakeNet · first-pass foundation · nature, neighbors, and transparent experiments</footer></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
