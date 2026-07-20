import { requireTenantRole } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <main className="min-h-dvh bg-gray-50 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Ajustes
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Configuración de la Bodega
          </h1>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Datos Generales</h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Nombre Comercial</p>
              <p className="text-base text-gray-900 font-medium">{tenant?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Slug (URL)</p>
              <p className="text-base text-gray-900 font-medium">@{tenant?.slug}</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Administración</h2>
          
          <Link href={`/t/${tenantSlug}/settings/users`} className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-xl font-semibold text-gray-900 border border-gray-200 flex justify-between items-center transition-colors">
            Gestión de Usuarios / Personal
            <span className="text-gray-400">→</span>
          </Link>

          <Link href={`/t/${tenantSlug}/cash-closure`} className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-xl font-semibold text-gray-900 border border-gray-200 flex justify-between items-center transition-colors">
            Cierre de Caja
            <span className="text-gray-400">→</span>
          </Link>

          <Link href={`/t/${tenantSlug}/returns`} className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-xl font-semibold text-gray-900 border border-gray-200 flex justify-between items-center transition-colors">
            Devoluciones
            <span className="text-gray-400">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
