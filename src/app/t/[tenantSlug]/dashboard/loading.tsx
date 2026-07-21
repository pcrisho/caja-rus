import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeaderSkeleton />

        {/* NRUS Summary Card Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>

        {/* Expense List Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
