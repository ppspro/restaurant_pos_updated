import React from 'react';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = "No reports found", 
  description = "Adjust your filters or generate a new report." 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed text-muted-foreground bg-muted/10 h-64">
      <FileSearch className="w-12 h-12 mb-4 text-muted" />
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1">{description}</p>
    </div>
  );
}
