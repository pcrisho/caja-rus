import { ReactNode } from "react";

type DsEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DsEmptyState({
  icon,
  title,
  description,
  action,
}: DsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
