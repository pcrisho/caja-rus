import { DsCard } from "@/components/design-system/DsCard";
import { DsStatsCard } from "@/components/design-system/DsStatsCard";
import { DsProgressBar } from "@/components/design-system/DsProgressBar";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  ShoppingCart,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Resumen del negocio
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Mi Bodega
          </h1>
        </header>

        {/* NRUS Card */}
        <DsCard variant="hero">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  NRUS — Junio 2026
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-zinc-50">
                  Categoría 1
                </h2>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-2 text-right">
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Cuota SUNAT</p>
                <p className="text-xl font-bold text-gray-900 dark:text-zinc-50">S/ 20</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-1">
                  <TrendingUp size={16} />
                  <p className="text-xs font-bold uppercase tracking-wider">Ventas</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">S/ 3,200</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-1">
                  <ShoppingBag size={16} />
                  <p className="text-xs font-bold uppercase tracking-wider">Compras</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">S/ 2,850</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
              <DsProgressBar value={65} color="emerald" label="Límite del mes" />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                15 días restantes
              </span>
              <span>Espacio: S/ 4,800.00</span>
            </div>
          </div>
        </DsCard>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <DsStatsCard
            label="Ventas hoy"
            value="S/ 1,250"
            change="+12%"
            changeType="positive"
            icon={<TrendingUp size={16} />}
          />
          <DsStatsCard
            label="Productos"
            value="156"
            change="+3"
            changeType="positive"
            icon={<Package size={16} />}
          />
        </div>

        {/* Chart placeholder */}
        <DsCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Ventas de la semana
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">S/ 8,750</p>
            </div>
            <div className="h-32 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-end justify-around p-4 gap-2">
              {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-600 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>
        </DsCard>

        {/* Recent transactions */}
        <DsCard>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              Últimas ventas
            </p>
            <span className="text-xs font-bold text-blue-900 dark:text-blue-400 cursor-pointer">
              VER TODAS
            </span>
          </div>
          <div className="flex flex-col">
            {[
              { name: "Venta #1234", client: "Cliente general", amount: "S/ 245.00", time: "Hoy, 10:24 AM" },
              { name: "Venta #1233", client: "María López", amount: "S/ 89.50", time: "Hoy, 9:15 AM" },
              { name: "Venta #1232", client: "Cliente general", amount: "S/ 156.00", time: "Ayer" },
            ].map((tx, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100 dark:border-zinc-800" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
                    {tx.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{tx.client}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {tx.amount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DsCard>
      </div>
    </main>
  );
}
