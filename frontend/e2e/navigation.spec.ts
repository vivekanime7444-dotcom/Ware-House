import { test, expect } from '@playwright/test';

test.describe('Navigation & Dashboard Core Flows', () => {
  test('navigates to dashboard hub and verifies hub cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/StockFlow WMS/i);

    // Verify presence of hub modules
    await expect(page.getByText('Central Inventory')).toBeVisible();
    await expect(page.getByText('Warehouse Status')).toBeVisible();
    await expect(page.getByText('Restocking')).toBeVisible();
  });

  test('navigates across all key modules from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on Central Inventory module
    await page.getByText('Central Inventory').click();
    await expect(page).toHaveURL(/.*inventory/);
    await expect(page.getByText('Active Available Stock View')).toBeVisible();

    // Click on Warehouse Status
    await page.goto('/warehouse-status');
    await expect(page.getByText('+ Add Product')).toBeVisible();
  });
});
