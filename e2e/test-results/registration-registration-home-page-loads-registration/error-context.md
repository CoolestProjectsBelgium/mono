# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: registration.spec.ts >> registration home page loads
- Location: tests/registration.spec.ts:7:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at https://registration.coolestprojects.localhost:8443/
Call log:
  - navigating to "https://registration.coolestprojects.localhost:8443/", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | // Smoke test only — see docs/e2e/scenarios/registration.md. Deliberately not
  4  | // a full registration walkthrough: written without a running Dev Container
  5  | // to verify real selectors/copy against, so it sticks to what's safe to
  6  | // assert sight-unseen.
  7  | test('registration home page loads', async ({ page }) => {
> 8  |   const response = await page.goto('/');
     |                               ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at https://registration.coolestprojects.localhost:8443/
  9  |   expect(response?.ok()).toBeTruthy();
  10 |   await expect(page.locator('h1')).toBeVisible();
  11 | });
  12 | 
```