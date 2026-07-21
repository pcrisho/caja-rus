import { DsSkeleton } from "@/components/design-system/DsSkeleton";
import { DsCard } from "@/components/design-system/DsCard";

export default function SettingsLoading() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-1.5 py-2 mb-2">
          <DsSkeleton className="h-5 w-20" />
          <DsSkeleton className="h-8 w-48" />
          <DsSkeleton className="h-4 w-64" />
        </div>

        <DsCard variant="flat" padding="lg">
          <div className="flex flex-col gap-4">
            <DsSkeleton className="h-5 w-36" />
            <div className="flex flex-col gap-3">
              <DsSkeleton className="h-10 w-full" />
              <DsSkeleton className="h-10 w-full" />
            </div>
          </div>
        </DsCard>

        <DsCard variant="flat" padding="lg">
          <div className="flex flex-col gap-4">
            <DsSkeleton className="h-5 w-28" />
            <DsSkeleton className="h-14 w-full" />
          </div>
        </DsCard>

        <DsCard variant="flat" padding="lg">
          <div className="flex flex-col gap-4">
            <DsSkeleton className="h-5 w-20" />
            <DsSkeleton className="h-14 w-full" />
          </div>
        </DsCard>

        <DsCard variant="flat" padding="lg">
          <div className="flex flex-col gap-4">
            <DsSkeleton className="h-5 w-36" />
            <DsSkeleton className="h-14 w-full" />
            <DsSkeleton className="h-14 w-full" />
            <DsSkeleton className="h-14 w-full" />
          </div>
        </DsCard>
      </div>
    </main>
  );
}
