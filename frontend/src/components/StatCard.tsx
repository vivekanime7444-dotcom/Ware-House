import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple" | "indigo" | "cyan";
  description?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "indigo",
  description,
  onClick
}) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
  };

  const cardBgStyles = {
    blue: "bg-[#bde9f8]/50 border-[#7dd3f8]",
    emerald: "bg-[#c3f0d8]/50 border-[#80ddb0]",
    amber: "bg-[#fde8c0]/50 border-[#fcd18a]",
    rose: "bg-[#ffd6d6]/50 border-[#fca5a5]",
    purple: "bg-[#e0d5f5]/50 border-[#c2b0ea]",
    indigo: "bg-[#d5d8f5]/50 border-[#a5aadc]",
    cyan: "bg-[#b2eddb]/50 border-[#5dd5ae]",
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border shadow-sm transition-all duration-200 ${cardBgStyles[color]} ${
        onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-outfit">{value}</h3>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
