"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Package, Truck, BarChart2, Settings } from "lucide-react";

const navItems = [
  { label: "Ventas", icon: ShoppingCart, path: "pos" },
  { label: "Inventario", icon: Package, path: "inventory" },
  { label: "Compras", icon: Truck, path: "purchases" },
  { label: "Finanzas", icon: BarChart2, path: "dashboard" },
  { label: "Ajustes", icon: Settings, path: "settings" },
];

export function BottomNav({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ label, icon: Icon, path }) => {
          const href = `/t/${tenantSlug}/${path}`;
          const isActive = pathname.includes(`/${path}`);
          return (
            <Link
              key={path}
              href={href}
              className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-gray-500 dark:text-zinc-400"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
