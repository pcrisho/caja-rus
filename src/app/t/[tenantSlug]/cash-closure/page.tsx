import { requireTenantAuth } from "@/lib/auth-helpers";
import { getCurrentShiftDataAction, getCashClosureHistoryAction } from "@/actions/cash-closure";
import { CashClosureForm } from "@/components/cash-closure/CashClosureForm";
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
    <main className="min-h-dvh bg-gray-50 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Cierre de Caja
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Cerrar Turno
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Cajero: {authResult.tenantName}
          </p>
        </header>

        <CashClosureForm tenantSlug={tenantSlug} initialShiftData={initialShiftData} />

        {history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Últimos cierres</h2>
            <div className="flex flex-col gap-3">
              {history.map((closure) => (
                <div key={closure.id} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(closure.closedAt).toLocaleString()}
                    </p>
                    <p className={`font-bold text-sm ${Number(closure.difference) === 0 ? "text-emerald-700" : Number(closure.difference) > 0 ? "text-amber-700" : "text-red-700"}`}>
                      {Number(closure.difference) === 0 ? "OK" : Number(closure.difference) > 0 ? `+S/ ${Number(closure.difference).toFixed(2)}` : `-S/ ${Math.abs(Number(closure.difference)).toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
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
