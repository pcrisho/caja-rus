"use client";

import { useState } from "react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsButton } from "@/components/design-system/DsButton";
import { DsInput } from "@/components/design-system/DsInput";
import { DsChip } from "@/components/design-system/DsChip";
import { DsEmptyState } from "@/components/design-system/DsEmptyState";
import { Search, Plus, UploadCloud, Pencil, AlertTriangle, XCircle } from "lucide-react";

export default function InventoryPreview() {
  const [activeCategory, setActiveCategory] = useState("all");

  const products = [
    { name: "Aceite vegetal 1L", barcode: "7891234567890", price: 8.50, stock: 45, unit: "UN", minStock: 10 },
    { name: "Arroz premium 5kg", barcode: "7891234567891", price: 25.00, stock: 3, unit: "KG", minStock: 5 },
    { name: "Azúcar rubia 1kg", barcode: null, price: 5.80, stock: 0, unit: "UN", minStock: 15 },
    { name: "Leche evaporada 400ml", barcode: "7891234567893", price: 4.20, stock: 32, unit: "UN", minStock: 10 },
  ];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Inventario
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Inventario
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {products.length} productos registrados
          </p>
        </header>

        {/* Actions */}
        <div className="flex gap-3">
          <DsButton icon={<Plus size={20} />}>
            NUEVO
          </DsButton>
          <DsButton variant="secondary" icon={<UploadCloud size={20} />}>
            CSV
          </DsButton>
        </div>

        {/* Search & filters */}
        <DsCard variant="default">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-950"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["Todos", "Stock bajo", "Aceites", "Granos", "Lácteos"].map((cat, i) => (
                <DsChip
                  key={cat}
                  variant={
                    cat === "Stock bajo"
                      ? activeCategory === "low" ? "warning" : "default"
                      : i === 0 ? "active" : "default"
                  }
                  onClick={() => setActiveCategory(i === 0 ? "all" : cat === "Stock bajo" ? "low" : cat)}
                  className="cursor-pointer"
                >
                  {cat}
                </DsChip>
              ))}
            </div>
          </div>
        </DsCard>

        {/* Product list */}
        <div className="flex flex-col gap-4">
          {products.map((product, i) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = !isOutOfStock && product.stock <= product.minStock;

            return (
              <DsCard key={i}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg leading-tight">
                        {product.name}
                      </h3>
                      {product.barcode && (
                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">
                          CÓDIGO: {product.barcode}
                        </p>
                      )}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xl">
                        S/ {product.price.toFixed(2)}
                      </p>
                      <p className="text-gray-500 dark:text-zinc-400 text-xs">
                        por {product.unit === "UNIT" ? "UNIDAD" : "KG"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold">
                        Stock Actual
                      </span>
                      <span className="text-gray-900 dark:text-zinc-50 font-bold text-lg">
                        {product.stock} {product.unit === "UNIT" ? "UN" : "KG"}
                      </span>
                    </div>

                    {isOutOfStock && (
                      <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-none text-sm font-medium">
                        <XCircle size={16} />
                        Agotado
                      </div>
                    )}

                    {isLowStock && (
                      <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-none text-sm font-medium">
                        <AlertTriangle size={16} />
                        Stock bajo
                      </div>
                    )}
                  </div>

                  <button className="mt-2 w-full bg-white dark:bg-zinc-900">
                    <Pencil size={20} />
                    EDITAR
                  </button>
                </div>
              </DsCard>
            );
          })}
        </div>
      </div>
    </main>
  );
}
