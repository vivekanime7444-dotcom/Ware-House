import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { ProductImage } from "../components/ProductImage";
import { StockBadge } from "../components/StockBadge";
import { api } from "../services/api";
import type { Product, Category } from "../types";
import {
  Plus,
  Trash2,
  Filter,
  Loader2,
  Warehouse,
  AlertCircle,
  X,
  CheckCircle2,
  TrendingDown,
  Package
} from "lucide-react";

export const WarehouseStatus: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Success / Error alerts
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCatId, setNewCatId] = useState<number>(1);
  const [newImage, setNewImage] = useState("");
  const [newQty, setNewQty] = useState<number>(10);
  const [newThresh, setNewThresh] = useState<number>(10);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Product Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowAddModal(true);
    }
  }, [searchParams]);

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
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load warehouse status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, stockFilter, searchQuery]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      setModalError("Product code and name are required");
      return;
    }

    try {
      setModalError(null);
      setModalSubmitting(true);
      const created = await api.createProduct({
        product_code: newCode.trim(),
        name: newName.trim(),
        description: newDesc.trim(),
        category_id: newCatId,
        image_url: newImage.trim() || undefined,
        quantity: newQty,
        low_stock_threshold: newThresh,
      });

      setShowAddModal(false);
      setNewCode("");
      setNewName("");
      setNewDesc("");
      setNewImage("");
      setNewQty(10);
      setSearchParams({});

      setAlertSuccess(`Product "${created.name}" (${created.product_code}) added to warehouse successfully!`);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to create product");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleteSubmitting(true);
      await api.deleteProduct(productToDelete.id);
      setAlertSuccess(`Product "${productToDelete.name}" (${productToDelete.product_code}) has been removed from warehouse.`);
      setProductToDelete(null);
      await loadData();
    } catch (err: any) {
      setAlertError(err.message || "Failed to delete product");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const totalStockCount = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalAvailableCount = products.reduce((acc, p) => acc + p.available_quantity, 0);
  const lowDemandCount = products.filter((p) => p.available_quantity === p.quantity && p.quantity > 0).length;

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Warehouse Status Module"
        subtitle="Complete catalog view, stock audit, product registration, and obsolete SKU deletion"
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search product code, name, category..."
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {/* Top Metric Cards Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warehouse Units</p>
              <h3 className="text-2xl font-black text-slate-900 font-outfit">{loading ? "…" : totalStockCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Units</p>
              <h3 className="text-2xl font-black text-slate-900 font-outfit">{loading ? "…" : totalAvailableCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Demand / Unmoved Items</p>
              <h3 className="text-2xl font-black text-slate-900 font-outfit">{loading ? "…" : lowDemandCount}</h3>
            </div>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {alertSuccess && (
          <div role="alert" aria-live="polite" className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="font-bold">{alertSuccess}</span>
            </div>
            <button onClick={() => setAlertSuccess(null)} aria-label="Dismiss success message" className="text-emerald-600 hover:text-emerald-800 font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {alertError && (
          <div role="alert" aria-live="polite" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
              <span className="font-bold">{alertError}</span>
            </div>
            <button onClick={() => setAlertError(null)} aria-label="Dismiss error message" className="text-rose-600 hover:text-rose-800 font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}


        {/* Category Tab Bar & Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
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
                    ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
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
                <option value="ALL">All Stock Status</option>
                <option value="IN STOCK">In Stock</option>
                <option value="LOW STOCK">Low Stock</option>
                <option value="OUT OF STOCK">Out of Stock</option>
              </select>
            </div>

            {/* Add Product Option */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Product Cards Grid - Window Filling Responsive Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Fetching warehouse items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
            <Warehouse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-outfit">No items in warehouse catalog</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No products match your current filters. Click "Add Product" above to insert a new SKU into the warehouse.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {products.map((product) => {
              const isLowDemand = product.reserved_quantity === 0 && product.quantity > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200"
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
                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                        <StockBadge status={product.status} size="sm" />
                        {isLowDemand && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] shadow-xs">
                            Low Demand
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-slate-700 border border-slate-200 shadow-xs">
                        {product.product_code}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          {product.category_name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit line-clamp-1 mt-0.5">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                          {product.description || "No description provided."}
                        </p>
                      </div>

                      {/* Warehouse Stock Breakdown */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-slate-700 font-semibold">
                          <span>Total Warehouse Stock:</span>
                          <span className="font-extrabold text-slate-900">{product.quantity} units</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 text-[11px]">
                          <span>Available for Orders:</span>
                          <span className="font-bold text-emerald-600">{product.available_quantity} units</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 text-[11px]">
                          <span>Reserved / In-Flight:</span>
                          <span className="font-semibold text-amber-600">{product.reserved_quantity} units</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Product Option */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Delete Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Add New Product to Warehouse</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{modalError}</span>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Product Code / SKU</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="e.g. WHS-101"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={newCatId}
                      onChange={(e) => setNewCatId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter product title"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Product specification & details..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Initial Stock Quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={newQty}
                      onChange={(e) => setNewQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min={1}
                      value={newThresh}
                      onChange={(e) => setNewThresh(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-amber-600/20"
                  >
                    {modalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-100 rounded-2xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">Delete Product from Warehouse</h3>
                  <p className="text-xs text-rose-600 font-medium">Remove due to low or zero demand</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p className="text-slate-800 font-bold">{productToDelete.name}</p>
                <p className="text-slate-500 font-mono">Code: {productToDelete.product_code}</p>
                <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                  <span>Current Physical Stock:</span>
                  <span className="font-extrabold text-slate-900">{productToDelete.quantity} units</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete this product? This action will remove it from the warehouse catalog and audit the deletion.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={deleteSubmitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  disabled={deleteSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20"
                >
                  {deleteSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
