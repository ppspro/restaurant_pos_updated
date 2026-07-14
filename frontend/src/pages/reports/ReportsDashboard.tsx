import React, { useState } from 'react';
import { FilterSidebar } from '../../components/reports/FilterSidebar';
import { ReportsHeader } from '../../components/reports/ReportsHeader';
import { ReportGrid } from '../../components/reports/ReportGrid';
import { ReportCard } from '../../components/reports/ReportCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { BarChart3, LineChart, PieChart, Receipt, Settings, Users, Percent, ShieldCheck, ArrowLeft, Star } from 'lucide-react';
import { SalesReportsView } from '../../components/reports/SalesReportsView';
import { OrderReportsView } from '../../components/reports/OrderReportsView';
import { FinanceReportsView } from '../../components/reports/FinanceReportsView';
import { MenuReportsView } from '../../components/reports/MenuReportsView';
import { StaffReportsView } from '../../components/reports/StaffReportsView';
import { SystemReportsView } from '../../components/reports/SystemReportsView';

export default function ReportsDashboard() {
  const [favorites, setFavorites] = useState<string[]>(['daily-sales']);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleExport = (format: string) => {
    console.log(`Exporting all as ${format}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportModules = [
    { id: 'daily-sales', title: 'Daily Sales', desc: 'Comprehensive breakdown of today\'s sales.', icon: <BarChart3 className="w-5 h-5" />, category: 'sales' },
    { id: 'weekly-sales', title: 'Weekly Trends', desc: 'Revenue performance over the last 7 days.', icon: <LineChart className="w-5 h-5" />, category: 'sales' },
    { id: 'order-metrics', title: 'Order Metrics', desc: 'Kitchen vs Packed, average completion times.', icon: <Receipt className="w-5 h-5" />, category: 'orders' },
    { id: 'payment-dist', title: 'Payment Distribution', desc: 'Breakdown of Cash, UPI, and Card transactions.', icon: <PieChart className="w-5 h-5" />, category: 'payments' },
    { id: 'cashier-perf', title: 'Cashier Performance', desc: 'Shift summaries, active cashiers, and leaderboards.', icon: <Users className="w-5 h-5" />, category: 'staff' },
    { id: 'gst-tax', title: 'GST & Tax Summary', desc: 'Detailed breakdown of collected taxes for accounting.', icon: <Percent className="w-5 h-5" />, category: 'finance' },
    { id: 'audit-log', title: 'Security Audit Log', desc: 'System logins, setting changes, and cancellations.', icon: <ShieldCheck className="w-5 h-5" />, category: 'system' },
    { id: 'sys-health', title: 'System Health', desc: 'Printers, terminals, and database status.', icon: <Settings className="w-5 h-5" />, category: 'system' },
    { id: 'menu-perf', title: 'Menu Performance', desc: 'Top selling items, least selling items, and categories.', icon: <PieChart className="w-5 h-5" />, category: 'sales' },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Left Sidebar */}
      <FilterSidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <ReportsHeader 
          title={activeReportId ? reportModules.find(r => r.id === activeReportId)?.title || "Detailed Report" : "Reports & Analytics"} 
          description={activeReportId ? "Detailed view and breakdown" : "Generate, preview, and export comprehensive business reports."}
          onExport={handleExport}
          onPrint={handlePrint}
        />

        {activeReportId ? (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setActiveReportId(null)} className="mb-4 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            {activeReportId === 'daily-sales' || activeReportId === 'weekly-sales' ? (
              <SalesReportsView />
            ) : activeReportId === 'order-metrics' ? (
              <OrderReportsView />
            ) : activeReportId === 'payment-dist' || activeReportId === 'gst-tax' ? (
              <FinanceReportsView />
            ) : activeReportId === 'menu-perf' ? (
              <MenuReportsView />
            ) : activeReportId === 'cashier-perf' ? (
              <StaffReportsView />
            ) : activeReportId === 'audit-log' || activeReportId === 'sys-health' ? (
              <SystemReportsView />
            ) : (
              <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">
                <p>Detailed view for this report is under construction.</p>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="staff">Staff & Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <ReportGrid columns={3}>
              {reportModules.map(report => (
                <ReportCard
                  key={report.id}
                  title={report.title}
                  description={report.desc}
                  icon={report.icon}
                  isFavorite={favorites.includes(report.id)}
                  onToggleFavorite={() => toggleFavorite(report.id)}
                  onPreview={() => setActiveReportId(report.id)}
                  onExport={(fmt) => console.log('Export', report.id, fmt)}
                />
              ))}
            </ReportGrid>
          </TabsContent>

          <TabsContent value="favorites" className="m-0">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed text-muted-foreground bg-muted/10">
                <Star className="w-12 h-12 mb-4 text-muted" />
                <h3 className="text-lg font-medium text-foreground">No favorite reports</h3>
                <p>Click the star icon on any report to add it to your favorites.</p>
              </div>
            ) : (
              <ReportGrid columns={3}>
                {reportModules.filter(r => favorites.includes(r.id)).map(report => (
                  <ReportCard
                    key={report.id}
                    title={report.title}
                    description={report.desc}
                    icon={report.icon}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(report.id)}
                    onPreview={() => setActiveReportId(report.id)}
                  />
                ))}
              </ReportGrid>
            )}
          </TabsContent>
          
          <TabsContent value="sales" className="m-0">
             <ReportGrid columns={3}>
                {reportModules.filter(r => r.category === 'sales').map(report => (
                  <ReportCard key={report.id} {...report} description={report.desc} isFavorite={favorites.includes(report.id)} onToggleFavorite={() => toggleFavorite(report.id)} onPreview={() => setActiveReportId(report.id)} />
                ))}
              </ReportGrid>
          </TabsContent>

          <TabsContent value="finance" className="m-0">
             <ReportGrid columns={3}>
                {reportModules.filter(r => r.category === 'finance' || r.category === 'payments').map(report => (
                  <ReportCard key={report.id} {...report} description={report.desc} isFavorite={favorites.includes(report.id)} onToggleFavorite={() => toggleFavorite(report.id)} onPreview={() => setActiveReportId(report.id)} />
                ))}
              </ReportGrid>
          </TabsContent>
          
          <TabsContent value="staff" className="m-0">
             <ReportGrid columns={3}>
                {reportModules.filter(r => r.category === 'staff' || r.category === 'orders').map(report => (
                  <ReportCard key={report.id} {...report} description={report.desc} isFavorite={favorites.includes(report.id)} onToggleFavorite={() => toggleFavorite(report.id)} onPreview={() => setActiveReportId(report.id)} />
                ))}
              </ReportGrid>
          </TabsContent>

        </Tabs>
        )}
      </div>
    </div>
  );
}
