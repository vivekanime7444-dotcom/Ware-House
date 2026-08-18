import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, AlertCircle, Package } from "lucide-react";
import { api } from "../services/api";
import type { Product } from "../types";

export const NotificationsPopover: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [outOfStock, setOutOfStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const [low, out] = await Promise.all([
        api.getLowStockProducts(),
        api.getOutOfStockProducts(),
      ]);
      setLowStock(low);
      setOutOfStock(out);
    } catch {
      // silent catch for background polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = lowStock.length + outOfStock.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Stock alerts: ${totalAlerts} items require attention`}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalAlerts > 0 && (
          <span
            aria-live="polite"
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse"
          >
            {totalAlerts}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Stock Alert Notifications Drawer"
          className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4"
        >

          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Stock Alerts ({totalAlerts})
            </h4>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Close
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading alerts...</p>
          ) : totalAlerts === 0 ? (
            <div className="py-6 text-center text-slate-500">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <p className="text-xs font-medium">All stock levels healthy!</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
              {outOfStock.map((p) => (
                <div key={`out-${p.id}`} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[11px] text-rose-600">OUT OF STOCK (0 units available)</p>
                  </div>
                </div>
              ))}

              {lowStock.map((p) => (
                <div key={`low-${p.id}`} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[11px] text-amber-700">LOW STOCK ({p.quantity} units remaining)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
