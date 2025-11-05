import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import Daftar from "./pages/Daftar";
import Jadwal from "./pages/Jadwal";
import Kontak from "./pages/Kontak";
import Kalkulator from "./pages/Kalkulator";
import DataTPA from "./pages/DataTPA";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import DataSampah from "./pages/admin/DataSampah";
import Infografik from "./pages/admin/Infografik";
import Pelanggan from "./pages/admin/Pelanggan";
import RuteSampah from "./pages/admin/RuteSampah";
import Anggaran from "./pages/admin/Anggaran";
import AnggaranPublik from "./pages/AnggaranPublik";

const queryClient = new QueryClient();

// 🔒 Ambil token dari cookies
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

// 🔐 ProtectedRoute pakai cookies, bukan localStorage
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getCookie("access_token");
  return token ? <>{children}</> : <Navigate to="/admin" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/daftar" element={<Daftar />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/kalkulator" element={<Kalkulator />} />
          <Route path="/data-tpa" element={<DataTPA />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/anggaran-publik" element={<AnggaranPublik />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/data-sampah"
            element={
              <ProtectedRoute>
                <DataSampah />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/infografik"
            element={
              <ProtectedRoute>
                <Infografik />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pelanggan"
            element={
              <ProtectedRoute>
                <Pelanggan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rute"
            element={
              <ProtectedRoute>
                <RuteSampah />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/anggaran"
            element={
              <ProtectedRoute>
                <Anggaran />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
