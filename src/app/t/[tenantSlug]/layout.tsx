import { auth } from "@/lib/auth";
import { getTenantContextBySlug } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tenantSlug } = await params;
  const tenant = await getTenantContextBySlug(session.user.id, tenantSlug);
  if (!tenant) redirect("/tenants?error=unauthorized");

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNav tenantSlug={tenantSlug} />
    </div>
  );
}
