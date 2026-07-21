type DsProgressBarProps = {
  value: number;
  max?: number;
  color?: "emerald" | "amber" | "red" | "blue";
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
};

const colorStyles = {
  emerald: "bg-emerald-600",
  amber: "bg-amber-600",
  red: "bg-red-600",
  blue: "bg-blue-900",
};

const sizeStyles = {
  sm: "h-2",
  md: "h-4",
};

export function DsProgressBar({
  value,
  max = 100,
  color = "emerald",
  label,
  showValue = true,
  size = "md",
}: DsProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              {label}
            </p>
          )}
          {showValue && (
            <p className="text-sm font-bold text-gray-900 dark:text-zinc-50">
              {Math.round(percentage)}%
            </p>
          )}
        </div>
      )}
      <div
        className={`bg-gray-200 dark:bg-zinc-700 rounded-full ${sizeStyles[size]} overflow-hidden`}
      >
        <div
          className={`${colorStyles[color]} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
