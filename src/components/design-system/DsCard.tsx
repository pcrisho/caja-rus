import { ReactNode } from "react";

type DsCardProps = {
  children: ReactNode;
  variant?: "default" | "hero" | "flat";
  padding?: "sm" | "md" | "lg";
  className?: string;
};

const variantStyles = {
  default: "bg-white dark:bg-zinc-900",
  hero: "bg-white dark:bg-zinc-900",
  flat: "bg-gray-50 dark:bg-zinc-800",
};

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function DsCard({
  children,
  variant = "default",
  padding = "md",
  className = "",
}: DsCardProps) {
  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
