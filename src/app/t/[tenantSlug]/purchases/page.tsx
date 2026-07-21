import { requireTenantAuth } from '@/lib/auth-helpers';
import { getPurchasesAction } from '@/actions/purchases';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';

export default async function PurchasesPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  await requireTenantAuth(tenantSlug);

  const purchasesRes = await getPurchasesAction(tenantSlug);
  if (!purchasesRes.success) {
    throw new Error(purchasesRes.error || 'Error al cargar compras');
  }

  const purchases = purchasesRes.data as any[];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Compras"
          title="Compras"
          subtitle="Historial de reabastecimiento"
        />

        <Link
          href={`/t/${tenantSlug}/purchases/new`}
          className="w-full bg-emerald-600 text-white py-4 flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-transform font-bold font-mono text-lg"
        >
          <Plus size={24} />
          REGISTRAR COMPRA
        </Link>

        <div className="flex flex-col gap-4">
          <h2 className="text-gray-900 dark:text-zinc-50 font-bold text-lg">Últimas Compras</h2>
          
          {purchases.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 dark:bg-zinc-800">
              <Receipt size={48} className="text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-zinc-400 text-sm">No has registrado compras aún.</p>
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-base leading-tight">
                      {purchase.supplierName || 'Proveedor sin nombre'}
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">
                      {new Date(purchase.purchaseDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {purchase.invoiceNumber ? ` • ${purchase.invoiceNumber}` : ''}
                    </p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-gray-900 dark:text-zinc-50 font-bold text-lg tabular-nums">S/ {Number(purchase.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  {purchase.items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-zinc-300">
                      <span className="truncate pr-2">{item.quantity}x {item.product?.name || 'Producto eliminado'}</span>
                      <span className="font-medium whitespace-nowrap tabular-nums">S/ {Number(item.totalCost).toFixed(2)}</span>
                    </div>
                  ))}
                  {purchase.items?.length > 3 && (
                    <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">+ {purchase.items.length - 3} ítems más</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
