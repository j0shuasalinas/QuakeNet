import {Spectrum} from 'spectrum-ts';
import {imessage} from 'spectrum-ts/providers/imessage';
export interface InboundReply {messageId:string;senderId:string;text:string;receivedAt:number}
export interface MessagingAdapter {send(memberId:string,text:string):Promise<{delivery:'mock'|'provider_accepted'}>}
export interface PrivateMessagingEnrollment {memberId:string;messagingIdentifier:string;consentedAt:number}
// Server only. Deliberately not wired to the application until identity mapping,
// durable idempotency, explicit enrollment and contextual action validation exist.
export async function createSpectrumScaffold(){
 const projectId=process.env.PHOTON_PROJECT_ID;const projectSecret=process.env.PHOTON_PROJECT_SECRET;
 if(!projectId||!projectSecret)throw new Error('Missing PHOTON_PROJECT_ID and PHOTON_PROJECT_SECRET; provision a managed iMessage line in the Photon dashboard.');
 return Spectrum({projectId,projectSecret,providers:[imessage.config()]});
}
export class MockMessagingAdapter implements MessagingAdapter {
 readonly outbox:Array<{memberId:string;text:string;delivery:'mock'}>=[];
 async send(memberId:string,text:string){this.outbox.push({memberId,text,delivery:'mock'});return {delivery:'mock' as const};}
}
// TODO D: consume app.messages tuples; verify message.platform === 'imessage';
// persist inbound message IDs before actions; map sender to opted-in member;
// preserve original text; resolve room/event/request; send only authorized updates.
