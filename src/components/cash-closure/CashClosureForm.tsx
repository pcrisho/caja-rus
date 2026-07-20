"use client";

import { useState, useTransition, useEffect } from "react";

type ShiftData = {
  shiftStart: Date;
  salesCount: number;
  expectedAmount: number;
  paymentBreakdown: Record<string, number>;
};

type Props = {
  tenantSlug: string;
  initialShiftData: ShiftData | null;
};

let closeCashAction: (
  tenantSlug: string,
  countedAmount: number,
  notes?: string
) => Promise<{ success: boolean; data?: any; error?: string }>;

import("@/actions/cash-closure").then((m) => {
  closeCashAction = m.closeCashAction;
});

export function CashClosureForm({ tenantSlug, initialShiftData }: Props) {
  const [countedAmount, setCountedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, startSubmit] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (!initialShiftData) {
    return <div className="p-4 bg-red-100 text-red-800 rounded-xl">Error al cargar datos del turno.</div>;
  }

  const expected = initialShiftData.expectedAmount;
  const counted = parseFloat(countedAmount) || 0;
  const diff = counted - expected;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(counted) || counted < 0) {
      setMsg({ type: "err", text: "Ingresa un monto válido." });
      return;
    }

    startSubmit(async () => {
      const res = await closeCashAction(tenantSlug, counted, notes);
      if (res.success) {
        setMsg({ type: "ok", text: "Turno cerrado exitosamente." });
        setCountedAmount("");
        setNotes("");
        // Typically we would trigger a refresh or redirect here
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMsg({ type: "err", text: res.error || "Error al cerrar turno." });
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {msg && (
        <div className={`p-4 rounded-xl border font-semibold ${msg.type === "ok" ? "bg-emerald-100 border-emerald-200 text-emerald-800" : "bg-red-100 border-red-200 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen del Turno Actual</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Esperado en Caja</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">S/ {expected.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Ventas (Total)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{initialShiftData.salesCount}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Efectivo contado físicamente (S/)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={countedAmount}
            onChange={(e) => setCountedAmount(e.target.value)}
            className="w-full text-2xl font-bold border-2 border-gray-300 rounded-xl py-4 px-4 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            placeholder="0.00"
            required
          />
        </div>

        {countedAmount !== "" && (
          <div className={`p-4 rounded-xl border ${diff === 0 ? "bg-emerald-50 border-emerald-200" : diff > 0 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
            <p className={`font-bold ${diff === 0 ? "text-emerald-700" : diff > 0 ? "text-amber-700" : "text-red-700"}`}>
              {diff === 0 ? "¡Caja cuadrada!" : diff > 0 ? `Sobrante: S/ ${diff.toFixed(2)}` : `Faltante: S/ ${Math.abs(diff).toFixed(2)}`}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones (Opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 resize-none h-24 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            placeholder="Detalles sobre el sobrante o faltante..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-900 text-white font-bold text-lg rounded-xl py-4 active:scale-95 transition-transform disabled:opacity-50 mt-2"
        >
          {isSubmitting ? "Cerrando turno..." : "Cerrar Turno"}
        </button>
      </form>
    </div>
  );
}
