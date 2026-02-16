import { FilterState, MESES, TIPOS_CONTRATO, TIPOS_IMOVEL, BAIRROS } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw, Calendar, FileText, Home, MapPin } from "lucide-react";

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const FilterSelect = ({
  label,
  icon: Icon,
  value,
  options,
  onValueChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  options: string[];
  onValueChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-primary" />
      {label}
    </label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-secondary border-border text-foreground h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border z-50">
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-popover-foreground text-sm">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export function SidebarFilters({ filters, onChange }: SidebarFiltersProps) {
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({ mes: "Todos", tipoContrato: "Todos", tipoImovel: "Todos", bairro: "Todos" });
  };

  return (
    <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider">Filtros</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        <FilterSelect label="Mês" icon={Calendar} value={filters.mes} options={MESES} onValueChange={(v) => update("mes", v)} />
        <FilterSelect label="Tipo de Contrato" icon={FileText} value={filters.tipoContrato} options={TIPOS_CONTRATO} onValueChange={(v) => update("tipoContrato", v)} />
        <FilterSelect label="Tipo de Imóvel" icon={Home} value={filters.tipoImovel} options={TIPOS_IMOVEL} onValueChange={(v) => update("tipoImovel", v)} />
        <FilterSelect label="Bairro" icon={MapPin} value={filters.bairro} options={BAIRROS} onValueChange={(v) => update("bairro", v)} />
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Limpar Filtros
        </Button>
      </div>
    </aside>
  );
}
