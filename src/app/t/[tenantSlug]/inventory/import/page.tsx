import { requireTenantAuth } from '@/lib/auth-helpers';
import { CsvImport } from '@/components/inventory/CsvImport';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ImportProductsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  await requireTenantAuth(tenantSlug);

  return (
    <div className="flex flex-col min-h-dvh bg-white pb-[env(safe-area-inset-bottom)]">
      <header className="bg-blue-900 text-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Link href={`/t/${tenantSlug}/inventory`} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Importar Productos</h1>
      </header>

      <main className="flex-1 p-4 w-full">
        <CsvImport tenantSlug={tenantSlug} />
      </main>
    </div>
  );
}
