import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OrderTypeChartProps {
  data: { name: string; value: number }[];
}

const COLORS: Record<string, string> = {
  KITCHEN: 'hsl(var(--chart-1, 142 71% 45%))',
  PACKED: 'hsl(var(--chart-4, 43 74% 66%))',
};

export function OrderTypeChart({ data }: OrderTypeChartProps) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
        No order type data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'hsl(var(--muted))'} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => `${Number(value || 0).toLocaleString()} orders`}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
