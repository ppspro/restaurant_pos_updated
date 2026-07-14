import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export type StatusType = 'success' | 'warning' | 'error' | 'neutral';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

export function StatusBadge({ status, type = 'neutral', className }: StatusBadgeProps) {
  const variants: Record<StatusType, string> = {
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/20',
    error: 'bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 border-red-500/20',
    neutral: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 hover:bg-slate-500/25 border-slate-500/20',
  };

  // Auto-detect type if not provided
  let activeType = type;
  if (type === 'neutral') {
    const s = status.toLowerCase();
    if (s === 'online' || s === 'open' || s === 'active' || s === 'completed') activeType = 'success';
    else if (s === 'warning' || s === 'pending') activeType = 'warning';
    else if (s === 'offline' || s === 'closed' || s === 'error' || s === 'failed') activeType = 'error';
  }

  return (
    <Badge variant="outline" className={cn('font-medium capitalize', variants[activeType], className)}>
      {status.toLowerCase()}
    </Badge>
  );
}
