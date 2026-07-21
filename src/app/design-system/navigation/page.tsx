"use client";

import { useState } from "react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsListItem } from "@/components/design-system/DsListItem";
import { DsTabs } from "@/components/design-system/DsTabs";
import { DsChip } from "@/components/design-system/DsChip";
import {
  ShoppingCart,
  Package,
  Truck,
  BarChart2,
  Settings,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Design System
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Navegación
          </h1>
        </header>

        {/* Tabs */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Tabs
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsTabs
                tabs={[
                  { id: "general", label: "GENERAL" },
                  { id: "billing", label: "FACTURACIÓN" },
                  { id: "goals", label: "METAS" },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Tab activo: {activeTab}
              </p>
            </div>
          </DsCard>
        </section>

        {/* Bottom nav preview */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Bottom Nav
          </h2>
          <DsCard>
            <div className="bg-white dark:bg-zinc-950">
              <nav className="flex items-center justify-around h-16">
                {[
                  { label: "Ventas", icon: ShoppingCart, active: true },
                  { label: "Inventario", icon: Package, active: false },
                  { label: "Compras", icon: Truck, active: false },
                  { label: "Finanzas", icon: BarChart2, active: false },
                  { label: "Ajustes", icon: Settings, active: false },
                ].map(({ label, icon: Icon, active }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 ${
                      active
                        ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-xs">{label}</span>
                  </div>
                ))}
              </nav>
            </div>
          </DsCard>
        </section>

        {/* List items */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            List Items
          </h2>
          <div className="flex flex-col gap-2">
            <DsListItem
              icon={<CreditCard size={20} />}
              title="Cambiar límite de transferencia"
              subtitle="Ajusta cuánto puedes enviar desde tu saldo"
              chevron
            />
            <DsListItem
              icon={<Bell size={20} />}
              title="Transferencias programadas"
              subtitle="Configura una transferencia para más tarde"
              chevron
            />
            <DsListItem
              icon={<Shield size={20} />}
              title="Débitos directos"
              subtitle="Configura y administra pagos recurrentes"
              chevron
            />
          </div>
        </section>

        {/* Sidebar nav */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Sidebar Nav (Desktop)
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                  RESUMEN
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "Dashboard", icon: BarChart2, active: true },
                    { label: "Ventas", icon: ShoppingCart, active: false },
                    { label: "Inventario", icon: Package, active: false },
                    { label: "Compras", icon: Truck, active: false },
                  ].map(({ label, icon: Icon, active }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 px-3 py-2 rounded-none ${
                        active
                          ? "bg-blue-900 text-white"
                          : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-px bg-gray-200 dark:bg-zinc-700" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                  CUENTA
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "Ajustes", icon: Settings },
                    { label: "Ayuda", icon: HelpCircle },
                    { label: "Documentos", icon: FileText },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 px-3 py-2 rounded-none text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DsCard>
        </section>

        {/* Breadcrumbs */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Breadcrumbs
          </h2>
          <DsCard>
            <nav className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 dark:text-zinc-400">
              <span className="hover:text-gray-900 dark:hover:text-zinc-50 cursor-pointer">
                INICIO
              </span>
              <span className="text-gray-300 dark:text-zinc-600">
                <ChevronRight size={14} className="stroke-[3]" />
              </span>
              <span className="hover:text-gray-900 dark:hover:text-zinc-50 cursor-pointer">
                INVENTARIO
              </span>
              <span className="text-gray-300 dark:text-zinc-600">
                <ChevronRight size={14} className="stroke-[3]" />
              </span>
              <span className="text-gray-900 dark:text-zinc-50 font-bold">
                ACEITE VEGETAL
              </span>
            </nav>
          </DsCard>
        </section>
      </div>
    </main>
  );
}
