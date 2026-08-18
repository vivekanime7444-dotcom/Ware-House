# StockFlow WMS — Enterprise Warehouse Management System

A high-performance, full-stack enterprise **Warehouse Management System (WMS)** built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **FastAPI**, **SQLAlchemy**, and **SQLite/PostgreSQL**.

StockFlow WMS delivers comprehensive inventory tracking, stock replenishment, dynamic order prioritization, physical verification with damaged/missing item detection and replacement, and real-time business intelligence analytics.

---

## 🌟 Key Functional Modules

1. **Dashboard Hub (4×2 Matrix View)**:
   - 3D cursor-perspective tilt cards providing instant telemetry for Total Inventory, Physical Units, Low Stock Threshold Alerts, Pending Orders, Ready Shipments, and Damaged/Missing Discrepancies.
2. **Central Inventory Module**:
   - Live available stock view with category filtering, real-time keyword search, stock status badges (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`), and quantity counters.
3. **Warehouse Status & SKU Management**:
   - Complete catalog audit, real-time product registration modal with threshold alerts, and obsolete SKU deletion for low-demand items.
4. **Restocking & Replenishment**:
   - Physical stock injection workflow with instant recalculation of available quantities, status updates, and audit trail logging.
5. **Order Placement**:
   - Customer order creation interface with direct numerical quantity inputs and real-time availability validation.
6. **Orders Prioritization Queue**:
   - Smart order fulfillment sorting based on available stock ratios, status progression (`PENDING` -> `ACCEPTED` -> `PROCESSING` -> `SHIPPED`), and category breakdown.
7. **Order Placement & Tracking (Verification)**:
   - Quality inspection table verifying item conditions (`Good`, `Damaged`, `Missing`), discrepancy auditing, and one-click replacement dispatch.
8. **Damaged & Missing Management**:
   - Live discrepancy monitoring, status filter tabs (`All`, `Pending`, `Replaced`), and resolution workflows.
9. **Low Stock & Out of Stock Monitoring**:
   - Automated threshold monitoring and immediate restock redirection.
10. **Analytics & Business Intelligence**:
    - 7 live interactive database charts powered by Recharts (Category breakdown, stock status distribution, order timelines, top ordered items, damaged vs. missing rates, restocking trends).

---

## 🧪 Comprehensive Testing Suite

StockFlow WMS includes a comprehensive automated test suite spanning **Unit Tests**, **Component Tests**, **Page Integration Tests**, and **End-to-End (E2E) Tests** with **80%+ code coverage** on critical paths.

### 📊 Testing Architecture

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── businessLogic.test.ts    # Stock math, status formulas, quality rules
│   │   │   ├── apiService.test.ts       # All 16 API endpoints + offline local storage sync
│   │   │   └── authContext.test.tsx     # Session management, JWT tokens, login/logout
│   │   ├── components/
│   │   │   ├── Header.test.tsx          # Title, search input, actions slot
│   │   │   ├── StatCard.test.tsx        # Metric counters, color variants
│   │   │   ├── StockBadge.test.tsx      # In-stock, low-stock, out-of-stock styles
│   │   │   ├── ProductImage.test.tsx    # Remote images, fallbacks, broken URL recovery
│   │   │   ├── Navbar.test.tsx          # Branding, user pill, notifications
│   │   │   ├── Sidebar.test.tsx         # Module navigation links & active route highlights
│   │   │   ├── NotificationsPopover.test.tsx # Stock alert notifications drawer
│   │   │   └── PriorityBadge.test.tsx   # Dynamic order prioritization badges
│   │   └── pages/
│   │       ├── Dashboard.test.tsx       # Hub cards & metric loading
│   │       ├── Inventory.test.tsx       # Available stock view & category filters
│   │       ├── WarehouseStatus.test.tsx # Catalog grid, add product, delete SKU
│   │       ├── OrderPlacement.test.tsx  # Direct quantity input & order placement
│   │       ├── Orders.test.tsx          # Priority queue, accept order, status filter
│   │       ├── OrderTracking.test.tsx   # Quality verification, replacement, shipment
│   │       ├── DamagedMissing.test.tsx  # Issue records, status filters, quick replace
│   │       ├── Restocking.test.tsx      # Stock injection & audit history table
│   │       ├── LowStock.test.tsx        # Threshold alerts & out-of-stock monitor
│   │       └── Analysis.test.tsx        # KPI charts & database analytics
│   └── test/
│       └── setup.ts                     # Jest-DOM matchers, DOM mocks, localStorage resets
├── e2e/
│   ├── navigation.spec.ts               # Core app routing & hub navigation
│   ├── inventory.spec.ts                # Search & category filters
│   ├── order-lifecycle.spec.ts          # Order placement -> queue -> tracking -> shipment
│   └── product-management.spec.ts       # SKU registration & catalog management
├── vitest.config.ts                     # Vitest runner + v8 coverage configuration
└── playwright.config.ts                 # Playwright E2E configuration
```

### 🚀 Running the Tests

#### 1. Run Frontend Unit, Component & Integration Tests
```bash
# In the root or frontend directory:
npm test
# Or with hot-reload watch mode:
npm run test:watch
```

#### 2. Run Code Coverage Report (Target: 80%+)
```bash
npm run test:coverage
```

#### 3. Run Backend Pytest Suite
```bash
# Windows PowerShell:
set PYTHONPATH=backend && python -m pytest backend/tests/test_wms.py -v

# Linux/macOS:
PYTHONPATH=backend python -m pytest backend/tests/test_wms.py -v
```

#### 4. Run End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+) & npm
- Python (3.10+)

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\Activate
# On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API interactive Swagger docs are available at `http://127.0.0.1:8000/docs`.

---

## 🔒 Offline Resilience & Synchronization
StockFlow WMS features an intelligent offline sync layer in `frontend/src/services/api.ts` with comprehensive local storage caching. All 24 catalog products, restocks, orders, and damaged/missing records operate without disruption even when the backend API is disconnected or starting up.
