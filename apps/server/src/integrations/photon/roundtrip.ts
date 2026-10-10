import {createSpectrumScaffold} from './index.js';
// Opt-in manual transport probe, separate from the mock application.
// A judge/tester texts the provisioned agent number; the agent sends one reply.
const app=await createSpectrumScaffold();
try{
 for await(const [space,message] of app.messages){
  if(message.platform!=='imessage'||message.content.type!=='text')continue;
  await space.send('DEMO — QuakeNet Spectrum transport test received your message. This is a connectivity test, not an emergency check-in.');
  console.log('Real inbound received; outbound accepted by Spectrum. Verify delivery on the test phone.');
  break;
 }
}finally{await app.stop();}
