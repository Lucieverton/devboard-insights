import { ContratoData } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: ContratoData[];
}

const COLORS = ["hsl(183, 100%, 50%)", "hsl(145, 80%, 50%)"];

export function DonutChart({ data }: DonutChartProps) {
  const locacao = data.filter((d) => d.tipoContrato === "Locação").length;
  const venda = data.filter((d) => d.tipoContrato === "Venda").length;

  const chartData = [
    { name: "Locação", value: locacao },
    { name: "Venda", value: venda },
  ];

  return (
    <div className="neon-border card-inset rounded-lg bg-card p-4 flex-1 flex flex-col items-center">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 self-start">Contratos por Região</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value"
            stroke="none">
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "hsl(0, 0%, 14%)", border: "1px solid hsl(183, 60%, 25%)", borderRadius: 8, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1">
        {chartData.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-mono font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
