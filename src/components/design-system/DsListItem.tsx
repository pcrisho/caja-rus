import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type DsListItemProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  className?: string;
  showSeparator?: boolean;
};

export function DsListItem({
  icon,
  title,
  subtitle,
  action,
  chevron = false,
  onClick,
  className = "",
  showSeparator = true,
}: DsListItemProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-4 ${
        showSeparator ? "border-b border-gray-100 dark:border-zinc-800" : ""
      } ${
        onClick ? "hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-transform cursor-pointer" : ""
      } ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 text-left min-w-0">
        <p className="text-base font-semibold text-gray-900 dark:text-zinc-50 truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {action}
      {chevron && (
        <ChevronRight size={20} className="text-gray-400 dark:text-zinc-500 shrink-0" />
      )}
    </Component>
  );
}
