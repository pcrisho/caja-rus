import { requireTenantAuth } from '@/lib/auth-helpers';
import { getPurchasesAction } from '@/actions/purchases';
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
    <div className="flex flex-col min-h-dvh bg-white pb-[env(safe-area-inset-bottom)]">
      <header className="bg-blue-900 text-white p-6 pb-8 sticky top-0 z-10 shadow-sm flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-blue-200 mt-1">Historial de reabastecimiento</p>
        </div>
      </header>

      <main className="flex-1 p-4 -mt-4 flex flex-col gap-6 max-w-sm mx-auto w-full">
        <Link
          href={`/t/${tenantSlug}/purchases/new`}
          className="w-full bg-emerald-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-transform font-bold text-lg shadow-sm"
        >
          <Plus size={24} />
          REGISTRAR COMPRA
        </Link>

        <div className="flex flex-col gap-4 pb-20">
          <h2 className="text-gray-900 font-bold text-lg mt-2">Últimas Compras</h2>
          
          {purchases.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
              <Receipt size={48} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No has registrado compras aún.</p>
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase.id} className="bg-gray-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="text-gray-900 font-bold text-base leading-tight">
                      {purchase.supplierName || 'Proveedor sin nombre'}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(purchase.purchaseDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {purchase.invoiceNumber ? ` • ${purchase.invoiceNumber}` : ''}
                    </p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-gray-900 font-bold text-lg">S/ {Number(purchase.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  {purchase.items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700">
                      <span className="truncate pr-2">{item.quantity}x {item.product?.name || 'Producto eliminado'}</span>
                      <span className="font-medium whitespace-nowrap">S/ {Number(item.totalCost).toFixed(2)}</span>
                    </div>
                  ))}
                  {purchase.items?.length > 3 && (
                    <p className="text-gray-500 text-xs mt-1">+ {purchase.items.length - 3} ítems más</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
