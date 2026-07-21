"use client";
import { usePosStore, CartItem as CartItemType } from "@/store/usePosStore";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = usePosStore();
  const { product, quantity } = item;
  const isKg = product.unitType === "KILOGRAM";
  const lineTotal = (product.sellingPrice * quantity).toFixed(2);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-xl p-3 border border-gray-200 dark:border-zinc-800">
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-gray-900 dark:text-zinc-50 truncate">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          S/ {product.sellingPrice.toFixed(2)}{isKg ? " / kg" : " c/u"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isKg ? (
          <span className="text-base font-semibold text-gray-700 dark:text-zinc-300">
            {quantity.toFixed(3)} kg
          </span>
        ) : (
          <>
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform"
              aria-label={`Quitar un ${product.name}`}
            >
              <Minus size={16} className="text-gray-700 dark:text-zinc-300" />
            </button>
            <span className="w-8 text-center text-base font-bold text-gray-900 dark:text-zinc-50">
              {quantity}
            </span>
            <button
              onClick={() => {
                if (quantity < product.stock) {
                  updateQuantity(product.id, quantity + 1);
                }
              }}
              disabled={quantity >= product.stock}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              aria-label={`Agregar un ${product.name}`}
            >
              <Plus size={16} className="text-gray-700 dark:text-zinc-300" />
            </button>
          </>
        )}
      </div>

      <div className="text-right">
        <p className="text-base font-bold text-gray-900 dark:text-zinc-50">S/ {lineTotal}</p>
        <button
          onClick={() => removeItem(product.id)}
          className="text-red-600 dark:text-red-400 mt-1 active:scale-95 transition-transform"
          aria-label={`Eliminar ${product.name} del carrito`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
