import { requireTenantAuth } from '@/lib/auth-helpers';
import { getProductsAction } from '@/actions/products';
import { getCategoriesAction } from '@/actions/categories';
import { ProductCard } from '@/components/inventory/ProductCard';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { Plus, UploadCloud, Search, AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ q?: string; category?: string; alert?: string }>;
}) {
  const { tenantSlug } = await params;
  const { q, category, alert } = await searchParams;
  await requireTenantAuth(tenantSlug);

  const [productsRes, categoriesRes] = await Promise.all([
    getProductsAction(tenantSlug, { 
      search: q, 
      categoryId: category, 
      lowStock: alert === 'true' 
    }),
    getCategoriesAction(tenantSlug)
  ]);

  if (!productsRes.success) {
    throw new Error(productsRes.error || 'Error al cargar productos');
  }

  const { products, total } = productsRes.data as any;
  const categories = categoriesRes.success ? (categoriesRes.data as any[]) : [];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Inventario"
          title="Inventario"
          subtitle={`${total} productos registrados`}
        />

        <div className="flex gap-3">
          <Link
            href={`/t/${tenantSlug}/inventory/new`}
            className="flex-1 bg-emerald-600 text-white py-4 flex flex-col items-center justify-center gap-1 hover:bg-emerald-700 active:scale-95 transition-transform font-bold font-sans"
          >
            <Plus size={24} />
            <span>NUEVO</span>
          </Link>
          <Link
            href={`/t/${tenantSlug}/inventory/import`}
            className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 py-4 flex flex-col items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-transform font-bold font-sans"
          >
            <UploadCloud size={24} />
            <span>CSV</span>
          </Link>
        </div>

        <form className="flex flex-col gap-3 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-zinc-700 focus-within:border-blue-900 transition-colors">
            <Search size={20} className="text-gray-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o código..."
              className="flex-1 bg-transparent py-3 text-base text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none min-w-0"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Link
              href={`/t/${tenantSlug}/inventory`}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${
                !category && !alert
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              Todos
            </Link>
            <Link
              href={`/t/${tenantSlug}/inventory?alert=true`}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                alert === 'true'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              <AlertTriangle size={14} /> Stock bajo
            </Link>
            {categories.map(c => (
              <Link
                key={c.id}
                href={`/t/${tenantSlug}/inventory?category=${c.id}`}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${
                  category === c.id
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </form>

        <div className="flex flex-col gap-4">
          {products.length === 0 ? (
            <p className="text-center py-10 text-gray-500 dark:text-zinc-400 text-lg">
              No se encontraron productos.
            </p>
          ) : (
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} tenantSlug={tenantSlug} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
