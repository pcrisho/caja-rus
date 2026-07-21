import { requireTenantRole } from "@/lib/auth-helpers";
import { getTenantHubPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Ajustes | CajaRUS",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  let authResult;
  try {
    authResult = await requireTenantRole(tenantSlug, "ADMIN");
  } catch (error) {
    redirect(getTenantHubPath("unauthorized"));
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: authResult.tenantId },
  });

  return (
    <SettingsClient
      tenantSlug={tenantSlug}
      tenantName={tenant?.name ?? ""}
      tenantSlugName={tenant?.slug ?? ""}
    />
  );
}
