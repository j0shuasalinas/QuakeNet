import { z } from 'zod';
const id = z.string().uuid();
const timestamp = z.number().finite().nonnegative();
export const CommunitySchema = z.object({communityId:id,roomCode:z.string().regex(/^[A-Z0-9-]{3,24}$/),name:z.string()});
export type Community=z.infer<typeof CommunitySchema>;
export const MemberSchema=z.object({memberId:id,communityId:id,displayName:z.string().trim().min(1).max(40),messagingEnrolled:z.boolean()});
export type Member=z.infer<typeof MemberSchema>;
export const SensorDeviceSchema=z.object({deviceId:id,memberId:id,communityId:id,lastReceivedAt:timestamp,source:z.enum(['phone','simulation'])});
export type SensorDevice=z.infer<typeof SensorDeviceSchema>;
export const SensorReadingSchema=z.object({deviceId:id,timestamp,sequence:z.number().int().nonnegative(),x:z.number().finite().min(-100).max(100),y:z.number().finite().min(-100).max(100),z:z.number().finite().min(-100).max(100),includesGravity:z.boolean(),source:z.enum(['phone','simulation'])});
export type SensorReading=z.infer<typeof SensorReadingSchema>;
export const MotionWindowSchema=z.object({deviceId:id,start:timestamp,end:timestamp,strength:z.number().finite().nonnegative(),sampleCount:z.number().int().nonnegative()});
export type MotionWindow=z.infer<typeof MotionWindowSchema>;
export const CommunityEventSchema=z.object({eventId:id,communityId:id,timestamp,status:z.enum(['demo','checkin_active','closed']),explanation:z.string(),deviceIds:z.array(id)});
export type CommunityEvent=z.infer<typeof CommunityEventSchema>;
export const CheckInStateSchema=z.enum(['no_response','checked_in','checkin_requested','volunteer_acknowledged']);
export const CheckInSchema=z.object({eventId:id,memberId:id,state:CheckInStateSchema,originalReply:z.string().optional()});
export type CheckIn=z.infer<typeof CheckInSchema>;
export const CheckInRequestSchema=z.object({requestId:id,eventId:id,memberId:id,status:z.enum(['pending_confirmation','published','acknowledged']),timestamp});
export type CheckInRequest=z.infer<typeof CheckInRequestSchema>;
export const VolunteerAcknowledgmentSchema=z.object({requestId:id,eventId:id,memberId:id,timestamp});
export type VolunteerAcknowledgment=z.infer<typeof VolunteerAcknowledgmentSchema>;
export const CommunityResourceSchema=z.object({resourceId:id,communityId:id,title:z.string(),category:z.enum(['garden','park','environmental_group','supplies']),description:z.string(),link:z.url().optional(),verificationNote:z.string(),sample:z.boolean()});
export type CommunityResource=z.infer<typeof CommunityResourceSchema>;
export const AgentIntentSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('join'),roomCode:z.string().regex(/^[A-Z0-9-]{3,24}$/)}),
 z.object({kind:z.enum(['community_status','resources','clarify'])}),
 z.object({kind:z.enum(['check_in','request_checkin','confirm_request']),eventId:id.optional()}),
 z.object({kind:z.literal('volunteer'),eventId:id.optional(),requestId:id.optional(),displayName:z.string().optional()})
]);
export type AgentIntent=z.infer<typeof AgentIntentSchema>;
export const JoinSchema=z.object({displayName:z.string().trim().min(1).max(40),roomCode:z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,24}$/),deviceId:id,sessionToken:z.string().uuid().optional()});
export type JoinInput=z.infer<typeof JoinSchema>;
export type Trace=SensorDevice & {readings:Array<SensorReading & {receivedAt:number}>};
export type DashboardState='Monitoring'|'Single-device motion'|'Correlated shaking'|'Check-in active';
export interface RoomSnapshot {community:Community;members:Member[];traces:Trace[];events:CommunityEvent[];checkins:CheckIn[];requests:CheckInRequest[];resources:CommunityResource[];state:DashboardState;outbox:Array<{memberId:string;text:string;timestamp:number;delivery:'mock'}>}
export type JoinResult={ok:true;member:Member;sessionToken:string}|{ok:false;error:string};
export interface ClientToServerEvents {'community:join':(input:JoinInput,reply:(result:JoinResult)=>void)=>void;'sensor:reading':(reading:SensorReading)=>void;'sensor:stop':()=>void;'demo:event':()=>void;'messaging:enroll':(enabled:boolean)=>void}
export interface ServerToClientEvents {'room:snapshot':(snapshot:RoomSnapshot)=>void;'app:error':(error:string)=>void}
