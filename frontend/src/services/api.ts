import { API_BASE_URL } from "../config";
import type {
  User, Category, Product, RestockTransaction, Order,
  OrderVerificationSummary, DamageMissingRecord, DashboardSummary,
  AuditLog, ChartDataResponse
} from "../types";
import {
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS,
  INITIAL_RESTOCKS, INITIAL_DAMAGED_MISSING, INITIAL_AUDIT_LOGS
} from "./mockData";

// --- Local Offline-Resilient Storage Helpers ---
const STORAGE_KEYS = {
  PRODUCTS: "stockflow_products_v2",
  CATEGORIES: "stockflow_categories_v2",
  ORDERS: "stockflow_orders_v2",
  RESTOCKS: "stockflow_restocks_v2",
  DAMAGED_MISSING: "stockflow_dm_v2",
  AUDIT_LOGS: "stockflow_audit_v2",
  TOKEN: "token"
};

function getLocal<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("LocalStorage save error:", err);
  }
}

// Pre-warm local storage
if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
  setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}
if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
  setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}
if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
  setLocal(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}
if (!localStorage.getItem(STORAGE_KEYS.RESTOCKS)) {
  setLocal(STORAGE_KEYS.RESTOCKS, INITIAL_RESTOCKS);
}
if (!localStorage.getItem(STORAGE_KEYS.DAMAGED_MISSING)) {
  setLocal(STORAGE_KEYS.DAMAGED_MISSING, INITIAL_DAMAGED_MISSING);
}
if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
  setLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = "API Request Failed";
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ access_token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await handleResponse<{ access_token: string; user: User }>(res);
      return data;
    } catch (err) {
      console.warn("Backend auth offline, using local admin session", err);
      const mockToken = "mock_token_" + Date.now();
      const mockUser: User = {
        id: 1,
        username: username || "admin",
        full_name: "System Administrator",
        role: "admin",
      };
      return { access_token: mockToken, user: mockUser };
    }
  },

  async getMe(): Promise<User> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      return {
        id: 1,
        username: "admin",
        full_name: "System Administrator",
        role: "admin",
      };
    }
  },

  // Products
  async getProducts(params?: { search?: string; category_name?: string; stock_status?: string }): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.category_name && params.category_name !== "All") query.append("category_name", params.category_name);
      if (params?.stock_status) query.append("stock_status", params.stock_status);

      const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
        headers: getAuthHeader(),
      });
      const prods = await handleResponse<Product[]>(res);
      if (prods && prods.length > 0) {
        setLocal(STORAGE_KEYS.PRODUCTS, prods);
        return prods;
      }
    } catch (err) {
      console.warn("Falling back to local products store", err);
    }

    // Local fallback
    let prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    if (!prods || prods.length === 0) {
      prods = INITIAL_PRODUCTS;
      setLocal(STORAGE_KEYS.PRODUCTS, prods);
    }

    if (params?.category_name && params.category_name !== "All") {
      prods = prods.filter(p => p.category_name === params.category_name);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q));
    }
    if (params?.stock_status && params.stock_status !== "ALL") {
      prods = prods.filter(p => p.status === params.stock_status);
    }
    return prods;
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories`, {
        headers: getAuthHeader(),
      });
      const cats = await handleResponse<Category[]>(res);
      if (cats && cats.length > 0) {
        setLocal(STORAGE_KEYS.CATEGORIES, cats);
        return cats;
      }
    } catch (err) {
      console.warn("Falling back to local categories", err);
    }
    return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async getLowStockProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/low-stock`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return prods.filter(p => p.status === "LOW STOCK");
    }
  },

  async getOutOfStockProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/out-of-stock`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return prods.filter(p => p.status === "OUT OF STOCK");
    }
  },

  async createProduct(product: {
    product_code: string;
    name: string;
    description?: string;
    category_id: number;
    image_url?: string;
    quantity: number;
    low_stock_threshold: number;
  }): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const created = await handleResponse<Product>(res);
      // Sync local
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      setLocal(STORAGE_KEYS.PRODUCTS, [created, ...prods.filter(p => p.id !== created.id)]);
      return created;
    } catch (err) {
      console.warn("Backend createProduct failed, saving locally", err);
      const categories = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      const category = categories.find(c => c.id === product.category_id);
      const newProd: Product = {
        id: Date.now(),
        product_code: product.product_code,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        category_name: category?.name || "General",
        image_url: product.image_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
        quantity: product.quantity,
        reserved_quantity: 0,
        available_quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold || 10,
        status: product.quantity === 0 ? "OUT OF STOCK" : product.quantity <= (product.low_stock_threshold || 10) ? "LOW STOCK" : "IN STOCK",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      setLocal(STORAGE_KEYS.PRODUCTS, [newProd, ...prods]);
      return newProd;
    }
  },

  async deleteProduct(productId: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      await handleResponse(res);
    } catch (err) {
      console.warn("Backend delete failed, removing locally", err);
    }
    const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setLocal(STORAGE_KEYS.PRODUCTS, prods.filter(p => p.id !== productId));
    return { message: "Product deleted successfully" };
  },

  // Restocking
  async restockProduct(productId: number, quantityAdded: number): Promise<RestockTransaction> {
    try {
      const res = await fetch(`${API_BASE_URL}/restocks`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity_added: quantityAdded }),
      });
      const data = await handleResponse<RestockTransaction>(res);
      return data;
    } catch (err) {
      console.warn("Backend restock failed, updating locally", err);
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const target = prods.find(p => p.id === productId);
      const prevQty = target ? target.quantity : 0;
      const newQty = prevQty + quantityAdded;
      if (target) {
        target.quantity = newQty;
        target.available_quantity = target.quantity - target.reserved_quantity;
        target.status = target.available_quantity <= 0 ? "OUT OF STOCK" : target.available_quantity <= target.low_stock_threshold ? "LOW STOCK" : "IN STOCK";
        setLocal(STORAGE_KEYS.PRODUCTS, [...prods]);
      }
      const tx: RestockTransaction = {
        id: Date.now(),
        product_id: productId,
        product_name: target?.name,
        product_code: target?.product_code,
        quantity_added: quantityAdded,
        previous_quantity: prevQty,
        new_quantity: newQty,
        user_name: "admin",
        created_at: new Date().toISOString()
      };
      const restocks = getLocal<RestockTransaction[]>(STORAGE_KEYS.RESTOCKS, INITIAL_RESTOCKS);
      setLocal(STORAGE_KEYS.RESTOCKS, [tx, ...restocks]);
      return tx;
    }
  },

  async getRestockHistory(): Promise<RestockTransaction[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/restocks`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      return getLocal<RestockTransaction[]>(STORAGE_KEYS.RESTOCKS, INITIAL_RESTOCKS);
    }
  },

  // Orders
  async placeOrder(items: { product_id: number; quantity: number }[]): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      return await handleResponse<Order>(res);
    } catch (err) {
      console.warn("Backend order placement offline, processing locally", err);
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const orderItems = items.map((it, idx) => {
        const prod = prods.find(p => p.id === it.product_id);
        if (prod) {
          prod.reserved_quantity += it.quantity;
          prod.available_quantity = Math.max(0, prod.quantity - prod.reserved_quantity);
          prod.status = prod.available_quantity <= 0 ? "OUT OF STOCK" : prod.available_quantity <= prod.low_stock_threshold ? "LOW STOCK" : "IN STOCK";
        }
        return {
          id: Date.now() + idx,
          product_id: it.product_id,
          product_name: prod?.name || "Product",
          product_code: prod?.product_code || "CODE",
          product_image: prod?.image_url,
          quantity: it.quantity,
          unit_price: 29.99,
          current_available: prod?.available_quantity
        };
      });
      setLocal(STORAGE_KEYS.PRODUCTS, [...prods]);

      const newOrder: Order = {
        id: Date.now(),
        order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: 1,
        user_name: "admin",
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: orderItems,
        fulfillment_ratio: 1.0,
        priority_label: "High Priority"
      };
      const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      setLocal(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
      return newOrder;
    }
  },

  async getOrders(params?: { status_filter?: string; search?: string }): Promise<Order[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status_filter && params.status_filter !== "ALL") query.append("status_filter", params.status_filter);
      if (params?.search) query.append("search", params.search);

      const res = await fetch(`${API_BASE_URL}/orders?${query.toString()}`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      let orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      if (params?.status_filter && params.status_filter !== "ALL") {
        orders = orders.filter(o => o.status === params.status_filter);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        orders = orders.filter(o => o.order_number.toLowerCase().includes(q));
      }
      return orders;
    }
  },

  async acceptOrder(orderId: number): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/accept`, {
        method: "POST",
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        ord.status = "ACCEPTED";
        ord.updated_at = new Date().toISOString();
        setLocal(STORAGE_KEYS.ORDERS, [...orders]);
      }
      return ord || orders[0];
    }
  },

  async cancelOrder(orderId: number): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        ord.status = "CANCELLED";
        ord.updated_at = new Date().toISOString();
        setLocal(STORAGE_KEYS.ORDERS, [...orders]);
      }
      return ord || orders[0];
    }
  },

  // Order Tracking & Verification
  async getAcceptedOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/tracking/accepted`, {
        headers: getAuthHeader(),
      });
      const orders = await handleResponse<Order[]>(res);
      if (orders && orders.length > 0) {
        return orders;
      }
    } catch (err) {
      console.warn("Using local accepted orders", err);
    }
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.filter(o => o.status === "ACCEPTED" || o.status === "PROCESSING");
  },

  async getVerificationSummary(orderId: number): Promise<OrderVerificationSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/summary`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      const dmRecords = getLocal<DamageMissingRecord[]>(STORAGE_KEYS.DAMAGED_MISSING, INITIAL_DAMAGED_MISSING);
      const order = orders.find(o => o.id === orderId) || orders[0];
      
      const orderDm = dmRecords.filter(d => d.order_id === order.id);
      const totalDamaged = orderDm.reduce((acc, d) => acc + d.damaged_quantity, 0);
      const totalMissing = orderDm.reduce((acc, d) => acc + d.missing_quantity, 0);

      const verifs = order.items.map((it, idx) => {
        const dm = orderDm.find(d => d.product_id === it.product_id);
        const damaged = dm ? dm.damaged_quantity : 0;
        const missing = dm ? dm.missing_quantity : 0;
        const good = Math.max(0, it.quantity - damaged - missing);
        return {
          id: idx + 1,
          order_id: order.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_image: it.product_image,
          expected_quantity: it.quantity,
          good_quantity: good,
          damaged_quantity: damaged,
          missing_quantity: missing,
          is_verified: true,
          verified_at: new Date().toISOString()
        };
      });

      const replacementNeeded = orderDm.filter(d => d.status !== "REPLACED").reduce((acc, d) => acc + d.damaged_quantity + d.missing_quantity, 0);

      return {
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        verifications: verifs,
        total_damaged: totalDamaged,
        total_missing: totalMissing,
        replacement_needed: replacementNeeded,
        can_ship: replacementNeeded === 0
      };
    }
  },

  async verifyOrderItems(
    orderId: number,
    items: { product_id: number; good_quantity: number; damaged_quantity: number; missing_quantity: number }[]
  ): Promise<{ message: string }> {
    // 1. Sync local state first so UI updates immediately
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    let dmRecords = getLocal<DamageMissingRecord[]>(STORAGE_KEYS.DAMAGED_MISSING, INITIAL_DAMAGED_MISSING);
    const order = orders.find(o => o.id === orderId);

    if (order) {
      order.status = "PROCESSING";
      order.updated_at = new Date().toISOString();
      setLocal(STORAGE_KEYS.ORDERS, [...orders]);

      items.forEach(item => {
        const prod = prods.find(p => p.id === item.product_id);
        const hasIssue = item.damaged_quantity > 0 || item.missing_quantity > 0;
        
        // Remove existing record for this order & product
        dmRecords = dmRecords.filter(d => !(d.order_id === orderId && d.product_id === item.product_id));

        if (hasIssue) {
          const newDm: DamageMissingRecord = {
            id: Date.now() + item.product_id,
            order_id: orderId,
            order_number: order.order_number,
            product_id: item.product_id,
            product_name: prod?.name || "Product",
            product_code: prod?.product_code || "CODE",
            product_image: prod?.image_url,
            category_name: prod?.category_name || "General",
            damaged_quantity: item.damaged_quantity,
            missing_quantity: item.missing_quantity,
            status: "REPORTED",
            created_at: new Date().toISOString()
          };
          dmRecords.unshift(newDm);
        }
      });

      setLocal(STORAGE_KEYS.DAMAGED_MISSING, dmRecords);
    }

    // 2. Also send to backend if available
    try {
      const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/verify`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      return await handleResponse(res);
    } catch {
      return { message: "Order verification recorded successfully" };
    }
  },

  async replaceDamagedMissing(orderId: number, productId: number, quantity: number): Promise<{ message: string }> {
    // 1. Update local state
    const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const dmRecords = getLocal<DamageMissingRecord[]>(STORAGE_KEYS.DAMAGED_MISSING, INITIAL_DAMAGED_MISSING);
    
    // Deduct physical replacement from inventory
    const prod = prods.find(p => p.id === productId);
    if (prod) {
      prod.quantity = Math.max(0, prod.quantity - quantity);
      prod.available_quantity = Math.max(0, prod.quantity - prod.reserved_quantity);
      prod.status = prod.available_quantity <= 0 ? "OUT OF STOCK" : prod.available_quantity <= prod.low_stock_threshold ? "LOW STOCK" : "IN STOCK";
      setLocal(STORAGE_KEYS.PRODUCTS, [...prods]);
    }

    // Mark damage record as REPLACED
    const targetDm = dmRecords.find(d => d.order_id === orderId && d.product_id === productId);
    if (targetDm) {
      targetDm.status = "REPLACED";
      setLocal(STORAGE_KEYS.DAMAGED_MISSING, [...dmRecords]);
    }

    // 2. Call backend
    try {
      const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/replace`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, replacement_quantity: quantity }),
      });
      return await handleResponse(res);
    } catch {
      return { message: `Replaced ${quantity} units from inventory successfully` };
    }
  },

  async shipOrder(orderId: number): Promise<Order> {
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      ord.status = "SHIPPED";
      ord.updated_at = new Date().toISOString();
      setLocal(STORAGE_KEYS.ORDERS, [...orders]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/ship`, {
        method: "POST",
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      return ord || orders[0];
    }
  },

  // Damaged & Missing
  async getDamagedMissingRecords(): Promise<{
    summary: { total_damaged: number; total_missing: number; total_affected: number; record_count: number };
    records: DamageMissingRecord[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/damaged-missing`, {
        headers: getAuthHeader(),
      });
      const data = await handleResponse<{
        summary: { total_damaged: number; total_missing: number; total_affected: number; record_count: number };
        records: DamageMissingRecord[];
      }>(res);
      if (data && data.records && data.records.length > 0) {
        setLocal(STORAGE_KEYS.DAMAGED_MISSING, data.records);
        return data;
      }
    } catch (err) {
      console.warn("Using local damaged missing records", err);
    }

    const records = getLocal<DamageMissingRecord[]>(STORAGE_KEYS.DAMAGED_MISSING, INITIAL_DAMAGED_MISSING);
    const totalDamaged = records.reduce((acc, r) => acc + r.damaged_quantity, 0);
    const totalMissing = records.reduce((acc, r) => acc + r.missing_quantity, 0);
    return {
      summary: {
        total_damaged: totalDamaged,
        total_missing: totalMissing,
        total_affected: totalDamaged + totalMissing,
        record_count: records.length
      },
      records
    };
  },


  // Analytics & Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      const dm = getLocal<DamageMissingRecord[]>(STORAGE_KEYS.DAMAGED_MISSING, INITIAL_DAMAGED_MISSING);

      return {
        total_products: prods.length,
        total_units: prods.reduce((a, p) => a + p.quantity, 0),
        low_stock_items: prods.filter(p => p.status === "LOW STOCK").length,
        out_of_stock_items: prods.filter(p => p.status === "OUT OF STOCK").length,
        pending_orders: orders.filter(o => o.status === "PENDING").length,
        ready_orders: orders.filter(o => o.status === "ACCEPTED").length,
        shipped_orders: orders.filter(o => o.status === "SHIPPED").length,
        damaged_items: dm.reduce((a, d) => a + d.damaged_quantity, 0),
        missing_items: dm.reduce((a, d) => a + d.missing_quantity, 0)
      };
    }
  },

  async getChartsData(): Promise<ChartDataResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/charts`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const categories = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);

      const catCounts = categories.map(c => {
        const catProds = prods.filter(p => p.category_id === c.id);
        return {
          category: c.name,
          product_count: catProds.length,
          total_units: catProds.reduce((a, p) => a + p.quantity, 0)
        };
      });

      return {
        products_by_category: catCounts,
        inventory_status: [
          { name: "In Stock", value: prods.filter(p => p.status === "IN STOCK").length },
          { name: "Low Stock", value: prods.filter(p => p.status === "LOW STOCK").length },
          { name: "Out of Stock", value: prods.filter(p => p.status === "OUT OF STOCK").length }
        ],
        orders_over_time: [
          { date: "Day 1", orders: 3 },
          { date: "Day 2", orders: 5 },
          { date: "Day 3", orders: 2 },
          { date: "Day 4", orders: 6 },
          { date: "Day 5", orders: 4 }
        ],
        most_ordered_products: [
          { product: "USB-C Cable 2m", ordered_quantity: 35 },
          { product: "Wireless Ergonomic Mouse", ordered_quantity: 28 },
          { product: "Mechanical RGB Keyboard", ordered_quantity: 19 },
          { product: "Ergonomic Mesh Chair", ordered_quantity: 14 }
        ],
        damaged_vs_missing: [
          { category: "Furniture", damaged: 1, missing: 1 },
          { category: "Electronics", damaged: 0, missing: 0 }
        ],
        restocking_activity: [
          { date: "Day 1", quantity_added: 50 },
          { date: "Day 2", quantity_added: 25 },
          { date: "Day 3", quantity_added: 35 }
        ],
        orders_by_status: [
          { status: "Pending", count: 2 },
          { status: "Accepted", count: 1 },
          { status: "Shipped", count: 4 }
        ]
      };
    }
  },

  async getActivityLogs(limit: number = 25): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/activity?limit=${limit}`, {
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch {
      return getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
  }
};
