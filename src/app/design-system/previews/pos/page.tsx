"use client";

import { useState } from "react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsButton } from "@/components/design-system/DsButton";
import { DsChip } from "@/components/design-system/DsChip";
import { DsModal } from "@/components/design-system/DsModal";
import { Search, ScanLine, ShoppingCart, Plus, Minus } from "lucide-react";

export default function PosPreview() {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const cartItems = [
    { name: "Aceite vegetal 1L", price: 8.50, qty: 2, unit: "UN" },
    { name: "Arroz premium 5kg", price: 25.00, qty: 1, unit: "KG" },
    { name: "Azúcar rubia 1kg", price: 5.80, qty: 3, unit: "UN" },
  ];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Punto de venta
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Mi Bodega
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            @mi-bodega
          </p>
        </header>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-12 py-3 bg-white dark:bg-zinc-900 rounded-none text-base text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400">
            <ScanLine size={20} />
          </button>
        </div>

        {/* Quick add chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["Todos", "Aceites", "Granos", "Lácteos", "Bebidas"].map((cat, i) => (
            <DsChip key={cat} variant={i === 0 ? "active" : "default"}>
              {cat}
            </DsChip>
          ))}
        </div>

        {/* Cart */}
        <DsCard>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-gray-500 dark:text-zinc-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Carrito
              </p>
            </div>
            <DsChip variant="danger" className="text-xs">
              {cartItems.length} items
            </DsChip>
          </div>

          <div className="flex flex-col">
            {cartItems.map((item, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-3 ${
                  i < arr.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    S/ {item.price.toFixed(2)} / {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-zinc-50">
                    {item.qty}
                  </span>
                  <button className="w-8 h-8 rounded-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400">
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-50 w-20 text-right">
                  S/ {(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-gray-900 tabular-nums dark:text-zinc-50">TOTAL</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums dark:text-zinc-50">
                S/ {total.toFixed(2)}
              </p>
            </div>
          </div>
        </DsCard>

        {/* Payment method */}
        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-3">
            Método de pago
          </p>
          <div className="flex flex-wrap gap-2">
            {["Efectivo", "Yape", "Plin", "Tarjeta"].map((method) => (
              <DsChip
                key={method}
                variant={paymentMethod === method.toLowerCase() ? "active" : "default"}
                onClick={() => setPaymentMethod(method.toLowerCase())}
                className="cursor-pointer"
              >
                {method}
              </DsChip>
            ))}
          </div>
        </DsCard>

        {/* CTA */}
        <DsButton onClick={() => setShowPayment(true)}>
          COBRAR S/ {total.toFixed(2)}
        </DsButton>

        {/* Payment modal */}
        <DsModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          title="Confirmar cobro"
          subtitle="Verifica los datos antes de confirmar"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-none p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
                Total a cobrar
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-zinc-50">
                S/ {total.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">Método</span>
                <span className="font-bold text-gray-900 dark:text-zinc-50 capitalize">{paymentMethod}</span>
              </div>
              <div className="border-t" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">Items</span>
                <span className="font-bold text-gray-900 dark:text-zinc-50">{cartItems.length} productos</span>
              </div>
            </div>

            <DsButton onClick={() => setShowPayment(false)}>
              CONFIRMAR COBRO
            </DsButton>
          </div>
        </DsModal>
      </div>
    </main>
  );
}
