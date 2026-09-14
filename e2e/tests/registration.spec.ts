import { expect, test } from '@playwright/test';

// Smoke test only — see docs/e2e/scenarios/registration.md. Deliberately not
// a full registration walkthrough: written without a running Dev Container
// to verify real selectors/copy against, so it sticks to what's safe to
// assert sight-unseen.
test('registration home page loads', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h1')).toBeVisible();
});
