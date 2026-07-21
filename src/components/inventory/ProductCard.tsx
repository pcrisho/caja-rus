import Link from 'next/link';
import { Pencil, AlertTriangle, XCircle } from 'lucide-react';
import { Prisma } from '@/generated/prisma/client';
import { DsBadge } from '@/components/design-system/DsBadge';

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
    <div className="bg-gray-100 dark:bg-zinc-800 p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg leading-tight">{product.name}</h3>
          {product.barcode && (
            <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">CÓDIGO: {product.barcode}</p>
          )}
        </div>
        <div className="text-right whitespace-nowrap">
          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xl tabular-nums">S/ {price}</p>
          <p className="text-gray-500 dark:text-zinc-400 text-xs">por {product.unitType === 'UNIT' ? 'UNIDAD' : 'KG'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold">Stock Actual</span>
          <span className="text-gray-900 dark:text-zinc-50 font-bold text-lg tabular-nums">{stock} {product.unitType === 'UNIT' ? 'UN' : 'KG'}</span>
        </div>
        
        {isOutOfStock && (
          <DsBadge variant="destructive">
            <XCircle size={14} />
            Agotado
          </DsBadge>
        )}
        
        {isLowStock && (
          <DsBadge variant="outline">
            <AlertTriangle size={14} />
            Stock bajo
          </DsBadge>
        )}
      </div>

      <Link
        href={`/t/${tenantSlug}/inventory/${product.id}`}
        className="w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 py-3 px-4 flex items-center justify-center gap-2 font-semibold font-mono hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-95 transition-transform"
      >
        <Pencil size={20} />
        EDITAR
      </Link>
    </div>
  );
}
