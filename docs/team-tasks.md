# Team ownership and next tasks

Agree on packages/shared/src/index.ts and docs/contracts.md before dependent work. Propose contract changes together; preserve event-scoped IDs and private contacts.

| Owner / branch | Next task | Dependency | Acceptance criteria |
|---|---|---|---|
| A / feat/phone-sensors | Test two real phones over HTTPS, permission denial, start/stop and reconnect; extract native Expo capture only if needed | Running backend and shared contracts | Two distinct physical devices show real traces on laptop; repeated tabs/reconnects remain one device; denied/unsupported browsers explain recovery; log device/browser evidence |
| B / feat/detection-engine | Implement calibration, gravity-aware strength, alignment, sustained overlap, stale exclusion, deduplication and cooldown behind DetectionEngine | A's real readings, contracts | Single-device motion never triggers; >=2 distinct real devices sustain aligned activity; one explained DEMO event; configurable experimental thresholds; simulated data excluded from real evidence |
| C / feat/community-dashboard | Split App into pages/features, improve live traces, event board, confirmed requests, acknowledgment and resources | B event lifecycle, D action functions | Mobile and laptop views readable; keyboard focus/contrast verified; event-scoped display names; acknowledgment never marks completed; sample resources remain labeled |
| D / feat/imessage-agent | Provision real line and run transport probe first; add explicit enrollment, stored identity/context, Gemini structured intents and validated application handlers | Photon credentials/line, contracts, event context | One real inbound and outbound verified on phone; judge can text agent; duplicates have no side effects; confirmation gates public requests; ambiguous event/target asks clarification; stored resources returned |

Works now: root dev/build/typecheck; health endpoint; validated room joins; reconnect identity; real-time traces; browser motion hook; labeled simulation; manual event/check-in board; sample resources; mock enrollment/outbox; typed SDK scaffold.

Mocked: message delivery and enrollment. Scaffolds: automatic detection, natural-language interpretation, confirmation/request/volunteer workflows. Unverified: two physical phones, rendered visual/keyboard QA, real iMessage round trip, Gemini calls, sponsor guidelines, promo redemption, Beginner history.

Use separate checkouts/worktrees for concurrent work. Suggested commands: `git worktree add ../QuakeNet-phone -b feat/phone-sensors`, with analogous branches for other owners. Install dependencies per checkout; use separate ports if running concurrently. Serialize staging/commits if sharing one checkout. No force push, history rewriting, or remote push without team instruction.
