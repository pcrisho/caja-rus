import { requireTenantAuth } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { ReturnForm } from "@/components/returns/ReturnForm";

export const metadata = {
  title: "Devoluciones | CajaRUS",
};

export default async function ReturnsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  
  try {
    // Both Admin and Cashier can process returns.
    await requireTenantAuth(tenantSlug);
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Devoluciones
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Registrar Devolución
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Busca la venta por ID y selecciona los productos a devolver. El monto se descontará de las ventas del mes para el cálculo del NRUS.
          </p>
        </header>

        <ReturnForm tenantSlug={tenantSlug} />
      </div>
    </main>
  );
}
