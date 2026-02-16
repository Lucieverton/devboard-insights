import { ContratoData } from "@/data/mockData";
import { FileStack, DollarSign, Calculator, TrendingUp } from "lucide-react";

interface HeaderCardsProps {
  data: ContratoData[];
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "green";
}

function SummaryCard({ icon: Icon, label, value, sublabel, variant = "default" }: SummaryCardProps) {
  return (
    <div className="neon-border card-inset rounded-lg bg-card p-4 flex items-center gap-4 flex-1 min-w-0">
      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">{label}</p>
        <p className={`text-lg font-bold font-mono truncate ${variant === "green" ? "text-green-neon" : "text-neon"}`}>
          {value}
        </p>
        {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

export function HeaderCards({ data }: HeaderCardsProps) {
  // data already excludes cancelled contracts (filtered in Index.tsx)
  const totalContratos = data.length;
  const valorBruto = data.reduce((sum, d) => sum + d.valor, 0);
  const totalComissao = data.reduce((sum, d) => sum + d.comissao, 0);

  return (
    <header className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border-b border-border/50">
      <div className="shrink-0 mr-2 hidden md:block">
        <h1 className="text-lg font-bold text-neon tracking-tight">DevBoard</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Stores</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 flex-1 min-w-0">
        <SummaryCard
          icon={FileStack}
          label="Contratos Ativos"
          value={totalContratos.toString()}
          sublabel="Exclui cancelados"
        />
        <SummaryCard
          icon={DollarSign}
          label="VGV Total"
          value={formatCurrency(valorBruto)}
          sublabel="Valor Geral de Vendas"
          variant="green"
        />
        <SummaryCard
          icon={Calculator}
          label="Comissão Prevista"
          value={formatCurrency(totalComissao)}
          sublabel="Sobre contratos ativos"
          variant="green"
        />
      </div>
    </header>
  );
}
