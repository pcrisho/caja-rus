import { BottomNav } from "@/components/layout/BottomNav";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950 flex flex-col">
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNav tenantSlug={tenantSlug} />
    </div>
  );
}
