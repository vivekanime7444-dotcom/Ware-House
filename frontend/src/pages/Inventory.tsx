import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ProductImage } from "../components/ProductImage";
import { StockBadge } from "../components/StockBadge";
import { api } from "../services/api";
import type { Product, Category } from "../types";
import { Filter, Loader2, PackageCheck, CheckCircle } from "lucide-react";

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts({
          search: searchQuery,
          category_name: selectedCategory,
          stock_status: stockFilter,
        }),
      ]);
      setCategories(cats);
      // Filter ONLY available items in the warehouse at the moment
      const availableProds = prods.filter((p) => p.available_quantity > 0);
      setProducts(availableProds);
    } catch (err) {
      console.error("Failed to load available inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, stockFilter, searchQuery]);

  const totalAvailableUnits = products.reduce((acc, p) => acc + p.available_quantity, 0);

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Central Inventory Module"
        subtitle="Currently available items in stock across warehouse locations"
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search product code, title, category..."
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {/* Availability Overview Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Active Available Stock View</h3>
              <p className="text-xs text-slate-500 font-medium">
                Displaying products with ready-to-ship available quantities at this moment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available SKUs</p>
              <p className="text-xl font-black text-slate-900 font-outfit">{loading ? "…" : products.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Available Units</p>
              <p className="text-xl font-black text-sky-600 font-outfit">{loading ? "…" : totalAvailableUnits}</p>
            </div>
          </div>
        </div>

        {/* Category Tab Bar & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-400/30"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-400/30"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-semibold"
              >
                <option value="ALL">All Available Statuses</option>
                <option value="IN STOCK">In Stock</option>
                <option value="LOW STOCK">Low Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid - Full Window Responsive Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Fetching available stock items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-outfit">No available products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are currently no items available in the warehouse matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 hover:border-sky-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Image Container */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      category={product.category_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <StockBadge status={product.status} size="sm" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-slate-700 border border-slate-200 shadow-xs">
                      {product.product_code}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                        {product.category_name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 font-outfit line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                        {product.description || "Available in warehouse inventory."}
                      </p>
                    </div>

                    {/* Available Quantities breakdown */}
                    <div className="bg-sky-50/70 rounded-xl p-3 border border-sky-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-700 font-semibold">
                        <span>Available Now:</span>
                        <span className="font-extrabold text-emerald-600">{product.available_quantity} units</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 text-[11px]">
                        <span>Total Warehouse Stock:</span>
                        <span className="font-semibold text-slate-700">{product.quantity} units</span>
                      </div>
                      {product.reserved_quantity > 0 && (
                        <div className="flex justify-between items-center text-amber-700 text-[11px] font-semibold">
                          <span>Reserved:</span>
                          <span>{product.reserved_quantity} units</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
