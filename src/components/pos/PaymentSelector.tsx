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

const ALL_METHODS: PaymentMethod[] = ["CASH", "YAPE", "PLIN", "CARD", "MIXED"];
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

      <div className="flex flex-wrap gap-2">
        {ALL_METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setPaymentMethod(m)}
            className={`px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
              paymentMethod === m
                ? "bg-blue-900 text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {paymentMethod === "MIXED" && (
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 flex flex-col gap-3">
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
                <div className="relative flex-1 border-b border-gray-200 dark:border-zinc-700 focus-within:border-blue-900 transition-colors">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 text-base">
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
                    className="w-full bg-transparent py-3 pl-8 pr-4 text-base text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                  />
                </div>
              </div>
            );
          })}

          <div
            className={`flex items-center justify-between p-3 ${
              Math.abs(mixedDiff) < 0.01
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : mixedDiff > 0
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {Math.abs(mixedDiff) < 0.01 ? (
              <p className="text-sm font-semibold flex items-center gap-2">
                <Check size={16} /> Monto completo
              </p>
            ) : mixedDiff > 0 ? (
              <p className="text-sm font-semibold">
                Falta: S/ {mixedDiff.toFixed(2)}
              </p>
            ) : (
              <p className="text-sm font-semibold">
                Exceso: S/ {Math.abs(mixedDiff).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
