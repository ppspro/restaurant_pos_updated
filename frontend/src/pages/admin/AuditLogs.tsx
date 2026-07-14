import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { api } from '../../api/axios';
import { useNotification } from '../../components/ui/GlobalNotificationProvider';

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  
  const [logs, setLogs] = useState([
    { id: '1', user: 'Admin User', action: 'UPDATE', entity: 'Settings', desc: 'Updated GST percentage rate to 5%', time: '2026-07-11 11:32 AM', ip: '192.168.1.10' },
    { id: '2', user: 'Sarah K. (Cashier)', action: 'LOGIN', entity: 'Shift Control', desc: 'Shift started on Terminal T02', time: '2026-07-11 11:15 AM', ip: '192.168.1.51' },
    { id: '3', user: 'Jane S. (Manager)', action: 'CANCEL', entity: 'Order #203', desc: 'Voided item: Noodles x1 due to change of mind', time: '2026-07-11 10:42 AM', ip: '192.168.1.52' },
    { id: '4', user: 'Admin User', action: 'CREATE', entity: 'User', desc: 'Created cashier employee account (John D.)', time: '2026-07-11 09:12 AM', ip: '192.168.1.10' },
    { id: '5', user: 'John D. (Cashier)', action: 'LOGIN', entity: 'Shift Control', desc: 'Shift started on Terminal T01', time: '2026-07-11 08:00 AM', ip: '192.168.1.50' }
  ]);

  const actionColors: Record<string, string> = {
    UPDATE: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    LOGIN: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    CANCEL: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    CREATE: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  const { notify } = useNotification();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (logs.length === 0) {
      notify('error', 'No audit logs available.');
      return;
    }
    
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (search) params.append('user', search);
      
      const response = await api.get(`/audit/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `audit_logs.csv`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notify('success', 'Audit logs exported successfully.');
    } catch (error) {
      console.error(error);
      notify('error', 'Unable to export audit logs.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">System Security</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">Monitor and search security, user activity, and configuration modifications.</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting || logs.length === 0} className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          {isExporting ? 'Exporting...' : 'Export Logs'}
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search user, action, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl border border-border bg-card focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <Button variant="outline" className="h-9 text-xs rounded-xl border-border hover:bg-accent">
              <Filter className="w-4 h-4 mr-1.5" /> Filter by Action
            </Button>
            <Button variant="outline" className="h-9 text-xs rounded-xl border-border hover:bg-accent">
              <ArrowUpDown className="w-4 h-4 mr-1.5" /> Sort Timestamp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">User</th>
                <th className="p-4">Description</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-805/40 transition-colors">
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${actionColors[log.action]}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{log.entity}</td>
                  <td className="p-4 text-muted-foreground">{log.user}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-200">{log.desc}</td>
                  <td className="p-4 font-semibold text-muted-foreground">{log.time}</td>
                  <td className="p-4 font-mono text-muted-foreground">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
