# Shared contracts

Zod schemas in packages/shared/src/index.ts are authoritative. Member IDs and device IDs are separate. UUIDs identify records; timestamps are epoch milliseconds. Board members contain display names and enrollment flags only. Messaging addresses stay in server-only storage.

Socket client messages: community:join (validated JoinInput plus acknowledgment), sensor:reading (validated SensorReading), sensor:stop, messaging:enroll (boolean), demo:event (manual development event). Server messages: room:snapshot (RoomSnapshot), app:error (string). Join returns a private session token; reconnect must present it. Never share tokens.

Readings use server receipt time for traces. Retain device timestamp for later alignment. Reject non-increasing sequence numbers, timestamps older than 30 seconds or over 5 seconds ahead, and backwards device timestamps. A new socket does not create a new device. Restart sequences using the saved counter. No sensor packets create automatic events in this first pass.

Every check-in, request and acknowledgment is scoped to eventId. Event lifecycle: demo -> checkin_active -> closed (later implementation). Manual demo creation directly activates check-ins. no_response means no reply received, never unsafe. Future request lifecycle: pending_confirmation -> published only by explicit confirmation -> acknowledged by a different member. Acknowledgment does not complete a request. Original reply text is retained separately; resolving ambiguous events/requests requires clarification. LLM output must pass AgentIntentSchema and application authorization; it cannot authorize a confirmation.
