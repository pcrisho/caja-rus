import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeaderSkeleton />

        {/* Datos Generales Card Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Apariencia Card Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        {/* Sesión Card Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        {/* Administración Card Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
