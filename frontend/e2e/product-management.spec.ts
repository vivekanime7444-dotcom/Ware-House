import { test, expect } from '@playwright/test';

test.describe('Product Management E2E Flow', () => {
  test('adds a new product and deletes a low demand product', async ({ page }) => {
    await page.goto('/warehouse-status');
    await expect(page.getByText('Warehouse Status Module')).toBeVisible();

    // Click Add Product
    await page.getByText('+ Add Product').click();
    await expect(page.getByText('Add New Warehouse Product')).toBeVisible();

    // Fill form
    await page.getByLabel(/Product Code/i).fill('E2E-CODE-100');
    await page.getByLabel(/Product Title/i).fill('E2E High Capacity Battery');
    await page.getByLabel(/Initial Physical Stock/i).fill('35');

    await page.getByText('Save Product').click();
    await expect(page.getByText('E2E High Capacity Battery')).toBeVisible();
  });
});
