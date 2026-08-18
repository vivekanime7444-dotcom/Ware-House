import { test, expect } from '@playwright/test';

test.describe('Critical Flow 1: Inventory Filtering & Stock Status Display', () => {
  test('navigates to inventory, filters by category, searches SKU, and verifies status badges', async ({ page }) => {
    // 1. Visit inventory page
    await page.goto('/inventory');
    await expect(page.getByText('Active Available Stock View')).toBeVisible();

    // 2. Filter by category pills (e.g. Electronics, Furniture)
    const electronicsPill = page.getByRole('button', { name: 'Electronics' });
    await expect(electronicsPill).toBeVisible();
    await electronicsPill.click();

    // 3. Search for a specific product
    const searchInput = page.getByPlaceholder(/Search product code, title/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('USB-C');

    // 4. Verify filtered product card and stock status badge
    await expect(page.getByText('USB-C Cable 2m')).toBeVisible();
    await expect(page.getByText(/IN STOCK|LOW STOCK|OUT OF STOCK/i).first()).toBeVisible();

    // 5. Clear search and select 'All' categories
    await searchInput.fill('');
    const allPill = page.getByRole('button', { name: 'All' });
    await allPill.click();
    await expect(page.getByText('Ergonomic Mesh Office Chair')).toBeVisible();
  });
});
