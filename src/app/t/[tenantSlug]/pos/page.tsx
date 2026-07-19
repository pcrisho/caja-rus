import { auth } from "@/lib/auth";
import {
  getTenantContextBySlug,
  getTenantHubPath,
} from "@/lib/tenancy";
import { redirect } from "next/navigation";

export default async function TenantPosPage(props: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { tenantSlug } = await props.params;
  const tenant = await getTenantContextBySlug(session.user.id, tenantSlug);

  if (!tenant) {
    redirect(getTenantHubPath("unauthorized"));
  }

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <header className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Punto de venta
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {tenant.tenantName}
          </h1>
          <p className="mt-3 text-base text-gray-700">
            Bodega activa: @{tenant.tenantSlug}
          </p>
        </header>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-bold text-emerald-900">
            Base multitenant lista
          </h2>
          <p className="mt-2 text-base text-emerald-800">
            La sesión ya resuelve la bodega activa. Falta conectar aquí el POS,
            inventario y ventas sobre este tenant.
          </p>
        </section>

        <a
          href="/tenants"
          className="rounded-xl border border-gray-300 bg-white px-6 py-4 text-center text-lg font-semibold text-gray-900 active:scale-95 transition-transform"
        >
          Cambiar bodega
        </a>
      </div>
    </main>
  );
}
