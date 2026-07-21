type DsSkeletonProps = {
  className?: string;
};

export function DsSkeleton({ className = "" }: DsSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-zinc-700 ${className}`}
    />
  );
}
