import React, { useMemo } from 'react';
import { useKitchenQueue } from '../../api/kitchen.api';
import { OrderCard } from '../../components/kitchen/OrderCard';
import { Loader2, ChefHat } from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';

export default function KitchenDashboard() {
  const { data: queue, isLoading, isError } = useKitchenQueue();

  const waitingOrders = useMemo(() => queue?.filter((o: any) => o.status === 'PAID') || [], [queue]);
  const preparingOrders = useMemo(() => queue?.filter((o: any) => o.status === 'PREPARING') || [], [queue]);
  const readyOrders = useMemo(() => queue?.filter((o: any) => o.status === 'READY') || [], [queue]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center text-destructive">
          <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold">Failed to connect to KDS</h2>
          <p>Please check your network connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 dark">
      {/* KDS Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white">MAIN KITCHEN</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Live System</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white tracking-tight">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-slate-400">Total Active: {queue?.length || 0}</p>
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-hidden">
        
        {/* Waiting Column */}
        <div className="flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-200">WAITING</h3>
            <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold">
              {waitingOrders.length}
            </span>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {waitingOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {waitingOrders.length === 0 && (
                <div className="text-center p-8 text-slate-500 font-medium">No waiting orders</div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Preparing Column */}
        <div className="flex flex-col bg-slate-900/50 rounded-xl border border-amber-900/50 overflow-hidden">
          <div className="p-4 bg-amber-900/30 border-b border-amber-900/50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-amber-500">PREPARING</h3>
            <span className="bg-amber-500/20 text-amber-500 border border-amber-500/50 px-3 py-1 rounded-full text-sm font-bold">
              {preparingOrders.length}
            </span>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {preparingOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {preparingOrders.length === 0 && (
                <div className="text-center p-8 text-slate-500 font-medium">No orders currently preparing</div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Ready Column */}
        <div className="flex flex-col bg-slate-900/50 rounded-xl border border-green-900/50 overflow-hidden">
          <div className="p-4 bg-green-900/30 border-b border-green-900/50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-green-500">READY (EXPEDITE)</h3>
            <span className="bg-green-500/20 text-green-500 border border-green-500/50 px-3 py-1 rounded-full text-sm font-bold">
              {readyOrders.length}
            </span>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {readyOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {readyOrders.length === 0 && (
                <div className="text-center p-8 text-slate-500 font-medium">No orders waiting for pickup</div>
              )}
            </div>
          </ScrollArea>
        </div>

      </div>
    </div>
  );
}
