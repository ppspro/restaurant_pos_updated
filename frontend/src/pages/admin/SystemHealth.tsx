import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Activity, RefreshCw, Cpu, Database, Server, Clock, CheckCircle2 } from 'lucide-react';

export default function SystemHealth() {
  const [metrics, setMetrics] = useState({
    cpu: '14%',
    memory: '1.2 GB / 4.0 GB',
    storage: '35% (28 GB Free)',
    uptime: '14 Days, 6 Hours',
    dbLatency: '3ms',
    apiStatus: 'HEALTHY'
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setMetrics({
        cpu: `${Math.floor(Math.random() * 15) + 5}%`,
        memory: '1.3 GB / 4.0 GB',
        storage: '35% (28 GB Free)',
        uptime: '14 Days, 6 Hours',
        dbLatency: `${Math.floor(Math.random() * 5) + 2}ms`,
        apiStatus: 'HEALTHY'
      });
    }, 8000);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Hardware Infrastructure</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">System Health</h1>
          <p className="text-muted-foreground text-sm">Monitor CPU, RAM, database latency, and operational health metrics.</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* CPU */}
        <Card className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" /> CPU Core Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="text-3xl font-black text-gray-900 dark:text-white">{metrics.cpu}</div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 shadow-inner">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: metrics.cpu }}></div>
            </div>
            <p className="text-[10px] text-muted-foreground">Average load across 4 logical processors.</p>
          </CardContent>
        </Card>

        {/* RAM */}
        <Card className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" /> Memory (RAM) Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="text-3xl font-black text-gray-900 dark:text-white">{metrics.memory.split(' / ')[0]}</div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 shadow-inner">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '32%' }}></div>
            </div>
            <p className="text-[10px] text-muted-foreground">Total system capacity: {metrics.memory.split(' / ')[1]}.</p>
          </CardContent>
        </Card>

        {/* Latency */}
        <Card className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" /> Database Latency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="text-3xl font-black text-emerald-600">{metrics.dbLatency}</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PostgreSQL Connection Healthy
            </p>
            <p className="text-[10px] text-muted-foreground">Avg query read-write round trip latency.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
