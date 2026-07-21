import { requireTenantAuth } from '@/lib/auth-helpers';
import { getProductsAction } from '@/actions/products';
import { getCategoriesAction } from '@/actions/categories';
import { getPastSuppliersAction } from '@/actions/purchases';
import { OcrUploader } from '@/components/purchases/OcrUploader';
import { PageHeader } from '@/components/ui/page-header';

export default async function NewPurchasePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  await requireTenantAuth(tenantSlug);

  const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
    getProductsAction(tenantSlug, { limit: 500 }),
    getCategoriesAction(tenantSlug),
    getPastSuppliersAction(tenantSlug),
  ]);

  const catalogProducts = productsRes.success && productsRes.data?.products ? productsRes.data.products : [];
  const categories = categoriesRes.success && categoriesRes.data ? (categoriesRes.data as any[]) : [];
  const suppliers = suppliersRes.success && suppliersRes.data ? suppliersRes.data : [];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Compras"
          title="Registrar Compra"
          subtitle="Escanea tu boleta/factura con IA o ingresa los ítems manualmente"
          backHref={`/t/${tenantSlug}/purchases`}
          breadcrumbs={[
            { label: "Compras", href: `/t/${tenantSlug}/purchases` },
            { label: "Registrar Compra" },
          ]}
        />
        <OcrUploader
          tenantSlug={tenantSlug}
          catalogProducts={catalogProducts}
          categories={categories}
          suppliers={suppliers}
        />
      </div>
    </main>
  );
}
