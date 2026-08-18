import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { StatCard } from "../components/StatCard";
import { ProductImage } from "../components/ProductImage";
import { api } from "../services/api";
import type { DamageMissingRecord } from "../types";
import { ShieldAlert, HelpCircle, AlertTriangle, Loader2, RefreshCw, CheckCircle2, Filter } from "lucide-react";

export const DamagedMissing: React.FC = () => {
  const [summary, setSummary] = useState({
    total_damaged: 0,
    total_missing: 0,
    total_affected: 0,
    record_count: 0,
  });
  const [records, setRecords] = useState<DamageMissingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDamagedMissingRecords();
      setSummary(res.summary);
      setRecords(res.records);
    } catch (err) {
      console.error("Damaged missing error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReplaceItem = async (rec: DamageMissingRecord) => {
    try {
      setReplacingId(rec.id);
      setActionMsg(null);
      const totalQty = rec.damaged_quantity + rec.missing_quantity;
      await api.replaceDamagedMissing(rec.order_id, rec.product_id, totalQty);
      setActionMsg(`Successfully replaced ${totalQty} units of ${rec.product_name || "Product"}.`);
      await loadData();
    } catch (err: any) {
      console.error("Replacement error:", err);
      setActionMsg(err.message || "Failed to issue replacement.");
    } finally {
      setReplacingId(null);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (statusFilter === "REPORTED") return r.status === "REPORTED" || !r.status;
    if (statusFilter === "REPLACED") return r.status === "REPLACED";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full font-sans">
      <Header
        title="Damaged & Missing Module"
        subtitle="Track stock issues reported during order verification and monitor replacement history"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-full mx-auto w-full flex-1">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Damaged Items"
            value={loading ? "..." : summary.total_damaged}
            icon={ShieldAlert}
            color="rose"
            description="Items verified with physical damage"
          />
          <StatCard
            title="Total Missing Items"
            value={loading ? "..." : summary.total_missing}
            icon={HelpCircle}
            color="amber"
            description="Discrepancies reported during verification"
          />
          <StatCard
            title="Total Affected Items"
            value={loading ? "..." : summary.total_affected}
            icon={AlertTriangle}
            color="indigo"
            description="Combined total affected inventory"
          />
        </div>

        {/* Action Feedback Banner */}
        {actionMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{actionMsg}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-emerald-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Audit Log / List Section */}
        <section className="bg-[#b2eddb]/40 border border-[#5dd5ae] rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-outfit">
                Verification Issue Records ({filteredRecords.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live audit records logged during physical quality inspections & order verification.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-[#5dd5ae]/60 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  statusFilter === "ALL"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setStatusFilter("REPORTED")}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  statusFilter === "REPORTED"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({records.filter((r) => r.status === "REPORTED" || !r.status).length})
              </button>
              <button
                onClick={() => setStatusFilter("REPLACED")}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  statusFilter === "REPLACED"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Replaced ({records.filter((r) => r.status === "REPLACED").length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-teal-700 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading damage & missing audit records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-16 bg-white/70 border border-[#5dd5ae]/60 rounded-2xl text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-700">No damaged or missing items in this view.</p>
              <p className="text-xs text-slate-500 mt-1">
                {statusFilter === "REPORTED"
                  ? "All reported issues have been fully resolved with replacements!"
                  : "All verified orders have passed quality inspection."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((rec) => {
                const isPending = rec.status === "REPORTED" || !rec.status;
                const totalIssueQty = rec.damaged_quantity + rec.missing_quantity;

                return (
                  <div
                    key={rec.id}
                    className="bg-white border border-[#5dd5ae]/80 rounded-2xl p-4 space-y-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <ProductImage
                              src={rec.product_image}
                              alt={rec.product_name || "Product"}
                              category={rec.category_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                              {rec.category_name || "Warehouse"}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 truncate">{rec.product_name}</h3>
                            <p className="text-xs font-mono text-slate-500">{rec.product_code}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 border ${
                            isPending
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {isPending ? "PENDING REPLACEMENT" : "REPLACED"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#b2eddb]/25 p-2.5 rounded-xl border border-[#5dd5ae]/40 text-xs">
                        <div>
                          <span className="text-[10px] text-rose-700 font-bold uppercase block">Damaged Units</span>
                          <span className="text-sm font-black text-rose-600">{rec.damaged_quantity} units</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase block">Missing Units</span>
                          <span className="text-sm font-black text-amber-700">{rec.missing_quantity} units</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <div>
                        Order: <span className="font-mono font-bold text-teal-900">#{rec.order_number}</span>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() => handleReplaceItem(rec)}
                          disabled={replacingId === rec.id}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {replacingId === rec.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              Replace ({totalIssueQty})
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
