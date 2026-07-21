import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 bg-gray-50 dark:bg-zinc-950 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">CajaRUS</h1>
        <p className="text-lg text-gray-700 dark:text-zinc-300 mb-6">
          No encontramos esta página.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-transform"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
