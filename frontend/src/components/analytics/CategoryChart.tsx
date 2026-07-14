import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryChartProps {
  data: { name: string; qty: number; revenue: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground)/0.2)" />
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12 }} 
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
          contentStyle={{ borderRadius: '8px' }}
          formatter={(value: any, name: any) => [
            name === 'revenue' ? `₹${Number(value || 0).toLocaleString()}` : value, 
            name === 'qty' ? 'Items Sold' : 'Revenue'
          ]}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="revenue" name="Revenue (₹)" fill="hsl(var(--chart-2, 160 60% 45%))" radius={[0, 4, 4, 0]} barSize={16} />
        <Bar dataKey="qty" name="Quantity Sold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
