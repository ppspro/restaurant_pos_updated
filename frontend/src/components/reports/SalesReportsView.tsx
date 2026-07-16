import React, { useState } from 'react';
import { DataTable } from './DataTable';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { ChartCard } from '../analytics/ChartCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SalesRow {
  date: string;
  orders: number;
  revenue: number;
  aov: number;
}

const columns: ColumnDef<SalesRow>[] = [
  {
    accessorKey: 'date',
    header: 'Date / Hour',
  },
  {
    accessorKey: 'orders',
    header: 'Total Orders',
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue (₹)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('revenue'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'aov',
    header: 'Avg Order Value',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('aov'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return <div>{formatted}</div>;
    },
  },
];

export function SalesReportsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // TODO: Replace with actual React Query hook fetching from backend API
  const mockData: SalesRow[] = [
    { date: '2026-07-10 12:00', orders: 15, revenue: 4500, aov: 300 },
    { date: '2026-07-10 13:00', orders: 25, revenue: 8000, aov: 320 },
    { date: '2026-07-10 14:00', orders: 20, revenue: 6500, aov: 325 },
    { date: '2026-07-10 15:00', orders: 10, revenue: 2500, aov: 250 },
  ];

  return (
    <div className="space-y-6">
      <ChartCard title="Revenue Trends" data={mockData}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' } as any}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Detailed Breakdown</h3>
        <DataTable
          columns={columns}
          data={mockData}
          pageCount={1}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={false}
        />
      </div>
    </div>
  );
}
