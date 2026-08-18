import { test, expect } from '@playwright/test';

test.describe('Order Lifecycle E2E Flow', () => {
  test('places an order and verifies it in orders queue', async ({ page }) => {
    // 1. Place order
    await page.goto('/order-placement');
    await expect(page.getByText('Order Placement Module')).toBeVisible();

    const placeBtn = page.getByText('CONFIRM & PLACE ORDER');
    await placeBtn.click();

    await expect(page.getByText(/Order Placed Successfully/i)).toBeVisible();

    // 2. View in Orders
    await page.goto('/orders');
    await expect(page.getByText('Orders Module')).toBeVisible();
    await expect(page.getByText(/ORD-/i).first()).toBeVisible();

    // 3. Navigate to Order Placement & Tracking
    await page.goto('/tracking');
    await expect(page.getByText('Order Placement & Tracking')).toBeVisible();
  });
});
