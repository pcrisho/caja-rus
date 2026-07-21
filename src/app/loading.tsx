export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 bg-gray-50 dark:bg-zinc-950">
      <div
        className="h-10 w-10 rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 animate-spin"
        role="status"
        aria-label="Cargando"
      />
      <p className="text-gray-500 dark:text-zinc-400 text-base">Cargando...</p>
    </div>
  );
}
