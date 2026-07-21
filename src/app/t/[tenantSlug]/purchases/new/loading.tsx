import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function NewPurchaseLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeaderSkeleton hasBreadcrumb />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </main>
  );
}
