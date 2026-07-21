import { SelectHTMLAttributes } from "react";

type DsSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
};

export function DsSelect({
  label,
  options,
  error,
  className = "",
  id,
  ...props
}: DsSelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={selectId}
        className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none border-b border-gray-200 dark:border-zinc-700 py-3 pr-8 text-base text-gray-900 dark:text-zinc-50 bg-transparent focus-visible:outline-none focus-visible:border-blue-900 transition-colors ${
            error ? "border-red-600" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-zinc-500">
          ▼
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
