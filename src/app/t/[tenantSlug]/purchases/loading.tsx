import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function PurchasesLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeaderSkeleton />

        {/* Register purchase button skeleton */}
        <Skeleton className="h-14 w-full rounded-xl" />

        {/* Purchase history items */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
