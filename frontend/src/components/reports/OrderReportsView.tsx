import React, { useState } from 'react';
import { DataTable } from './DataTable';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { ChartCard } from '../analytics/ChartCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '../ui/badge';

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  items: number;
  total: number;
  cashier: string;
  time: string;
}

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
    cell: ({ row }) => <div className="font-medium">#{row.getValue('orderNumber')}</div>,
  },
  {
    accessorKey: 'time',
    header: 'Time',
  },
  {
    accessorKey: 'cashier',
    header: 'Cashier',
  },
  {
    accessorKey: 'items',
    header: 'Items',
  },
  {
    accessorKey: 'total',
    header: 'Total (₹)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';
      if (status === 'CANCELLED') variant = 'destructive';
      if (status === 'PENDING') variant = 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

export function OrderReportsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // TODO: Replace with actual API data
  const mockTableData: OrderRow[] = [
    { id: '1', orderNumber: '1001', status: 'COMPLETED', items: 3, total: 450, cashier: 'John Doe', time: '12:30 PM' },
    { id: '2', orderNumber: '1002', status: 'COMPLETED', items: 1, total: 150, cashier: 'Jane Smith', time: '12:35 PM' },
    { id: '3', orderNumber: '1003', status: 'CANCELLED', items: 2, total: 300, cashier: 'John Doe', time: '12:40 PM' },
    { id: '4', orderNumber: '1004', status: 'PENDING', items: 4, total: 850, cashier: 'Jane Smith', time: '12:45 PM' },
  ];

  const mockChartData = [
    { name: '12:00', completed: 15, cancelled: 1 },
    { name: '13:00', completed: 25, cancelled: 2 },
    { name: '14:00', completed: 20, cancelled: 0 },
    { name: '15:00', completed: 10, cancelled: 3 },
  ];

  return (
    <div className="space-y-6">
      <ChartCard title="Order Timeline" data={mockChartData}>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' } as any}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
              <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Order Log</h3>
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
