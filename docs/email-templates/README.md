# Email template copy (canonical)

Authoritative plain-text copy for the six core participant emails (`registration`, `welcomeOwner`, `welcomeCoWorker`, `waiting`, `ask4Token`, `emailExists`) in en / nl / fr.

| Language | File |
|----------|------|
| English | [en.md](en.md) |
| Dutch | [nl.md](nl.md) |
| French | [fr.md](fr.md) |

When changing these templates:

1. Edit the markdown file(s) first.
2. Mirror the same wording in [`apps/api/src/mailer/seed-email-templates.ts`](../../apps/api/src/mailer/seed-email-templates.ts) (`contentPlain` + HTML `contentRich` with `<a href="{{url}}">` and `mailto:info@coderdojobelgium.be`).
3. Rebuild the API and run `npm run sync-copy --workspace=apps/api` (CLI: `event:sync-copy`) to upsert the six core `EmailTemplates` rows for the active event. On a deployed API host, run `node cli event:sync-copy` from the app directory. Reminder and owner-change templates are not overwritten.

Conventions (all languages):

- Contact footer: `info@coderdojobelgium.be` — no FAQ links.
- Localized project link label: EN *Go to my project*, NL *Ga naar mijn project*, FR *Accéder à mon projet* — not `Go2MyProject`.
- No “copy between quotes” URL instructions; use click-the-link + fallback copy-paste line.

Other template types (`dailyReminder`, `registrationReminder`, `notifyNewProjectOwner`, `notifyProjectParticipantLeft`, `accountDeleted`) are only in the seed file until copy is approved.

See [apps/api.md](../apps/api.md#email-templates) for runtime behaviour and Handlebars context.
