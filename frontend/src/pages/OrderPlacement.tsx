import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ProductImage } from "../components/ProductImage";
import { StockBadge } from "../components/StockBadge";
import { api } from "../services/api";
import type { Product, Category } from "../types";
import { ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Loader2, Package } from "lucide-react";

export const OrderPlacement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Cart/Quantity selection state map: product_id -> order quantity
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts({ search: searchQuery, category_name: selectedCategory }),
      ]);
      setCategories(cats);
      setProducts(prods);

      setQuantities((prev) => {
        const initialQtyMap: Record<number, number> = { ...prev };
        prods.forEach((p) => {
          if (initialQtyMap[p.id] === undefined) {
            initialQtyMap[p.id] = p.available_quantity > 0 ? 1 : 0;
          }
        });
        return initialQtyMap;
      });
    } catch (err) {
      console.error("Order placement error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const setDirectQuantity = (productId: number, valStr: string, maxAvail: number) => {
    if (maxAvail === 0) return;
    const parsed = parseInt(valStr, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } else {
      const clamped = Math.min(maxAvail, Math.max(1, parsed));
      setQuantities((prev) => ({ ...prev, [productId]: clamped }));
    }
  };

  const updateQuantity = (productId: number, delta: number, maxAvail: number) => {
    if (maxAvail === 0) return;
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(maxAvail, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handlePlaceOrder = async (product: Product) => {
    const qty = quantities[product.id] || 1;
    if (qty <= 0) return;
    if (qty > product.available_quantity) {
      setErrorMsg(`Cannot place order: requested quantity (${qty}) exceeds available stock (${product.available_quantity}).`);
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSubmittingId(product.id);

      const order = await api.placeOrder([{ product_id: product.id, quantity: qty }]);
      setSuccessMsg(`Order #${order.order_number} placed successfully for ${qty}x ${product.name}! Stock reserved.`);

      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to place order");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Order Placement Module"
        subtitle="Select warehouse products and enter exact desired quantities to place customer orders"
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search available catalog items..."
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "All"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-[#ffd6d6]/70 text-slate-700 border border-[#fca5a5] hover:bg-[#ffd6d6] hover:text-slate-900"
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
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-[#ffd6d6]/70 text-slate-700 border border-[#fca5a5] hover:bg-[#ffd6d6] hover:text-slate-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Global Feedback Banners */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Products Grid - Window Filling Responsive Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 bg-[#ffd6d6]/40 border border-[#fca5a5] rounded-3xl text-center shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No products available for order placement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {products.map((product) => {
              const currentQty = quantities[product.id] ?? (product.available_quantity > 0 ? 1 : 0);
              const isOutOfStock = product.available_quantity === 0;

              return (
                <div
                  key={product.id}
                  className="bg-[#ffd6d6]/50 border border-[#fca5a5] hover:border-rose-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200"
                >
                  <div>
                    {/* Product Image */}
                    <div className="h-44 w-full bg-[#ffe4e4] relative overflow-hidden border-b border-[#fca5a5]/50">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        category={product.category_name}
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <StockBadge status={product.status} size="sm" />
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                          {product.category_name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit line-clamp-1 mt-0.5">
                          {product.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {product.product_code}</p>
                      </div>

                      <div className="bg-white/70 rounded-xl p-3 border border-[#fca5a5]/60 flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold">Available Quantity:</span>
                        <span className={`font-extrabold ${isOutOfStock ? "text-rose-700" : "text-emerald-700"}`}>
                          {product.available_quantity} units
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Number Input & Place Order Controls */}
                  <div className="p-4 pt-0 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                        Enter Desired Quantity:
                      </label>
                      <div className="flex items-center gap-1.5 bg-white border border-[#fca5a5] rounded-xl p-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1, product.available_quantity)}
                          disabled={isOutOfStock || currentQty <= 1}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 font-bold shrink-0"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min={1}
                          max={product.available_quantity}
                          disabled={isOutOfStock}
                          value={isOutOfStock ? 0 : currentQty}
                          onChange={(e) => setDirectQuantity(product.id, e.target.value, product.available_quantity)}
                          className="w-full text-center font-black text-sm text-slate-900 focus:outline-none bg-transparent disabled:opacity-50"
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1, product.available_quantity)}
                          disabled={isOutOfStock || currentQty >= product.available_quantity}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 font-bold shrink-0"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlaceOrder(product)}
                      disabled={isOutOfStock || submittingId === product.id}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                    >
                      {submittingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          PLACE ORDER ({isOutOfStock ? 0 : currentQty} UNITS)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
