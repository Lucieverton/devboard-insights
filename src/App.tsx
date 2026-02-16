import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import ImoveisPage from "./pages/Imoveis";
import ContratosPage from "./pages/Contratos";
import ClientesPage from "./pages/Clientes";
import ConfiguracoesPage from "./pages/Configuracoes";
import VitrinePage from "./pages/Vitrine";
import AuthPage from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { getTenantSlug } from "@/lib/tenant";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

function AppRoutes() {
  // Check if accessing via subdomain (production multi-tenant)
  const tenantSlug = getTenantSlug();
  
  // If on a tenant subdomain and not on /vitrine path, show vitrine directly
  if (tenantSlug && !window.location.pathname.startsWith("/vitrine")) {
    return <VitrinePage />;
  }

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/auth" element={<AuthRoute />} />
      <Route path="/vitrine/:slug" element={<VitrinePage />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/imoveis" element={<ProtectedRoute><AppLayout><ImoveisPage /></AppLayout></ProtectedRoute>} />
      <Route path="/contratos" element={<ProtectedRoute><AppLayout><ContratosPage /></AppLayout></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><AppLayout><ClientesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><AppLayout><ConfiguracoesPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
