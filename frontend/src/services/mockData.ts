import type {
  Product, Category, Order, RestockTransaction, DamageMissingRecord,
  AuditLog
} from "../types";


export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Groceries", description: "Fresh produce, packaged foods, and beverages", image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Electronics", description: "Computer accessories, cables, and gadgets", image_url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Furniture", description: "Office chairs, desks, lamps, and storage", image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Toys", description: "Children toys, puzzles, and educational sets", image_url: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Fashion", description: "Apparel, footwear, and accessories", image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "Home Appliances", description: "Kitchen items, climate control, and home tech", image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80" },
  { id: 7, name: "Mobiles", description: "Smartphones, chargers, and mobile accessories", image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80" },
  { id: 8, name: "Sports", description: "Fitness gear, outdoor equipment, and activewear", image_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80" }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Electronics
  {
    id: 1, product_code: "ELE-101", name: "USB-C Cable 2m",
    description: "High-speed fast charging USB-C nylon braided cable",
    category_id: 2, category_name: "Electronics",
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
    quantity: 5, reserved_quantity: 3, available_quantity: 2,
    low_stock_threshold: 10, status: "LOW STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2, product_code: "ELE-102", name: "Wireless Ergonomic Mouse",
    description: "2.4GHz silent optical wireless mouse",
    category_id: 2, category_name: "Electronics",
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
    quantity: 35, reserved_quantity: 0, available_quantity: 35,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3, product_code: "ELE-103", name: "Mechanical RGB Keyboard",
    description: "Tactile switch mechanical gaming keyboard",
    category_id: 2, category_name: "Electronics",
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    quantity: 18, reserved_quantity: 4, available_quantity: 14,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4, product_code: "ELE-104", name: "4K Ultra HD HDMI Cable",
    description: "Ultra high speed 4K 60Hz HDMI 2.0 cable",
    category_id: 2, category_name: "Electronics",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    quantity: 4, reserved_quantity: 0, available_quantity: 4,
    low_stock_threshold: 10, status: "LOW STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5, product_code: "ELE-105", name: "20000mAh Power Bank",
    description: "Dual output fast charging portable power bank",
    category_id: 2, category_name: "Electronics",
    image_url: "https://images.unsplash.com/photo-1609592424074-8c8d8b4c0556?auto=format&fit=crop&w=400&q=80",
    quantity: 30, reserved_quantity: 0, available_quantity: 30,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Mobiles
  {
    id: 6, product_code: "MOB-201", name: "Smartphone Pro Max A",
    description: "6.7 inch OLED screen, 256GB storage, triple camera",
    category_id: 7, category_name: "Mobiles",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
    quantity: 25, reserved_quantity: 0, available_quantity: 25,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7, product_code: "MOB-202", name: "Smartphone Lite B",
    description: "6.1 inch display, 128GB, long battery life",
    category_id: 7, category_name: "Mobiles",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80",
    quantity: 8, reserved_quantity: 0, available_quantity: 8,
    low_stock_threshold: 10, status: "LOW STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8, product_code: "MOB-204", name: "65W GaN Fast Wall Charger",
    description: "Compact dual USB-C multi-port fast charger",
    category_id: 7, category_name: "Mobiles",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    quantity: 15, reserved_quantity: 0, available_quantity: 15,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Groceries
  {
    id: 9, product_code: "GRO-301", name: "Organic Arabica Coffee Beans 1kg",
    description: "100% premium roasted whole bean coffee",
    category_id: 1, category_name: "Groceries",
    image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    quantity: 45, reserved_quantity: 0, available_quantity: 45,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10, product_code: "GRO-302", name: "Unsweetened Almond Milk 1L",
    description: "Plant-based dairy alternative milk",
    category_id: 1, category_name: "Groceries",
    image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    quantity: 12, reserved_quantity: 0, available_quantity: 12,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 11, product_code: "GRO-303", name: "70% Dark Chocolate Bar 100g",
    description: "Organic single-origin dark cocoa bar",
    category_id: 1, category_name: "Groceries",
    image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80",
    quantity: 25, reserved_quantity: 0, available_quantity: 25,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Furniture
  {
    id: 12, product_code: "FUR-401", name: "Ergonomic Mesh Office Chair",
    description: "Adjustable lumbar support high-back office chair",
    category_id: 3, category_name: "Furniture",
    image_url: "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=400&q=80",
    quantity: 14, reserved_quantity: 5, available_quantity: 9,
    low_stock_threshold: 10, status: "LOW STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 13, product_code: "FUR-402", name: "Motorized Electric Standing Desk",
    description: "Dual motor height-adjustable bamboo desk",
    category_id: 3, category_name: "Furniture",
    image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80",
    quantity: 6, reserved_quantity: 0, available_quantity: 6,
    low_stock_threshold: 10, status: "LOW STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 14, product_code: "FUR-403", name: "Dimmable LED Desk Lamp",
    description: "Touch control desk light with wireless charger",
    category_id: 3, category_name: "Furniture",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80",
    quantity: 22, reserved_quantity: 0, available_quantity: 22,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Toys
  {
    id: 15, product_code: "TOY-501", name: "High-Speed Remote Control Car",
    description: "1:16 scale off-road 4WD RC monster truck",
    category_id: 4, category_name: "Toys",
    image_url: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80",
    quantity: 16, reserved_quantity: 0, available_quantity: 16,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 16, product_code: "TOY-502", name: "3D Wooden Puzzle Set",
    description: "Brain teaser mechanical model building kit",
    category_id: 4, category_name: "Toys",
    image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=80",
    quantity: 190, reserved_quantity: 0, available_quantity: 190,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 17, product_code: "TOY-503", name: "Architectural Building Block Set",
    description: "500-piece creative building brick set",
    category_id: 4, category_name: "Toys",
    image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80",
    quantity: 30, reserved_quantity: 0, available_quantity: 30,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Fashion
  {
    id: 18, product_code: "FAS-601", name: "Classic Vintage Denim Jacket",
    description: "100% cotton premium washed denim jacket",
    category_id: 5, category_name: "Fashion",
    image_url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=400&q=80",
    quantity: 20, reserved_quantity: 0, available_quantity: 20,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 19, product_code: "FAS-602", name: "Organic Cotton Crewneck T-Shirt",
    description: "Breathable soft jersey cotton everyday t-shirt",
    category_id: 5, category_name: "Fashion",
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    quantity: 50, reserved_quantity: 10, available_quantity: 40,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 20, product_code: "FAS-603", name: "Pro Cushion Running Sneakers",
    description: "Lightweight mesh athletic road running shoes",
    category_id: 5, category_name: "Fashion",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    quantity: 12, reserved_quantity: 0, available_quantity: 12,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Home Appliances
  {
    id: 21, product_code: "HAP-701", name: "HEPA Air Purifier Pro",
    description: "Quiet air cleaner with true HEPA filter for rooms up to 500 sq ft",
    category_id: 6, category_name: "Home Appliances",
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80",
    quantity: 8, reserved_quantity: 0, available_quantity: 8,
    low_stock_threshold: 10, status: "LOW STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 22, product_code: "HAP-702", name: "Compact Countertop Microwave 20L",
    description: "Digital stainless steel microwave oven",
    category_id: 6, category_name: "Home Appliances",
    image_url: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80",
    quantity: 11, reserved_quantity: 0, available_quantity: 11,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Sports
  {
    id: 23, product_code: "SPO-801", name: "Non-Slip Yoga Mat 6mm",
    description: "Eco-friendly TPE alignment line fitness mat",
    category_id: 8, category_name: "Sports",
    image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=400&q=80",
    quantity: 25, reserved_quantity: 0, available_quantity: 25,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 24, product_code: "SPO-803", name: "Insulated Stainless Water Bottle 1L",
    description: "Double-wall vacuum insulated thermo flask",
    category_id: 8, category_name: "Sports",
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80",
    quantity: 40, reserved_quantity: 0, available_quantity: 40,
    low_stock_threshold: 10, status: "IN STOCK",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    order_number: "ORD-1001",
    user_id: 2,
    user_name: "warehouse",
    status: "PENDING",
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    items: [
      { id: 1, product_id: 1, product_name: "USB-C Cable 2m", product_code: "ELE-101", quantity: 3, unit_price: 12.99, current_available: 2 }
    ],
    fulfillment_ratio: 1.0,
    priority_label: "High Priority"
  },
  {
    id: 2,
    order_number: "ORD-1002",
    user_id: 1,
    user_name: "admin",
    status: "ACCEPTED",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    items: [
      { id: 2, product_id: 3, product_name: "Mechanical RGB Keyboard", product_code: "ELE-103", quantity: 4, unit_price: 79.99, current_available: 14 }
    ],
    fulfillment_ratio: 1.0,
    priority_label: "High Priority"
  },
  {
    id: 3,
    order_number: "ORD-1003",
    user_id: 1,
    user_name: "admin",
    status: "PROCESSING",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    items: [
      { id: 3, product_id: 12, product_name: "Ergonomic Mesh Office Chair", product_code: "FUR-401", quantity: 5, unit_price: 189.99, current_available: 9 }
    ],
    fulfillment_ratio: 1.0,
    priority_label: "High Priority"
  },
  {
    id: 4,
    order_number: "ORD-1004",
    user_id: 2,
    user_name: "warehouse",
    status: "SHIPPED",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    items: [
      { id: 4, product_id: 19, product_name: "Organic Cotton Crewneck T-Shirt", product_code: "FAS-602", quantity: 10, unit_price: 19.99, current_available: 40 }
    ],
    fulfillment_ratio: 1.0,
    priority_label: "High Priority"
  }
];

export const INITIAL_RESTOCKS: RestockTransaction[] = [
  {
    id: 1, product_id: 1, product_name: "USB-C Cable 2m", product_code: "ELE-101",
    quantity_added: 5, previous_quantity: 0, new_quantity: 5, user_name: "admin",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 2, product_id: 2, product_name: "Wireless Ergonomic Mouse", product_code: "ELE-102",
    quantity_added: 20, previous_quantity: 15, new_quantity: 35, user_name: "warehouse",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const INITIAL_DAMAGED_MISSING: DamageMissingRecord[] = [
  {
    id: 1, order_id: 3, order_number: "ORD-1003",
    product_id: 12, product_name: "Ergonomic Mesh Office Chair", product_code: "FUR-401",
    category_name: "Furniture", damaged_quantity: 1, missing_quantity: 1,
    status: "REPORTED", created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 1, action: "SYSTEM_INIT", entity: "System", entity_id: 1, user_name: "admin", timestamp: new Date(Date.now() - 15 * 86400000).toISOString(), details: "StockFlow WMS Database Initialized." },
  { id: 2, action: "RESTOCK", entity: "Product", entity_id: 1, user_name: "admin", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), details: "Restocked USB-C Cable +5 units." },
  { id: 3, action: "PLACE_ORDER", entity: "Order", entity_id: 1, user_name: "warehouse", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), details: "Order #ORD-1001 placed for 3x USB-C Cable." },
  { id: 4, action: "ACCEPT_ORDER", entity: "Order", entity_id: 2, user_name: "admin", timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), details: "Order #ORD-1002 accepted for verification." },
  { id: 5, action: "VERIFY_ORDER", entity: "Order", entity_id: 3, user_name: "admin", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), details: "Order #ORD-1003 verified (3 Good, 1 Damaged, 1 Missing)." },
  { id: 6, action: "SHIP_ORDER", entity: "Order", entity_id: 4, user_name: "warehouse", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), details: "Order #ORD-1004 shipped successfully." }
];
