"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 bg-gray-50 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">CajaRUS</h1>
        <p className="text-lg text-gray-700 mb-6">
          Algo salió mal. Ya estamos trabajando para arreglarlo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-transform cursor-pointer"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
