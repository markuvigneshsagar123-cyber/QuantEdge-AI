import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  key?: React.Key;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-white/5 rounded-md", className)} {...props} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-12" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-6 w-10" />)}
        </div>
      </div>
      <Skeleton className="flex-1 w-full" />
    </div>
  );
}
