import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ProductImage } from "../components/ProductImage";
import { api } from "../services/api";
import type { Order } from "../types";
import { Truck, CheckCircle2, ShieldAlert, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export const OrderTracking: React.FC = () => {
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Verification state map: product_id -> { good, damaged, missing }
  const [verifInputs, setVerifInputs] = useState<Record<number, { good: number; damaged: number; missing: number }>>({});

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [shipping, setShipping] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAccepted = async () => {
    try {
      setLoading(true);
      const orders = await api.getAcceptedOrders();
      setAcceptedOrders(orders);

      if (orders.length > 0) {
        const target = selectedOrder
          ? orders.find((o) => o.id === selectedOrder.id) || orders[0]
          : orders[0];
        setSelectedOrder(target);
        await loadSummary(target.id);
      } else {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Tracking load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async (orderId: number) => {
    try {
      const sum = await api.getVerificationSummary(orderId);

      const ord = acceptedOrders.find((o) => o.id === orderId) || selectedOrder;
      if (ord) {
        const inputMap: Record<number, { good: number; damaged: number; missing: number }> = {};
        ord.items.forEach((item) => {
          const existing = sum.verifications.find((v) => v.product_id === item.product_id);
          if (existing) {
            inputMap[item.product_id] = {
              good: existing.good_quantity,
              damaged: existing.damaged_quantity,
              missing: existing.missing_quantity,
            };
          } else {
            inputMap[item.product_id] = {
              good: item.quantity,
              damaged: 0,
              missing: 0,
            };
          }
        });
        setVerifInputs(inputMap);
      }
    } catch (err) {
      console.error("Failed to load verification summary:", err);
    }
  };

  useEffect(() => {
    loadAccepted();
  }, []);

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order);
    setSuccessMsg(null);
    setErrorMsg(null);
    await loadSummary(order.id);
  };

  const handleInputChange = (productId: number, field: "good" | "damaged" | "missing", value: number) => {
    setVerifInputs((prev) => {
      const current = prev[productId] || { good: 0, damaged: 0, missing: 0 };
      return {
        ...prev,
        [productId]: {
          ...current,
          [field]: Math.max(0, value),
        },
      };
    });
  };

  const handleVerify = async () => {
    if (!selectedOrder) return;

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setVerifying(true);

      const itemsToSubmit = selectedOrder.items.map((item) => {
        const inp = verifInputs[item.product_id] || { good: item.quantity, damaged: 0, missing: 0 };
        return {
          product_id: item.product_id,
          good_quantity: inp.good,
          damaged_quantity: inp.damaged,
          missing_quantity: inp.missing,
        };
      });

      await api.verifyOrderItems(selectedOrder.id, itemsToSubmit);
      setSuccessMsg(`Order #${selectedOrder.order_number} verified successfully!`);

      await loadAccepted();
      if (selectedOrder) await loadSummary(selectedOrder.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Order verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleReplace = async (productId: number, requiredQty: number) => {
    if (!selectedOrder) return;
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setReplacingId(productId);

      const res = await api.replaceDamagedMissing(selectedOrder.id, productId, requiredQty);
      setSuccessMsg(res.message);

      await loadAccepted();
      if (selectedOrder) await loadSummary(selectedOrder.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to replace damaged/missing stock");
    } finally {
      setReplacingId(null);
    }
  };

  const handleShip = async () => {
    if (!selectedOrder) return;

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setShipping(true);

      const shipped = await api.shipOrder(selectedOrder.id);
      setSuccessMsg(`Order #${shipped.order_number} shipped successfully! Physical stock deducted.`);

      await loadAccepted();
    } catch (err: any) {
      setErrorMsg(err.message || "Shipment failed");
    } finally {
      setShipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Order Placement & Tracking"
        subtitle="Verify item quality (Good, Damaged, Missing), replace affected items, and confirm final shipments"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading tracking queue...</p>
          </div>
        ) : acceptedOrders.length === 0 ? (
          <div className="py-20 bg-[#d5d8f5]/40 border border-[#a5aadc] rounded-3xl text-center shadow-xs">
            <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-outfit">No accepted orders pending verification</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Orders move here automatically after being accepted from the Orders module.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Order Selection Sidebar */}
            <div className="lg:col-span-4 bg-[#d5d8f5]/50 border border-[#a5aadc] rounded-3xl p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
                Accepted Orders Queue ({acceptedOrders.length})
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {acceptedOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                      selectedOrder?.id === ord.id
                        ? "bg-indigo-100/90 border-indigo-400 text-indigo-950 font-bold shadow-xs"
                        : "bg-white/70 border-[#a5aadc]/60 text-slate-700 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-sm text-slate-900">#{ord.order_number}</span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-200/80 text-indigo-900 border border-indigo-300">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {ord.items.length} item types &bull; {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Verification Details & Controls */}
            {selectedOrder && (
              <div className="lg:col-span-8 bg-[#d5d8f5]/40 border border-[#a5aadc] rounded-3xl p-6 space-y-6 shadow-sm">
                {/* Order Header */}
                <div className="flex items-center justify-between border-b border-[#a5aadc]/60 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-mono">
                      ORDER #{selectedOrder.order_number}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Status: <span className="text-indigo-800 font-bold">{selectedOrder.status}</span> &bull; Placed by {selectedOrder.user_name}
                    </p>
                  </div>
                </div>

                {/* Feedback Banners */}
                {successMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-bold">{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="font-bold">{errorMsg}</span>
                  </div>
                )}

                {/* Verification Table */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Item Verification
                  </h3>

                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => {
                      const inp = verifInputs[item.product_id] || { good: item.quantity, damaged: 0, missing: 0 };
                      const sumVal = inp.good + inp.damaged + inp.missing;
                      const isValidSum = sumVal === item.quantity;
                      const hasDamageOrMissing = inp.damaged > 0 || inp.missing > 0;
                      const totalNeededReplacement = inp.damaged + inp.missing;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                              <ProductImage src={item.product_image} alt={item.product_name || "Product"} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-900">{item.product_name}</h4>
                              <p className="text-xs font-mono text-slate-500">{item.product_code}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 block font-medium">Expected Qty</span>
                              <span className="text-base font-extrabold text-indigo-600">{item.quantity} units</span>
                            </div>
                          </div>

                          {/* Verification Inputs Grid */}
                          <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
                            <div>
                              <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">
                                Good Quantity
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={item.quantity}
                                value={inp.good}
                                onChange={(e) => handleInputChange(item.product_id, "good", Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-emerald-700 font-extrabold focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">
                                Damaged Quantity
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={item.quantity}
                                value={inp.damaged}
                                onChange={(e) => handleInputChange(item.product_id, "damaged", Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-rose-700 font-extrabold focus:outline-none focus:border-rose-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">
                                Missing Quantity
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={item.quantity}
                                value={inp.missing}
                                onChange={(e) => handleInputChange(item.product_id, "missing", Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-amber-700 font-extrabold focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Validation rule notice */}
                          {!isValidSum && (
                            <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Validation Error: Good ({inp.good}) + Damaged ({inp.damaged}) + Missing ({inp.missing}) = {sumVal}, must equal Expected Quantity ({item.quantity}).
                            </p>
                          )}

                          {/* Replacement button if damage/missing detected */}
                          {hasDamageOrMissing && (
                            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                              <span className="text-xs text-amber-800 font-bold flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                                {totalNeededReplacement} replacement units needed
                              </span>
                              <button
                                onClick={() => handleReplace(item.product_id, totalNeededReplacement)}
                                disabled={replacingId === item.product_id}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-40"
                              >
                                {replacingId === item.product_id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    REPLACE
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Workflow Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-40"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        VERIFY ORDER ITEMS
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShip}
                    disabled={shipping}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-40"
                  >
                    {shipping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        [ ORDER SHIPPED ]
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
