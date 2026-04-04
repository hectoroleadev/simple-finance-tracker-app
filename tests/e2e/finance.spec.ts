import { test, expect } from '@playwright/test';

test.describe('Simple Finance Tracker Critical Flows', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto('/');

        // Wait for the app to initialize (auth check)
        await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

        // Wait for either the dashboard to load (if already logged in) or the login page to appear
        const isLogin = await Promise.race([
            page.waitForURL(/.*dashboard.*/, { timeout: 8000 }).then(() => false).catch(() => true),
            page.getByRole('heading', { name: /Login|Iniciar Sesión/i }).waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false)
        ]);

        if (isLogin && page.url().includes('login')) {
            await page.getByPlaceholder(/Your username|Usuario/i).fill('hector.test');
            await page.getByPlaceholder(/••••••••/i).fill('Test1234##');
            
            // Click and wait for navigation
            await page.getByRole('button', { name: /Login|Iniciar Sesión/i }).first().click();
            await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
        }

        // Wait for any data-fetching loading spinner to disappear
        await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
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
        // Clicks the '+' button in the Pending Payments section
        const pendingPaymentsSection = page.locator('div, section').filter({ hasText: /Pending Payments/i });
        const addButton = pendingPaymentsSection.getByRole('button').filter({ has: page.locator('svg') });
        
        await addButton.first().click();

        // The input should appear. We expect it to be auto-focused or we can pick it
        const nameInput = page.locator('input[type="text"]');
        await expect(nameInput).toBeVisible();

        await nameInput.fill('E2E Rent');
        await page.keyboard.press('Tab');
        
        const amountInput = page.locator('input[type="number"]');
        await amountInput.fill('1200');
        await page.keyboard.press('Enter');

        // Verify the value was visually persisted
        await expect(page.getByText('E2E Rent')).toBeVisible();
    });

    test('User can save a snapshot and view it in History tab', async ({ page }) => {
        // Click Record Snapshot button
        const snapshotBtn = page.getByRole('button', { name: /Record Snapshot/i });
        await expect(snapshotBtn).toBeVisible();
        await snapshotBtn.click();

        // It should navigate to /history automatically
        await expect(page).toHaveURL(/.*history$/);

        // Expect the History table or virtual list to be visible
        await expect(page.locator('.virtual-list').or(page.getByRole('table'))).toBeVisible();
    });
});

