import { DsCard } from "@/components/design-system/DsCard";
import { DsStatsCard } from "@/components/design-system/DsStatsCard";
import { DsProgressBar } from "@/components/design-system/DsProgressBar";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsEmptyState } from "@/components/design-system/DsEmptyState";
import { DsChip } from "@/components/design-system/DsChip";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Inbox,
  Plus,
} from "lucide-react";

export default function DataDisplayPage() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Design System
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Display de Datos
          </h1>
        </header>

        {/* Progress bars */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Progress Bars
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsProgressBar value={65} color="emerald" label="NRUS" />
              <DsProgressBar value={85} color="amber" label="Alerta" />
              <DsProgressBar value={100} color="red" label="Excedido" />
              <DsProgressBar value={40} color="blue" label="Progreso" size="sm" />
            </div>
          </DsCard>
        </section>

        {/* Alerts */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Alertas
          </h2>
          <div className="flex flex-col gap-3">
            <DsAlert
              variant="success"
              message="Venta registrada exitosamente. S/ 245.00 cobrados."
            />
            <DsAlert
              variant="warning"
              message="Solo tienes 3 unidades de este producto. Considera reabastecer pronto."
            />
            <DsAlert
              variant="error"
              message="No se pudo procesar el pago. Verifica tu conexión."
            />
            <DsAlert
              variant="info"
              message="El sistema se actualizará esta noche a las 2:00 AM."
            />
          </div>
        </section>

        {/* Stats grid */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Stats Grid
          </h2>
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
          <div className="grid grid-cols-2 gap-3">
            <DsStatsCard
              label="Compras"
              value="S/ 830"
              change="-5%"
              changeType="negative"
              icon={<ShoppingBag size={16} />}
            />
            <DsStatsCard
              label="Stock bajo"
              value="8"
              icon={<AlertTriangle size={16} />}
            />
          </div>
        </section>

        {/* Chips */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Chips de Estado
          </h2>
          <DsCard>
            <div className="flex flex-wrap gap-2">
              <DsChip variant="success">Activo</DsChip>
              <DsChip variant="warning">Pendiente</DsChip>
              <DsChip variant="danger">Inactivo</DsChip>
              <DsChip variant="default">Draft</DsChip>
              <DsChip variant="active">Seleccionado</DsChip>
            </div>
          </DsCard>
        </section>

        {/* Empty state */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Empty State
          </h2>
          <DsCard>
            <DsEmptyState
              icon={<Package size={32} />}
              title="Sin productos"
              description="Aún no has registrado ningún producto en tu inventario."
            />
          </DsCard>
          <DsCard>
            <DsEmptyState
              icon={<Inbox size={32} />}
              title="Sin resultados"
              description="No se encontraron productos con estos filtros."
            />
          </DsCard>
        </section>

        {/* Transaction list */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Lista de Transacciones
          </h2>
          <DsCard>
            <div className="flex flex-col gap-3">
              {[
                { name: "Blue Bottle Coffee", category: "Alimentos", amount: "-S/ 6.50", time: "Hoy, 10:24 AM" },
                { name: "Whole Foods Market", category: "Supermercado", amount: "-S/ 142.30", time: "Ayer" },
                { name: "Depósito Stripe", category: "Ingreso", amount: "+S/ 4,200.00", time: "Oct 12", positive: true },
                { name: "Uber Technologies", category: "Transporte", amount: "-S/ 24.10", time: "Oct 11" },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
                      {tx.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {tx.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        tx.positive
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-gray-900 dark:text-zinc-50"
                      }`}
                    >
                      {tx.amount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {tx.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DsCard>
        </section>
      </div>
    </main>
  );
}
