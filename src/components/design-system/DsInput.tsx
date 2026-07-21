import { InputHTMLAttributes, ReactNode } from "react";

type DsInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ReactNode;
};

export function DsInput({
  label,
  error,
  icon,
  className = "",
  id,
  ...props
}: DsInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full border-b border-gray-200 dark:border-zinc-700 py-3 text-base text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-blue-900 transition-colors ${
            icon ? "pl-8 pr-0" : "px-0"
          } ${error ? "border-red-600" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
