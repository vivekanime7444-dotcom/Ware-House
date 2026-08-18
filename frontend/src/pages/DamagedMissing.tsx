import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { StatCard } from "../components/StatCard";
import { ProductImage } from "../components/ProductImage";
import { api } from "../services/api";
import type { DamageMissingRecord } from "../types";
import { ShieldAlert, HelpCircle, AlertTriangle, Loader2 } from "lucide-react";

export const DamagedMissing: React.FC = () => {
  const [summary, setSummary] = useState({
    total_damaged: 0,
    total_missing: 0,
    total_affected: 0,
    record_count: 0,
  });
  const [records, setRecords] = useState<DamageMissingRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col text-slate-900 w-full">
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

        {/* Audit Log / List Section */}
        <section className="bg-[#b2eddb]/40 border border-[#5dd5ae] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit">
              Verification Issue Records ({records.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-teal-700 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading damage & missing audit records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 bg-white/70 border border-[#5dd5ae]/60 rounded-2xl text-center">
              <p className="text-sm font-bold text-slate-700">No damaged or missing products recorded.</p>
              <p className="text-xs text-slate-500 mt-1">All verified orders have passed 100% quality inspection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white/80 border border-[#5dd5ae]/80 rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                        <ProductImage
                          src={rec.product_image}
                          alt={rec.product_name || "Product"}
                          category={rec.category_name}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                          {rec.category_name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{rec.product_name}</h3>
                        <p className="text-xs font-mono text-slate-500">ID: {rec.product_code}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#b2eddb]/30 p-2.5 rounded-xl border border-[#5dd5ae]/50 text-xs shadow-xs">
                      <div>
                        <span className="text-[10px] text-rose-700 font-bold uppercase block">Damaged</span>
                        <span className="text-sm font-extrabold text-rose-600">{rec.damaged_quantity} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-800 font-bold uppercase block">Missing</span>
                        <span className="text-sm font-extrabold text-amber-700">{rec.missing_quantity} units</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#5dd5ae]/50 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <div>
                      Order: <span className="font-mono font-bold text-teal-800">#{rec.order_number}</span>
                    </div>
                    <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
