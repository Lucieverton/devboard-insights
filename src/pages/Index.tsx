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
import { Filter, Target, Zap, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ContratoData } from "@/data/mockData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Legend } from "recharts";

const regiaoMap: Record<string, string> = {
  "Ponta Verde": "Orla", "Jatiúca": "Orla", "Pajuçara": "Orla",
  "Mangabeiras": "Centro-Sul", "Farol": "Centro", "Benedito Bentes": "Periferia",
  "Stella Maris": "Litoral Norte", "Cruz das Almas": "Centro-Sul",
  "Gruta de Lourdes": "Centro", "Serraria": "Periferia",
};

const MONTH_NAMES = MESES.slice(1);

const Index = () => {
  const { contratos, imoveis, getMatches, loading } = useData();
  const [filters, setFilters] = useState<FilterState>({
    mes: "Todos", tipoContrato: "Todos", tipoImovel: "Todos", bairro: "Todos",
  });

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

  // Match alerts
  const matches = useMemo(() => getMatches(), [getMatches]);

  // Receivables data
  const receivablesData = useMemo(() => {
    let paga = 0, aReceber = 0;
    contratos.forEach((c) => {
      const comissao = c.valorTotal * c.comissaoPercent / 100;
      if (c.comissaoPaga) paga += comissao;
      else if (c.etapa === "Concluído") aReceber += comissao;
    });
    return { paga, aReceber };
  }, [contratos]);

  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
          {/* Match Alerts */}
          {matches.length > 0 && (
            <div className="neon-border card-inset rounded-lg bg-card p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Zap className="w-4 h-4 animate-pulse" /> Matches Encontrados ({matches.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {matches.slice(0, 6).map((m, i) => (
                  <div key={i} className="text-xs bg-accent/5 border border-accent/20 rounded-lg p-2 flex items-start gap-2">
                    <Target className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{m.clienteNome}</p>
                      <p className="text-muted-foreground">{m.imovelTipo} · {m.imovelBairro} · {fmt(m.imovelValor)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {matches.length > 6 && <p className="text-xs text-muted-foreground">+{matches.length - 6} outros matches</p>}
            </div>
          )}

          {/* Receivables Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="neon-border card-inset rounded-lg bg-card p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Comissão Recebida</p>
                <p className="text-lg font-bold font-mono text-green-neon">{fmt(receivablesData.paga)}</p>
              </div>
            </div>
            <div className="neon-border card-inset rounded-lg bg-card p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-chart-orange" />
              <div>
                <p className="text-xs text-muted-foreground">Comissão a Receber</p>
                <p className="text-lg font-bold font-mono text-neon">{fmt(receivablesData.aReceber)}</p>
              </div>
            </div>
          </div>

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
