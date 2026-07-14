import { Skeleton } from '../ui/skeleton';
import { DashboardGrid } from './DashboardGrid';

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardGrid columns={4}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </DashboardGrid>
      
      <DashboardGrid columns={3}>
        <Skeleton className="col-span-1 h-[350px] w-full rounded-xl lg:col-span-2" />
        <Skeleton className="col-span-1 h-[350px] w-full rounded-xl" />
      </DashboardGrid>
      
      <DashboardGrid columns={3}>
        <Skeleton className="col-span-1 h-[350px] w-full rounded-xl lg:col-span-2" />
        <Skeleton className="col-span-1 h-[350px] w-full rounded-xl" />
      </DashboardGrid>
    </div>
  );
}
