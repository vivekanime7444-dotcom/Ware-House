import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '../../services/api';
import { INITIAL_CATEGORIES } from '../../services/mockData';



describe('API Service Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Product API Operations', () => {
    it('fetches products catalog and populates initial items', async () => {
      const products = await api.getProducts();
      expect(products).toBeDefined();
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('product_code');
      expect(products[0]).toHaveProperty('available_quantity');
    });

    it('filters products by category correctly', async () => {
      const electronics = await api.getProducts({ category_name: 'Electronics' });
      expect(electronics.length).toBeGreaterThan(0);
      electronics.forEach((p) => {
        expect(p.category_name).toBe('Electronics');
      });
    });

    it('filters products by search keyword correctly', async () => {
      const results = await api.getProducts({ search: 'USB-C' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('usb-c');
    });

    it('filters products by stock status (LOW STOCK / IN STOCK)', async () => {
      const lowStock = await api.getProducts({ stock_status: 'LOW STOCK' });
      lowStock.forEach((p) => {
        expect(p.status).toBe('LOW STOCK');
      });
    });

    it('fetches categories list', async () => {
      const categories = await api.getCategories();
      expect(categories.length).toBe(INITIAL_CATEGORIES.length);
      expect(categories.map((c) => c.name)).toContain('Electronics');
    });

    it('creates a new product and persists it to product store', async () => {
      const newProduct = await api.createProduct({
        product_code: 'TEST-NEW-999',
        name: 'Super High-Tech Sensor',
        category_id: 2,
        quantity: 50,
        low_stock_threshold: 10,
        description: 'Quality precision sensor',
      });

      expect(newProduct.product_code).toBe('TEST-NEW-999');
      expect(newProduct.name).toBe('Super High-Tech Sensor');
      expect(newProduct.available_quantity).toBe(50);
      expect(newProduct.status).toBe('IN STOCK');

      // Verify it is found in getProducts
      const products = await api.getProducts();
      const found = products.find((p) => p.product_code === 'TEST-NEW-999');
      expect(found).toBeDefined();
    });

    it('deletes a product by ID and removes it from product store', async () => {
      const productsBefore = await api.getProducts();
      const targetId = productsBefore[0].id;

      const res = await api.deleteProduct(targetId);
      expect(res.message).toContain('deleted');

      const productsAfter = await api.getProducts();
      expect(productsAfter.find((p) => p.id === targetId)).toBeUndefined();
    });

    it('fetches low-stock and out-of-stock products', async () => {
      const low = await api.getLowStockProducts();
      expect(Array.isArray(low)).toBe(true);

      const out = await api.getOutOfStockProducts();
      expect(Array.isArray(out)).toBe(true);
    });
  });

  describe('Restocking Operations', () => {
    it('restocks an existing product and increments stock and transaction history', async () => {
      const products = await api.getProducts();
      const target = products[0];
      const initialQty = target.quantity;

      const tx = await api.restockProduct(target.id, 15);
      expect(tx.product_id).toBe(target.id);
      expect(tx.quantity_added).toBe(15);
      expect(tx.new_quantity).toBe(initialQty + 15);

      // Verify product quantity was updated
      const updatedProducts = await api.getProducts();
      const updatedTarget = updatedProducts.find((p) => p.id === target.id);
      expect(updatedTarget?.quantity).toBe(initialQty + 15);

      // Verify restock history contains the transaction
      const history = await api.getRestockHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Order Lifecycle Operations', () => {
    it('places an order, reserves items, and adds to order queue', async () => {
      const products = await api.getProducts();
      const target = products[0];
      const initialAvailable = target.available_quantity;

      const order = await api.placeOrder([{ product_id: target.id, quantity: 2 }]);
      expect(order.order_number).toBeDefined();
      expect(order.status).toBe('PENDING');
      expect(order.items.length).toBe(1);

      // Verify product available_quantity decreased
      const updatedProducts = await api.getProducts();
      const updatedTarget = updatedProducts.find((p) => p.id === target.id);
      expect(updatedTarget?.available_quantity).toBe(initialAvailable - 2);

      // Verify order is listed in getOrders
      const orders = await api.getOrders();
      expect(orders.find((o) => o.id === order.id)).toBeDefined();
    });

    it('accepts a pending order and updates status to ACCEPTED', async () => {
      const orders = await api.getOrders();
      const pending = orders.find((o) => o.status === 'PENDING') || orders[0];

      const accepted = await api.acceptOrder(pending.id);
      expect(accepted.status).toBe('ACCEPTED');
    });

    it('cancels an order and updates status to CANCELLED', async () => {
      const orders = await api.getOrders();
      const target = orders[0];

      const cancelled = await api.cancelOrder(target.id);
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('ships an order and updates status to SHIPPED', async () => {
      const orders = await api.getOrders();
      const target = orders[0];

      const shipped = await api.shipOrder(target.id);
      expect(shipped.status).toBe('SHIPPED');
    });
  });

  describe('Verification & Damaged/Missing Synchronization', () => {
    it('records verification discrepancies and populates damaged & missing records', async () => {
      const orders = await api.getOrders();
      const targetOrder = orders[0];
      const targetItem = targetOrder.items[0];

      const res = await api.verifyOrderItems(targetOrder.id, [
        {
          product_id: targetItem.product_id,
          good_quantity: Math.max(0, targetItem.quantity - 2),
          damaged_quantity: 1,
          missing_quantity: 1,
        },
      ]);

      expect(res.message).toBeDefined();

      // Check verification summary
      const summary = await api.getVerificationSummary(targetOrder.id);
      expect(summary.total_damaged).toBe(1);
      expect(summary.total_missing).toBe(1);
      expect(summary.replacement_needed).toBe(2);

      // Check damaged & missing records list
      const dmData = await api.getDamagedMissingRecords();
      expect(dmData.summary.total_damaged).toBeGreaterThanOrEqual(1);
      expect(dmData.records.some((r) => r.order_id === targetOrder.id)).toBe(true);
    });

    it('handles replacing damaged/missing items and updates issue record to REPLACED', async () => {
      const orders = await api.getOrders();
      const targetOrder = orders[0];
      const targetItem = targetOrder.items[0];

      const replaceRes = await api.replaceDamagedMissing(targetOrder.id, targetItem.product_id, 2, 1, 1);
      expect(replaceRes.message).toBeDefined();

      const dmData = await api.getDamagedMissingRecords();
      const record = dmData.records.find((r) => r.order_id === targetOrder.id && r.product_id === targetItem.product_id);
      expect(record?.status).toBe('REPLACED');
    });
  });

  describe('Dashboard Analytics & Logs', () => {
    it('fetches dashboard summary metrics with non-zero counters', async () => {
      const summary = await api.getDashboardSummary();
      expect(summary.total_products).toBeGreaterThan(0);
      expect(summary.total_units).toBeGreaterThan(0);
      expect(typeof summary.low_stock_items).toBe('number');
    });

    it('fetches charts analytics dataset', async () => {
      const charts = await api.getChartsData();
      expect(charts.products_by_category).toBeDefined();
      expect(charts.inventory_status).toBeDefined();
      expect(charts.orders_over_time).toBeDefined();
    });

    it('fetches activity audit logs', async () => {
      const logs = await api.getActivityLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
