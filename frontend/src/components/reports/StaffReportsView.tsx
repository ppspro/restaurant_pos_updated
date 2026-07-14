import React, { useState } from 'react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { ChartCard } from '../analytics/ChartCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '../ui/badge';

interface ShiftRow {
  shiftId: string;
  cashier: string;
  terminal: string;
  openingCash: number;
  closingCash: number;
  sales: number;
  status: string;
}

const columns: ColumnDef<ShiftRow>[] = [
  {
    accessorKey: 'cashier',
    header: 'Cashier',
    cell: ({ row }) => <div className="font-medium">{row.getValue('cashier')}</div>,
  },
  {
    accessorKey: 'terminal',
    header: 'Terminal',
  },
  {
    accessorKey: 'openingCash',
    header: 'Opening Cash (₹)',
    cell: ({ row }) => <div>{new Intl.NumberFormat('en-IN').format(parseFloat(row.getValue('openingCash')))}</div>,
  },
  {
    accessorKey: 'sales',
    header: 'Total Sales (₹)',
    cell: ({ row }) => <div className="font-medium text-primary">{new Intl.NumberFormat('en-IN').format(parseFloat(row.getValue('sales')))}</div>,
  },
  {
    accessorKey: 'closingCash',
    header: 'Closing Cash (₹)',
    cell: ({ row }) => <div>{new Intl.NumberFormat('en-IN').format(parseFloat(row.getValue('closingCash')))}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge variant={status === 'OPEN' ? 'secondary' : 'default'}>{status}</Badge>;
    },
  },
];

export function StaffReportsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mockTableData: ShiftRow[] = [
    { shiftId: '1', cashier: 'John Doe', terminal: 'POS-1', openingCash: 1000, sales: 15500, closingCash: 16500, status: 'CLOSED' },
    { shiftId: '2', cashier: 'Jane Smith', terminal: 'POS-2', openingCash: 500, sales: 8400, closingCash: 8900, status: 'OPEN' },
    { shiftId: '3', cashier: 'Mike Johnson', terminal: 'POS-1', openingCash: 1500, sales: 22000, closingCash: 23500, status: 'CLOSED' },
  ];

  const mockChartData = mockTableData.map(d => ({
    name: d.cashier,
    sales: d.sales
  }));

  return (
    <div className="space-y-6">
      <ChartCard title="Cashier Performance" data={mockChartData}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip 
              formatter={(value: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' } as any}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Shift & Cashier Log</h3>
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
