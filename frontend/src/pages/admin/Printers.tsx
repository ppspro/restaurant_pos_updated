import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Printer as PrinterIcon, RefreshCw, Plus, CheckCircle2, AlertTriangle, Edit, Trash2, Search, Filter } from 'lucide-react';
import { printerApi, type Printer } from '../../api/printer.api';
import PrinterFormModal from '../../components/admin/printers/PrinterFormModal';
import { useNotification } from '../../components/ui/GlobalNotificationProvider';

export default function Printers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [printingId, setPrintingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { notify } = useNotification();

  const { data, isLoading } = useQuery({
    queryKey: ['printers'],
    queryFn: () => printerApi.getPrinters()
  });

  const printers: Printer[] = data?.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => printerApi.deletePrinter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      notify('success', 'Printer deleted successfully');
    },
    onError: (error: any) => {
      notify('error', error.response?.data?.message || 'Failed to delete printer');
    }
  });

  const testPrintMutation = useMutation({
    mutationFn: (id: string) => printerApi.testPrint(id),
    onSuccess: (res) => {
      notify('success', res.data.message || 'Test print sent successfully');
      setPrintingId(null);
    },
    onError: (error: any) => {
      notify('error', error.response?.data?.message || 'Failed to send test print');
      setPrintingId(null);
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete Printer?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTestPrint = (id: string) => {
    setPrintingId(id);
    testPrintMutation.mutate(id);
  };

  const openEdit = (printer: Printer) => {
    setEditingPrinter(printer);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingPrinter(null);
    setIsModalOpen(true);
  };

  const filteredPrinters = printers.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.ipAddress && p.ipAddress.includes(search)) ||
      p.location.toLowerCase().includes(search.toLowerCase());
      
    const matchesFilter = filterType === 'All' 
      ? true 
      : filterType === 'Online' ? p.status === 'Online'
      : filterType === 'Offline' ? p.status === 'Offline'
      : p.type.includes(filterType);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Peripheral Configurations</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">Thermal Printers</h1>
          <p className="text-muted-foreground text-sm">Configure receipt, kitchen KOT, and label printers.</p>
        </div>
        <Button onClick={openAdd} className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Printer
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, IP, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Online', 'Offline', 'Receipt', 'Kitchen', 'Label'].map(filter => (
            <Badge 
              key={filter} 
              variant="outline" 
              className={`cursor-pointer border px-3 py-1 text-xs transition-colors rounded-lg ${filterType === filter ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              onClick={() => setFilterType(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-[250px] bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : filteredPrinters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl border-gray-200 dark:border-gray-800">
          <PrinterIcon className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No printers found</h3>
          <p className="text-gray-500 max-w-sm mt-2 text-sm">Add a new printer or change your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrinters.map((p) => (
            <Card key={p.id} className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <PrinterIcon className={`w-5 h-5 ${p.status === 'Online' ? 'text-blue-500' : 'text-gray-400'}`} />
                  {p.name}
                </CardTitle>
                <Badge className={p.status === 'Online' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-600 border border-gray-500/20'}>
                  {p.status === 'Online' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                  {p.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 flex-1 flex flex-col">
                
                <div className="flex items-center gap-2 mb-2">
                   <Badge variant="outline" className="text-[10px] uppercase font-bold border-gray-200">{p.type}</Badge>
                   {p.connectionType === 'Network' && <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 border-blue-200 bg-blue-50">Network</Badge>}
                </div>

                <div className="text-xs space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-border flex-1">
                  <div className="flex justify-between"><span className="text-muted-foreground font-medium">Location:</span><span className="font-bold text-gray-900 dark:text-gray-100">{p.location}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground font-medium">Connection:</span><span className="font-bold text-gray-900 dark:text-gray-100">{p.connectionType}</span></div>
                  {p.ipAddress && (
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">IP Address:</span><span className="font-bold font-mono text-gray-900 dark:text-gray-100">{p.ipAddress}:{p.port}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground font-medium">Paper:</span><span className="font-bold text-gray-900 dark:text-gray-100">{p.paperWidth}</span></div>
                </div>

                <div className="flex gap-2 mt-auto pt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleTestPrint(p.id)}
                    disabled={printingId === p.id}
                    variant="outline"
                    className="h-9 text-xs flex-1 rounded-xl border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${printingId === p.id ? 'animate-spin' : ''}`} />
                    Test Print
                  </Button>
                  <Button onClick={() => openEdit(p)} variant="outline" className="h-9 px-3 rounded-xl border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800">
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </Button>
                  <Button onClick={() => handleDelete(p.id)} variant="outline" className="h-9 px-3 rounded-xl border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <PrinterFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        printer={editingPrinter} 
      />
    </div>
  );
}
