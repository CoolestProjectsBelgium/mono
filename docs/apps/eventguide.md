# Event guide app

## Purpose

Nuxt 3 SPA for Coolest Projects Belgium attendees on event day: browse all projects in a sorted list or on an interactive floor-plan map. Ports the legacy `projectview_list` + `projectview_map` from [coolestproject-backend/website](https://github.com/CoolestProjectsBelgium/coolestproject-backend/tree/2024/website).

## Stack

- Nuxt 3, Vue 3, TypeScript (SPA: `ssr: false`)
- Tailwind CSS — same design tokens as registration/voting (`primary` `#00AEA9`, shared shell components)
- Pinia for caching project data between list ↔ map navigation
- Leaflet (`L.CRS.Simple`) for the venue floor plan
- Vitest (`@nuxt/test-utils`)

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/eventguide/pages/index.vue` | Project list (current event) |
| `apps/eventguide/pages/map.vue` | Interactive map (current event) |
| `apps/eventguide/pages/event/[eventId]/index.vue` | Project list for a specific event |
| `apps/eventguide/pages/event/[eventId]/map.vue` | Map for a specific event |
| `apps/eventguide/composables/useEventguideProjects.ts` | Fetches project data from API |
| `apps/eventguide/composables/useFloorplanMap.ts` | SVG table bounds + map layer helpers |
| `npm run start:dev --workspace=apps/eventguide` | Dev server (port 3002 in Dev Container) |
| `npm run test --workspace=apps/eventguide` | Vitest suite |

Local URL (via proxy): `https://eventguide.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `EventguideController` at `/eventguide/*` (public, no auth):
  - `GET /eventguide/projects` — current active event (via `InfoInterceptor`)
  - `GET /eventguide/events/:eventId/projects` — explicit event (including past events)
  - `GET /eventguide/attachments/:attachmentId/thumbnail` — confirmed project photo (photo consent required)
- API base: `NUXT_PUBLIC_API_BASE_URL` (default `https://api.coolestprojects.localhost:8443`). On `https://eventguide.coolestprojects.localhost:8443` dev, Nitro proxies `/eventguide/**` → port 3001.
- Does not import `@coolestprojects/database` directly

## Key flows

### Event selection

- `/` and `/map` use the API active event (date window in `InfoInterceptor`).
- `/event/:eventId` and `/event/:eventId/map` load a specific event by ID (for archives or staff testing).

### Project list

Fetches `EventguideProjectsResponse` (`event` metadata + `projects[]`). Projects are sorted by table number. Accordion rows show language badge, photo-consent icon, participants, description, and optional thumbnail. “Show on map” opens a modal highlighting the table on the SVG floor plan.

### Map view

Leaflet renders `public/map.svg` (or `Event.floorplanPath`) with searchable table polygons. Clicking a table opens a popup with project details. Search filters by project name or participant names.

### Photo consent

`agreedToPhoto` is `true` only when every registered participant (owner + co-participants) has a `QuestionUser` row for the `"Agree to Photo"` question. Thumbnails are omitted when consent is missing.

## Out of scope / unknowns

- Staff planning grid, presentation modes, QR codes, `projects.json` export
- UI copy is English for v1 (no `@nuxtjs/i18n` yet)
- SMS public voting links in map popups

## Status

Status: deep
