"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getTenantLandingPath } from "@/lib/tenancy-utils";

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
    // Si 0 o >1 membresías activas, renderizar el selector o estado vacío
  }, [session, status, router]);

  if (status === "loading") return <div className="min-h-dvh flex items-center justify-center bg-white"><p className="text-gray-500 text-base">Cargando...</p></div>;
  
  // Renderizar selector de bodegas si hay múltiples activas
  const memberships = session?.user?.tenantMemberships ?? [];
  const active = memberships.filter((m) => m.isActive);

  // Si tiene exactamente 1 activa, ya está redirigiendo — mostrar cargando
  if (active.length === 1) return <div className="min-h-dvh flex items-center justify-center bg-white"><p className="text-gray-500 text-base">Cargando tu bodega...</p></div>;
  
  // Sin bodegas activas
  if (active.length === 0) {
    return (
      <main className="min-h-dvh bg-white px-4 py-6">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
          <div className="bg-amber-100 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-700 text-base font-semibold">Sin bodega asignada</p>
            <p className="text-amber-700 text-base mt-1">Tu cuenta está activa pero aún no te asignaron a una bodega. Pide al administrador que te agregue.</p>
          </div>
        </div>
      </main>
    );
  }

  // Múltiples bodegas activas — selector
  return (
    <main className="min-h-dvh bg-white px-4 py-6">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <header>
          <p className="text-xs font-bold tracking-wider uppercase text-gray-500">Tus bodegas</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Elige dónde entrar</h1>
          <p className="mt-2 text-base text-gray-700">Cada bodega vive separada. Escoge la que quieres manejar ahora.</p>
        </header>
        <div className="space-y-3">
          {active.map((m) => (
            <a key={m.tenantId} href={getTenantLandingPath(m.tenantSlug)} className="block bg-gray-100 rounded-xl p-5 active:scale-95 transition-transform">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">{m.tenantName}</p>
                  <p className="text-sm text-gray-500 mt-1">@{m.tenantSlug}</p>
                </div>
                <span className="rounded-full bg-white border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">{m.tenantRole === 'ADMIN' ? 'Admin' : 'Cajero'}</span>
              </div>
              {m.isPrimary && <p className="text-sm text-emerald-700 mt-2 font-medium">Tu bodega principal</p>}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
