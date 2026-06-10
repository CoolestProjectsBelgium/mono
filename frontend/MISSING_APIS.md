# API gaps (routes exist; data may be missing)

## Routes that return `null` (controller not wired to service)

| Endpoint | Controller | Service exists? | UI impact |
|----------|------------|-----------------|-----------|
| POST /login | login.controller.ts | Yes — activateRegistration in registration.service | Magic-link activation returns null; no session cookie |
| POST /login/mailToken | login.controller.ts | No dedicated service yet | Magic-link email not sent |
| POST /login/logout | login.controller.ts | — | Logout no-op |
| GET/PATCH/DELETE /userinfo | userinfo.controller.ts | No service module yet | Profile empty/disabled |
| POST /participant | participant.controller.ts | Yes — participant.service.generateParticipantVoucher | Cannot generate invite tokens |
| DELETE /participant/:id | participant.controller.ts | — | Cannot remove co-participant |

## Fully implemented (call directly)

- GET/POST/PATCH/DELETE /projectinfo
- POST/DELETE /attachments, POST /attachments/:name/sas
- GET /settings, /tshirts, /questions, /approvals; POST /registration

## Path changes from legacy

| Legacy | Mono |
|--------|------|
| POST /register | POST /registration |
| POST /participants | POST /participant |
| POST /mailToken | POST /login/mailToken |
| POST /login with Bearer token | POST /login with body `{ jwt }` |
| POST /logout | POST /login/logout |

## Blocked on login cookie (routes work once /login returns data)

- /projectinfo, /attachments, /userinfo, /participant — all have AuthGuard

## Not in scope (separate voting app)

- Vote/VoteCategory — no HTTP routes yet
