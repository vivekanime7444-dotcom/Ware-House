import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { PriorityBadge } from "../components/PriorityBadge";
import { ProductImage } from "../components/ProductImage";
import { api } from "../services/api";
import type { Order } from "../types";
import { ClipboardList, CheckCircle2, Loader2, Filter, AlertCircle } from "lucide-react";

export const Orders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders({
        status_filter: statusFilter,
        search: searchQuery
      });
      setOrders(data);
    } catch (err) {
      console.error("Orders load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchQuery]);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSubmittingId(orderId);

      const updated = await api.acceptOrder(orderId);
      setSuccessMsg(`Order #${updated.order_number} successfully accepted and routed to Order Placement & Tracking!`);

      await loadOrders();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to accept order");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "ACCEPTED":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "PROCESSING":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "SHIPPED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
      <Header
        title="Orders Module & Prioritization Queue"
        subtitle="Prioritized orders sorted dynamically by stock fulfillment ratio"
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search by Order ID (e.g. ORD-1001)..."
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-slate-900 font-outfit">
              Prioritized Orders ({orders.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-[#fde8c0]/60 border border-[#fcd18a] rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-semibold"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Global Feedback Banners */}
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

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading prioritized order queue...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 bg-[#fde8c0]/40 border border-[#fcd18a] rounded-3xl text-center shadow-xs">
            <p className="text-sm font-bold text-slate-600">No orders match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className="bg-[#fde8c0]/50 border border-[#fcd18a] hover:border-amber-400 rounded-3xl p-6 shadow-sm space-y-4 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#fcd18a]/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-200/80 text-amber-900 border border-amber-300 flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-extrabold text-slate-900 font-mono">
                          ORDER #{order.order_number}
                        </h3>
                        <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${getStatusBadgeStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleString()} by <span className="text-slate-900 font-bold">{order.user_name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Priority score indicator */}
                  <div className="flex items-center gap-3">
                    <PriorityBadge ratio={order.fulfillment_ratio} label={order.priority_label} />
                  </div>
                </div>

                {/* Items List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-[#fcd18a]/70"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                        <ProductImage
                          src={item.product_image}
                          alt={item.product_name || "Product"}
                        />
                      </div>
                      <div className="overflow-hidden space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.product_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.product_code}</p>
                        <div className="flex items-center gap-3 text-[11px] pt-1">
                          <span className="text-amber-800 font-bold">Ordered: {item.quantity}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-emerald-700 font-bold">Available: {item.current_available}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Footer */}
                {order.status === "PENDING" && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={submittingId === order.id}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-40"
                    >
                      {submittingId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          [ ACCEPT ORDER ]
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
