import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function PosLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <PageHeaderSkeleton />

        {/* Search input skeleton */}
        <Skeleton className="h-14 w-full rounded-xl" />

        {/* Cart / Products list skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </main>
  );
}
