import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationsPopover } from "./NotificationsPopover";
import { Warehouse } from "lucide-react";
import { APP_NAME } from "../config";

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#fff8f2] px-8 pt-5 pb-3 flex items-center justify-center relative">
      {/* Centered Brand Pill — exactly like the image */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 px-8 py-2.5 rounded-full bg-[#ddd6f7] hover:bg-[#cec4f4] border border-[#c4b8f0] transition-all shadow-sm group"
      >
        <span className="font-black text-2xl tracking-widest text-[#2d1a6e] font-outfit uppercase">
          {APP_NAME}
        </span>
        <div className="p-1.5 rounded-xl bg-[#2d1a6e] text-white shadow-sm group-hover:scale-110 transition-transform">
          <Warehouse className="w-5 h-5" />
        </div>
      </button>

      {/* Right side — absolutely positioned to stay right, exactly like image */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {/* Bell notification */}
        <NotificationsPopover />

        {/* Avatar + name pill */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#ddd6f7] text-[#2d1a6e] font-extrabold text-xs flex items-center justify-center border border-[#c4b8f0] uppercase shrink-0">
            {user?.username?.[0] || "A"}
          </div>
          <span className="text-sm font-bold text-slate-700">{user?.username || "admin"}</span>
        </div>
      </div>
    </header>
  );
};
