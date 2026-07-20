import { requireTenantAuth } from '@/lib/auth-helpers';
import { getProductByIdAction } from '@/actions/products';
import { getCategoriesAction } from '@/actions/categories';
import { ProductForm } from '@/components/inventory/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <div className="flex flex-col min-h-dvh bg-white pb-[env(safe-area-inset-bottom)]">
      <header className="bg-blue-900 text-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Link href={`/t/${tenantSlug}/inventory`} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold truncate">Editar {product?.name}</h1>
      </header>

      <main className="flex-1 p-4 w-full">
        <ProductForm tenantSlug={tenantSlug} initialData={product} categories={categories} />
      </main>
    </div>
  );
}
