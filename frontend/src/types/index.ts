export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
}


export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  category_id: number;
  category_name?: string;
  image_url?: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  created_at: string;
  updated_at: string;
}

export interface RestockTransaction {
  id: number;
  product_id: number;
  product_name?: string;
  product_code?: string;
  quantity_added: number;
  previous_quantity: number;
  new_quantity: number;
  user_name?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  product_code?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  current_available?: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_name?: string;
  status: "PENDING" | "ACCEPTED" | "PROCESSING" | "SHIPPED" | "CANCELLED";
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  fulfillment_ratio: number;
  priority_label: string;
}

export interface ItemVerificationOut {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  expected_quantity: number;
  good_quantity: number;
  damaged_quantity: number;
  missing_quantity: number;
  is_verified: boolean;
  verified_at: string;
}

export interface OrderVerificationSummary {
  order_id: number;
  order_number: string;
  status: string;
  verifications: ItemVerificationOut[];
  total_damaged: number;
  total_missing: number;
  replacement_needed: number;
  can_ship: boolean;
}

export interface DamageMissingRecord {
  id: number;
  order_id: number;
  order_number?: string;
  product_id: number;
  product_name?: string;
  product_code?: string;
  product_image?: string;
  category_name?: string;
  damaged_quantity: number;
  missing_quantity: number;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  total_products: number;
  total_units: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_orders: number;
  ready_orders: number;
  shipped_orders: number;
  damaged_items: number;
  missing_items: number;
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id?: number;
  user_name: string;
  timestamp: string;
  details?: string;
}

export interface ChartDataResponse {
  products_by_category: { category: string; product_count: number; total_units: number }[];
  inventory_status: { name: string; value: number }[];
  orders_over_time: { date: string; orders: number }[];
  most_ordered_products: { product: string; ordered_quantity: number }[];
  damaged_vs_missing: { category: string; damaged: number; missing: number }[];
  restocking_activity: { date: string; quantity_added: number }[];
  orders_by_status: { status: string; count: number }[];
}
