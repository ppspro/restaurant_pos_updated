import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Package, AlertTriangle, IndianRupee, Truck } from 'lucide-react';
// import { useInventoryDashboardStats } from '../../api/inventory.api'; 

export default function InventoryDashboard() {
  // Mock data for Phase 1 UI
  const stats = {
    totalValue: 125430.50,
    lowStockCount: 4,
    outOfStockCount: 1,
    pendingPurchases: 2,
    recentMovements: [
      { id: '1', item: 'Tomato', type: 'IN', qty: 50, unit: 'Kg', time: '2 hours ago' },
      { id: '2', item: 'Onion', type: 'OUT', qty: 10, unit: 'Kg', time: '3 hours ago' },
      { id: '3', item: 'Cheese block', type: 'WASTE', qty: 1, unit: 'Kg', time: '5 hours ago' },
    ]
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.outOfStockCount} out of stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Purchases</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPurchases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentMovements.map(movement => (
                <div key={movement.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      movement.type === 'IN' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      movement.type === 'OUT' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{movement.item}</p>
                      <p className="text-xs text-muted-foreground">{movement.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {movement.type === 'IN' ? '+' : '-'}{movement.qty} {movement.unit}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1">{movement.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border flex flex-col gap-2">
              <h4 className="font-medium">Receive Stock (GRN)</h4>
              <p className="text-xs text-muted-foreground">Log new deliveries from vendors into the system.</p>
              <button className="mt-2 w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Receive Stock
              </button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg border flex flex-col gap-2">
              <h4 className="font-medium">Log Waste / Damage</h4>
              <p className="text-xs text-muted-foreground">Record expired or damaged stock for accurate reporting.</p>
              <button className="mt-2 w-full py-2 bg-background border rounded-md text-sm font-medium hover:bg-accent transition-colors">
                Log Waste
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
