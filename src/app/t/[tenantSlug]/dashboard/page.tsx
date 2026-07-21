import { requireTenantAuth } from "@/lib/auth-helpers";
import { getDashboardDataAction, getExpensesAction } from "@/actions/dashboard";
import { NrusSummaryCard } from "@/components/dashboard/NrusSummaryCard";
import { SalesSummaryChart } from "@/components/dashboard/SalesSummaryChart";
import { ExpenseList } from "@/components/dashboard/ExpenseList";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { DsAlert } from "@/components/design-system/DsAlert";

export const metadata = {
  title: "Dashboard | CajaRUS",
};

export default async function DashboardPage({
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

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [dashboardRes, expensesRes] = await Promise.all([
    getDashboardDataAction(tenantSlug),
    getExpensesAction(tenantSlug, year, month),
  ]);

  if (!dashboardRes.success || !dashboardRes.data) {
    return (
      <div className="m-4">
        <DsAlert variant="error" message={`Error al cargar el dashboard: ${dashboardRes.error}`} />
      </div>
    );
  }

  const { data } = dashboardRes;
  const expenses = expensesRes.success && expensesRes.data ? expensesRes.data : [];

  // Mapping sales for chart
  const salesChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    salesChartData.push({
      date: dateKey,
      total: data.salesByDay[dateKey] || 0,
    });
  }

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Resumen del negocio"
          title={authResult.tenantName}
        />

        <NrusSummaryCard
          totalSales={Number(data.nrusSummary?.totalSales || 0)}
          totalPurchases={Number(data.nrusSummary?.totalPurchases || 0)}
          currentCategory={data.nrusSummary?.currentCategory || 1}
          consecutiveExcess={data.nrusSummary?.consecutiveExcess || 0}
          year={year}
          month={month}
        />

        <SalesSummaryChart data={salesChartData} />

        <ExpenseList
          expenses={expenses.map((e) => ({
            id: e.id,
            description: e.description,
            amount: Number(e.amount),
            category: e.category,
            expenseDate: e.expenseDate.toISOString(),
          }))}
          tenantSlug={tenantSlug}
        />
      </div>
    </main>
  );
}
