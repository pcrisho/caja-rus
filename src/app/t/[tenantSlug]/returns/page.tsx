import { requireTenantAuth } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { ReturnForm } from "@/components/returns/ReturnForm";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Devoluciones | CajaRUS",
};

export default async function ReturnsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  
  try {
    // Both Admin and Cashier can process returns.
    await requireTenantAuth(tenantSlug);
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          categoryTag="Devoluciones"
          categoryTagColor="red"
          title="Registrar Devolución"
          subtitle="Busca la venta por ID y selecciona los productos a devolver"
          backHref={`/t/${tenantSlug}/settings`}
          breadcrumbs={[
            { label: "Ajustes", href: `/t/${tenantSlug}/settings` },
            { label: "Devoluciones" },
          ]}
        />

        <ReturnForm tenantSlug={tenantSlug} />
      </div>
    </main>
  );
}
