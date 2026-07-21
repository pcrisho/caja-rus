"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getTenantLandingPath } from "@/lib/tenancy-utils";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsBadge } from "@/components/design-system/DsBadge";

export default function TenantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    const memberships = session.user.tenantMemberships ?? [];
    const active = memberships.filter((m) => m.isActive);
    if (active.length === 1) {
      router.replace(getTenantLandingPath(active[0].tenantSlug));
    }
  }, [session, status, router]);

  if (status === "loading") return <div className="min-h-dvh flex items-center justify-center bg-white dark:bg-zinc-950"><p className="text-gray-500 dark:text-zinc-400 text-base">Cargando...</p></div>;
  
  const memberships = session?.user?.tenantMemberships ?? [];
  const active = memberships.filter((m) => m.isActive);

  if (active.length === 1) return <div className="min-h-dvh flex items-center justify-center bg-white dark:bg-zinc-950"><p className="text-gray-500 dark:text-zinc-400 text-base">Cargando tu bodega...</p></div>;
  
  if (active.length === 0) {
    return (
      <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-4 pt-20">
          <DsAlert variant="warning" message="Tu cuenta está activa pero aún no te asignaron a una bodega. Pide al administrador que te agregue." />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <header>
          <p className="text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">Tus bodegas</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-50">Elige dónde entrar</h1>
          <p className="mt-2 text-base text-gray-700 dark:text-zinc-300">Cada bodega vive separada. Escoge la que quieres manejar ahora.</p>
        </header>
        <div className="space-y-3">
          {active.map((m) => (
            <a key={m.tenantId} href={getTenantLandingPath(m.tenantSlug)} className="block bg-gray-100 dark:bg-zinc-800 p-5 active:scale-95 transition-transform">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">{m.tenantName}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">@{m.tenantSlug}</p>
                </div>
                <DsBadge variant="outline">
                  {m.tenantRole === 'ADMIN' ? 'Admin' : 'Cajero'}
                </DsBadge>
              </div>
              {m.isPrimary && <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2 font-medium">Tu bodega principal</p>}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
