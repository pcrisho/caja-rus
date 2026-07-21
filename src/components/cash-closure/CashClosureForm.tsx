"use client";

import { useState, useTransition } from "react";
import { DsInput } from "@/components/design-system/DsInput";
import { DsButton } from "@/components/design-system/DsButton";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsTextarea } from "@/components/design-system/DsTextarea";
import { DsCard } from "@/components/design-system/DsCard";

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
    return <DsAlert variant="error" message="Error al cargar datos del turno." />;
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
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMsg({ type: "err", text: res.error || "Error al cerrar turno." });
      }
    });
  };

  return (
    <DsCard>
      <div className="flex flex-col gap-6">
        {msg && (
          <DsAlert variant={msg.type === "ok" ? "success" : "error"} message={msg.text} />
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-4">Resumen del Turno Actual</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-zinc-800 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Esperado en Caja</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mt-1 tabular-nums">S/ {expected.toFixed(2)}</p>
            </div>
            <div className="bg-gray-100 dark:bg-zinc-800 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Ventas (Total)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mt-1 tabular-nums">{initialShiftData.salesCount}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DsInput
            label="Efectivo contado físicamente (S/)"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={countedAmount}
            onChange={(e) => setCountedAmount(e.target.value)}
            placeholder="0.00"
          />

          {countedAmount !== "" && (
            <div className={`p-4 ${
              diff === 0
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : diff > 0
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}>
              <p className="font-bold">
                {diff === 0 ? "¡Caja cuadrada!" : diff > 0 ? `Sobrante: S/ ${diff.toFixed(2)}` : `Faltante: S/ ${Math.abs(diff).toFixed(2)}`}
              </p>
            </div>
          )}

          <DsTextarea
            label="Observaciones (Opcional)"
            placeholder="Detalles sobre el sobrante o faltante..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <DsButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Cerrando turno..." : "Cerrar Turno"}
          </DsButton>
        </form>
      </div>
    </DsCard>
  );
}
