import { requireTenantRole } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { LogoutButton } from "@/components/settings/LogoutButton";

export const metadata = {
  title: "Ajustes | CajaRUS",
};

export default async function SettingsPage({
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

  const tenant = await prisma.tenant.findUnique({
    where: { id: authResult.tenantId },
  });

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Ajustes"
          title="Configuración de la Bodega"
        />

        <section className="bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-4">Datos Generales</h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-semibold">Nombre Comercial</p>
              <p className="text-base text-gray-900 dark:text-zinc-50 font-medium">{tenant?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-semibold">Slug (URL)</p>
              <p className="text-base text-gray-900 dark:text-zinc-50 font-medium">@{tenant?.slug}</p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-2">Apariencia</h2>
          <ThemeToggle />
        </section>

        <section className="bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-2">Sesión</h2>
          <LogoutButton />
        </section>

        <section className="bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-2">Administración</h2>
          
          <Link
            href={`/t/${tenantSlug}/settings/users`}
            className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 font-semibold text-gray-900 dark:text-zinc-50 flex justify-between items-center transition-colors"
          >
            Gestión de Usuarios / Personal
            <span className="text-gray-400 dark:text-zinc-500">→</span>
          </Link>

          <Link
            href={`/t/${tenantSlug}/cash-closure`}
            className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 font-semibold text-gray-900 dark:text-zinc-50 flex justify-between items-center transition-colors"
          >
            Cierre de Caja
            <span className="text-gray-400 dark:text-zinc-500">→</span>
          </Link>

          <Link
            href={`/t/${tenantSlug}/returns`}
            className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 font-semibold text-gray-900 dark:text-zinc-50 flex justify-between items-center transition-colors"
          >
            Devoluciones
            <span className="text-gray-400 dark:text-zinc-500">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
