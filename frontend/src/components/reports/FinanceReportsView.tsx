import React, { useState } from 'react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { ChartCard } from '../analytics/ChartCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface FinanceRow {
  category: string;
  taxRate: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
}

const columns: ColumnDef<FinanceRow>[] = [
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div className="font-medium">{row.getValue('category')}</div>,
  },
  {
    accessorKey: 'taxRate',
    header: 'GST Rate',
  },
  {
    accessorKey: 'grossAmount',
    header: 'Gross (₹)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('grossAmount'));
      return <div>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</div>;
    },
  },
  {
    accessorKey: 'taxAmount',
    header: 'Tax Collected (₹)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('taxAmount'));
      return <div className="text-destructive font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</div>;
    },
  },
  {
    accessorKey: 'netAmount',
    header: 'Net Revenue (₹)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('netAmount'));
      return <div className="text-primary font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</div>;
    },
  },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function FinanceReportsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mockTableData: FinanceRow[] = [
    { category: 'Food (Kitchen)', taxRate: '5%', grossAmount: 10500, taxAmount: 500, netAmount: 10000 },
    { category: 'Beverage (Packed)', taxRate: '18%', grossAmount: 5900, taxAmount: 900, netAmount: 5000 },
  ];

  const mockPieData = [
    { name: 'UPI', value: 8500 },
    { name: 'Card', value: 4500 },
    { name: 'Cash', value: 3400 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Payment Distribution" data={mockPieData}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {mockPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' } as any}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        
        {/* We can add a second chart here later, e.g. Daily Revenue by Payment Method */}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">GST & Tax Breakdown</h3>
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
