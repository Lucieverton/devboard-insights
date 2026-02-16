import { ContratoData } from "@/data/mockData";

interface RegionsTableProps {
  data: ContratoData[];
}

export function RegionsTable({ data }: RegionsTableProps) {
  const bairroMap = new Map<string, { qtde: number; regiao: string }>();
  data.forEach((d) => {
    const existing = bairroMap.get(d.bairro);
    if (existing) {
      existing.qtde++;
    } else {
      bairroMap.set(d.bairro, { qtde: 1, regiao: d.regiao });
    }
  });

  const rows = Array.from(bairroMap.entries())
    .map(([bairro, { qtde, regiao }]) => ({ bairro, qtde, regiao }))
    .sort((a, b) => b.qtde - a.qtde);

  return (
    <div className="neon-border card-inset rounded-lg bg-card p-4 flex-1">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Tabela de Regiões</h3>
      <div className="overflow-auto max-h-[200px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-1.5 text-muted-foreground font-medium">Bairro</th>
              <th className="text-center py-1.5 text-muted-foreground font-medium">Qtde</th>
              <th className="text-right py-1.5 text-muted-foreground font-medium">Região</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.bairro} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                <td className="py-1.5 text-foreground">{row.bairro}</td>
                <td className="py-1.5 text-center text-neon font-mono font-semibold">{row.qtde}</td>
                <td className="py-1.5 text-right text-muted-foreground">{row.regiao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
