"use client";

import { useState, useTransition, useMemo } from "react";
import { Search } from "lucide-react";
import { ReturnReason } from "@/generated/prisma/enums";
import { DsInput } from "@/components/design-system/DsInput";
import { DsButton } from "@/components/design-system/DsButton";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsCheckbox } from "@/components/design-system/DsCheckbox";
import { DsTextarea } from "@/components/design-system/DsTextarea";
import { DsCard } from "@/components/design-system/DsCard";

type ReturnItemData = {
  saleItemId: string;
  quantity: number;
  totalAmount: number;
};

type Props = {
  tenantSlug: string;
};

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
        next[itemId] = maxQty;
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
        <DsAlert variant={msg.type === "ok" ? "success" : "error"} message={msg.text} />
      )}

      <form onSubmit={handleSearch} className="flex items-end gap-2">
        <div className="flex-1">
          <DsInput
            label="ID de la venta"
            placeholder="ej. abcd123"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search size={20} />}
          />
        </div>
        <DsButton type="submit" disabled={isSearching} size="md" className="mb-0">
          {isSearching ? "..." : "Buscar"}
        </DsButton>
      </form>

      {!selectedSale && sales.length > 0 && (
        <DsCard variant="flat" padding="sm">
          {sales.map((sale) => (
            <button
              key={sale.id}
              onClick={() => handleSelectSale(sale)}
              className="w-full text-left p-4 hover:bg-white dark:hover:bg-zinc-700 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 last:border-0"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-zinc-50">Venta: ...{sale.id.slice(-6)}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{new Date(sale.saleDate).toLocaleString()}</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-zinc-50 tabular-nums">S/ {Number(sale.totalAmount).toFixed(2)}</p>
            </button>
          ))}
        </DsCard>
      )}

      {selectedSale && (
        <DsCard>
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Detalle de Venta</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400">ID: {selectedSale.id}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-blue-900 dark:text-blue-400 text-sm font-semibold hover:underline">
                Cambiar venta
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800">
              {availableItems.length === 0 ? (
                <p className="p-4 text-center text-gray-500 dark:text-zinc-400">Todos los ítems de esta venta ya han sido devueltos.</p>
              ) : (
                availableItems.map((item: any) => {
                  const isSelected = returnItems[item.id] !== undefined;
                  return (
                    <div key={item.id} className="p-4 flex flex-col gap-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                      <DsCheckbox
                        label={item.product.name}
                        description={`S/ ${Number(item.unitPrice).toFixed(2)} c/u`}
                        checked={isSelected}
                        onChange={() => toggleItem(item.id, item.available)}
                      />
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
                            className="w-24 bg-transparent border-b border-gray-200 dark:border-zinc-700 py-2 text-sm text-gray-900 dark:text-zinc-50 tabular-nums focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
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
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">Motivo de devolución</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReturnReason)}
                    className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-zinc-700 py-3 text-base text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
                  >
                    <option value="DEFECTIVE">Producto defectuoso</option>
                    <option value="WRONG_ITEM">Producto equivocado</option>
                    <option value="CUSTOMER_CHANGED_MIND">El cliente cambió de opinión</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <DsTextarea
                  label="Observaciones (Opcional)"
                  placeholder="Detalles adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />

                <div className="bg-gray-100 dark:bg-zinc-800 p-4 flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-zinc-300">Total a reembolsar</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">S/ {totalRefund.toFixed(2)}</span>
                </div>

                <DsButton
                  onClick={handleSubmit}
                  disabled={isSubmitting || totalRefund <= 0}
                  variant="destructive"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar Devolución"}
                </DsButton>
              </>
            )}
          </div>
        </DsCard>
      )}
    </div>
  );
}
