import React from "react";

interface StockBadgeProps {
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK" | string;
  size?: "sm" | "md";
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status, size = "md" }) => {
  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let dotStyle = "bg-emerald-500";

  if (status === "LOW STOCK") {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 animate-pulse-subtle";
    dotStyle = "bg-amber-500";
  } else if (status === "OUT OF STOCK") {
    badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
    dotStyle = "bg-rose-500";
  }

  const textSize = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      role="status"
      aria-label={`Stock status: ${status}`}
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${badgeStyle} ${textSize}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} aria-hidden="true"></span>
      {status}
    </span>
  );
};

