"use client";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
};

const EXPENSE_CATEGORIES = [
  "Alquiler",
  "Servicios (luz/agua/internet)",
  "Sueldo",
  "Transporte",
  "Mantenimiento",
  "Marketing",
  "Otros",
];

type Props = {
  expenses: Expense[];
  tenantSlug: string;
};

let addExpenseAction: (
  tenantSlug: string,
  description: string,
  amount: number,
  category: string
) => Promise<{ success: boolean; error?: string }>;

import("@/actions/dashboard").then((m) => {
  addExpenseAction = m.addExpenseAction as typeof addExpenseAction;
});

export function ExpenseList({ expenses: initial, tenantSlug }: Props) {
  const [expenses, setExpenses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!description.trim() || !amt || amt <= 0) {
      setError("Completa todos los campos con valores válidos.");
      return;
    }
    setError("");
    startTransition(async () => {
      if (!addExpenseAction) return;
      const res = await addExpenseAction(tenantSlug, description, amt, category);
      if (res.success) {
        setExpenses([
          ...expenses,
          {
            id: Date.now().toString(),
            description,
            amount: amt,
            category,
            expenseDate: new Date().toISOString(),
          },
        ]);
        setDescription("");
        setAmount("");
        setShowForm(false);
      } else {
        setError(res.error ?? "Error al registrar el gasto.");
      }
    });
  };

  return (
    <div className="bg-gray-100 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Gastos operativos
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            S/ {total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Agregar gasto"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Formulario inline */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 flex flex-col gap-3 border border-gray-200">
          <div>
            <label htmlFor="expense-desc" className="block text-sm font-semibold text-gray-700 mb-1">
              Descripción
            </label>
            <input
              id="expense-desc"
              type="text"
              placeholder="Ej: Alquiler del mes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-amount" className="block text-sm font-semibold text-gray-700 mb-1">
                Monto (S/)
              </label>
              <input
                id="expense-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.50"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
            <div>
              <label htmlFor="expense-cat" className="block text-sm font-semibold text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="expense-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="w-full bg-emerald-600 text-white rounded-xl py-4 text-lg font-semibold active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Registrar gasto"}
          </button>
        </div>
      )}

      {/* Lista */}
      {expenses.length > 0 ? (
        <div className="flex flex-col gap-2">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {e.description}
                </p>
                <p className="text-sm text-gray-500">{e.category}</p>
              </div>
              <p className="text-base font-bold text-gray-900">
                S/ {e.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">
          Sin gastos registrados este mes
        </p>
      )}
    </div>
  );
}
