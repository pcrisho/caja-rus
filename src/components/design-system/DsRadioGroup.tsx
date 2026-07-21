"use client";

import { ReactNode } from "react";

type RadioOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type DsRadioGroupProps = {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
};

export function DsRadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
}: DsRadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
          {label}
        </p>
      )}
      <div className="flex gap-2">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              name={name}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2 flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                isSelected
                  ? "bg-blue-900 text-white"
                  : "bg-transparent border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900`}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
