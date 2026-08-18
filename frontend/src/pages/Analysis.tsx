import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { api } from "../services/api";
import type { ChartDataResponse } from "../types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend, CartesianGrid
} from "recharts";
import { BarChart3, Loader2 } from "lucide-react";

export const Analysis: React.FC = () => {
  const [chartsData, setChartsData] = useState<ChartDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getChartsData();
      setChartsData(res);
    } catch (err) {
      console.error("Analysis load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    "IN STOCK": "#10b981",
    "LOW STOCK": "#f59e0b",
    "OUT OF STOCK": "#ef4444",
    "PENDING": "#f59e0b",
    "ACCEPTED": "#6366f1",
    "PROCESSING": "#06b6d4",
    "SHIPPED": "#10b981",
    "CANCELLED": "#ef4444",
  };

  const CATEGORY_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6"];

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Warehouse Analytics & Metrics"
        subtitle="7 Live interactive database charts powered by real-time inventory transactions"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {loading || !chartsData ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Querying real database analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Products by Category (Bar Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-700" />
                1. Products & Units by Category
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData.products_by_category}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef08a" />
                    <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Bar dataKey="product_count" name="Unique Products" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="total_units" name="Total Physical Units" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Inventory Status Distribution (Donut Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                2. Inventory Stock Status Distribution
              </h3>
              <div className="h-64 w-full text-xs flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartsData.inventory_status}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }: any) => `${name}: ${value}`}
                    >
                      {chartsData.inventory_status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || CATEGORY_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Orders Over Time (Area/Line Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                3. Order Volume Timeline
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartsData.orders_over_time}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef08a" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Area type="monotone" dataKey="orders" name="Orders Placed" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Most Ordered Products (Bar Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-800" />
                4. Top Most Ordered Products
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData.most_ordered_products} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef08a" />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="product" type="category" stroke="#64748b" width={110} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Bar dataKey="ordered_quantity" name="Total Units Ordered" fill="#d97706" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Damaged vs Missing by Category (Stacked Bar Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-700" />
                5. Damaged vs Missing Products
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData.damaged_vs_missing}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef08a" />
                    <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Legend />
                    <Bar dataKey="damaged" name="Damaged" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="missing" name="Missing" fill="#eab308" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6. Restocking Activity over Time (Line Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                6. Restocking Activity Trends
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartsData.restocking_activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef08a" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Line type="monotone" dataKey="quantity_added" name="Units Restocked" stroke="#059669" strokeWidth={2.5} dot={{ fill: "#059669" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 7. Orders by Status (Donut Chart) */}
            <div className="bg-[#fef9c3]/50 border border-[#fde047] rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-700" />
                7. Orders Distribution by Workflow Status
              </h3>
              <div className="h-64 w-full text-xs flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartsData.orders_by_status}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, count }: any) => `${status}: ${count}`}
                    >
                      {chartsData.orders_by_status.map((entry, index) => (
                        <Cell key={`cell-ord-${index}`} fill={STATUS_COLORS[entry.status] || CATEGORY_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#fde047", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
