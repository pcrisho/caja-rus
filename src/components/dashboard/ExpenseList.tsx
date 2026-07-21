"use client";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { DsInput } from "@/components/design-system/DsInput";
import { DsSelect } from "@/components/design-system/DsSelect";
import { DsButton } from "@/components/design-system/DsButton";
import { DsAlert } from "@/components/design-system/DsAlert";

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
    <div className="bg-gray-100 dark:bg-zinc-800 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Gastos operativos
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-zinc-50 mt-1 tabular-nums">
            S/ {total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Agregar gasto"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3">
          <DsInput
            label="Descripción"
            placeholder="Ej: Alquiler del mes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <DsInput
              label="Monto (S/)"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.50"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <DsSelect
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          {error && <DsAlert variant="error" message={error} />}
          <DsButton onClick={handleAdd} disabled={isPending}>
            {isPending ? "Guardando..." : "Registrar gasto"}
          </DsButton>
        </div>
      )}

      {expenses.length > 0 ? (
        <div className="flex flex-col gap-2">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-zinc-900 p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-zinc-50">
                  {e.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{e.category}</p>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-zinc-50 tabular-nums">
                S/ {e.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-2">
          Sin gastos registrados este mes
        </p>
      )}
    </div>
  );
}
