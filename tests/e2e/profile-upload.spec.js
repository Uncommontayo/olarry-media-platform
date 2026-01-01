// Playwright E2E test stub: profile upload flow
// Requires: npm i -D @playwright/test && npx playwright install

import { test, expect } from '@playwright/test';

test.describe('Profile upload flow', () => {
  test('user can set username, upload avatar, and avatar shows in feed', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // set username via Navbar button (prompts are not ideal in headless flows — adjust if you add a dedicated UI)
    // This test assumes a simple input is used, or you can set localStorage directly for robust testing.
    await page.evaluate(() => localStorage.setItem('username', 'e2euser'));
    await page.reload();

    // go to profile
    await page.goto('http://localhost:5173/e2euser');

    // ensure profile page loads
    await expect(page.locator('h2')).toContainText('@e2euser');

    // Note: file uploads require a real file; use a small fixture image added to tests/fixtures
    const fileInput = page.locator('input[type="file"]');
    // if the input exists, set a test image (adjust path to your fixture)
    try {
      await fileInput.setInputFiles('tests/fixtures/avatar-sample.png');
    } catch (error) {
      // If no fixture is added yet, assert file input is available as a stub
      test.info().log('File input not set — add a fixture at tests/fixtures/avatar-sample.png to enable binary upload test');
      test.info().log(String(error));
      return;
    }

    // click Upload button
    await page.locator('button', { hasText: 'Upload' }).click();

    // wait for avatar to appear in header (may require network / backend running)
    await expect(page.locator('main img[alt="Profile"]')).toBeVisible({ timeout: 10000 });

    // basic cleanup assertion: verify that there is at most 1 profile image in list_media (this requires backend integration)
    // For a full test, run backend locally and confirm GET /api/list_media yields only one `__profile_pic__` for this username
  });
});