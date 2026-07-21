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

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/t/${tenantSlug}/inventory/new`}
            className="flex-1 bg-emerald-600 text-white rounded-xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-emerald-700 active:scale-95 transition-transform font-bold"
          >
            <Plus size={24} />
            <span>NUEVO</span>
          </Link>
          <Link
            href={`/t/${tenantSlug}/inventory/import`}
            className="flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-50 rounded-xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-transform font-bold"
          >
            <UploadCloud size={24} />
            <span>CSV</span>
          </Link>
        </div>

        {/* Filters Form */}
        <form className="flex flex-col gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20} />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-950 border-2 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Link
              href={`/t/${tenantSlug}/inventory`}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border ${!category && !alert ? 'bg-blue-900 text-white border-blue-900' : 'bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'}`}
            >
              Todos
            </Link>
            <Link
              href={`/t/${tenantSlug}/inventory?alert=true`}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-1 ${alert === 'true' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-zinc-950 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400'}`}
            >
              <AlertTriangle size={14} /> Stock bajo
            </Link>
            {categories.map(c => (
              <Link
                key={c.id}
                href={`/t/${tenantSlug}/inventory?category=${c.id}`}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border ${category === c.id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </form>

        {/* Product List */}
        <div className="flex flex-col gap-4">
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-zinc-400 text-lg">No se encontraron productos.</p>
            </div>
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

