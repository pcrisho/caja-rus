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
    <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-50 dark:bg-zinc-950 p-6 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
          CajaRUS
        </h1>
        <p className="text-lg text-gray-700 dark:text-zinc-300 mb-6">
          Algo salió mal. Ya estamos trabajando para arreglarlo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="w-full bg-emerald-600 text-white py-4 px-6 text-lg font-semibold font-mono hover:bg-emerald-700 active:scale-95 transition-transform cursor-pointer"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
