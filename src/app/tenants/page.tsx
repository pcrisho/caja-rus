import { auth } from "@/lib/auth";
import { getTenantLandingPath, getTenantMemberships } from "@/lib/tenancy";
import { redirect } from "next/navigation";

export default async function TenantsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await getTenantMemberships(session.user.id);
  const activeMemberships = memberships.filter((membership) => membership.isActive);

  if (activeMemberships.length === 1) {
    redirect(getTenantLandingPath(activeMemberships[0].tenantSlug));
  }

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <header className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Tus bodegas
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Elige dónde entrar
          </h1>
          <p className="mt-3 text-base text-gray-700">
            Cada bodega vive separada. Escoge la que quieres manejar ahora.
          </p>
        </header>

        {memberships.length === 0 ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-900">Sin bodega asignada</h2>
            <p className="mt-2 text-base text-amber-800">
              Tu cuenta está activa, pero todavía no te asignaron a una bodega.
              Pide a un administrador que te agregue.
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {memberships.map((membership) => {
              const card = (
                <div className="block rounded-2xl border border-gray-200 bg-white p-5 transition-transform">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {membership.tenantName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        @{membership.tenantSlug}
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                      {membership.tenantRole}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    {membership.isPrimary
                      ? "Tu bodega principal"
                      : membership.isActive
                        ? "Bodega activa"
                        : "Bodega inactiva"}
                  </p>
                </div>
              );

              if (!membership.isActive) {
                return (
                  <div key={membership.tenantId} className="opacity-60">
                    {card}
                  </div>
                );
              }

              return (
                <a
                  key={membership.tenantId}
                  href={getTenantLandingPath(membership.tenantSlug)}
                  className="block active:scale-[0.99] transition-transform"
                >
                  {card}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
