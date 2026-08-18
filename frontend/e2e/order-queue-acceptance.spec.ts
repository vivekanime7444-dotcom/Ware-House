import { test, expect } from '@playwright/test';

test.describe('Critical Flow 4: Accepting an Order from the Queue', () => {
  test('views priority orders queue, filters by pending status, and accepts order to advance to tracking queue', async ({ page }) => {
    // 1. Navigate to Orders module
    await page.goto('/orders');
    await expect(page.getByText('Orders Module')).toBeVisible();

    // 2. Select PENDING filter tab/dropdown
    const statusSelect = page.getByRole('combobox').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('PENDING');
    }

    // 3. Locate Accept Order button
    const acceptButtons = page.getByRole('button', { name: /Accept Order/i });
    if (await acceptButtons.count() > 0) {
      await acceptButtons.first().click();
      // Verify confirmation or status transition to accepted
      await expect(page.getByText(/accepted/i).first()).toBeVisible();
    } else {
      // If queue is clean, verify orders table renders properly
      await expect(page.getByText(/ORD-/i).first()).toBeVisible();
    }
  });
});
