import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { FilterState, MESES, TIPOS_CONTRATO, TIPOS_IMOVEL, BAIRROS } from "@/data/mockData";
import { AppSidebar, MobileMenuTrigger } from "@/components/layout/AppSidebar";
import { HeaderCards } from "@/components/dashboard/HeaderCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ContractsBarChart } from "@/components/dashboard/ContractsBarChart";
import { RegionsTable } from "@/components/dashboard/RegionsTable";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { PropertyTypeChart } from "@/components/dashboard/PropertyTypeChart";
import { SidebarFilters } from "@/components/dashboard/SidebarFilters";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ContratoData } from "@/data/mockData";

const regiaoMap: Record<string, string> = {
  "Ponta Verde": "Orla", "Jatiúca": "Orla", "Pajuçara": "Orla",
  "Mangabeiras": "Centro-Sul", "Farol": "Centro", "Benedito Bentes": "Periferia",
  "Stella Maris": "Litoral Norte", "Cruz das Almas": "Centro-Sul",
  "Gruta de Lourdes": "Centro", "Serraria": "Periferia",
};

const MONTH_NAMES = MESES.slice(1);

const Index = () => {
  const { contratos, imoveis } = useData();
  const [filters, setFilters] = useState<FilterState>({
    mes: "Todos", tipoContrato: "Todos", tipoImovel: "Todos", bairro: "Todos",
  });

  // Derive ContratoData from global state
  const allData: ContratoData[] = useMemo(() => {
    return contratos.map((c) => {
      const imovel = imoveis.find((i) => i.id === c.imovelId);
      const mesIndex = c.dataInicio ? parseInt(c.dataInicio.split("-")[1], 10) - 1 : 0;
      const bairro = imovel?.bairro || "Ponta Verde";
      return {
        mes: MONTH_NAMES[mesIndex] || MONTH_NAMES[0],
        mesIndex,
        tipoContrato: c.tipo,
        tipoImovel: imovel?.tipo || "Casa",
        bairro,
        regiao: regiaoMap[bairro] || "Centro",
        valor: c.valorTotal,
        comissao: c.valorTotal * c.comissaoPercent / 100,
      };
    });
  }, [contratos, imoveis]);

  const filteredData = useMemo(() => {
    return allData.filter((d) => {
      if (filters.mes !== "Todos" && d.mes !== filters.mes) return false;
      if (filters.tipoContrato !== "Todos" && d.tipoContrato !== filters.tipoContrato) return false;
      if (filters.tipoImovel !== "Todos" && d.tipoImovel !== filters.tipoImovel) return false;
      if (filters.bairro !== "Todos" && d.bairro !== filters.bairro) return false;
      return true;
    });
  }, [allData, filters]);

  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar>
        <SidebarFilters filters={filters} onChange={setFilters} />
      </AppSidebar>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-border/50">
          <MobileMenuTrigger />
          <h1 className="text-base font-bold text-neon tracking-tight flex-1">DevBoard</h1>
          <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(true)}>
            <Filter className="w-5 h-5 text-primary" />
          </Button>
        </div>

        {/* Mobile filters sheet */}
        {isMobile && (
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent side="right" className="w-64 bg-sidebar border-sidebar-border p-0">
              <SheetTitle className="sr-only">Filtros</SheetTitle>
              <SidebarFilters filters={filters} onChange={setFilters} />
            </SheetContent>
          </Sheet>
        )}

        <HeaderCards data={filteredData} />
        <main className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 overflow-auto">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <RevenueChart data={filteredData} />
            <ContractsBarChart data={filteredData} />
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <RegionsTable data={filteredData} />
            <DonutChart data={filteredData} />
            <PropertyTypeChart data={filteredData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
