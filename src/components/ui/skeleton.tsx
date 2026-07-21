import * as React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 dark:bg-zinc-800 ${className}`}
      {...props}
    />
  );
}

export function PageHeaderSkeleton({ hasBreadcrumb = false }: { hasBreadcrumb?: boolean }) {
  return (
    <div className="flex flex-col gap-3 py-2 mb-2">
      {hasBreadcrumb && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
