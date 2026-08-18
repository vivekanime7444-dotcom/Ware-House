import React from "react";
import { Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onSearchChange,
  searchValue = "",
  searchPlaceholder = "Search...",
  actions,
}) => {
  return (
    <div className="px-6 pt-6 pb-4 max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 font-outfit tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {onSearchChange && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all w-64 shadow-xs"
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};
