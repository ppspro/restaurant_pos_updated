import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TopItemsChartProps {
  data: { name: string; qty: number; revenue: number }[];
}

export function TopItemsChart({ data }: TopItemsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
        No item data available
      </div>
    );
  }

  // Format revenue to be more readable on chart if it's very large
  const formattedData = data.map(d => ({
    ...d,
    // Convert revenue to thousands (K) for the secondary axis if needed, 
    // but Recharts can format ticks automatically.
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
        <XAxis 
          dataKey="name" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 11 }} 
          // Truncate long names
          tickFormatter={(value) => value.length > 12 ? value.substring(0, 10) + '...' : value}
        />
        <YAxis 
          yAxisId="left"
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12 }} 
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
          contentStyle={{ borderRadius: '8px' }}
          formatter={(value: any, name: any) => [
            name === 'revenue' ? `₹${value.toLocaleString()}` : value, 
            name === 'qty' ? 'Quantity' : 'Revenue'
          ]}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar yAxisId="left" dataKey="qty" name="Quantity Sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="hsl(var(--chart-2, 160 60% 45%))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
