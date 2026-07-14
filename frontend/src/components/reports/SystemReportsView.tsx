import React, { useState } from 'react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShieldAlert, LogIn, Edit, FileX } from 'lucide-react';

interface AuditRow {
  time: string;
  user: string;
  action: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

const columns: ColumnDef<AuditRow>[] = [
  {
    accessorKey: 'time',
    header: 'Timestamp',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('time')}</div>,
  },
  {
    accessorKey: 'user',
    header: 'User / Actor',
    cell: ({ row }) => <div className="font-medium">{row.getValue('user')}</div>,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const act = row.getValue('action') as string;
      const getIcon = () => {
        if (act.includes('LOGIN')) return <LogIn className="w-3 h-3 mr-1" />;
        if (act.includes('EDIT') || act.includes('UPDATE')) return <Edit className="w-3 h-3 mr-1" />;
        if (act.includes('CANCEL')) return <FileX className="w-3 h-3 mr-1" />;
        return null;
      };
      return <div className="flex items-center text-xs">{getIcon()}{act}</div>;
    },
  },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => {
      const sev = row.getValue('severity') as string;
      let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';
      if (sev === 'CRITICAL') variant = 'destructive';
      if (sev === 'WARNING') variant = 'secondary';
      if (sev === 'INFO') variant = 'outline';
      return <Badge variant={variant}>{sev}</Badge>;
    },
  },
  {
    accessorKey: 'description',
    header: 'Details',
  },
];

export function SystemReportsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mockTableData: AuditRow[] = [
    { time: '2026-07-10 14:05:12', user: 'Admin', action: 'SETTINGS_UPDATE', description: 'Updated Tax Rate to 18%', severity: 'WARNING' },
    { time: '2026-07-10 12:30:00', user: 'John Doe', action: 'ORDER_CANCELLED', description: 'Cancelled Order #1003', severity: 'CRITICAL' },
    { time: '2026-07-10 09:00:10', user: 'Jane Smith', action: 'SYSTEM_LOGIN', description: 'Logged into POS-2', severity: 'INFO' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">in the selected period</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Security & Audit Log</h3>
        <DataTable
          columns={columns}
          data={mockTableData}
          pageCount={1}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={false}
        />
      </div>
    </div>
  );
}
