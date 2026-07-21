"use client";
import { usePosStore, PaymentEntry } from "@/store/usePosStore";
import { Check } from "lucide-react";

type PaymentMethod = "CASH" | "YAPE" | "PLIN" | "CARD" | "MIXED";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  CARD: "Tarjeta",
  MIXED: "Mixto",
};

const SINGLE_METHODS: PaymentEntry["method"][] = ["CASH", "YAPE", "PLIN", "CARD"];

export function PaymentSelector({ total }: { total: number }) {
  const { paymentMethod, setPaymentMethod, payments, setPayments } =
    usePosStore();

  const mixedTotal = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const mixedDiff = total - mixedTotal;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        Método de pago
      </p>

      {/* Chips de método */}
      <div className="flex flex-wrap gap-2">
        {(["CASH", "YAPE", "PLIN", "CARD", "MIXED"] as PaymentMethod[]).map(
          (m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors active:scale-95 transition-transform ${
                paymentMethod === m
                  ? "bg-blue-900 text-white border-blue-900"
                  : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-700"
              }`}
            >
              {METHOD_LABELS[m]}
            </button>
          )
        )}
      </div>

      {/* Panel MIXED */}
      {paymentMethod === "MIXED" && (
        <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
            Total a cobrar: S/ {total.toFixed(2)}
          </p>

          {SINGLE_METHODS.map((m) => {
            const entry = payments.find((p) => p.method === m);
            const value = entry?.amount ?? 0;

            return (
              <div key={m} className="flex items-center gap-3">
                <label
                  htmlFor={`mixed-${m}`}
                  className="w-20 text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  {METHOD_LABELS[m]}
                </label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 text-base">
                    S/
                  </span>
                  <input
                    id={`mixed-${m}`}
                    type="number"
                    min="0"
                    step="0.10"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={value || ""}
                    onChange={(e) => {
                      const newAmount = parseFloat(e.target.value) || 0;
                      const filtered = payments.filter((p) => p.method !== m);
                      if (newAmount > 0) {
                        setPayments([
                          ...filtered,
                          { method: m, amount: newAmount },
                        ]);
                      } else {
                        setPayments(filtered);
                      }
                    }}
                    className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3 pl-9 pr-4 text-base bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
                  />
                </div>
              </div>
            );
          })}

          {/* Diferencia */}
          <div
            className={`flex items-center justify-between rounded-xl p-3 ${
              Math.abs(mixedDiff) < 0.01
                ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"
                : mixedDiff > 0
                ? "bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700"
                : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
            }`}
          >
            {Math.abs(mixedDiff) < 0.01 ? (
              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <Check size={16} /> Monto completo ✔
              </p>
            ) : mixedDiff > 0 ? (
              <p className="text-amber-700 dark:text-amber-400 text-sm font-semibold">
                Falta: S/ {mixedDiff.toFixed(2)}
              </p>
            ) : (
              <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
                Exceso: S/ {Math.abs(mixedDiff).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
