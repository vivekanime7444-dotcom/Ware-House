import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  RefreshCw,
  ShoppingCart,
  ClipboardList,
  Truck,
  AlertTriangle,
  Flame,
  BarChart3,
  Warehouse
} from "lucide-react";
import { APP_NAME } from "../config";
import { useAuth } from "../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard Hub (4x2)", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Boxes },
    { name: "Warehouse Status", path: "/warehouse-status", icon: Warehouse },
    { name: "Restocking", path: "/restocking", icon: RefreshCw },
    { name: "Order Placement", path: "/order-placement", icon: ShoppingCart },
    { name: "Orders", path: "/orders", icon: ClipboardList },
    { name: "Order Placement & Tracking", path: "/tracking", icon: Truck },
    { name: "Damaged & Missing", path: "/damaged-missing", icon: AlertTriangle },
    { name: "Low Stock & Out of Stock", path: "/low-stock", icon: Flame },
    { name: "Analysis", path: "/analysis", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none font-outfit">
              {APP_NAME}
            </h1>
            <p className="text-[11px] text-indigo-600 font-semibold tracking-wide uppercase mt-1">
              Enterprise WMS
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-indigo-600" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5 overflow-hidden px-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shrink-0">
            {user?.username?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || user?.username}</p>
            <p className="text-[10px] text-slate-500 capitalize truncate">{user?.role || "operator"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
