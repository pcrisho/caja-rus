import { DsCard } from "@/components/design-system/DsCard";
import { DsStatsCard } from "@/components/design-system/DsStatsCard";
import { DsProgressBar } from "@/components/design-system/DsProgressBar";
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle } from "lucide-react";

export default function CardsPage() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Design System
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Cards
          </h1>
        </header>

        {/* Default card */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Card Default (bg-gray-100)
          </h2>
          <DsCard variant="default">
            <p className="text-base text-gray-700 dark:text-zinc-300">
              Contenido de la card con padding estándar. Sin bordes, sin sombra.
            </p>
          </DsCard>
        </section>

        {/* Hero card */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Card Hero (rounded-none)
          </h2>
          <DsCard variant="hero" padding="lg">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                NRUS — Junio 2026
              </p>
              <h3 className="text-xl font-bold text-gray-900 tabular-nums dark:text-zinc-50">
                Categoría 1
              </h3>
              <DsProgressBar value={65} color="emerald" label="Progreso del mes" />
            </div>
          </DsCard>
        </section>

        {/* Bordered card */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Card Bordered (con borde)
          </h2>
          <DsCard variant="default">
            <p className="text-base text-gray-700 dark:text-zinc-300">
              Card con borde de 1px. Útil cuando la card está sobre fondo blanco.
            </p>
          </DsCard>
        </section>

        {/* Stats cards */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Stats Cards
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <DsStatsCard
              label="Ventas"
              value="S/ 12,450"
              change="+12%"
              changeType="positive"
              icon={<TrendingUp size={16} />}
            />
            <DsStatsCard
              label="Compras"
              value="S/ 8,230"
              change="-5%"
              changeType="negative"
              icon={<ShoppingBag size={16} />}
            />
          </div>
          <DsStatsCard
            label="Balance del mes"
            value="S/ 4,220"
            change="+8% vs mes anterior"
            changeType="positive"
            icon={<DollarSign size={16} />}
          />
        </section>

        {/* Card with content */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Card con Contenido Mixto
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Total del día
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums dark:text-zinc-50">
                  S/ 1,250.00
                </p>
              </div>
              <div className="h-px bg-gray-200 dark:bg-zinc-700" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">15 ventas</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Promedio: S/ 83.33
                </span>
              </div>
            </div>
          </DsCard>
        </section>

        {/* Alert card */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Card de Alerta
          </h2>
          <DsCard className="bg-amber-100 dark:bg-amber-900/30">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-700 dark:text-amber-400 text-sm font-semibold">
                Solo tienes 3 unidades de este producto. Considera reabastecer pronto.
              </p>
            </div>
          </DsCard>
        </section>
      </div>
    </main>
  );
}
