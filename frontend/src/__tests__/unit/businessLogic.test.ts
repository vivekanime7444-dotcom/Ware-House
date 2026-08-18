import { describe, it, expect } from 'vitest';
import type { Product, OrderItem } from '../../types';
import {
  calculateAvailableStock,
  determineStockStatus,
  calculateOrderPriority,
  validateVerificationQuantities,
  validateQuantityInput
} from '../../utils/warehouseCalculations';

describe('Warehouse Business Logic & Pure Calculation Utilities', () => {
  describe('Stock Availability & Pure Math Functions', () => {
    it('calculates available quantity correctly as (quantity - reserved_quantity)', () => {
      const product: Product = {
        id: 1,
        product_code: 'TEST-001',
        name: 'Test Item',
        category_id: 1,
        quantity: 50,
        reserved_quantity: 15,
        available_quantity: 35,
        low_stock_threshold: 10,
        status: 'IN STOCK',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const computedAvailable = product.quantity - product.reserved_quantity;
      expect(computedAvailable).toBe(35);
      expect(computedAvailable).toBe(product.available_quantity);
      expect(calculateAvailableStock(50, 15)).toBe(35);
    });

    it('handles negative or invalid stock quantities gracefully', () => {
      expect(calculateAvailableStock(-5, 0)).toBe(0);
      expect(calculateAvailableStock(10, 20)).toBe(0);
      expect(calculateAvailableStock(NaN, 5)).toBe(0);
      expect(calculateAvailableStock(10, NaN)).toBe(10);
    });

    it('determines IN STOCK status when available quantity exceeds threshold', () => {
      expect(determineStockStatus(50, 10, 10)).toBe('IN STOCK');
      expect(determineStockStatus(100, 0, 15)).toBe('IN STOCK');
    });

    it('determines LOW STOCK status when available quantity is between 1 and threshold', () => {
      expect(determineStockStatus(10, 0, 10)).toBe('LOW STOCK');
      expect(determineStockStatus(15, 10, 10)).toBe('LOW STOCK');
      expect(determineStockStatus(1, 0, 5)).toBe('LOW STOCK');
    });

    it('determines OUT OF STOCK status when available quantity is 0 or negative', () => {
      expect(determineStockStatus(0, 0, 10)).toBe('OUT OF STOCK');
      expect(determineStockStatus(20, 20, 10)).toBe('OUT OF STOCK');
      expect(determineStockStatus(5, 10, 10)).toBe('OUT OF STOCK');
    });
  });

  describe('Order Prioritization & Fulfillment Math', () => {
    it('computes High Priority for 100% fulfillable orders', () => {
      const items = [
        { quantity: 10, available_quantity: 15 },
        { quantity: 5, available_quantity: 20 }
      ];
      const result = calculateOrderPriority(items);
      expect(result.ratio).toBe(1.0);
      expect(result.priorityTier).toBe('High');
      expect(result.label).toContain('High Priority');
    });

    it('computes Medium Priority when fulfillment ratio is between 50% and 99.9%', () => {
      const items = [
        { quantity: 10, available_quantity: 8 }
      ];
      const result = calculateOrderPriority(items);
      expect(result.ratio).toBe(0.8);
      expect(result.priorityTier).toBe('Medium');
      expect(result.label).toContain('Medium Priority (80% Fulfillable)');
    });

    it('computes Low Priority when fulfillment ratio is below 50%', () => {
      const items = [
        { quantity: 10, available_quantity: 2 }
      ];
      const result = calculateOrderPriority(items);
      expect(result.ratio).toBe(0.2);
      expect(result.priorityTier).toBe('Low');
      expect(result.label).toContain('Low Priority (20% Fulfillable)');
    });

    it('returns High Priority when order items array is empty or zero quantities', () => {
      expect(calculateOrderPriority([]).ratio).toBe(1.0);
      expect(calculateOrderPriority([{ quantity: 0, available_quantity: 0 }]).ratio).toBe(1.0);
    });
  });

  describe('Verification Quality Equation (Good + Damaged + Missing == Expected)', () => {
    it('validates correct verification sums without discrepancies', () => {
      const result = validateVerificationQuantities(8, 1, 1, 10);
      expect(result.valid).toBe(true);
      expect(result.difference).toBe(0);
      expect(result.sum).toBe(10);
    });

    it('detects discrepancies when sum does not equal expected', () => {
      const underResult = validateVerificationQuantities(5, 1, 0, 10);
      expect(underResult.valid).toBe(false);
      expect(underResult.difference).toBe(-4);
      expect(underResult.message).toBeDefined();

      const overResult = validateVerificationQuantities(10, 2, 1, 10);
      expect(overResult.valid).toBe(false);
      expect(overResult.difference).toBe(3);
    });
  });

  describe('Quantity Input Validation & Sanitization', () => {
    it('accepts valid positive integer quantities within stock bounds', () => {
      const res = validateQuantityInput(5, 10);
      expect(res.valid).toBe(true);
      expect(res.value).toBe(5);
    });

    it('parses string numbers and trims whitespace', () => {
      const res = validateQuantityInput('  12  ', 20);
      expect(res.valid).toBe(true);
      expect(res.value).toBe(12);
    });

    it('rejects zero, negative numbers, and invalid strings', () => {
      expect(validateQuantityInput(0).valid).toBe(false);
      expect(validateQuantityInput(-3).valid).toBe(false);
      expect(validateQuantityInput('abc').valid).toBe(false);
      expect(validateQuantityInput(NaN).valid).toBe(false);
    });

    it('rejects quantities exceeding available warehouse inventory', () => {
      const res = validateQuantityInput(15, 10);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds available stock');
    });
  });
});
