import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Download, FileText, ArrowRight, Star } from 'lucide-react';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isFavorite?: boolean;
  onPreview?: () => void;
  onExport?: (format: 'pdf' | 'csv' | 'xlsx') => void;
  onToggleFavorite?: () => void;
}

export function ReportCard({ title, description, icon, isFavorite, onPreview, onExport, onToggleFavorite }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-yellow-500" onClick={onToggleFavorite}>
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </Button>
      </div>
      <CardHeader className="pb-3 flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mt-4 gap-2">
          <Button variant="outline" size="sm" className="w-full flex-1" onClick={onPreview}>
            <FileText className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <div className="flex bg-muted rounded-md overflow-hidden">
             <Button variant="ghost" size="sm" className="px-2 h-9 rounded-none hover:bg-primary hover:text-primary-foreground text-xs" onClick={() => onExport?.('csv')}>CSV</Button>
             <Button variant="ghost" size="sm" className="px-2 h-9 rounded-none hover:bg-primary hover:text-primary-foreground text-xs border-l" onClick={() => onExport?.('xlsx')}>XLSX</Button>
             <Button variant="ghost" size="sm" className="px-2 h-9 rounded-none hover:bg-primary hover:text-primary-foreground text-xs border-l" onClick={() => onExport?.('pdf')}>PDF</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
