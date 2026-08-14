import { jsx, jsxs } from "react/jsx-runtime";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }) {
  return (
    <div className={cn("rounded-3xl border border-border/60 bg-card overflow-hidden", className)}>
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8, className }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6", className)}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-10 w-64 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="bg-muted/50 border-b border-border/60 px-4 py-3 flex gap-4">
          {Array.from({ length: cols }, (_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="px-4 py-3 border-b border-border/40 last:border-b-0 flex gap-4">
            {Array.from({ length: cols }, (_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton({ className }) {
  return (
    <div className={cn("space-y-6", className)}>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="aspect-[16/9] w-full max-w-2xl rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 w-40 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </div>
  );
}
