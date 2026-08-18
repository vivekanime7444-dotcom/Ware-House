import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { DashboardSummary } from "../types";

/* ═══════════════════════════════════════════════════════════════
   CURSOR-TILT CARD — 3D perspective tilt that follows the mouse
═══════════════════════════════════════════════════════════════ */
const TiltCard: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, onClick, className = "", style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)"
  );
  const [ease, setEase] = useState("transform 0.45s cubic-bezier(.16,1,.3,1)");
  const [glare, setGlare] = useState({ x: 50, y: 50, op: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTx(
      `perspective(1000px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) scale(1.032)`
    );
    setEase("transform 0.1s ease-out");
    setGlare({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      op: 0.3,
    });
  };

  const onLeave = () => {
    setTx("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
    setEase("transform 0.45s cubic-bezier(.16,1,.3,1)");
    setGlare((g) => ({ ...g, op: 0 }));
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform: tx, transition: ease, ...style }}
      className={`relative cursor-pointer overflow-hidden rounded-2xl ${className}`}
    >
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl z-10 transition-opacity duration-150"
        style={{
          opacity: glare.op,
          background: `radial-gradient(380px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.7), transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WAREHOUSE SHELF SVG
═══════════════════════════════════════════════════════════════ */
const Shelf: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg
    viewBox="0 0 90 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={flip ? { transform: "scaleX(-1)" } : undefined}
    className="h-full w-auto"
  >
    <rect x="6" y="4" width="78" height="122" rx="5" fill="#fde68a" fillOpacity="0.35" stroke="#d97706" strokeWidth="2.5" />
    <line x1="6" y1="48" x2="84" y2="48" stroke="#d97706" strokeWidth="2" />
    <line x1="6" y1="90" x2="84" y2="90" stroke="#d97706" strokeWidth="2" />
    <rect x="12" y="12" width="24" height="30" rx="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
    <rect x="42" y="18" width="32" height="24" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
    <rect x="14" y="56" width="28" height="28" rx="4" fill="#ef4444" fillOpacity="0.7" stroke="#dc2626" strokeWidth="1.5" />
    <rect x="48" y="54" width="30" height="30" rx="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
    <rect x="12" y="97" width="22" height="22" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
    <rect x="40" y="95" width="36" height="24" rx="4" fill="#ef4444" fillOpacity="0.55" stroke="#dc2626" strokeWidth="1.5" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   LOW STOCK FLOATING ICONS ROW
═══════════════════════════════════════════════════════════════ */
const StockBubbles: React.FC = () => (
  <div className="flex items-center justify-around py-2">
    {["📊", "📦", "🔥", "🥃", "📉", "📦", "📊"].map((ic, i) => (
      <div
        key={i}
        className={`bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-center ${
          i === 2 ? "w-11 h-11 text-2xl shadow-md border-orange-200" : "w-8 h-8 text-base"
        }`}
      >
        {ic}
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MINI BAR CHART
═══════════════════════════════════════════════════════════════ */
const MiniBar: React.FC = () => (
  <div className="flex items-end gap-1 h-10">
    {[35, 55, 40, 70, 88, 62].map((h, i) => (
      <div
        key={i}
        className="rounded-t-sm flex-1 min-w-[10px]"
        style={{ height: `${h}%`, background: i >= 3 ? "#0d9488" : "#99f6e4" }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
═══════════════════════════════════════════════════════════════ */
export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboardSummary()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const n = (v?: number, fb = 0) => (loading ? "…" : (v ?? fb));
  const alerts = (stats?.low_stock_items ?? 0) + (stats?.out_of_stock_items ?? 0);

  return (
    <div className="px-6 md:px-8 py-6 max-w-full mx-auto w-full">

      {/* ══════════════ ROW 1 ══════════════ */}
      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* 1 — Total Inventory (sky blue) */}
        <TiltCard
          onClick={() => navigate("/inventory")}
          className="col-span-12 md:col-span-4 bg-[#bde9f8] border border-[#7dd3f8] shadow hover:shadow-xl"
        >
          <div className="p-6 flex flex-col justify-between h-full min-h-[205px]">
            <div className="flex gap-4 items-start">
              {/* Icon */}
              <div className="mt-1 shrink-0 p-3 rounded-2xl bg-[#7dd3f8]/60 border border-[#38bdf8]/60">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="4" width="22" height="24" rx="4" fill="#0ea5e9" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1.8" />
                  <line x1="7" y1="11" x2="19" y2="11" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                  <line x1="7" y1="16" x2="15" y2="16" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                  <line x1="7" y1="21" x2="17" y2="21" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Total Inventory</p>
                <h2 className="text-6xl font-black text-slate-900 font-outfit leading-none mt-1">
                  {n(stats?.total_products, 28)}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Unique SKUs in catalog</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#7dd3f8]/50 mt-4">
              <p className="text-xs font-semibold text-slate-600">
                Dashboard Hub (4×2) · Overview of all warehouse modules
              </p>
            </div>
          </div>
        </TiltCard>

        {/* 2 — Warehouse Status (warm peach) */}
        <TiltCard
          onClick={() => navigate("/warehouse-status")}
          className="col-span-12 md:col-span-4 bg-[#fde8c5] border border-[#fbc878] shadow hover:shadow-xl"
        >
          <div className="p-5 flex flex-col items-center h-full min-h-[205px]">
            <h3 className="text-base font-bold text-slate-800 font-outfit mb-2">Warehouse Status</h3>

            <div className="flex items-stretch gap-2 flex-1 w-full">
              {/* Left shelf */}
              <div className="w-14 flex items-center opacity-80 shrink-0">
                <Shelf />
              </div>

              {/* White metrics box */}
              <div className="flex-1 bg-white/75 border border-[#fbc878]/50 rounded-2xl flex flex-col items-center justify-center px-3 py-2 gap-1 shadow-xs">
                <p className="text-[11px] font-bold text-slate-500 tracking-wider">Total Units:</p>
                <p className="text-4xl font-black text-slate-900 font-outfit">
                  {n(stats?.total_units, 550)}
                </p>
                <MiniBar />
              </div>

              {/* Right shelf */}
              <div className="w-14 flex items-center opacity-80 shrink-0">
                <Shelf flip />
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-600 mt-2">Inventory Levels</p>
          </div>
        </TiltCard>

        {/* 3 — Restocking (mint green) */}
        <TiltCard
          onClick={() => navigate("/restocking")}
          className="col-span-4 bg-[#c3f0d8] border border-[#80ddb0] shadow hover:shadow-xl"
        >
          <div className="p-6 flex flex-col justify-between h-full min-h-[205px]">
            <div className="flex items-start gap-4">
              {/* Restocking icon */}
              <div className="p-2.5 rounded-2xl bg-[#86efb8]/60 border border-[#34d399]/70 shrink-0">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="8" y="4" width="20" height="16" rx="4" fill="#065f46" fillOpacity="0.25" stroke="#059669" strokeWidth="1.8" />
                  <path d="M4 28 Q18 20 32 28" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="18" cy="30" rx="14" ry="5" fill="#6ee7b7" stroke="#34d399" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 font-outfit">Restocking</h3>
                {/* Yellow pill exactly as image */}
                <div className="mt-2 px-3 py-2 rounded-xl bg-[#fef08a] border border-[#facc15] inline-block shadow-xs">
                  <span className="text-3xl font-black text-slate-900 font-outfit block leading-none">
                    {n(stats?.low_stock_items, 9)}
                  </span>
                  <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-tight">
                    Items at or below threshold — Low Stock
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#80ddb0]/50 mt-4">
              <p className="text-xs font-semibold text-slate-600">
                Add physical stock &amp; update stock levels
              </p>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* ══════════════ ROW 2 ══════════════ */}
      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* 4 — Order Placement (pastel pink) */}
        <TiltCard
          onClick={() => navigate("/order-placement")}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#ffd6d6] border border-[#fca5a5] shadow hover:shadow-xl"
        >
          <div className="p-5 flex flex-col justify-between h-full min-h-[220px]">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-[#fecaca]/80 border border-[#f87171]/60">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M4 6 h3 l3 10 h10 l2-6H11" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="11" cy="20" r="1.5" fill="#be123c" />
                  <circle cx="18" cy="20" r="1.5" fill="#be123c" />
                </svg>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#fecaca] border border-[#f87171] text-rose-800 font-extrabold text-[11px]">
                {n(stats?.pending_orders, 1)} Pending
              </span>
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900 font-outfit mt-4">Order Placement</h4>
              <p className="text-xs font-semibold text-slate-600 mt-1">Select products &amp; quantity</p>
            </div>
          </div>
        </TiltCard>

        {/* 5 — Orders Queue (warm amber) */}
        <TiltCard
          onClick={() => navigate("/orders")}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#fde8c0] border border-[#fcd18a] shadow hover:shadow-xl"
        >
          <div className="p-5 flex flex-col justify-between h-full min-h-[220px]">
            <div className="p-2.5 rounded-xl bg-[#fde68a]/80 border border-[#fbbf24]/60 w-fit">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="6" y="4" width="16" height="20" rx="3" fill="#b45309" fillOpacity="0.2" stroke="#b45309" strokeWidth="1.5" />
                <line x1="9" y1="10" x2="19" y2="10" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="9" y1="14" x2="16" y2="14" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="9" y1="18" x2="17" y2="18" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900 font-outfit">Orders Queue</h4>
              <p className="text-xs font-semibold text-slate-600 mt-1">Availability-based prioritization</p>
            </div>
          </div>
        </TiltCard>

        {/* 6 — Low & Out of Stock (soft lavender amber) */}
        <TiltCard
          onClick={() => navigate("/low-stock")}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#e8eaf5] border border-[#c5c9e0] shadow hover:shadow-xl"
        >
          <div className="p-5 flex flex-col justify-between h-full min-h-[220px]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 font-outfit">
                Low &amp; Out of Stock
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#fef08a] border border-[#fbbf24] text-amber-900 font-extrabold text-xs shadow-xs">
                {n(alerts, 12)} Alerts
              </span>
            </div>

            <StockBubbles />

            <div className="pt-2 border-t border-[#c5c9e0]/60 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Low Stock Items:</span>
              <span className="font-extrabold text-slate-900">{n(stats?.low_stock_items, 9)}</span>
            </div>
          </div>
        </TiltCard>

        {/* 8 — Order Placement & Tracking (periwinkle indigo) */}
        <TiltCard
          onClick={() => navigate("/tracking")}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#d5d8f5] border border-[#a5aadc] shadow hover:shadow-xl"
        >
          <div className="p-5 flex flex-col justify-between h-full min-h-[220px]">
            <div className="flex items-start justify-between gap-1">
              <div className="p-2.5 rounded-xl bg-[#818cf8]/30 border border-[#818cf8]/50 w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="15" height="11" rx="2" fill="#3730a3" fillOpacity="0.2" stroke="#3730a3" strokeWidth="1.3" />
                  <path d="M17 10 l4 3 -4 3" stroke="#3730a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#818cf8]/30 border border-[#818cf8]/60 text-indigo-900 font-extrabold text-[11px]">
                {n(stats?.ready_orders, 9)} Ready
              </span>
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900 font-outfit leading-tight">
                Order Placement &amp; Tracking
              </h4>
              <p className="text-xs font-semibold text-slate-600 mt-1">Verification &amp; dispatch</p>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* ══════════════ ROW 3 ══════════════ */}
      <div className="grid grid-cols-12 gap-4">

        {/* 9 — Damaged & Missing (teal mint) */}
        <TiltCard
          onClick={() => navigate("/damaged-missing")}
          className="col-span-5 bg-[#b2eddb] border border-[#5dd5ae] shadow hover:shadow-xl"
        >
          <div className="p-6 flex items-center justify-between min-h-[148px]">
            <div className="flex items-center gap-4">
              {/* Box + question mark icon */}
              <div className="relative shrink-0">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="4" y="14" width="40" height="42" rx="7" fill="#6ee7b7" stroke="#10b981" strokeWidth="2" />
                  <rect x="4" y="24" width="40" height="10" fill="#34d399" fillOpacity="0.35" />
                  <path d="M18 14 Q24 6 30 14" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <circle cx="52" cy="18" r="13" fill="#fef08a" stroke="#fbbf24" strokeWidth="2.2" />
                  <text x="52" y="23" textAnchor="middle" fontSize="14" fontWeight="900" fill="#92400e" fontFamily="sans-serif">?</text>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-outfit">Damaged &amp; Missing</h3>
                <p className="text-sm text-slate-600 font-medium mt-1">Track reported defects &amp; replacements</p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-[#6ee7b7]/60 border border-[#34d399] text-teal-900 font-extrabold text-sm shadow-xs shrink-0 ml-3">
              {n((stats?.damaged_items ?? 0) + (stats?.missing_items ?? 0), 2)} Issues
            </span>
          </div>
        </TiltCard>

        {/* 10 — Analysis (canary yellow) */}
        <TiltCard
          onClick={() => navigate("/analysis")}
          className="col-span-7 bg-[#fef6c0] border border-[#fde047] shadow hover:shadow-xl"
        >
          <div className="p-6 flex items-center justify-between min-h-[148px]">
            <div className="flex items-center gap-4">
              {/* Trending up chart icon */}
              <div className="p-3 rounded-2xl bg-[#fde68a]/70 border border-[#fbbf24]/80 shrink-0">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <polyline
                    points="6,36 16,24 24,30 38,12"
                    stroke="#92400e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <polyline
                    points="30,12 38,12 38,20"
                    stroke="#92400e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-outfit">Analysis</h3>
                <p className="text-sm text-slate-600 font-medium mt-1">
                  7 Live Charts · Real database charts
                </p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-[#fde68a] border border-[#fbbf24] text-amber-900 font-extrabold text-sm shadow-xs shrink-0 ml-3">
              7 Live Charts
            </span>
          </div>
        </TiltCard>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-3">
        <span className="text-[11px] font-semibold text-slate-400 font-mono tracking-wide">
          Live Database Sync
        </span>
      </div>
    </div>
  );
};
