import { ContratoData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PropertyTypeChartProps {
  data: ContratoData[];
}

export function PropertyTypeChart({ data }: PropertyTypeChartProps) {
  const typeMap = new Map<string, number>();
  data.forEach((d) => {
    typeMap.set(d.tipoImovel, (typeMap.get(d.tipoImovel) || 0) + 1);
  });

  const chartData = Array.from(typeMap.entries())
    .map(([tipo, qtde]) => ({ tipo, qtde }))
    .sort((a, b) => b.qtde - a.qtde);

  return (
    <div className="neon-border card-inset rounded-lg bg-card p-4 flex-1">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Contratos por Tipo de Imóvel</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <defs>
            <linearGradient id="gradHBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(220, 80%, 55%)" />
              <stop offset="100%" stopColor="hsl(183, 100%, 50%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 25%)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="tipo" type="category" tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
          <Tooltip
            contentStyle={{ background: "hsl(0, 0%, 14%)", border: "1px solid hsl(183, 60%, 25%)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "hsl(183, 100%, 50%)" }}
          />
          <Bar dataKey="qtde" fill="url(#gradHBar)" radius={[0, 4, 4, 0]} name="Contratos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
