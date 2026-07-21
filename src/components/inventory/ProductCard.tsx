import Link from 'next/link';
import { Pencil, AlertTriangle, XCircle, Package } from 'lucide-react';
import { Prisma } from '@/generated/prisma/client';
import { DsBadge } from '@/components/design-system/DsBadge';
import { DsCard } from '@/components/design-system/DsCard';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    barcode: string | null;
    sellingPrice: Prisma.Decimal;
    stock: Prisma.Decimal;
    minStock: Prisma.Decimal;
    unitType: string;
  };
  tenantSlug: string;
};

export function ProductCard({ product, tenantSlug }: ProductCardProps) {
  const stock = Number(product.stock);
  const minStock = Number(product.minStock);
  const price = Number(product.sellingPrice).toFixed(2);
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  return (
    <DsCard variant="flat" padding="md">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg leading-tight truncate">
              {product.name}
            </h3>
            {product.barcode && (
              <p className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5 font-mono">
                {product.barcode}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xl tabular-nums leading-tight">
              S/ {price}
            </p>
            <p className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5">
              {product.unitType === 'UNIT' ? 'UNIDAD' : 'KG'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-400 dark:text-zinc-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-bold leading-none">
                Stock
              </p>
              <p className="text-gray-900 dark:text-zinc-50 font-bold tabular-nums leading-tight mt-0.5">
                {stock} {product.unitType === 'UNIT' ? 'un' : 'kg'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOutOfStock && (
              <DsBadge variant="destructive">
                <XCircle size={12} />
                Agotado
              </DsBadge>
            )}
            {isLowStock && (
              <DsBadge variant="outline">
                <AlertTriangle size={12} />
                Stock bajo
              </DsBadge>
            )}
          </div>
        </div>

        <Link
          href={`/t/${tenantSlug}/inventory/${product.id}`}
          className="w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 py-3 px-4 flex items-center justify-center gap-2 font-semibold font-mono text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-95 transition-transform"
        >
          <Pencil size={16} />
          EDITAR
        </Link>
      </div>
    </DsCard>
  );
}
