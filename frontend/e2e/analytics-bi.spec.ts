import { test, expect } from '@playwright/test';

test.describe('Critical Flow 5: Analytics Charts Loading Correctly', () => {
  test('navigates to Analysis module, verifies summary KPI cards, and checks Recharts charts load without errors', async ({ page }) => {
    // 1. Navigate to Analysis module
    await page.goto('/analysis');
    await expect(page.getByText('Analysis & Reports Module')).toBeVisible();

    // 2. Verify summary metric cards
    await expect(page.getByText('Total Stock Units')).toBeVisible();
    await expect(page.getByText('Catalog SKUs')).toBeVisible();

    // 3. Verify interactive chart containers are rendered
    await expect(page.getByText('Stock Distribution by Category')).toBeVisible();
    await expect(page.getByText('Inventory Health Overview')).toBeVisible();
    await expect(page.getByText('Quality Audit Issues')).toBeVisible();

    // 4. Verify SVG chart elements exist in DOM
    const svgElements = page.locator('svg.recharts-surface');
    await expect(svgElements.first()).toBeVisible();
  });
});
