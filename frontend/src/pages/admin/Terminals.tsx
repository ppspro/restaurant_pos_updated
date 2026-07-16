import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Monitor, RefreshCw, Plus, Wifi, WifiOff, Users, Key, Clock } from 'lucide-react';

export default function Terminals() {
  const [terminals, setTerminals] = useState([
    { id: '1', code: 'T01', name: 'Main Front Counter', status: 'ONLINE', heartbeat: '5s ago', cashier: 'John D.', ip: '192.168.1.50' },
    { id: '2', code: 'T02', name: 'Expedited Bar Counter', status: 'ONLINE', heartbeat: '12s ago', cashier: 'Sarah K.', ip: '192.168.1.51' },
    { id: '3', code: 'T03', name: 'Drive-Thru Window', status: 'ONLINE', heartbeat: '1m ago', cashier: 'Jane S.', ip: '192.168.1.52' },
    { id: '4', code: 'T04', name: 'Back Kitchen Hub', status: 'OFFLINE', heartbeat: '2h ago', cashier: 'Unassigned', ip: '192.168.1.53' }
  ]);

  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      alert('Terminal connection responsive. Latency: 8ms.');
    }, 1000);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Hardware Configuration</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">POS Terminals</h1>
          <p className="text-muted-foreground text-sm">Register, monitor, and configure active POS cash registers.</p>
        </div>
        <Button className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Register Terminal
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {terminals.map((t) => (
          <Card key={t.id} className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  {t.name} ({t.code})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">IP: {t.ip}</CardDescription>
              </div>
              <Badge className={t.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-850 text-muted-foreground'}>
                {t.status === 'ONLINE' ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
                {t.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-border">
                <div>
                  <p className="text-muted-foreground font-semibold">Assigned Cashier</p>
                  <p className="text-gray-900 dark:text-white font-bold mt-0.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> {t.cashier}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Last Heartbeat</p>
                  <p className="text-gray-900 dark:text-white font-bold mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {t.heartbeat}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTestConnection(t.id)}
                  disabled={testingId === t.id}
                  variant="outline"
                  className="h-9 text-xs flex-1 rounded-xl border-border hover:bg-accent"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingId === t.id ? 'animate-spin' : ''}`} />
                  {testingId === t.id ? 'Pinging...' : 'Test Connection'}
                </Button>
                <Button variant="outline" className="h-9 text-xs rounded-xl border-border hover:bg-accent">
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
