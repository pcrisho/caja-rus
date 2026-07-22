import { requireTenantAuth } from "@/lib/auth-helpers";
import { getProductsAction } from "@/actions/products";
import { PosClient } from "@/components/pos/PosClient";
import { PageHeader } from "@/components/ui/page-header";
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
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <PageHeader
          categoryTag="Punto de venta"
          title="Cobrar"
        />

        <PosClient tenantSlug={tenantSlug} initialProducts={mappedProducts} />
      </div>
    </main>
  );
}
