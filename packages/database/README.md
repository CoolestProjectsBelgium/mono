# @coolestprojects/database

Shared Sequelize-TypeScript models for the Coolest Projects platform. Consumed by `@coolestprojects/api` (NestJS) and `@coolestprojects/admin` (AdminJS).

## Usage

```typescript
import { User, Event, Project } from '@coolestprojects/database';
```

## Build

After any model change, rebuild from the monorepo root:

```bash
npm run build -w @coolestprojects/database
```

The compiled output is in `dist/`. Both API and Admin depend on this package via npm workspaces (`"@coolestprojects/database": "*"`).

## Adding a model

1. Create `src/models/<name>.model.ts` following existing models (decorators from `sequelize-typescript`).
2. Export from `src/index.ts` (use `.js` extension in the export path).
3. Rebuild the package.
4. Register in `apps/api/src/app.module.ts`.
5. Optionally expose in AdminJS via `apps/admin/src/index.ts`.

## Models

| Model | Purpose |
|-------|---------|
| `Event` | Event configuration and settings |
| `User` | Participant accounts |
| `Registration` | Event registration records |
| `Project` | Submitted projects |
| `Question` / `QuestionTranslation` | Custom registration questions |
| `QuestionRegistration` | Answers per registration |
| `Tshirt` / `TshirtGroup` / translations | T-shirt ordering |
| `Attachment` / `AzureBlob` | File uploads |
| `EmailTemplate` | Handlebars email templates |
| `Voucher` | Invite tokens for co-participants |
| `Vote` / `VoteCategory` | Voting system |
| `Award` / `Certificate` | Event awards |
| `Location` / `EventTable` / `ProjectTable` | Venue layout |
| `Account` | Admin user accounts |
| `Message` / `Hyperlink` | Event content |

## Related docs

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — model registration workflow
- [apps/api](../../apps/api) — NestJS API consuming these models
