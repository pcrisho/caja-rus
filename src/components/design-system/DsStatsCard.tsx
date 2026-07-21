import { ReactNode } from "react";

type DsStatsCardProps = {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  className?: string;
};

export function DsStatsCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  className = "",
}: DsStatsCardProps) {
  const changeColors = {
    positive: "text-emerald-700 dark:text-emerald-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-500 dark:text-zinc-400",
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-2">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tabular-nums">
          {value}
        </p>
        {change && (
          <p className={`text-sm font-semibold tabular-nums ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
