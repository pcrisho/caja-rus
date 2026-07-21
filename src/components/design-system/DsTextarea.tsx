import { TextareaHTMLAttributes } from "react";

type DsTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function DsTextarea({
  label,
  error,
  className = "",
  id,
  rows = 4,
  ...props
}: DsTextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200"
      >
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full bg-transparent border-b border-gray-200 dark:border-zinc-700 py-3 text-base text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-blue-900 transition-colors resize-none field-sizing-content ${
          error ? "border-red-600" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
