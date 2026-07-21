import { ReactNode } from "react";

type DsBadgeProps = {
  variant?: "default" | "outline" | "secondary" | "destructive" | "success";
  children: ReactNode;
  className?: string;
};

const variantStyles = {
  default: "bg-emerald-600 text-white",
  outline: "border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300",
  secondary: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300",
  destructive: "bg-red-600 text-white",
  success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};

export function DsBadge({
  variant = "default",
  children,
  className = "",
}: DsBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
