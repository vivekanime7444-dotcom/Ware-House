import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { WarehouseStatus } from "./pages/WarehouseStatus";
import { Restocking } from "./pages/Restocking";
import { OrderPlacement } from "./pages/OrderPlacement";
import { Orders } from "./pages/Orders";
import { OrderTracking } from "./pages/OrderTracking";
import { DamagedMissing } from "./pages/DamagedMissing";
import { LowStock } from "./pages/LowStock";
import { Analysis } from "./pages/Analysis";
import { Loader2 } from "lucide-react";

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
        <p className="text-xs font-semibold">Loading StockFlow WMS...</p>
      </div>
    );
  }

  if (!user && !loading) {
    // If not authenticated, render layout anyway (auto-login is running)
  }

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f2] flex flex-col items-center justify-center text-slate-600 font-sans">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
        <p className="text-xs font-semibold">Opening StockFlow WMS Coverpage...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
      <Route path="/warehouse-status" element={<ProtectedLayout><WarehouseStatus /></ProtectedLayout>} />
      <Route path="/restocking" element={<ProtectedLayout><Restocking /></ProtectedLayout>} />
      <Route path="/order-placement" element={<ProtectedLayout><OrderPlacement /></ProtectedLayout>} />
      <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
      <Route path="/tracking" element={<ProtectedLayout><OrderTracking /></ProtectedLayout>} />
      <Route path="/damaged-missing" element={<ProtectedLayout><DamagedMissing /></ProtectedLayout>} />
      <Route path="/low-stock" element={<ProtectedLayout><LowStock /></ProtectedLayout>} />
      <Route path="/analysis" element={<ProtectedLayout><Analysis /></ProtectedLayout>} />
    </Routes>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
