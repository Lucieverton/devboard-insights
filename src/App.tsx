import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import ImoveisPage from "./pages/Imoveis";
import ContratosPage from "./pages/Contratos";
import ClientesPage from "./pages/Clientes";
import ConfiguracoesPage from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/imoveis" element={<AppLayout><ImoveisPage /></AppLayout>} />
            <Route path="/contratos" element={<AppLayout><ContratosPage /></AppLayout>} />
            <Route path="/clientes" element={<AppLayout><ClientesPage /></AppLayout>} />
            <Route path="/configuracoes" element={<AppLayout><ConfiguracoesPage /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
