import { TrendingUp, TrendingDown, DollarSign, ListOrdered, Percent } from 'lucide-react';
import { StatCard } from './StatCard';
import { DashboardGrid } from '../dashboard/DashboardGrid';
import { useMenuPerformance } from '../../hooks/useAnalytics';
import { DashboardLoadingSkeleton } from '../dashboard/LoadingSkeleton';
import type { AnalyticsFilters } from '../../hooks/useAnalytics';
import { TopItemsChart } from './TopItemsChart';
import { ChartCard } from './ChartCard';
import { CategoryChart } from './CategoryChart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from '../dashboard/StatusBadge';

interface MenuAnalyticsViewProps {
  filters: AnalyticsFilters;
}

export function MenuAnalyticsView({ filters }: MenuAnalyticsViewProps) {
  const { data: menu, isLoading } = useMenuPerformance(filters);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const topSellingItem = menu?.topItems?.[0] || { name: 'N/A', qty: 0 };
  const leastSellingItem = menu?.leastItems?.[0] || { name: 'N/A', qty: 0 };
  const highestRevenueItem = menu?.highestRevenue?.[0] || { name: 'N/A', revenue: 0 };
  const topCategory = menu?.categoryPerformance?.[0] || { name: 'N/A', revenue: 0 };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <DashboardGrid columns={4}>
        <StatCard
          title="Top Selling Item"
          value={topSellingItem.name}
          icon={<TrendingUp className="h-4 w-4" />}
          description={`${topSellingItem.qty} units sold`}
        />
        <StatCard
          title="Highest Revenue Item"
          value={highestRevenueItem.name}
          icon={<DollarSign className="h-4 w-4" />}
          description={`₹${highestRevenueItem.revenue?.toLocaleString() || 0} earned`}
        />
        <StatCard
          title="Top Category"
          value={topCategory.name}
          icon={<ListOrdered className="h-4 w-4" />}
          description={`₹${topCategory.revenue?.toLocaleString() || 0} revenue`}
        />
        <StatCard
          title="Least Selling Item"
          value={leastSellingItem.name}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          description={`${leastSellingItem.qty} units sold`}
        />
      </DashboardGrid>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard 
          title="Top Items by Revenue & Quantity" 
          data={menu?.topItems || []} 
          className="flex flex-col"
        >
          {menu?.topItems ? <TopItemsChart data={menu.topItems} /> : null}
        </ChartCard>

        <ChartCard 
          title="Category Performance" 
          data={menu?.categoryPerformance || []} 
          className="flex flex-col"
        >
          <CategoryChart data={menu?.categoryPerformance || []} />
        </ChartCard>
      </div>

      {/* Full Menu Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Item Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-md">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Quantity Sold</th>
                  <th className="px-4 py-3 text-right rounded-tr-md">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {menu?.all?.map((item: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.itemType} type={item.itemType === 'KITCHEN' ? 'warning' : 'neutral'} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{item.qty}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!menu?.all?.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No items sold in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
