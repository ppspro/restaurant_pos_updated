import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { useUpdateKitchenStatus } from '../../api/kitchen.api';
import { Clock, Play, CheckCircle } from 'lucide-react';

interface OrderCardProps {
  order: any;
}

export function OrderCard({ order }: OrderCardProps) {
  const updateMutation = useUpdateKitchenStatus();
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Live timer effect
  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMins = Math.floor((now - created) / 60000);
      setElapsedMinutes(diffMins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const handleAdvance = () => {
    let nextStatus = 'PREPARING';
    if (order.status === 'PREPARING') nextStatus = 'READY';
    else if (order.status === 'READY') nextStatus = 'COMPLETED';

    updateMutation.mutate({ id: order.id, status: nextStatus });
  };

  // Determine SLA color
  let timerColor = 'text-green-500 bg-green-500/10';
  if (elapsedMinutes >= 10 && elapsedMinutes < 15) {
    timerColor = 'text-yellow-500 bg-yellow-500/10';
  } else if (elapsedMinutes >= 15) {
    timerColor = 'text-red-500 bg-red-500/10 animate-pulse';
  }

  return (
    <Card className="flex flex-col shadow-lg border-2 border-transparent hover:border-border transition-colors h-[400px]">
      <CardHeader className="pb-3 border-b flex-row justify-between items-start space-y-0 bg-muted/50 rounded-t-lg">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">{order.tokenNumber}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">{order.orderNumber}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full flex items-center font-bold text-lg ${timerColor}`}>
          <Clock className="w-5 h-5 mr-2" />
          {elapsedMinutes}m
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-start border-b border-border/50 pb-3 last:border-0">
            <div className="flex gap-3">
              <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded text-lg h-fit">
                {item.quantity}x
              </div>
              <div>
                <p className="font-semibold text-lg leading-tight">{item.itemName}</p>
                {item.notes && (
                  <p className="text-sm text-destructive mt-1 font-medium bg-destructive/10 px-2 py-0.5 rounded w-fit">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/30 p-4">
        {order.status === 'PAID' && (
          <Button 
            className="w-full h-14 text-lg font-bold" 
            onClick={handleAdvance}
            disabled={updateMutation.isPending}
          >
            <Play className="w-6 h-6 mr-2" /> Start Preparing
          </Button>
        )}
        
        {order.status === 'PREPARING' && (
          <Button 
            variant="outline"
            className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white" 
            onClick={handleAdvance}
            disabled={updateMutation.isPending}
          >
            <CheckCircle className="w-6 h-6 mr-2" /> Mark Ready
          </Button>
        )}

        {order.status === 'READY' && (
          <Button 
            variant="outline"
            className="w-full h-14 text-lg font-bold border-green-500 text-green-500 hover:bg-green-500 hover:text-white" 
            onClick={handleAdvance}
            disabled={updateMutation.isPending}
          >
            <CheckCircle className="w-6 h-6 mr-2" /> Complete & Clear
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
