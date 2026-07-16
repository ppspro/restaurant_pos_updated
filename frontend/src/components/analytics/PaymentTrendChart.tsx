import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PaymentTrendChartProps {
  data: { date: string; CASH: number; UPI: number; CARD: number; total: number }[];
}

export function PaymentTrendChart({ data }: PaymentTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
        <XAxis 
          dataKey="date" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 11 }}
          tickFormatter={(val) => {
            if (val.includes(':')) return val.split(':')[0]; // format hour '14:00' -> '14'
            return val;
          }} 
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 11 }}
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
          contentStyle={{ borderRadius: '8px' }}
          formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="CASH" stackId="a" fill="hsl(var(--chart-1, 142 71% 45%))" />
        <Bar dataKey="UPI" stackId="a" fill="hsl(var(--chart-2, 217 91% 60%))" />
        <Bar dataKey="CARD" stackId="a" fill="hsl(var(--chart-3, 280 65% 60%))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
