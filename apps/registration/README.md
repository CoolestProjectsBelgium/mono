# @coolestprojects/registration

Nuxt 3 single-page application for Coolest Projects event registration. Supports Dutch, French, and English via `@nuxtjs/i18n`.

## Quick start

From the monorepo root (inside the dev container):

```bash
npm run dev -w @coolestprojects/registration
```

Open https://registration.coolestprojects.localhost:8443

The app proxies API requests to `/_api`, which nginx forwards to the NestJS API on port 3001.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev -w @coolestprojects/registration` | Development server (port 3004) |
| `npm run build -w @coolestprojects/registration` | Production build |
| `npm run preview -w @coolestprojects/registration` | Preview production build |
| `npm test -w @coolestprojects/registration` | Unit tests (Vitest) |
| `npm run test:watch -w @coolestprojects/registration` | Vitest watch mode |

## Tech stack

- **Nuxt 3** — SPA mode (`ssr: false`)
- **Pinia** — state management
- **Tailwind CSS** — styling via `@nuxtjs/tailwindcss`
- **Zod** — client-side validation
- **Vitest** + `@nuxt/test-utils` — unit tests

## Project structure

```
apps/registration/
├── components/       # Vue components
├── composables/      # useApiClient.ts — typed API wrapper
├── pages/            # Route pages
├── stores/           # Pinia stores
├── locales/          # i18n translation files (nl, fr, en)
├── nuxt.config.ts
└── MISSING_APIS.md   # API integration status
```

## API client

All backend calls go through `composables/useApiClient.ts`. The runtime API base is set by `NUXT_PUBLIC_API_BASE` (defaults to `/_api` in the dev container).

For direct API access during debugging: https://api.coolestprojects.localhost:8443

## API integration status

See [MISSING_APIS.md](./MISSING_APIS.md) for wired endpoints, legacy path changes, and out-of-scope voting UI.

## Related docs

- [apps/api](../api) — NestJS backend
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — frontend conventions
- [README.md](../../README.md) — local URLs and environment
