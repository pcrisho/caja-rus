"use client";

type Props = {
  lMes: number;
  category: number;
  threshold: number; // 5000 para cat1, 8000 para cat2
};

const THRESHOLDS = {
  1: 5000,
  2: 8000,
};

export function NrusThermometer({ lMes, category, threshold }: Props) {
  const pct = Math.min((lMes / threshold) * 100, 100);
  const alertPct = 85;

  const barColor =
    lMes > threshold
      ? "bg-red-600"
      : pct >= alertPct
      ? "bg-amber-600"
      : "bg-emerald-600";

  const statusText =
    lMes > threshold
      ? "¡Excedido! Debes pasar al Régimen MYPE"
      : pct >= alertPct
      ? "⚠ Estás al 85% del límite — cuidado"
      : "Vas bien";

  const statusColor =
    lMes > threshold
      ? "text-red-700 dark:text-red-400"
      : pct >= alertPct
      ? "text-amber-700 dark:text-amber-400"
      : "text-emerald-700 dark:text-emerald-400";

  return (
    <div className="flex flex-col gap-2">
      {/* Barra */}
      <div className="bg-gray-200 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={lMes}
          aria-valuemax={threshold}
          aria-label={`Límite NRUS: S/ ${lMes.toFixed(2)} de S/ ${threshold.toFixed(2)}`}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-semibold ${statusColor}`}>{statusText}</p>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          S/ {lMes.toFixed(2)} / S/ {threshold.toFixed(2)}
        </p>
      </div>

      {/* Marca del 85% */}
      <div className="relative h-1">
        <div
          className="absolute top-0 w-px h-3 bg-gray-400 dark:bg-zinc-500"
          style={{ left: `${alertPct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="relative">
        <span
          className="absolute text-xs text-gray-400 dark:text-zinc-500"
          style={{ left: `${alertPct - 2}%` }}
        >
          85%
        </span>
      </div>
    </div>
  );
}
