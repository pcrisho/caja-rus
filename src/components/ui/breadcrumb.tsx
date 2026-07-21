import * as React from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";

export function Breadcrumb({ ...props }: React.ComponentPropsWithoutRef<"nav">) {
  return <nav aria-label="breadcrumb" {...props} />;
}

export function BreadcrumbList({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      className={`flex flex-wrap items-center gap-1.5 break-words text-xs text-gray-500 dark:text-zinc-400 ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbItem({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbLink({
  href,
  className = "",
  children,
  ...props
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={`hover:text-gray-900 dark:hover:text-zinc-50 transition-colors font-medium ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function BreadcrumbPage({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={`font-semibold text-gray-900 dark:text-zinc-50 ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  children,
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={`text-gray-400 dark:text-zinc-600 ${className}`}
      {...props}
    >
      {children ?? <ChevronRight size={14} />}
    </li>
  );
}

export function BreadcrumbEllipsis({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={`flex h-4 w-4 items-center justify-center ${className}`}
      {...props}
    >
      <MoreHorizontal size={14} />
      <span className="sr-only">Más</span>
    </span>
  );
}
