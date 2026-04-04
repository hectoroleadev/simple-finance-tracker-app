# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: finance.spec.ts >> Simple Finance Tracker Critical Flows >> User can add a new item to a category
- Location: tests/e2e/finance.spec.ts:42:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[type="text"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[type="text"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6] [cursor=pointer]:
        - img [ref=e8]
        - heading "Simple Finances Tracker" [level=1] [ref=e11]
      - generic [ref=e12]:
        - navigation [ref=e13]:
          - button "Summary" [active] [ref=e14]:
            - img [ref=e15]
            - text: Summary
          - button "History" [ref=e20]:
            - img [ref=e21]
            - text: History
          - button "Analysis" [ref=e25]:
            - img [ref=e26]
            - text: Analysis
        - generic [ref=e29]:
          - button "Summary My Account" [ref=e31]:
            - img [ref=e33]
            - generic [ref=e36]:
              - generic [ref=e37]: Summary
              - generic [ref=e38]: My Account
            - img [ref=e39]
          - generic [ref=e41]:
            - generic [ref=e42]: Net Worth
            - text: $99.00
  - main [ref=e43]:
    - generic [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - img [ref=e49]
            - generic [ref=e52]: Total Income
          - generic [ref=e53]: $99.00
        - generic [ref=e54]:
          - generic [ref=e55]:
            - img [ref=e57]
            - generic [ref=e60]: Total Expenses
          - generic [ref=e61]: $0.00
        - generic [ref=e62]:
          - generic [ref=e63]:
            - img [ref=e65]
            - generic [ref=e68]: Net Balance
          - generic [ref=e69]: $99.00
        - generic [ref=e70]:
          - generic [ref=e71]:
            - img [ref=e73]
            - generic [ref=e76]: Retirement Capital
          - generic [ref=e77]: $0.00
      - generic [ref=e78]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - heading "Pending Payments" [level=3] [ref=e81]
            - button [ref=e82]:
              - img [ref=e83]
          - generic [ref=e85]:
            - generic [ref=e87]: loteria
            - generic [ref=e88]: $99.00
            - generic [ref=e89]:
              - button "History" [ref=e90]:
                - img [ref=e91]
              - button "edit" [ref=e94]:
                - img [ref=e95]
              - button "Delete" [ref=e97]:
                - img [ref=e98]
          - generic [ref=e101]:
            - generic [ref=e102]: Total
            - generic [ref=e103]: $99.00
        - generic [ref=e104]:
          - generic [ref=e105]:
            - heading "Period Close" [level=3] [ref=e106]
            - paragraph [ref=e107]: Save your current data for historical analysis.
          - generic [ref=e108]:
            - generic [ref=e109]:
              - generic [ref=e110]: Total Assets
              - generic [ref=e111]: $99.00
            - generic [ref=e112]:
              - generic [ref=e113]: Final Net
              - generic [ref=e114]: $99.00
          - button "Record Snapshot" [ref=e115]
  - contentinfo [ref=e116]:
    - paragraph [ref=e117]: Simple Finance Tracker • Smart Management
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Simple Finance Tracker Critical Flows', () => {
  4  |     
  5  |     test.beforeEach(async ({ page }) => {
  6  |         // Navigate to the app
  7  |         await page.goto('/');
  8  | 
  9  |         // Wait for the app to initialize (auth check)
  10 |         await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  11 | 
  12 |         // Wait for either the dashboard to load (if already logged in) or the login page to appear
  13 |         const isLogin = await Promise.race([
  14 |             page.waitForURL(/.*dashboard.*/, { timeout: 8000 }).then(() => false).catch(() => true),
  15 |             page.getByRole('heading', { name: /Login|Iniciar Sesión/i }).waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false)
  16 |         ]);
  17 | 
  18 |         if (isLogin && page.url().includes('login')) {
  19 |             await page.getByPlaceholder(/Your username|Usuario/i).fill('hector.test');
  20 |             await page.getByPlaceholder(/••••••••/i).fill('Test1234##');
  21 |             
  22 |             // Click and wait for navigation
  23 |             await page.getByRole('button', { name: /Login|Iniciar Sesión/i }).first().click();
  24 |             await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
  25 |         }
  26 | 
  27 |         // Wait for any data-fetching loading spinner to disappear
  28 |         await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
  29 |     });
  30 | 
  31 |     test('User can see dashboard and stats format', async ({ page }) => {
  32 |         // Basic verification
  33 |         await expect(page).toHaveTitle(/Simple Finance Tracker/i);
  34 | 
  35 |         // Check if stats are rendered accurately (matching uppercase UI)
  36 |         await expect(page.getByText('TOTAL INCOME')).toBeVisible();
  37 |         await expect(page.getByText('NET BALANCE')).toBeVisible();
  38 |         await expect(page.getByText('RETIREMENT CAPITAL')).toBeVisible();
  39 |         await expect(page.getByText('NET WORTH')).toBeVisible();
  40 |     });
  41 | 
  42 |     test('User can add a new item to a category', async ({ page }) => {
  43 |         // Clicks the '+' button in the Pending Payments section
  44 |         const pendingPaymentsSection = page.locator('div, section').filter({ hasText: /Pending Payments/i });
  45 |         const addButton = pendingPaymentsSection.getByRole('button').filter({ has: page.locator('svg') });
  46 |         
  47 |         await addButton.first().click();
  48 | 
  49 |         // The input should appear. We expect it to be auto-focused or we can pick it
  50 |         const nameInput = page.locator('input[type="text"]');
> 51 |         await expect(nameInput).toBeVisible();
     |                                 ^ Error: expect(locator).toBeVisible() failed
  52 | 
  53 |         await nameInput.fill('E2E Rent');
  54 |         await page.keyboard.press('Tab');
  55 |         
  56 |         const amountInput = page.locator('input[type="number"]');
  57 |         await amountInput.fill('1200');
  58 |         await page.keyboard.press('Enter');
  59 | 
  60 |         // Verify the value was visually persisted
  61 |         await expect(page.getByText('E2E Rent')).toBeVisible();
  62 |     });
  63 | 
  64 |     test('User can save a snapshot and view it in History tab', async ({ page }) => {
  65 |         // Click Record Snapshot button
  66 |         const snapshotBtn = page.getByRole('button', { name: /Record Snapshot/i });
  67 |         await expect(snapshotBtn).toBeVisible();
  68 |         await snapshotBtn.click();
  69 | 
  70 |         // It should navigate to /history automatically
  71 |         await expect(page).toHaveURL(/.*history$/);
  72 | 
  73 |         // Expect the History table or virtual list to be visible
  74 |         await expect(page.locator('.virtual-list').or(page.getByRole('table'))).toBeVisible();
  75 |     });
  76 | });
  77 | 
  78 | 
```