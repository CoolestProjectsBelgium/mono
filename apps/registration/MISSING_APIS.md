# API status

## Wired endpoints

- POST /login — JWT activation + session cookie
- POST /login/mailToken — sends login/registration token via Mailhog in dev
- POST /login/logout — clears session cookie
- GET/PATCH/DELETE /userinfo — profile CRUD
- POST /participant — generates invite voucher token
- DELETE /participant/:id — removes co-participant from project
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

## Not in scope (separate voting app)

- Vote/VoteCategory — voting API exists but no registration UI yet
