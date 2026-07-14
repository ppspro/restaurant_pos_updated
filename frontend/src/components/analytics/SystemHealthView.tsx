import { Server, Database, Printer, Monitor, Store, Clock, LayoutGrid, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useSystemHealth } from '../../hooks/useAnalytics';
import { DashboardLoadingSkeleton } from '../dashboard/LoadingSkeleton';
import { StatusBadge } from '../dashboard/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export function SystemHealthView() {
  const { data: health, isLoading, isError } = useSystemHealth();

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (isError || !health) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-red-500 border-2 border-dashed border-red-500/20 rounded-md bg-red-500/5">
        Failed to load system health. Backend might be unreachable.
      </div>
    );
  }

  // Format uptime
  const uptimeMinutes = Math.floor((health.uptimeSeconds || 0) / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);

  let uptimeStr = '';
  if (uptimeDays > 0) uptimeStr += `${uptimeDays}d `;
  if (uptimeHours > 0) uptimeStr += `${uptimeHours % 24}h `;
  uptimeStr += `${uptimeMinutes % 60}m`;
  if (uptimeStr === '0m') uptimeStr = '< 1m';

  const heartbeatTime = health.heartbeat ? new Date(health.heartbeat).toLocaleTimeString() : 'Unknown';
  const isHealthy = health.serverStatus === 'UP' && health.dbStatus === 'UP';

  return (
    <div className="space-y-6 animate-in fade-in-50">
      
      {/* Top Level System Status */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className={isHealthy ? 'border-emerald-500/20 shadow-sm shadow-emerald-500/10' : 'border-red-500/50'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className={`h-4 w-4 ${health.serverStatus === 'UP' ? 'text-emerald-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.serverStatus || 'DOWN'}</div>
            <p className="text-xs text-muted-foreground mt-1">Uptime: {uptimeStr}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className={`h-4 w-4 ${health.dbStatus === 'UP' ? 'text-emerald-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.dbStatus || 'DOWN'}</div>
            <p className="text-xs text-muted-foreground mt-1">Prisma Client Connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heartbeat</CardTitle>
            <HeartPulse className="h-4 w-4 text-rose-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{heartbeatTime}</div>
            <p className="text-xs text-muted-foreground mt-1">Refreshes every 10s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Day</CardTitle>
            <Store className={`h-4 w-4 ${health.businessDayStatus === 'OPEN' ? 'text-emerald-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.businessDayStatus || 'CLOSED'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {health.businessDayStatus === 'OPEN' ? 'Accepting orders' : 'POS operations suspended'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Hardware Status */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" /> 
              Terminals & Printers
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Terminals</h4>
                {health.terminals?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {health.terminals.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3 border rounded-md">
                        <span className="font-medium text-sm">{t.terminalName}</span>
                        <StatusBadge status={t.status} type={t.status === 'ACTIVE' ? 'success' : 'error'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">No terminals configured.</div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Printer className="h-4 w-4" /> Printers
                </h4>
                {health.printers?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {health.printers.map((p: any) => (
                      <div key={p.id} className="flex flex-col gap-2 p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{p.printerName}</span>
                          <StatusBadge status={p.status} type={p.status === 'ONLINE' ? 'success' : 'error'} />
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded-sm">{p.location}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">No printers configured.</div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Operations Status */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Operations & Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Cash Drawers</h4>
                {health.cashDrawers?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {health.cashDrawers.map((d: any) => (
                      <div key={d.id} className="flex flex-col gap-2 p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{d.drawerCode}</span>
                          <StatusBadge status={d.status} type={d.status === 'CLOSED' ? 'neutral' : 'warning'} />
                        </div>
                        <span className="text-xs font-mono">Bal: ₹{Number(d.currentBalance || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">No cash drawers configured.</div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Active Shifts
                </h4>
                {health.activeShifts?.length > 0 ? (
                  <div className="space-y-2">
                    {health.activeShifts.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium text-sm">{s.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{s.terminal?.terminalName || 'Unknown Terminal'}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status="OPEN" type="success" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Since {new Date(s.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic border-l-2 border-muted pl-4 py-2">
                    No active cashier shifts currently open.
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
