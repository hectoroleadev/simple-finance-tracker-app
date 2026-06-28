import { test, expect } from '@playwright/test';

test.describe('Simple Finance Tracker Critical Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to initialize (auth check)
    await page
      .locator('.animate-spin')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});

    // Wait for either the dashboard to load (if already logged in) or the login page to appear
    const isLogin = await Promise.race([
      page
        .waitForURL(/.*dashboard.*/, { timeout: 8000 })
        .then(() => false)
        .catch(() => true),
      page
        .getByRole('heading', { name: /Login|Iniciar Sesión/i })
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => true)
        .catch(() => false),
    ]);

    if (isLogin && page.url().includes('login')) {
      const username = process.env.PLAYWRIGHT_TEST_USERNAME;
      const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
      if (!username || !password) {
        test.skip(true, 'PLAYWRIGHT_TEST_USERNAME / PLAYWRIGHT_TEST_PASSWORD not set');
        return;
      }
      await page.getByPlaceholder(/Your username|Usuario/i).fill(username);
      await page.getByPlaceholder(/••••••••/i).fill(password);

      // Click and wait for navigation
      await page
        .getByRole('button', { name: /Login|Iniciar Sesión/i })
        .first()
        .click();
      await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
    }

    // Wait for any data-fetching loading spinner to disappear
    await page
      .locator('.animate-spin')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    // Ensure the dashboard content actually loaded (not showing an error boundary)
    // and wait for network to settle so background refetches don't interfere with mutations
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  });

  test('User can see dashboard and stats format', async ({ page }) => {
    // Basic verification
    await expect(page).toHaveTitle(/Simple Finance Tracker/i);

    // Check if stats are rendered accurately (matching uppercase UI)
    await expect(page.getByText('TOTAL INCOME')).toBeVisible();
    await expect(page.getByText('NET BALANCE')).toBeVisible();
    await expect(page.getByText('RETIREMENT CAPITAL')).toBeVisible();
    await expect(page.getByText('NET WORTH')).toBeVisible();
  });

  test('User can add a new item to a category', async ({ page }) => {
    // Unique name per run so the test never collides with leftover data and stays idempotent
    const itemName = `E2E Item ${Date.now()}`;

    // The add button's accessible name is "<addItem>: <category name>". The category name
    // ("Pending Payments") is stored data, not translated, so match on it to stay language-agnostic.
    const addButton = page.getByRole('button', { name: /Pending Payments/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Adding optimistically inserts a row in edit mode with the name input auto-focused.
    // getByRole('textbox') matches the only text input on the page (the editing row).
    const nameInput = page.getByRole('textbox').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    await nameInput.fill(itemName);
    await page.keyboard.press('Tab');

    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('1200');
    await page.keyboard.press('Enter');

    // The saved item appears in the list
    await expect(page.getByText(itemName)).toBeVisible({ timeout: 10000 });

    // Clean up: delete the item so the test leaves no residual data behind
    const row = page.locator('div.group.animate-fade-in').filter({ hasText: itemName });
    await row.hover();
    await row.getByRole('button', { name: /^Delete$|^Eliminar$/i }).click();

    // Confirm the deletion in the dialog
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^Delete$|^Eliminar$/i })
      .click();

    await expect(page.getByText(itemName)).toHaveCount(0);
  });

  test('User can save a snapshot and view it in History tab', async ({ page }) => {
    // The snapshot button's accessible name includes "snapshot" in all states
    // (e.g. "Record Snapshot" with no prior snapshot, "Last snapshot X ago" otherwise)
    const snapshotBtn = page.getByRole('button', { name: /snapshot/i }).first();
    await expect(snapshotBtn).toBeVisible({ timeout: 10000 });
    await snapshotBtn.click();

    // Clicking opens a confirmation dialog — confirm it
    const saveBtn = page.getByRole('button', { name: /^save$|^guardar$/i });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();

    // Navigate to the History tab manually (snapshot does not auto-navigate)
    await page.getByRole('button', { name: /^History$|^Historial$/i }).first().click();

    // Confirm the URL updated to the history route
    await expect(page).toHaveURL(/.*history$/);

    // The history virtual list should be visible
    await expect(page.locator('.virtual-list').first()).toBeVisible();
  });
});
