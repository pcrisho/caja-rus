"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  RotateCcw,
  HelpCircle,
  FileText,
  LogOut,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsButton } from "@/components/design-system/DsButton";
import { DsListItem } from "@/components/design-system/DsListItem";
import { DsModal } from "@/components/design-system/DsModal";
import { ThemeToggle } from "@/components/settings/ThemeToggle";

type Props = {
  tenantSlug: string;
  tenantName: string;
  tenantSlugName: string;
};

export function SettingsClient({ tenantSlug, tenantName, tenantSlugName }: Props) {
  const [showFaq, setShowFaq] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Ajustes
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {tenantName} — @{tenantSlugName}
          </p>
        </header>

        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
            Administración
          </p>
          <div className="flex flex-col">
            <Link href={`/t/${tenantSlug}/settings/users`}>
              <DsListItem
                icon={<Users size={20} />}
                title="Gestión de Personal"
                subtitle="Administra los accesos y roles de tu equipo"
                chevron
              />
            </Link>
            <Link href={`/t/${tenantSlug}/cash-closure`}>
              <DsListItem
                icon={<DollarSign size={20} />}
                title="Cierre de Caja"
                subtitle="Cuadra el efectivo y cierra el turno"
                chevron
              />
            </Link>
            <Link href={`/t/${tenantSlug}/returns`}>
              <DsListItem
                icon={<RotateCcw size={20} />}
                title="Devoluciones"
                subtitle="Procesa devoluciones de clientes"
                chevron
                showSeparator={false}
              />
            </Link>
          </div>
        </DsCard>

        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
            Bodega
          </p>
          <div className="flex flex-col">
            <DsListItem
              icon={<Building2 size={20} />}
              title={tenantName}
              subtitle={`@${tenantSlugName}`}
              showSeparator={false}
            />
          </div>
        </DsCard>

        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
            Apariencia
          </p>
          <ThemeToggle />
        </DsCard>

        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
            Soporte
          </p>
          <div className="flex flex-col">
            <DsListItem
              icon={<HelpCircle size={20} />}
              title="Centro de ayuda"
              subtitle="Preguntas frecuentes y soporte"
              chevron
            />
            <DsListItem
              icon={<FileText size={20} />}
              title="Documentación"
              subtitle="Guías y tutoriales de uso"
              chevron
              showSeparator={false}
            />
          </div>
        </DsCard>

        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-3">
            Preguntas Frecuentes
          </p>
          <div className="flex flex-col">
            {[
              {
                q: "¿Cómo registro un nuevo producto?",
                a: "Ve a Inventario → Nuevo y completa los datos del producto. Puedes escanear el código de barras con la cámara.",
              },
              {
                q: "¿Cómo cierro la caja del día?",
                a: "Ve a Finanzas → Cierre de caja y cuenta el efectivo físico. El sistema comparará con el esperado.",
              },
              {
                q: "¿Puedo usar la app sin internet?",
                a: "Sí, las ventas se guardan localmente y se sincronizan cuando recuperes la conexión.",
              },
            ].map((faq, i, arr) => (
              <div key={i}>
                <button
                  onClick={() => setShowFaq(showFaq === faq.q ? null : faq.q)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
                    {faq.q}
                  </span>
                  {showFaq === faq.q ? (
                    <ChevronUp size={20} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                  )}
                </button>
                {showFaq === faq.q && (
                  <p className="text-sm text-gray-600 dark:text-zinc-400 pb-4">
                    {faq.a}
                  </p>
                )}
                {i < arr.length - 1 && (
                  <div className="border-t border-gray-100 dark:border-zinc-800" />
                )}
              </div>
            ))}
          </div>
        </DsCard>

        <DsButton variant="destructive" onClick={() => setShowLogout(true)}>
          <LogOut size={20} />
          CERRAR SESIÓN
        </DsButton>

        <DsModal
          open={showLogout}
          onClose={() => setShowLogout(false)}
          title="¿Cerrar sesión?"
          subtitle="Tendrás que volver a iniciar sesión para acceder"
          size="sm"
        >
          <div className="flex flex-col gap-3">
            <DsButton variant="secondary" onClick={() => setShowLogout(false)}>
              CANCELAR
            </DsButton>
            <DsButton variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
              CERRAR SESIÓN
            </DsButton>
          </div>
        </DsModal>
      </div>
    </main>
  );
}
