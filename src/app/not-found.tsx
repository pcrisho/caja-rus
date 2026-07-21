import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-50 dark:bg-zinc-950 p-6 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
          CajaRUS
        </h1>
        <p className="text-lg text-gray-700 dark:text-zinc-300 mb-6">
          No encontramos esta página.
        </p>
        <Link
          href="/"
          className="block w-full bg-emerald-600 text-white py-4 px-6 text-lg font-semibold font-mono hover:bg-emerald-700 active:scale-95 transition-transform text-center"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
