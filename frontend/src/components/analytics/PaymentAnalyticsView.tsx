import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { StatCard } from './StatCard';
import { DashboardGrid } from '../dashboard/DashboardGrid';
import { usePaymentAnalytics } from '../../hooks/useAnalytics';
import { DashboardLoadingSkeleton } from '../dashboard/LoadingSkeleton';
import type { AnalyticsFilters } from '../../hooks/useAnalytics';
import { PaymentDistributionChart } from './PaymentDistributionChart';
import { PaymentTrendChart } from './PaymentTrendChart';
import { ChartCard } from './ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PaymentAnalyticsViewProps {
  filters: AnalyticsFilters;
}

export function PaymentAnalyticsView({ filters }: PaymentAnalyticsViewProps) {
  const { data: payments, isLoading } = usePaymentAnalytics(filters);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const distribution = payments?.distribution || [];
  
  const cashAmount = distribution.find((d: any) => d.name === 'CASH')?.value || 0;
  const upiAmount = distribution.find((d: any) => d.name === 'UPI')?.value || 0;
  const cardAmount = distribution.find((d: any) => d.name === 'CARD')?.value || 0;
  
  const totalAmount = cashAmount + upiAmount + cardAmount;

  const topMethod = [...distribution].sort((a, b) => b.value - a.value)[0] || { name: 'N/A', value: 0 };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <DashboardGrid columns={4}>
        <StatCard
          title="Total Revenue"
          value={`₹${totalAmount.toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Cash Revenue"
          value={`₹${cashAmount.toLocaleString()}`}
          icon={<Banknote className="h-4 w-4" />}
          trend={{ value: totalAmount ? Math.round((cashAmount / totalAmount) * 100) : 0, isPositive: true }}
          description="of total"
        />
        <StatCard
          title="UPI Revenue"
          value={`₹${upiAmount.toLocaleString()}`}
          icon={<Smartphone className="h-4 w-4" />}
          trend={{ value: totalAmount ? Math.round((upiAmount / totalAmount) * 100) : 0, isPositive: true }}
          description="of total"
        />
        <StatCard
          title="Card Revenue"
          value={`₹${cardAmount.toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{ value: totalAmount ? Math.round((cardAmount / totalAmount) * 100) : 0, isPositive: true }}
          description="of total"
        />
      </DashboardGrid>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Distribution Pie Chart */}
        <ChartCard 
          title="Payment Distribution" 
          data={distribution || []} 
          className="col-span-1 flex flex-col"
        >
          <PaymentDistributionChart data={distribution} />
        </ChartCard>

        {/* Trend Bar Chart */}
        <ChartCard 
          title="Payment Trend" 
          data={payments?.trend || []} 
          className="col-span-1 lg:col-span-2 flex flex-col"
        >
          <PaymentTrendChart data={payments?.trend || []} />
        </ChartCard>
      </div>
    </div>
  );
}
