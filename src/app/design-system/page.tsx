import Link from "next/link";

const sections = [
  {
    title: "Componentes Base",
    description: "Botones, cards, inputs — los bloques fundamentales",
    items: [
      { label: "Botones", href: "/design-system/buttons" },
      { label: "Cards", href: "/design-system/cards" },
      { label: "Formularios", href: "/design-system/forms" },
    ],
  },
  {
    title: "Navegación",
    description: "Tabs, list items, breadcrumbs — estructura de la app",
    items: [
      { label: "Navegación", href: "/design-system/navigation" },
    ],
  },
  {
    title: "Display de Datos",
    description: "Stats, progress, alerts — cómo se muestra la información",
    items: [
      { label: "Data Display", href: "/design-system/data-display" },
    ],
  },
  {
    title: "Modales",
    description: "Diálogos y overlays — interacciones superficiales",
    items: [
      { label: "Modales", href: "/design-system/modals" },
    ],
  },
  {
    title: "Previews",
    description: "Vistas previas de las pantallas completas del app",
    items: [
      { label: "Dashboard", href: "/design-system/previews/dashboard" },
      { label: "Punto de Venta", href: "/design-system/previews/pos" },
      { label: "Inventario", href: "/design-system/previews/inventory" },
      { label: "Ajustes", href: "/design-system/previews/settings" },
    ],
  },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            CajaRUS
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Design System
          </h1>
          <p className="text-base text-gray-600 dark:text-zinc-400">
            Paleta de componentes con estilo industrial de alto contraste.
            Basado en las referencias de diseño validadas.
          </p>
        </header>

        {/* Color palette quick reference */}
        <section className="bg-white dark:bg-zinc-900 rounded-none p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-4">
            Paleta de Colores
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-emerald-600" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-50">Primario</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">emerald-600</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-blue-900" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-50">Navegación</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">blue-900</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-amber-600" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-50">Advertencia</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">amber-600</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-red-600" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-50">Peligro</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">red-600</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {section.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                {section.description}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white dark:bg-zinc-900"
                >
                  <span className="text-base font-semibold text-gray-900 dark:text-zinc-50">
                    {item.label}
                  </span>
                  <span className="text-gray-400 dark:text-zinc-500">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Design System v1.0 — CajaRUS
          </p>
        </footer>
      </div>
    </main>
  );
}
