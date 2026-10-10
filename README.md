# QuakeNet

Experimental shared phone motion and community coordination demo. Not earthquake prediction or verified emergency detection.

Node 22.12+ recommended. Run `npm install`, `cp .env.example .env`, then `npm run dev`. Open http://localhost:5173. Checks: `npm run typecheck`, `npm run build`, `npm test`.

## Phone-first setup

Use **My phone** on phones and **Live dashboard** on the laptop. Enter the same room code (for example HINTON-4), but distinct test display names. Joining does not start sensors. Enable motion from a button press, then Start sharing. Stop sharing removes the listener. Keep the phone page active; background capture is not supported. The responsive web UI uses large touch controls. Expo is a possible later native capture client sharing the same backend/contracts, not included in this first pass.

Phone motion requires a trusted HTTPS origin. The default LAN HTTP URL can load the interface but cannot capture motion. For early testing, use your team's trusted HTTPS reverse proxy/tunnel to **Vite port 5173**; it must forward WebSocket upgrades and `/socket.io` and `/api` through Vite. Keep the backend behind that proxy. Alternatively configure Vite `server.https` with a locally trusted certificate covering the laptop's LAN hostname/IP, and install/trust the issuing development CA on each test phone. Certificate/trust and tunnel provisioning are not automated here. Use test-only data; the foundation has no production authentication.

On iOS, request motion permission from the Enable motion button. On Android, check browser sensor/site permissions. A message appears if no readings arrive within four seconds. Simulator/emulator readings do not count as physical phone verification. Test two real phones early. Device identity and packet sequence persist in localStorage across reconnects; multiple tabs share one device. Rooms and events reset when the backend restarts. Switching rooms for an existing device is not implemented.

## Real Spectrum round-trip blocker and steps

There is no `.env`, project credential or provisioned phone number in this checkout. Real messaging has not been verified. The app uses only a labeled developer mock outbox.

1. Open https://app.photon.codes/dashboard; create/select the team project, obtain its project ID and secret, and provision a managed iMessage line. The supplied promo is `HACKWITHPHOTON`; redemption is untested. If it fails, record the dashboard error and ask the sponsor.
2. Put `PHOTON_PROJECT_ID` and `PHOTON_PROJECT_SECRET` into root `.env` locally. Never commit secrets or real contacts. Do not use `VITE_` for backend credentials.
3. Run `npm run photon:roundtrip -w @quakenet/server`. From a test iPhone, text the provisioned agent number over iMessage. The separate probe receives one text and sends a DEMO connectivity reply, then stops. Verify the reply is actually delivered on that phone; provider acceptance alone is not delivery evidence.
4. D must connect explicit messaging consent, private sender mapping, original reply storage, durable duplicate-message handling and contextual authorized intents before integrating transport with the board. Gemini is only an interface scaffold. No arbitrary tools or unrestricted writes.

The scaffold follows [official Spectrum quickstart](https://photon.codes/docs/spectrum-ts/getting-started) and [cloud iMessage provider](https://photon.codes/docs/spectrum-ts/providers/imessage), inspected October 10, 2026. The supplied sponsor Notion guidelines could not be retrieved and must still be reviewed by the team. A generic messaging webhook does not satisfy the intended Spectrum submission.

## Ownership and verification

See [contracts](docs/contracts.md), [architecture](docs/architecture.md), [team tasks](docs/team-tasks.md), [track alignment](docs/track-alignment.md) and [demo script](docs/demo-script.md). A: real phone testing; B: detection; C: dashboard/workflow polish; D: real Spectrum round trip first, then agent integration.

Verified: TypeScript/build, repository identity/deduplication/manual-event tests, and a local two-client Socket.IO smoke check through the Vite proxy (synthetic readings, board and mock outbox). Unverified: physical-phone motion, browser visual QA, real Spectrum delivery, Gemini, sponsor eligibility/guidelines. Automatic correlation, requests/confirmation and volunteer workflows are intentionally unfinished.

`npm install` reported 18 moderate dependency advisories; review dependency paths before deployment. No forced dependency upgrades were applied. Build emits the web bundle and server type-checked JS; development uses tsx and source workspace contracts. A production server launch/package is future work.
