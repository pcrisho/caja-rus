import { auth } from "@/lib/auth";
import { getTenantContextBySlug } from "@/lib/tenancy";
import { redirect } from "next/navigation";

export default async function TenantLandingPage(props: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { tenantSlug } = await props.params;
  const tenant = await getTenantContextBySlug(session.user.id, tenantSlug);

  if (!tenant) {
    redirect("/tenants?error=unauthorized");
  }

  redirect(`/t/${tenantSlug}/pos`);
}
