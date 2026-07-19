import { auth } from "@/lib/auth";
import { getTenantLandingPath } from "@/lib/tenancy";
import { redirect } from "next/navigation";

export default async function LegacyPosPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = session.user.tenantMemberships ?? [];
  const activeMemberships = memberships.filter((membership) => membership.isActive);
  const primaryMembership =
    activeMemberships.find((membership) => membership.isPrimary) ??
    activeMemberships[0] ??
    null;

  if (!primaryMembership) {
    redirect("/tenants");
  }

  redirect(getTenantLandingPath(primaryMembership.tenantSlug));
}
