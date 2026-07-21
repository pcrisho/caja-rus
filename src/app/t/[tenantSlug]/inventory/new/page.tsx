import { requireTenantAuth } from '@/lib/auth-helpers';
import { getCategoriesAction } from '@/actions/categories';
import { ProductForm } from '@/components/inventory/ProductForm';
import { PageHeader } from '@/components/ui/page-header';

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  await requireTenantAuth(tenantSlug);

  const categoriesRes = await getCategoriesAction(tenantSlug);
  const categories = categoriesRes.success ? (categoriesRes.data as any[]) : [];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Inventario"
          title="Nuevo Producto"
          subtitle="Registra un nuevo producto para tu catálogo"
          backHref={`/t/${tenantSlug}/inventory`}
          breadcrumbs={[
            { label: "Inventario", href: `/t/${tenantSlug}/inventory` },
            { label: "Nuevo Producto" },
          ]}
        />
        <ProductForm tenantSlug={tenantSlug} categories={categories} />
      </div>
    </main>
  );
}
