import { useState, useMemo } from "react";
import { FilterState, MOCK_DATA, filterData } from "@/data/mockData";
import { SidebarFilters } from "@/components/dashboard/SidebarFilters";
import { HeaderCards } from "@/components/dashboard/HeaderCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ContractsBarChart } from "@/components/dashboard/ContractsBarChart";
import { RegionsTable } from "@/components/dashboard/RegionsTable";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { PropertyTypeChart } from "@/components/dashboard/PropertyTypeChart";

const Index = () => {
  const [filters, setFilters] = useState<FilterState>({
    mes: "Todos",
    tipoContrato: "Todos",
    tipoImovel: "Todos",
    bairro: "Todos",
  });

  const filteredData = useMemo(() => filterData(MOCK_DATA, filters), [filters]);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarFilters filters={filters} onChange={setFilters} />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderCards data={filteredData} />

        <main className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Top row - trend charts */}
          <div className="flex gap-4">
            <RevenueChart data={filteredData} />
            <ContractsBarChart data={filteredData} />
          </div>

          {/* Bottom row - table, donut, horizontal bars */}
          <div className="flex gap-4">
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
