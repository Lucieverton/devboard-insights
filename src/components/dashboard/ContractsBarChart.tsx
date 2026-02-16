import { ContratoData, MESES } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ContractsBarChartProps {
  data: ContratoData[];
}

export function ContractsBarChart({ data }: ContractsBarChartProps) {
  const monthlyData = MESES.slice(1).map((mes, i) => {
    const count = data.filter((d) => d.mesIndex === i).length;
    return { mes: mes.slice(0, 3), qtde: count };
  });

  return (
    <div className="neon-border card-inset rounded-lg bg-card p-4 flex-1">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Qtde. Contratos Mensais</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={monthlyData}>
          <defs>
            <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(183, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(220, 80%, 55%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 25%)" />
          <XAxis dataKey="mes" tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "hsl(0, 0%, 14%)", border: "1px solid hsl(183, 60%, 25%)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "hsl(183, 100%, 50%)" }}
          />
          <Bar dataKey="qtde" fill="url(#gradBar)" radius={[4, 4, 0, 0]} name="Contratos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
