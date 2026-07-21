import { ReactNode, ButtonHTMLAttributes } from "react";

type DsChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "active" | "warning" | "danger" | "success";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const variantStyles = {
  default:
    "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300",
  active:
    "bg-blue-900 text-white",
  warning:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  danger:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  success:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};

export function DsChip({
  variant = "default",
  icon,
  children,
  className = "",
  ...props
}: DsChipProps) {
  const Component = props.onClick ? "button" : "span";
  return (
    <Component
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </Component>
  );
}
