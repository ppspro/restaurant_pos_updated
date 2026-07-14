import React, { useState } from 'react';
import { useOrderHistory } from '../../api/orders.api';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '../../components/reports/DataTable'; // Reusing our enterprise DataTable
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Search, Eye } from 'lucide-react';
import { OrderDetailsDrawer } from '../../components/orders/OrderDetailsDrawer';

export default function OrderManagementDashboard() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('TODAY');
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useOrderHistory({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    dateRange: dateFilter,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'tokenNumber',
      header: 'Token',
      cell: ({ row }) => <div className="font-bold">{row.getValue('tokenNumber')}</div>,
    },
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground">{row.getValue('orderNumber')}</div>,
    },
    {
      accessorKey: 'cashier',
      header: 'Cashier',
    },
    {
      accessorKey: 'total',
      header: 'Total (₹)',
      cell: ({ row }) => <div className="font-medium text-primary">₹{Number(row.getValue('total')).toFixed(2)}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'CANCELLED' ? 'destructive' : status === 'COMPLETED' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(row.original.id)}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-1">Search, view, reprint, and cancel historical orders.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Token or Order #..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-background">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAY">Today</SelectItem>
            <SelectItem value="YESTERDAY">Yesterday</SelectItem>
            <SelectItem value="THIS_WEEK">This Week</SelectItem>
            <SelectItem value="THIS_MONTH">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <DataTable
          columns={columns}
          data={data?.data || []}
          pageCount={data?.pagination.totalPages || 1}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
        />
      </div>

      <OrderDetailsDrawer
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
