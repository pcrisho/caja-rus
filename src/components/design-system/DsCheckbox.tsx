"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";

type DsCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
  icon?: ReactNode;
};

export function DsCheckbox({
  label,
  description,
  icon,
  className = "",
  id,
  checked,
  onChange,
  disabled,
  ...props
}: DsCheckboxProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`flex items-start gap-3 cursor-pointer group ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="relative shrink-0 mt-0.5">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={`w-5 h-5 flex items-center justify-center border transition-colors ${
            checked
              ? "bg-blue-900 border-blue-900"
              : "border-gray-300 dark:border-zinc-600 group-hover:border-gray-400 dark:group-hover:border-zinc-500"
          } focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-900 peer-focus-visible:ring-offset-2`}
        >
          {checked && <Check size={14} className="text-white stroke-[3]" />}
        </div>
      </div>
      {(label || description || icon) && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-gray-400 dark:text-zinc-500 shrink-0">{icon}</span>
            )}
            {label && (
              <span className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                {label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
}
