import { requireTenantAuth } from "@/lib/auth-helpers";
import { getProductsAction } from "@/actions/products";
import { PosClient } from "@/components/pos/PosClient";
import { CartProduct } from "@/store/usePosStore";
import { UnitType } from "@/generated/prisma/enums";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Punto de Venta | CajaRUS",
};

export default async function TenantPosPage(props: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await props.params;
  let authResult;
  try {
    authResult = await requireTenantAuth(tenantSlug);
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  // Cargar productos activos iniciales
  const response = await getProductsAction(tenantSlug);
  
  let mappedProducts: CartProduct[] = [];
  if (response.success && response.data?.products) {
    mappedProducts = response.data.products.map((p) => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode ?? null,
      sellingPrice: Number(p.sellingPrice),
      stock: Number(p.stock),
      unitType: p.unitType as UnitType,
    }));
  }

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <header className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Punto de venta
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {authResult.tenantName}
          </h1>
          <p className="mt-3 text-base text-gray-700">
            Bodega activa: @{authResult.tenantSlug}
          </p>
        </header>

        <PosClient tenantSlug={tenantSlug} initialProducts={mappedProducts} />
      </div>
    </main>
  );
}
