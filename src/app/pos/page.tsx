import { auth } from "@/lib/auth";
import { getTenantLandingPath, getTenantMemberships } from "@/lib/tenancy";
import { redirect } from "next/navigation";

export default async function LegacyPosPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await getTenantMemberships(session.user.id);
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
