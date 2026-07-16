import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Database, Download, RefreshCw, Plus, CheckCircle2, History } from 'lucide-react';

export default function Backup() {
  const [backups, setBackups] = useState([
    { id: '1', filename: 'backup_pos_db_20260711_060000.sql', size: '12.4 MB', status: 'SUCCESS', createdBy: 'Scheduled System Task', timestamp: '2026-07-11 06:00 AM' },
    { id: '2', filename: 'backup_pos_db_20260710_060000.sql', size: '12.3 MB', status: 'SUCCESS', createdBy: 'Scheduled System Task', timestamp: '2026-07-10 06:00 AM' },
    { id: '3', filename: 'backup_pos_db_manual_reconcile.sql', size: '12.1 MB', status: 'SUCCESS', createdBy: 'Admin User', timestamp: '2026-07-09 04:30 PM' }
  ]);

  const [creatingBackup, setCreatingBackup] = useState(false);

  const handleBackup = () => {
    setCreatingBackup(true);
    setTimeout(() => {
      setCreatingBackup(false);
      const newBackup = {
        id: String(backups.length + 1),
        filename: `backup_pos_db_manual_${Date.now()}.sql`,
        size: '12.4 MB',
        status: 'SUCCESS',
        createdBy: 'Admin User',
        timestamp: new Date().toLocaleString('en-IN')
      };
      setBackups([newBackup, ...backups]);
      alert('Manual database snapshot created successfully.');
    }, 1500);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Database Maintenance</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">Data Backups</h1>
          <p className="text-muted-foreground text-sm">Create snapshots, restore historical databases, and check replication schedules.</p>
        </div>
        <Button
          onClick={handleBackup}
          disabled={creatingBackup}
          className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {creatingBackup ? 'Creating Snapshot...' : 'Create Snapshot'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Backup configuration summary */}
        <div className="space-y-6">
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" /> Storage Summary
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-semibold">Active replication configuration details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs space-y-2 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Backup Policy:</span><span className="font-bold text-gray-900 dark:text-white">Daily Scheduled</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span className="font-bold text-gray-900 dark:text-white">06:00 AM (local)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Destination:</span><span className="font-bold text-gray-900 dark:text-white">AWS S3 (Replicated)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Snapshots Kept:</span><span className="font-bold text-gray-900 dark:text-white">Last 30 Days</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 font-mono">
            <History className="w-4.5 h-4.5 text-blue-500" /> Database Snapshots History
          </h3>

          <div className="space-y-3">
            {backups.map((b) => (
              <Card key={b.id} className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-950 dark:text-white truncate max-w-[320px]">{b.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: <strong className="text-muted-foreground">{b.timestamp}</strong> • Size: <strong className="text-muted-foreground">{b.size}</strong> • by {b.createdBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 sm:w-auto w-full">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {b.status}
                    </Badge>
                    <Button variant="outline" className="h-8 text-[11px] rounded-lg border-border hover:bg-accent shrink-0">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
