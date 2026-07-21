import { InputHTMLAttributes, ReactNode } from "react";

type DsInputGroupProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
  error?: string;
};

export function DsInputGroup({
  leftIcon,
  rightAction,
  error,
  className = "",
  id,
  ...props
}: DsInputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-zinc-700 focus-within:border-blue-900 transition-colors">
        {leftIcon && (
          <div className="text-gray-400 dark:text-zinc-500 shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`flex-1 bg-transparent py-3 text-base text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none min-w-0 ${
            error ? "border-red-600" : ""
          } ${className}`}
          {...props}
        />
        {rightAction && (
          <div className="shrink-0">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
