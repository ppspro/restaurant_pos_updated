import React, { useState } from 'react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { ChartCard } from '../analytics/ChartCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '../ui/badge';

interface MenuRow {
  id: string;
  itemName: string;
  category: string;
  type: string;
  qtySold: number;
  revenue: number;
}

const columns: ColumnDef<MenuRow>[] = [
  {
    accessorKey: 'itemName',
    header: 'Item Name',
    cell: ({ row }) => <div className="font-medium">{row.getValue('itemName')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return <Badge variant={type === 'KITCHEN' ? 'default' : 'secondary'}>{type}</Badge>;
    },
  },
  {
    accessorKey: 'qtySold',
    header: 'Qty Sold',
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue (₹)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('revenue'));
      return <div className="text-primary font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</div>;
    },
  },
];

export function MenuReportsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mockTableData: MenuRow[] = [
    { id: '1', itemName: 'Butter Chicken', category: 'Main Course', type: 'KITCHEN', qtySold: 45, revenue: 15750 },
    { id: '2', itemName: 'Garlic Naan', category: 'Breads', type: 'KITCHEN', qtySold: 120, revenue: 6000 },
    { id: '3', itemName: 'Diet Coke', category: 'Beverages', type: 'PACKED', qtySold: 35, revenue: 2100 },
    { id: '4', itemName: 'Paneer Tikka', category: 'Starters', type: 'KITCHEN', qtySold: 28, revenue: 7000 },
  ];

  const mockChartData = mockTableData
    .map(item => ({ name: item.itemName, qty: item.qtySold }))
    .sort((a, b) => b.qty - a.qty);

  return (
    <div className="space-y-6">
      <ChartCard title="Top Selling Items (Qty)" data={mockChartData}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' } as any}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Menu Performance Log</h3>
        <DataTable
          columns={columns}
          data={mockTableData}
          pageCount={1}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={false}
        />
      </div>
    </div>
  );
}
