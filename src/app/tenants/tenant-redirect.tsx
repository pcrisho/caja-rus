"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function TenantRedirect({ destination }: { destination: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(destination);
  }, [destination, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <div
        className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"
        role="status"
        aria-label="Cargando"
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entrando a tu bodega</h1>
        <p className="mt-2 text-base text-gray-700">
          Un momento, estamos abriendo tu punto de venta.
        </p>
      </div>
    </main>
  );
}
