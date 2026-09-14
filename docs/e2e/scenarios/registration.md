# Scenario: registration start page loads

**Status:** automated — `e2e/tests/registration.spec.ts`

**App:** `apps/registration`

## Flow

1. Open the registration app's home page.
2. The page responds successfully and shows a heading (the rules/intro content — see [../../user-guide/registration.md](../../user-guide/registration.md)).

## Expected outcome

Page loads (HTTP response ok) and an `h1` is visible.

## Notes

Deliberately a smoke test, not a full registration walkthrough (rules acceptance → join/create project → upload → confirmation) — that needs real selectors verified against a running app, which is the natural next scenario to automate once someone can iterate against the Dev Container. Not run in CI yet.
