export type StockStatus = 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';

/**
 * Pure helper function to compute available stock from physical quantity and reserved quantity.
 */

export function calculateAvailableStock(quantity: number, reservedQuantity: number = 0): number {
  if (isNaN(quantity) || quantity < 0) return 0;
  if (isNaN(reservedQuantity) || reservedQuantity < 0) return Math.max(0, quantity);
  return Math.max(0, quantity - reservedQuantity);
}

/**
 * Determines stock status category badge based on available stock and low stock threshold.
 */
export function determineStockStatus(
  quantity: number,
  reservedQuantity: number = 0,
  lowStockThreshold: number = 10
): StockStatus {
  const available = calculateAvailableStock(quantity, reservedQuantity);
  if (available <= 0) {
    return 'OUT OF STOCK';
  }
  if (available <= Math.max(1, lowStockThreshold)) {
    return 'LOW STOCK';
  }
  return 'IN STOCK';
}

/**
 * Computes fulfillment ratio (0.0 to 1.0) and human-readable priority label for an order.
 */
export function calculateOrderPriority(
  items: Array<{ quantity: number; available_quantity?: number }>
): { ratio: number; label: string; priorityTier: 'High' | 'Medium' | 'Low' } {
  if (!items || items.length === 0) {
    return { ratio: 1.0, label: 'High Priority (100% Fulfillable)', priorityTier: 'High' };
  }

  let totalRequested = 0;
  let totalFulfillable = 0;

  for (const item of items) {
    const req = Math.max(0, item.quantity || 0);
    totalRequested += req;
    const avail = Math.max(0, item.available_quantity ?? req);
    totalFulfillable += Math.min(req, avail);
  }

  if (totalRequested <= 0) {
    return { ratio: 1.0, label: 'High Priority (100% Fulfillable)', priorityTier: 'High' };
  }

  const ratio = Math.min(1.0, Math.max(0.0, totalFulfillable / totalRequested));
  const percentage = Math.round(ratio * 1000) / 10; // 1 decimal place

  if (ratio >= 1.0) {
    return { ratio: 1.0, label: 'High Priority (100% Fulfillable)', priorityTier: 'High' };
  }
  if (ratio >= 0.5) {
    return { ratio, label: `Medium Priority (${percentage}% Fulfillable)`, priorityTier: 'Medium' };
  }
  return { ratio, label: `Low Priority (${percentage}% Fulfillable)`, priorityTier: 'Low' };
}

/**
 * Validates physical inspection quantities against expected order item quantity.
 * Equation: Good + Damaged + Missing == Expected.
 */
export function validateVerificationQuantities(
  good: number,
  damaged: number,
  missing: number,
  expected: number
): { valid: boolean; sum: number; difference: number; message?: string } {
  const g = Math.max(0, Math.floor(good || 0));
  const d = Math.max(0, Math.floor(damaged || 0));
  const m = Math.max(0, Math.floor(missing || 0));
  const exp = Math.max(0, Math.floor(expected || 0));

  const sum = g + d + m;
  const difference = sum - exp;

  if (sum !== exp) {
    return {
      valid: false,
      sum,
      difference,
      message: `Discrepancy: Good (${g}) + Damaged (${d}) + Missing (${m}) = ${sum}, expected ${exp}.`
    };
  }

  return { valid: true, sum, difference: 0 };
}

/**
 * Validates and sanitizes a numerical quantity input against minimums and maximum available inventory.
 */
export function validateQuantityInput(
  input: number | string,
  maxAvailable?: number
): { valid: boolean; value: number; error?: string } {
  const num = typeof input === 'string' ? parseInt(input.trim(), 10) : input;

  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, value: 0, error: 'Quantity must be a valid number.' };
  }

  if (num <= 0) {
    return { valid: false, value: 0, error: 'Quantity must be greater than 0.' };
  }

  if (maxAvailable !== undefined && num > maxAvailable) {
    return {
      valid: false,
      value: num,
      error: `Requested quantity (${num}) exceeds available stock (${maxAvailable}).`
    };
  }

  return { valid: true, value: num };
}
