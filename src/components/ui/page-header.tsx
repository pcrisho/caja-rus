import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export type BreadcrumbItemData = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  categoryTag?: string;
  categoryTagColor?: "blue" | "emerald" | "amber" | "red";
  backHref?: string;
  breadcrumbs?: BreadcrumbItemData[];
};

export function PageHeader({
  title,
  subtitle,
  categoryTag,
  categoryTagColor = "blue",
  backHref,
  breadcrumbs,
}: PageHeaderProps) {
  const tagColors = {
    blue: "text-blue-900 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20",
    emerald: "text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20",
    amber: "text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20",
    red: "text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20",
  };

  const hasNav = backHref || (breadcrumbs && breadcrumbs.length > 0);

  return (
    <header className="flex flex-col gap-3 py-2 mb-2">
      {hasNav && (
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label="Breadcrumbs">
          {backHref && (
            <Link
              href={backHref}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shrink-0 mr-1"
              aria-label="Volver"
            >
              <ArrowLeft size={18} className="stroke-[2.5]" />
            </Link>
          )}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <ol className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-gray-500 dark:text-zinc-400">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <li className="flex items-center">
                      {!isLast && item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-gray-900 dark:hover:text-zinc-50 transition-colors py-1"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className={`py-1 ${isLast ? "text-gray-900 dark:text-zinc-50 font-bold" : ""}`}>
                          {item.label}
                        </span>
                      )}
                    </li>
                    {!isLast && (
                      <li aria-hidden="true" className="text-gray-300 dark:text-zinc-600">
                        <ChevronRight size={14} className="stroke-[3]" />
                      </li>
                    )}
                  </React.Fragment>
                );
              })}
            </ol>
          )}
        </nav>
      )}

      <div className="flex flex-col gap-1.5">
        {categoryTag && (
          <div className="flex">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 ${tagColors[categoryTagColor]}`}
            >
              {categoryTag}
            </span>
          </div>
        )}
        <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-zinc-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
