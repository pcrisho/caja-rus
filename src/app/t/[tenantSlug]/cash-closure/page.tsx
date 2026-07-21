import { requireTenantAuth } from "@/lib/auth-helpers";
import { getCurrentShiftDataAction, getCashClosureHistoryAction } from "@/actions/cash-closure";
import { CashClosureForm } from "@/components/cash-closure/CashClosureForm";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cierre de Caja | CajaRUS",
};

export default async function CashClosurePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  let authResult;
  try {
    authResult = await requireTenantAuth(tenantSlug);
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  const [shiftRes, historyRes] = await Promise.all([
    getCurrentShiftDataAction(tenantSlug),
    getCashClosureHistoryAction(tenantSlug, 5),
  ]);

  const initialShiftData = shiftRes.success && shiftRes.data ? shiftRes.data : null;
  const history = historyRes.success && historyRes.data ? historyRes.data : [];

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Cierre de Caja"
          title="Cerrar Turno"
          subtitle={`Cajero: ${authResult.tenantName}`}
          backHref={`/t/${tenantSlug}/settings`}
          breadcrumbs={[
            { label: "Ajustes", href: `/t/${tenantSlug}/settings` },
            { label: "Cierre de Caja" },
          ]}
        />

        <CashClosureForm tenantSlug={tenantSlug} initialShiftData={initialShiftData} />

        {history.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Últimos cierres</h2>
            <div className="flex flex-col gap-3">
              {history.map((closure) => (
                <div key={closure.id} className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 flex flex-col gap-1 border border-gray-100 dark:border-zinc-700/50">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
                      {new Date(closure.closedAt).toLocaleString()}
                    </p>
                    <p className={`font-bold text-sm ${Number(closure.difference) === 0 ? "text-emerald-700 dark:text-emerald-400" : Number(closure.difference) > 0 ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}`}>
                      {Number(closure.difference) === 0 ? "OK" : Number(closure.difference) > 0 ? `+S/ ${Number(closure.difference).toFixed(2)}` : `-S/ ${Math.abs(Number(closure.difference)).toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                    <span>Esp: S/ {Number(closure.expectedAmount).toFixed(2)}</span>
                    <span>Real: S/ {Number(closure.countedAmount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
