import React from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ChartCardProps {
  title: string;
  data: any[];
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export function ChartCard({ title, data, children, className, minHeight = '300px' }: ChartCardProps) {
  
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    // Extract headers
    const headers = Object.keys(data[0]);
    
    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))
    ].join('\n');
    
    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={`flex flex-col ${className || ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1 text-xs" 
          onClick={handleExportCSV}
          disabled={!data || data.length === 0}
        >
          <Download className="h-3 w-3" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="flex-1" style={{ minHeight }}>
        {children}
      </CardContent>
    </Card>
  );
}
