import { useSystemHealth } from '../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Server, Printer, Database, TerminalSquare } from 'lucide-react';

export function SystemHealthPanel() {
  const { data, isLoading, isError } = useSystemHealth();

  if (isLoading) return <div>Loading health status...</div>;
  if (isError || !data) return <div>Failed to load health status</div>;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" /> System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4 text-muted-foreground" /> Database
          </div>
          <Badge variant={data.dbStatus === 'UP' ? 'default' : 'destructive'}>
            {data.dbStatus}
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Printers</p>
          {data.printers.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between text-sm ml-2">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-muted-foreground" /> {p.printerName}
              </div>
              <Badge variant={p.status === 'ONLINE' ? 'secondary' : p.status === 'WARNING' ? 'outline' : 'destructive'}>
                {p.status}
              </Badge>
            </div>
          ))}
          {data.printers.length === 0 && <span className="text-xs text-muted-foreground ml-2">No printers configured</span>}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terminals</p>
          {data.terminals.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between text-sm ml-2">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-muted-foreground" /> {t.terminalName}
              </div>
              <Badge variant={t.status === 'ONLINE' ? 'secondary' : 'destructive'}>
                {t.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tokens Generated Today</span>
          <span className="font-bold">{data.tokens.current}</span>
        </div>

      </CardContent>
    </Card>
  );
}
