"use client";

import { useState } from "react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsButton } from "@/components/design-system/DsButton";
import { DsListItem } from "@/components/design-system/DsListItem";
import { DsTabs } from "@/components/design-system/DsTabs";
import { DsToggle } from "@/components/design-system/DsToggle";
import { DsModal } from "@/components/design-system/DsModal";
import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function SettingsPreview() {
  const [activeTab, setActiveTab] = useState("general");
  const [showFaq, setShowFaq] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [publicStats, setPublicStats] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Ajustes
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Configuración
          </h1>
        </header>

        {/* Tabs */}
        <DsTabs
          tabs={[
            { id: "general", label: "GENERAL" },
            { id: "billing", label: "FACTURACIÓN" },
            { id: "goals", label: "METAS" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          fullWidth
        />

        {/* Account section */}
        <DsCard>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
            Cuenta
          </p>
          <div className="flex flex-col">
            <DsListItem
              icon={<Settings size={20} />}
              title="Perfil"
              subtitle="Administra tu información personal"
              chevron
            />
            <DsListItem
              icon={<Bell size={20} />}
              title="Notificaciones"
              subtitle="Configura alertas y avisos"
              chevron
            />
            <DsListItem
              icon={<Shield size={20} />}
              title="Seguridad"
              subtitle="Contraseña y verificación en dos pasos"
              chevron
              showSeparator={false}
            />
          </div>
        </DsCard>

        {/* Preferences */}
        <DsCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">
                Preferencias
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Administra tus ajustes y notificaciones
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <DsToggle
              label="Modo oscuro"
              description="Cambia la apariencia de la app"
              checked={darkMode}
              onChange={setDarkMode}
            />
            <div className="border-t border-gray-100 dark:border-zinc-800" />
            <DsToggle
              label="Estadísticas públicas"
              description="Permite que otros vean tu actividad"
              checked={publicStats}
              onChange={setPublicStats}
            />
            <div className="border-t border-gray-100 dark:border-zinc-800" />
            <DsToggle
              label="Notificaciones por email"
              description="Reportes mensuales de ventas"
              checked={emailNotifs}
              onChange={setEmailNotifs}
            />
          </div>
        </DsCard>

        {/* Support */}
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

        {/* FAQ */}
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

        {/* Logout */}
        <DsButton variant="destructive" onClick={() => setShowLogout(true)}>
          <LogOut size={20} className="mr-2" />
          CERRAR SESIÓN
        </DsButton>

        {/* Logout modal */}
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
            <DsButton variant="destructive" onClick={() => setShowLogout(false)}>
              CERRAR SESIÓN
            </DsButton>
          </div>
        </DsModal>
      </div>
    </main>
  );
}
