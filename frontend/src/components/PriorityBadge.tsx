import React from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface PriorityBadgeProps {
  ratio: number;
  label: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ ratio, label }) => {
  if (ratio >= 1.0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        {label}
      </span>
    );
  } else if (ratio >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-950 text-amber-300 border border-amber-800/60">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        {label}
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-950 text-rose-300 border border-rose-800/60">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        {label}
      </span>
    );
  }
};
