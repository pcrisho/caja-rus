import { requireTenantAuth } from '@/lib/auth-helpers';
import { getProductByIdAction } from '@/actions/products';
import { getCategoriesAction } from '@/actions/categories';
import { ProductForm } from '@/components/inventory/ProductForm';
import { PageHeader } from '@/components/ui/page-header';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; productId: string }>;
}) {
  const { tenantSlug, productId } = await params;
  await requireTenantAuth(tenantSlug);

  const [productRes, categoriesRes] = await Promise.all([
    getProductByIdAction(tenantSlug, productId),
    getCategoriesAction(tenantSlug)
  ]);

  if (!productRes.success) {
    throw new Error(productRes.error || 'Producto no encontrado');
  }

  const product = productRes.data;
  const categories = categoriesRes.success ? (categoriesRes.data as any[]) : [];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Inventario"
          title={`Editar ${product?.name}`}
          subtitle="Modifica precios, stock y detalles del producto"
          backHref={`/t/${tenantSlug}/inventory`}
          breadcrumbs={[
            { label: "Inventario", href: `/t/${tenantSlug}/inventory` },
            { label: product?.name || "Editar" },
          ]}
        />
        <ProductForm tenantSlug={tenantSlug} initialData={product} categories={categories} />
      </div>
    </main>
  );
}
