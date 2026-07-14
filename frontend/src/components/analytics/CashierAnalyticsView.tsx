import { Users, UserCheck, Timer, Trophy } from 'lucide-react';
import { StatCard } from './StatCard';
import { DashboardGrid } from '../dashboard/DashboardGrid';
import { useCashierAnalytics } from '../../hooks/useAnalytics';
import { DashboardLoadingSkeleton } from '../dashboard/LoadingSkeleton';
import type { AnalyticsFilters } from '../../hooks/useAnalytics';
import { ChartCard } from './ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CashierAnalyticsViewProps {
  filters: AnalyticsFilters;
}

export function CashierAnalyticsView({ filters }: CashierAnalyticsViewProps) {
  const { data: cashiers, isLoading } = useCashierAnalytics(filters);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  // Derived metrics
  const activeCount = cashiers?.length || 0;
  
  // Find top performer by sales
  let topPerformer = { name: 'N/A', salesAmount: 0 };
  let fastestCashier = { name: 'N/A', avgBillingTimeMin: 999 };

  if (cashiers && cashiers.length > 0) {
    topPerformer = cashiers[0]; // already sorted by sales descending
    
    cashiers.forEach((c: any) => {
      if (c.avgBillingTimeMin > 0 && c.avgBillingTimeMin < fastestCashier.avgBillingTimeMin) {
        fastestCashier = c;
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <DashboardGrid columns={4}>
        <StatCard
          title="Active Cashiers"
          value={activeCount}
          icon={<Users className="h-4 w-4" />}
          description="In selected period"
        />
        <StatCard
          title="Top Performer (Sales)"
          value={topPerformer.name}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          description={`₹${topPerformer.salesAmount?.toLocaleString() || 0}`}
        />
        <StatCard
          title="Fastest Cashier"
          value={fastestCashier.name !== 'N/A' ? fastestCashier.name : 'N/A'}
          icon={<Timer className="h-4 w-4 text-emerald-500" />}
          description={fastestCashier.name !== 'N/A' ? `${fastestCashier.avgBillingTimeMin}m avg billing` : ''}
        />
        <StatCard
          title="Avg Cashier AOV"
          value={`₹${(cashiers?.reduce((acc: number, c: any) => acc + c.avgOrderValue, 0) / (activeCount || 1))?.toFixed(2)}`}
          icon={<UserCheck className="h-4 w-4" />}
        />
      </DashboardGrid>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Leaderboard Chart */}
        <ChartCard 
          title="Sales by Cashier" 
          data={cashiers || []} 
          className="col-span-1 lg:col-span-1 flex flex-col"
        >
          {cashiers && cashiers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashiers.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="salesAmount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
              No cashier data available
            </div>
          )}
        </ChartCard>

        {/* Leaderboard Table */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Cashier Performance Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-md">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-md">Rank</th>
                    <th className="px-4 py-3">Cashier Name</th>
                    <th className="px-4 py-3 text-right">Orders</th>
                    <th className="px-4 py-3 text-right">AOV (₹)</th>
                    <th className="px-4 py-3 text-right">Avg Speed</th>
                    <th className="px-4 py-3 text-right rounded-tr-md">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {cashiers?.map((c: any, i: number) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-muted-foreground">#{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-right">{c.ordersProcessed}</td>
                      <td className="px-4 py-3 text-right">{c.avgOrderValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{c.avgBillingTimeMin}m</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{c.salesAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {!cashiers?.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No cashiers active in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
