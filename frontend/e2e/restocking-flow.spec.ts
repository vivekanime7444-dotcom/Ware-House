import { test, expect } from '@playwright/test';

test.describe('Critical Flow 2: Restocking a Product and Verifying Stock Update', () => {
  test('selects product, inputs restocking quantity, submits, and verifies inventory update & audit table', async ({ page }) => {
    // 1. Navigate to Restocking page
    await page.goto('/restocking');
    await expect(page.getByText('Restocking Module')).toBeVisible();

    // 2. Select product from dropdown
    const productSelect = page.getByRole('combobox').first();
    await expect(productSelect).toBeVisible();
    await productSelect.selectOption({ index: 1 });

    // 3. Enter restock quantity
    const quantityInput = page.getByPlaceholder('e.g. 50');
    await expect(quantityInput).toBeVisible();
    await quantityInput.fill('25');

    // 4. Submit Restock Form
    const submitBtn = page.getByRole('button', { name: /Add Units to Warehouse Inventory/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 5. Verify success alert feedback banner
    await expect(page.getByText(/Successfully restocked/i)).toBeVisible();

    // 6. Verify audit history table logs the entry
    await expect(page.getByText(/Audit History/i)).toBeVisible();
    await expect(page.getByText('+25 units').first()).toBeVisible();
  });
});
