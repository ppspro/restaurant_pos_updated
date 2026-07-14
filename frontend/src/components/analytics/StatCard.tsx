import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn('group overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/5', className)}>
      <CardContent className="p-5 relative">
        {/* Subtle background glow effect on hover */}
        <div className="absolute -inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:to-primary/10"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {title}
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            {icon}
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground/90">{value}</h2>
          {trend && (
            <span
              className={cn(
                'flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                trend.isPositive 
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-red-500/15 text-red-700 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
        
        {description && (
          <p className="mt-2 text-xs text-muted-foreground relative z-10">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
