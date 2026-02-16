import { ContratoData, MESES } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: ContratoData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const monthlyData = MESES.slice(1).map((mes, i) => {
    const monthContracts = data.filter((d) => d.mesIndex === i);
    const total = monthContracts.reduce((sum, d) => sum + d.valor, 0);
    return { mes: mes.slice(0, 3), valor: Math.round(total) };
  });

  return (
    <div className="neon-border card-inset rounded-lg bg-card p-4 flex-1">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Faturamento por Mês</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={monthlyData}>
          <defs>
            <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(183, 100%, 50%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(183, 100%, 50%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 25%)" />
          <XAxis dataKey="mes" tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }} axisLine={false} tickLine={false} width={60}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: "hsl(0, 0%, 14%)", border: "1px solid hsl(183, 60%, 25%)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "hsl(183, 100%, 50%)" }}
            formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Faturamento"]}
          />
          <Area type="monotone" dataKey="valor" stroke="hsl(183, 100%, 50%)" strokeWidth={2} fill="url(#gradArea)"
            dot={{ r: 3, fill: "hsl(183, 100%, 50%)" }}
            label={{ position: "top", fill: "hsl(183, 100%, 50%)", fontSize: 9, formatter: (v: number) => v > 0 ? `${(v / 1000).toFixed(0)}k` : "" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
