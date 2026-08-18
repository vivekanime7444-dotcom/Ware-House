import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { ProductImage } from "../components/ProductImage";
import { StockBadge } from "../components/StockBadge";
import { api } from "../services/api";
import type { Product } from "../types";
import { AlertTriangle, AlertCircle, RefreshCw, Loader2, ArrowRight } from "lucide-react";

export const LowStock: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "OUT" ? "OUT" : "LOW";

  const [activeTab, setActiveTab] = useState<"LOW" | "OUT">(initialTab as "LOW" | "OUT");
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [low, out] = await Promise.all([
        api.getLowStockProducts(),
        api.getOutOfStockProducts()
      ]);
      setLowStockProducts(low);
      setOutOfStockProducts(out);
    } catch (err) {
      console.error("Low stock load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayedProducts = activeTab === "LOW" ? lowStockProducts : outOfStockProducts;

  const handleTabChange = (tab: "LOW" | "OUT") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Low Stock & Out of Stock Module"
        subtitle="Automated alerts for inventory below thresholds and out-of-stock SKUs requiring immediate restocking"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-[#c5c9e0] pb-3">
          <button
            onClick={() => handleTabChange("LOW")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "LOW"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-[#e8eaf5]/70 text-slate-700 border border-[#c5c9e0] hover:bg-[#e8eaf5] hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            LOW STOCK ({lowStockProducts.length})
          </button>

          <button
            onClick={() => handleTabChange("OUT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "OUT"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-[#e8eaf5]/70 text-slate-700 border border-[#c5c9e0] hover:bg-[#e8eaf5] hover:text-slate-900"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            OUT OF STOCK ({outOfStockProducts.length})
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Checking stock status thresholds...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-20 bg-[#e8eaf5]/40 border border-[#c5c9e0] rounded-3xl text-center shadow-xs">
            <p className="text-sm font-bold text-slate-700">
              No products currently in {activeTab === "LOW" ? "LOW STOCK" : "OUT OF STOCK"} state!
            </p>
            <p className="text-xs text-slate-500 mt-1">Inventory levels are healthy across this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {displayedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#e8eaf5]/60 border border-[#c5c9e0] hover:border-indigo-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="h-44 w-full bg-[#f0f2fa] relative overflow-hidden border-b border-[#c5c9e0]/60">
                    <ProductImage
                      src={p.image_url}
                      alt={p.name}
                      category={p.category_name}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <StockBadge status={p.status} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                        {p.category_name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 font-outfit truncate mt-0.5">{p.name}</h3>
                      <p className="text-xs font-mono text-slate-500">ID: {p.product_code}</p>
                    </div>

                    <div className="bg-white/70 p-3 rounded-xl border border-[#c5c9e0]/60 space-y-1 text-xs">
                      <div className="flex justify-between items-center text-slate-700 font-semibold">
                        <span>Current Stock:</span>
                        <span className={`font-extrabold ${p.quantity === 0 ? "text-rose-600" : "text-amber-600"}`}>
                          {p.quantity} units
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 text-[11px]">
                        <span>Configured Threshold:</span>
                        <span className="font-semibold text-slate-700">{p.low_stock_threshold} units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Restock Shortcut Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => navigate(`/restocking?product_id=${p.id}`)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    [ RESTOCK PRODUCT ]
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
