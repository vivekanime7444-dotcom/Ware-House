import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { ProductImage } from "../components/ProductImage";
import { StockBadge } from "../components/StockBadge";
import { api } from "../services/api";
import type { Product, RestockTransaction } from "../types";
import { Search, RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export const Restocking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("product_id");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [history, setHistory] = useState<RestockTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, hist] = await Promise.all([
        api.getProducts({ search: searchQuery }),
        api.getRestockHistory()
      ]);
      setProducts(prods);
      setHistory(hist);

      if (preselectedId && !selectedProduct) {
        const found = prods.find((p) => p.id === Number(preselectedId));
        if (found) setSelectedProduct(found);
      } else if (prods.length > 0 && !selectedProduct) {
        setSelectedProduct(prods[0]);
      }
    } catch (err) {
      console.error("Restock page error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (restockQty <= 0) {
      setErrorMsg("Restock quantity must be greater than zero");
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSubmitting(true);

      const tx = await api.restockProduct(selectedProduct.id, restockQty);
      setSuccessMsg(`Successfully added +${restockQty} units to ${selectedProduct.name}. New total: ${tx.new_quantity} units.`);

      await loadData();

      const updated = await api.getProducts({ search: selectedProduct.product_code });
      if (updated.length > 0) {
        setSelectedProduct(updated[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to perform restocking transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Restocking & Replenishment"
        subtitle="Search products to add physical stock, recalculate availability, and view audit trail"
      />

      <main className="p-6 md:p-8 space-y-8 max-w-full mx-auto w-full flex-1">
        {/* Top Product Selector Search */}
        <section className="bg-[#c3f0d8]/50 border border-[#80ddb0] rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-700" />
            Stock Replenishment Workflow
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type product name, product ID (e.g. ELE-101)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#80ddb0] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Feedback Banners */}
          {successMsg && (
            <div role="alert" aria-live="polite" className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div role="alert" aria-live="polite" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}


          {/* Selected Product Restock Form Panel */}
          {selectedProduct ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/70 border border-[#80ddb0]/80 rounded-2xl p-5">
              {/* Product Visual */}
              <div className="md:col-span-4 flex flex-col items-center justify-center">
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs">
                  <ProductImage
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    category={selectedProduct.category_name}
                  />
                </div>
              </div>

              {/* Product Info & Restock Controls */}
              <div className="md:col-span-8 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {selectedProduct.category_name}
                    </span>
                    <StockBadge status={selectedProduct.status} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-outfit mt-1">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Product ID: <span className="text-slate-800 font-bold">{selectedProduct.product_code}</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Stock</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedProduct.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Reserved</span>
                    <span className="text-base font-extrabold text-amber-600">{selectedProduct.reserved_quantity} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Available</span>
                    <span className="text-base font-extrabold text-emerald-600">{selectedProduct.available_quantity} units</span>
                  </div>
                </div>

                <form onSubmit={handleRestock} className="flex items-end gap-4 pt-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Restock Quantity Input
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={restockQty}
                      onChange={(e) => setRestockQty(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-extrabold focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        [ RESTOCK ]
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Select a product to initiate restocking.</p>
          )}

          {/* Quick Select Product List Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Select Product to Restock ({products.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedProduct?.id === p.id
                      ? "bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold shadow-xs"
                      : "bg-white/80 border-[#80ddb0]/60 text-slate-700 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  <div className="flex justify-between items-center mt-1 text-[10px]">
                    <span className="font-mono text-slate-400">{p.product_code}</span>
                    <span className={p.quantity === 0 ? "text-rose-600 font-extrabold" : "text-emerald-700 font-bold"}>
                      {p.quantity} units
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Restocking History Table */}
        <section className="bg-[#c3f0d8]/40 border border-[#80ddb0] rounded-3xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 font-outfit">
            Restocking Audit History
          </h2>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Loading audit table...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No restocking transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#80ddb0] text-slate-600 uppercase text-[10px] font-bold tracking-wider bg-[#c3f0d8]/60">
                    <th className="p-3">ID</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Product Code</th>
                    <th className="p-3">Added</th>
                    <th className="p-3">Previous Stock</th>
                    <th className="p-3">New Stock</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Date / Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#80ddb0]/40 font-medium">
                  {history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/60 text-slate-700">
                      <td className="p-3 font-mono text-slate-400">#{tx.id}</td>
                      <td className="p-3 font-bold text-slate-900">{tx.product_name}</td>
                      <td className="p-3 font-mono text-slate-500">{tx.product_code}</td>
                      <td className="p-3 font-extrabold text-emerald-700">+{tx.quantity_added}</td>
                      <td className="p-3 text-slate-500">{tx.previous_quantity}</td>
                      <td className="p-3 font-bold text-slate-900">{tx.new_quantity}</td>
                      <td className="p-3 font-semibold text-slate-700">{tx.user_name}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
