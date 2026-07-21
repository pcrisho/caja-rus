"use client";

import { useState, useTransition, useMemo } from "react";
import { Search } from "lucide-react";
import { ReturnReason } from "@/generated/prisma/enums";

type ReturnItemData = {
  saleItemId: string;
  quantity: number;
  totalAmount: number;
};

type Props = {
  tenantSlug: string;
};

// Import Actions
let searchSaleForReturnAction: (
  tenantSlug: string,
  query: string
) => Promise<{ success: boolean; data?: any; error?: string }>;
let createReturnAction: (
  tenantSlug: string,
  saleId: string,
  items: ReturnItemData[],
  reason: ReturnReason,
  notes?: string
) => Promise<{ success: boolean; data?: any; error?: string }>;

import("@/actions/returns").then((m) => {
  searchSaleForReturnAction = m.searchSaleForReturnAction;
  createReturnAction = m.createReturnAction;
});

export function ReturnForm({ tenantSlug }: Props) {
  const [query, setQuery] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ReturnReason>("DEFECTIVE");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, startSubmit] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setMsg(null);
    setSelectedSale(null);
    startSearch(async () => {
      const res = await searchSaleForReturnAction(tenantSlug, query.trim());
      if (res.success && res.data) {
        setSales(res.data);
        if (res.data.length === 0) {
          setMsg({ type: "err", text: "No se encontraron ventas completadas con ese ID." });
        }
      } else {
        setMsg({ type: "err", text: res.error || "Error al buscar venta." });
      }
    });
  };

  const handleSelectSale = (sale: any) => {
    setSelectedSale(sale);
    setReturnItems({});
    setReason("DEFECTIVE");
    setNotes("");
    setMsg(null);
  };

  const availableItems = useMemo(() => {
    if (!selectedSale) return [];
    return selectedSale.items.map((item: any) => {
      const alreadyReturned = selectedSale.returns.reduce((acc: number, r: any) => {
        const match = r.items.find((ri: any) => ri.saleItemId === item.id);
        return acc + (match ? Number(match.quantity) : 0);
      }, 0);
      const available = Number(item.quantity) - alreadyReturned;
      return { ...item, available, alreadyReturned };
    }).filter((i: any) => i.available > 0);
  }, [selectedSale]);

  const toggleItem = (itemId: string, maxQty: number) => {
    setReturnItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = maxQty; // Select max by default
      }
      return next;
    });
  };

  const updateItemQty = (itemId: string, qty: string, maxQty: number) => {
    const val = Number(qty);
    if (val < 0) return;
    setReturnItems((prev) => ({ ...prev, [itemId]: Math.min(val, maxQty) }));
  };

  const totalRefund = useMemo(() => {
    let t = 0;
    Object.entries(returnItems).forEach(([itemId, qty]) => {
      const item = availableItems.find((i: any) => i.id === itemId);
      if (item && qty > 0) {
        t += Number(item.unitPrice) * qty;
      }
    });
    return t;
  }, [returnItems, availableItems]);

  const handleSubmit = () => {
    if (totalRefund <= 0) {
      setMsg({ type: "err", text: "Selecciona al menos un ítem para devolver." });
      return;
    }
    
    const itemsData: ReturnItemData[] = Object.entries(returnItems)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        const item = availableItems.find((i: any) => i.id === itemId);
        return {
          saleItemId: itemId,
          quantity: qty,
          totalAmount: Number(item.unitPrice) * qty,
        };
      });

    startSubmit(async () => {
      const res = await createReturnAction(tenantSlug, selectedSale.id, itemsData, reason, notes);
      if (res.success) {
        setMsg({ type: "ok", text: "Devolución registrada correctamente." });
        setSelectedSale(null);
        setSales([]);
        setQuery("");
      } else {
        setMsg({ type: "err", text: res.error || "Error al procesar devolución." });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className={`p-4 rounded-xl border font-semibold ${msg.type === "ok" ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300"}`}>
          {msg.text}
        </div>
      )}

      {/* Buscar venta */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="ID de la venta (ej. abcd123)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-blue-900 text-white px-6 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
        >
          {isSearching ? "..." : "Buscar"}
        </button>
      </form>

      {/* Lista de ventas encontradas */}
      {!selectedSale && sales.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden">
          {sales.map((sale) => (
            <button
              key={sale.id}
              onClick={() => handleSelectSale(sale)}
              className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-zinc-50">Venta: ...{sale.id.slice(-6)}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{new Date(sale.saleDate).toLocaleString()}</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-zinc-50">S/ {Number(sale.totalAmount).toFixed(2)}</p>
            </button>
          ))}
        </div>
      )}

      {/* Formulario de devolución */}
      {selectedSale && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Detalle de Venta</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">ID: {selectedSale.id}</p>
            </div>
            <button onClick={() => setSelectedSale(null)} className="text-blue-900 dark:text-blue-400 text-sm font-semibold underline">
              Cambiar venta
            </button>
          </div>

          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
            {availableItems.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-zinc-400">Todos los ítems de esta venta ya han sido devueltos.</p>
            ) : (
              availableItems.map((item: any) => {
                const isSelected = returnItems[item.id] !== undefined;
                return (
                  <div key={item.id} className="p-4 flex flex-col gap-2 bg-gray-50 dark:bg-zinc-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id, item.available)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-zinc-700 text-blue-900 focus:ring-blue-900"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-zinc-50">{item.product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">S/ {Number(item.unitPrice).toFixed(2)} c/u</p>
                      </div>
                    </label>
                    {isSelected && (
                      <div className="ml-8 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Cant:</span>
                        <input
                          type="number"
                          min="0.001"
                          max={item.available}
                          step="any"
                          value={returnItems[item.id] || ""}
                          onChange={(e) => updateItemQty(item.id, e.target.value, item.available)}
                          className="w-24 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-2 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 focus:border-blue-900 focus-visible:outline-none"
                        />
                        <span className="text-sm text-gray-500 dark:text-zinc-400">/ {item.available} disp.</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {availableItems.length > 0 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-zinc-50">Motivo de devolución</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReturnReason)}
                  className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-3 focus-visible:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50"
                >
                  <option value="DEFECTIVE">Producto defectuoso</option>
                  <option value="WRONG_ITEM">Producto equivocado</option>
                  <option value="CUSTOMER_CHANGED_MIND">El cliente cambió de opinión</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-zinc-50">Observaciones (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-3 focus-visible:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 resize-none h-24"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-4 flex justify-between items-center mt-2">
                <span className="font-bold text-gray-700 dark:text-zinc-300">Total a reembolsar</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">S/ {totalRefund.toFixed(2)}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || totalRefund <= 0}
                className="w-full bg-red-600 text-white rounded-xl py-4 font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Procesando..." : "Confirmar Devolución"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
