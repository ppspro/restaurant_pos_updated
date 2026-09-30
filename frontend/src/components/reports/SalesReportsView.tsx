import React, { useState, useMemo } from 'react';
import { DataTable } from './DataTable';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { ChartCard } from '../analytics/ChartCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAnalyticsTrends } from '../../hooks/useAnalytics';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

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

export function SalesReportsView({ reportType }: { reportType?: string }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const dateRangeMap: Record<string, 'TODAY' | 'THIS_WEEK' | 'THIS_YEAR'> = {
    'daily-sales': 'TODAY',
    'weekly-sales': 'THIS_WEEK',
    'total-sales': 'THIS_YEAR',
  };
  
  const dateRange = dateRangeMap[reportType || 'daily-sales'] || 'TODAY';

  const { data: trendsData, isLoading, isError, refetch } = useAnalyticsTrends({ dateRange });

  const mappedData: SalesRow[] = useMemo(() => {
    if (!trendsData) return [];
    return trendsData.map((item: any) => {
      return {
        date: item.label,
        orders: item.orders,
        revenue: item.sales,
        aov: item.orders > 0 ? item.sales / item.orders : 0
      };
    });
  }, [trendsData]);

  const displayData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return mappedData.slice(start, start + pagination.pageSize);
  }, [mappedData, pagination]);

  const isEmpty = useMemo(() => mappedData.length === 0 || mappedData.every(d => d.revenue === 0 && d.orders === 0), [mappedData]);

  return (
    <div className="space-y-6 w-full">
      <ChartCard title="Revenue Trends" data={mappedData}>
        <div className="w-full h-[300px]">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading sales data...</p>
            </div>
          ) : isError ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="max-w-md bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  <span>Error</span>
                </div>
                <p className="text-sm">Failed to load sales data.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 block border-destructive/50 hover:bg-destructive/20">
                  Retry
                </Button>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <p>No sales data available for the selected period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mappedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          )}
        </div>
      </ChartCard>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Detailed Breakdown</h3>
        <DataTable
          columns={columns}
          data={displayData}
          pageCount={Math.ceil(mappedData.length / pagination.pageSize)}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
