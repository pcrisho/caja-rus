import { requireTenantRole } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { getTenantMembersAction } from "@/actions/settings";
import { UsersClient } from "@/components/settings/UsersClient";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Gestión de Usuarios | CajaRUS",
};

export default async function UsersPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  try {
    await requireTenantRole(tenantSlug, "ADMIN");
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  const res = await getTenantMembersAction(tenantSlug);
  const members = res.success && res.data ? res.data : [];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Ajustes"
          title="Gestión de Personal"
          subtitle="Administra los accesos y roles de tu equipo"
          backHref={`/t/${tenantSlug}/settings`}
          breadcrumbs={[
            { label: "Ajustes", href: `/t/${tenantSlug}/settings` },
            { label: "Usuarios" },
          ]}
        />

        <UsersClient tenantSlug={tenantSlug} initialMembers={members} />
      </div>
    </main>
  );
}
