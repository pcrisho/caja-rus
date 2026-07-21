import { requireTenantAuth } from '@/lib/auth-helpers';
import { CsvImport } from '@/components/inventory/CsvImport';
import { PageHeader } from '@/components/ui/page-header';

export default async function ImportProductsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  await requireTenantAuth(tenantSlug);

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Inventario"
          title="Importar CSV"
          subtitle="Carga tus productos masivamente mediante un archivo CSV"
          backHref={`/t/${tenantSlug}/inventory`}
          breadcrumbs={[
            { label: "Inventario", href: `/t/${tenantSlug}/inventory` },
            { label: "Importar CSV" },
          ]}
        />
        <CsvImport tenantSlug={tenantSlug} />
      </div>
    </main>
  );
}
