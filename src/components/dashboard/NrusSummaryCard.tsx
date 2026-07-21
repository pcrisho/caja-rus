import { NrusThermometer } from "@/components/dashboard/NrusThermometer";
import { AlertTriangle, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import { DsBadge } from "@/components/design-system/DsBadge";

type Props = {
  totalSales: number;
  totalPurchases: number;
  currentCategory: number;
  consecutiveExcess: number;
  year: number;
  month: number;
};

const CATEGORY_THRESHOLDS: Record<number, number> = {
  1: 5000,
  2: 8000,
};

const CATEGORY_CUOTA: Record<number, number> = {
  1: 20,
  2: 50,
};

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function NrusSummaryCard({
  totalSales,
  totalPurchases,
  currentCategory,
  consecutiveExcess,
  year,
  month,
}: Props) {
  const lMes = Math.max(totalSales, totalPurchases);
  const threshold = CATEGORY_THRESHOLDS[currentCategory] ?? 8000;
  const cuota = CATEGORY_CUOTA[currentCategory];
  const isExceeded = lMes > 8000;

  const now = new Date();
  const lastDay = new Date(year, month, 0).getDate();
  const daysLeft = lastDay - now.getDate();

  return (
    <div className="bg-gray-100 dark:bg-zinc-800 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            NRUS — {MONTH_NAMES[month]} {year}
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-zinc-50">
            {isExceeded ? (
              <span className="text-red-600 dark:text-red-400">EXCEDIDO este mes</span>
            ) : (
              `Categoría ${currentCategory}`
            )}
          </h2>
        </div>
        {!isExceeded && cuota && (
          <div className="bg-white dark:bg-zinc-900 px-4 py-2 text-right">
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Cuota SUNAT</p>
            <p className="text-xl font-bold text-gray-900 dark:text-zinc-50 tabular-nums">S/ {cuota}</p>
          </div>
        )}
      </div>

      {consecutiveExcess >= 2 && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 flex items-start gap-2">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">
            Llevas 2 meses consecutivos excedido. Debes migrar al Régimen MYPE Tributario.
          </p>
        </div>
      )}
      {consecutiveExcess === 1 && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-3 flex items-start gap-2">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">
            Excediste el límite el mes pasado. Si lo excedes este mes también, deberás cambiar de régimen.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-1">
            <TrendingUp size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">Ventas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tabular-nums">
            S/ {totalSales.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-1">
            <ShoppingBag size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">Compras</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tabular-nums">
            S/ {totalPurchases.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Límite del mes (L = max(V, C))
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-zinc-50 tabular-nums">
            S/ {lMes.toFixed(2)}
          </p>
        </div>
        <NrusThermometer
          lMes={lMes}
          category={currentCategory}
          threshold={threshold}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <DollarSign size={14} />
          {daysLeft > 0 ? `${daysLeft} días restantes` : "Último día del mes"}
        </span>
        {!isExceeded && (
          <span>
            Espacio disponible: S/ {Math.max(threshold - lMes, 0).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
