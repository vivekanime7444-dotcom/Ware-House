import { API_BASE_URL } from "../config";
import type {
  User, Category, Product, RestockTransaction, Order,
  OrderVerificationSummary, DamageMissingRecord, DashboardSummary,
  AuditLog, ChartDataResponse
} from "../types";


function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
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
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Products
  async getProducts(params?: { search?: string; category_name?: string; stock_status?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category_name && params.category_name !== "All") query.append("category_name", params.category_name);
    if (params?.stock_status) query.append("stock_status", params.stock_status);

    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE_URL}/products/categories`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getLowStockProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/products/low-stock`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getOutOfStockProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/products/out-of-stock`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
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
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return handleResponse(res);
  },

  async deleteProduct(productId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },


  // Restocking
  async restockProduct(productId: number, quantityAdded: number): Promise<RestockTransaction> {
    const res = await fetch(`${API_BASE_URL}/restocks`, {
      method: "POST",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity_added: quantityAdded }),
    });
    return handleResponse(res);
  },

  async getRestockHistory(): Promise<RestockTransaction[]> {
    const res = await fetch(`${API_BASE_URL}/restocks`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Orders
  async placeOrder(items: { product_id: number; quantity: number }[]): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return handleResponse(res);
  },

  async getOrders(params?: { status_filter?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status_filter && params.status_filter !== "ALL") query.append("status_filter", params.status_filter);
    if (params?.search) query.append("search", params.search);

    const res = await fetch(`${API_BASE_URL}/orders?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async acceptOrder(orderId: number): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/accept`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async cancelOrder(orderId: number): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Order Tracking & Verification
  async getAcceptedOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE_URL}/tracking/accepted`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getVerificationSummary(orderId: number): Promise<OrderVerificationSummary> {
    const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/summary`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async verifyOrderItems(
    orderId: number,
    items: { product_id: number; good_quantity: number; damaged_quantity: number; missing_quantity: number }[]
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/verify`, {
      method: "POST",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return handleResponse(res);
  },

  async replaceDamagedMissing(orderId: number, productId: number, quantity: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/replace`, {
      method: "POST",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, replacement_quantity: quantity }),
    });
    return handleResponse(res);
  },

  async shipOrder(orderId: number): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/tracking/${orderId}/ship`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Damaged & Missing
  async getDamagedMissingRecords(): Promise<{
    summary: { total_damaged: number; total_missing: number; total_affected: number; record_count: number };
    records: DamageMissingRecord[];
  }> {
    const res = await fetch(`${API_BASE_URL}/damaged-missing`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Analytics & Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getChartsData(): Promise<ChartDataResponse> {
    const res = await fetch(`${API_BASE_URL}/analytics/charts`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Audit Activity Log
  async getActivityLogs(limit: number = 25): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE_URL}/activity?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  }
};
