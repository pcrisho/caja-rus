import { ReactNode, ButtonHTMLAttributes } from "react";

type DsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
  size?: "md" | "lg";
  icon?: ReactNode;
  fullWidth?: boolean;
};

const variantStyles = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-transform cursor-pointer",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
};

const sizeStyles = {
  md: "py-3 px-4 text-base font-semibold",
  lg: "py-4 px-6 text-lg font-semibold",
};

export function DsButton({
  variant = "primary",
  size = "lg",
  icon,
  fullWidth = true,
  className = "",
  children,
  ...props
}: DsButtonProps) {
  return (
    <button
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } font-mono flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
