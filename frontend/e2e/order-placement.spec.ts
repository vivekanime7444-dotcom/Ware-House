import { test, expect } from '@playwright/test';

test.describe('Critical Flow 3: Placing an Order', () => {
  test('navigates to order placement, sets item quantity, and places customer order with stock reservation', async ({ page }) => {
    // 1. Visit order placement page
    await page.goto('/order-placement');
    await expect(page.getByText('Order Placement Module')).toBeVisible();

    // 2. Locate product quantity inputs and adjust quantity
    const quantityInputs = page.locator('input[type="number"]');
    await expect(quantityInputs.first()).toBeVisible();
    await quantityInputs.first().fill('2');

    // 3. Confirm and place order
    const placeBtn = page.getByRole('button', { name: /CONFIRM & PLACE ORDER/i });
    await expect(placeBtn).toBeVisible();
    await placeBtn.click();

    // 4. Verify confirmation banner with generated Order Number
    await expect(page.getByText(/Order Placed Successfully/i)).toBeVisible();
    await expect(page.getByText(/ORD-/i)).toBeVisible();
  });
});
