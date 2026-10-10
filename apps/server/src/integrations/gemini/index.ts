import {AgentIntentSchema,type AgentIntent} from '@quakenet/shared';
import type {InboundReply} from '../photon/index.js';
export interface ReplyContext {memberId:string;communityId:string;activeEventIds:string[];pendingRequestIds:string[]}
export interface ReplyInterpreter {interpret(reply:InboundReply,context:ReplyContext):Promise<AgentIntent>}
export function validateProposedIntent(value:unknown):AgentIntent{return AgentIntentSchema.parse(value);}
export class GeminiScaffold implements ReplyInterpreter {
 async interpret(_reply:InboundReply,_context:ReplyContext):Promise<AgentIntent>{return {kind:'clarify'};}
}
// TODO D: backend Gemini structured output adapter. Never let model output alone
// confirm publication, expose contact details, or assign a volunteer. Application
// functions verify membership, event context, explicit confirmation and targets.
