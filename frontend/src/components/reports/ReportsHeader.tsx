import React from 'react';
import { QuickExport } from './QuickExport';
import { Printer } from 'lucide-react';
import { Button } from '../ui/button';

interface ReportsHeaderProps {
  title: string;
  description: string;
  onExport: (format: string) => void;
  onPrint: () => void;
}

export function ReportsHeader({ title, description, onExport, onPrint }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onPrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <QuickExport onExport={onExport} />
      </div>
    </div>
  );
}
