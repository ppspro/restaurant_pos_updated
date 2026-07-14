import { ShoppingBag, Ban, UtensilsCrossed, Package, Clock, CheckCircle2 } from 'lucide-react';
import { StatCard } from './StatCard';
import { DashboardGrid } from '../dashboard/DashboardGrid';
import { useOrderMetrics, usePeakHours } from '../../hooks/useAnalytics';
import { DashboardLoadingSkeleton } from '../dashboard/LoadingSkeleton';
import type { AnalyticsFilters } from '../../hooks/useAnalytics';
import { PeakHoursChart } from './PeakHoursChart';
import { ChartCard } from './ChartCard';
import { OrderTypeChart } from './OrderTypeChart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface OrderAnalyticsViewProps {
  filters: AnalyticsFilters;
}

export function OrderAnalyticsView({ filters }: OrderAnalyticsViewProps) {
  const { data: metrics, isLoading: isMetricsLoading } = useOrderMetrics(filters);
  const { data: peakHours, isLoading: isPeakHoursLoading } = usePeakHours(filters);

  if (isMetricsLoading || isPeakHoursLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <DashboardGrid columns={3}>
        <StatCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Completed Orders"
          value={metrics?.completedOrders || 0}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={{ value: metrics?.totalOrders ? Math.round((metrics.completedOrders / metrics.totalOrders) * 100) : 0, isPositive: true }}
          description="Completion rate"
        />
        <StatCard
          title="Cancelled Orders"
          value={metrics?.cancelledOrders || 0}
          icon={<Ban className="h-4 w-4" />}
          trend={{ value: metrics?.totalOrders ? Math.round((metrics.cancelledOrders / metrics.totalOrders) * 100) : 0, isPositive: false }}
          description="Cancellation rate"
        />
      </DashboardGrid>

      <DashboardGrid columns={4}>
        <StatCard
          title="Kitchen Items"
          value={metrics?.kitchenItems || 0}
          icon={<UtensilsCrossed className="h-4 w-4" />}
        />
        <StatCard
          title="Packed Items"
          value={metrics?.packedItems || 0}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Avg. Prep Time"
          value={`${metrics?.avgPrepTimeMin || 0}m`}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Avg. Billing Time"
          value={`${metrics?.avgBillingTimeMin || 0}m`}
          icon={<Clock className="h-4 w-4" />}
        />
      </DashboardGrid>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <ChartCard 
          title="Hourly Order Trend" 
          data={peakHours || []} 
          className="col-span-1 lg:col-span-2"
        >
          <PeakHoursChart data={peakHours || []} />
        </ChartCard>

        <ChartCard 
          title="Kitchen vs Packed" 
          data={[
            { name: 'KITCHEN', value: metrics?.kitchenItems || 0 },
            { name: 'PACKED', value: metrics?.packedItems || 0 }
          ]} 
          className="col-span-1 flex flex-col"
        >
          <OrderTypeChart data={[
            { name: 'KITCHEN', value: metrics?.kitchenItems || 0 },
            { name: 'PACKED', value: metrics?.packedItems || 0 }
          ]} />
        </ChartCard>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Table placeholder for recent canceled orders or large orders */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Actionable Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
              Order list will appear here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
