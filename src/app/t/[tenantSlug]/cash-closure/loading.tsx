import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function CashClosureLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeaderSkeleton hasBreadcrumb />
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
