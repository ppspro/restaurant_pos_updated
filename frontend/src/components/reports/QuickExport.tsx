import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Download, FileText, Table, File } from 'lucide-react';

interface QuickExportProps {
  onExport: (format: string) => void;
}

export function QuickExport({ onExport }: QuickExportProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Quick Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export All Data As</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport('csv')} className="cursor-pointer">
          <Table className="mr-2 h-4 w-4" />
          CSV (Spreadsheet)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('xlsx')} className="cursor-pointer">
          <File className="mr-2 h-4 w-4" />
          Excel Workbook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('pdf')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          PDF Document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
