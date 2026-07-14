import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Bell, AlertTriangle, Package, Utensils } from 'lucide-react';

export default function NotificationDashboard() {
  const notifications = [
    { id: '1', type: 'INVENTORY', priority: 'HIGH', title: 'Low Stock Alert', message: 'Tomato stock has fallen below 5kg reorder level.', time: '10 mins ago', read: false },
    { id: '2', type: 'KITCHEN', priority: 'CRITICAL', title: 'SLA Breach', message: 'Order #104 has breached 15 minute prep SLA.', time: '1 hour ago', read: false },
    { id: '3', type: 'SHIFT', priority: 'MEDIUM', title: 'Shift Closed', message: 'Morning shift closed by John Doe with ₹200 cash difference.', time: '3 hours ago', read: true },
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'INVENTORY': return <Package className="w-5 h-5" />;
      case 'KITCHEN': return <Utensils className="w-5 h-5" />;
      case 'SYSTEM': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Manage system alerts and communication.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors">
            Mark All as Read
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-lg border flex gap-4 transition-colors ${notif.read ? 'bg-muted/30 opacity-70' : 'bg-card hover:bg-muted/50'}`}
              >
                <div className={`p-3 rounded-full h-fit border ${getPriorityColor(notif.priority)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${notif.read ? '' : 'text-foreground'}`}>{notif.title}</h3>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(notif.priority)}`}>
                      {notif.priority}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {notif.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
