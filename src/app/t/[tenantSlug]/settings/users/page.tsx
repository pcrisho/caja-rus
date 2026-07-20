import { requireTenantRole } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { getTenantMembersAction } from "@/actions/settings";
import { UsersClient } from "@/components/settings/UsersClient";

export const metadata = {
  title: "Gestión de Usuarios | CajaRUS",
};

export default async function UsersPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  let authResult;
  try {
    authResult = await requireTenantRole(tenantSlug, "ADMIN");
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  const res = await getTenantMembersAction(tenantSlug);
  const members = res.success && res.data ? res.data : [];

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Ajustes
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Gestión de Personal
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra los accesos y roles de tu equipo.
          </p>
        </header>

        <UsersClient tenantSlug={tenantSlug} initialMembers={members} />
      </div>
    </main>
  );
}
