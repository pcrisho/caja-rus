import { ReactNode } from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

type DsAlertProps = {
  variant: "success" | "warning" | "error" | "info";
  message: string;
  icon?: ReactNode;
};

const variantStyles = {
  success:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  warning:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  error:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400",
};

const defaultIcons = {
  success: <CheckCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <XCircle size={20} />,
  info: <Info size={20} />,
};

export function DsAlert({ variant, message, icon }: DsAlertProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl ${variantStyles[variant]}`}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{icon || defaultIcons[variant]}</span>
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}
