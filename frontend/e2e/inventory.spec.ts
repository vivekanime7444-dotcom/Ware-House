import { test, expect } from '@playwright/test';

test.describe('Inventory Module E2E Flows', () => {
  test('searches products and filters by category', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page.getByText('Active Available Stock View')).toBeVisible();

    // Filter by Electronics category
    const electronicsPill = page.getByRole('button', { name: 'Electronics' });
    await electronicsPill.click();

    // Type in search bar
    const searchInput = page.getByPlaceholder(/Search product code, title/i);
    await searchInput.fill('USB-C');

    await expect(page.getByText('USB-C Cable 2m')).toBeVisible();
  });
});
