"use client";
import { usePosStore } from "@/store/usePosStore";
import { Delete } from "lucide-react";

/**
 * Teclado numérico para ingresar peso (KG) de un producto.
 * Aparece como modal cuando activeKgProduct no es null.
 */
export function WeightKeypad() {
  const { activeKgProduct, weightInput, setWeightInput, confirmWeight, setActiveKgProduct } =
    usePosStore();

  if (!activeKgProduct) return null;

  const handleKey = (val: string) => {
    if (val === "." && weightInput.includes(".")) return;
    if (val === "." && weightInput === "") {
      setWeightInput("0.");
      return;
    }
    // Máximo 3 decimales
    const parts = (weightInput + val).split(".");
    if (parts[1]?.length > 3) return;
    setWeightInput(weightInput + val);
  };

  const handleBackspace = () =>
    setWeightInput(weightInput.slice(0, -1));

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

  const qty = parseFloat(weightInput) || 0;
  const isValid = qty > 0 && qty <= activeKgProduct.stock;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Peso en kilogramos
        </p>
        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-50 truncate">
          {activeKgProduct.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Stock disponible: {activeKgProduct.stock.toFixed(3)} kg
        </p>
      </div>

      {/* Display */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            {weightInput || "0"}
          </p>
          <p className="text-2xl text-gray-500 dark:text-zinc-400 mt-2">kg</p>
          {weightInput && (
            <p className="text-base text-emerald-700 dark:text-emerald-400 mt-2 font-semibold">
              S/ {(activeKgProduct.sellingPrice * qty).toFixed(2)}
            </p>
          )}
          {qty > activeKgProduct.stock && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              ⚠ Excede el stock disponible
            </p>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => (k === "⌫" ? handleBackspace() : handleKey(k))}
            className="h-16 rounded-xl bg-gray-100 dark:bg-zinc-800 text-2xl font-semibold text-gray-900 dark:text-zinc-50 active:scale-95 transition-transform flex items-center justify-center"
          >
            {k === "⌫" ? <Delete size={24} /> : k}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-4 pt-0">
        <button
          onClick={() => setActiveKgProduct(null)}
          className="flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-4 text-lg font-semibold text-gray-700 dark:text-zinc-300 active:scale-95 transition-transform"
        >
          Cancelar
        </button>
        <button
          onClick={confirmWeight}
          disabled={!isValid}
          className="flex-1 bg-emerald-600 text-white rounded-xl py-4 text-lg font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
