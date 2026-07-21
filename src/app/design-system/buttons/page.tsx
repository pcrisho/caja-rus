import { DsButton } from "@/components/design-system/DsButton";
import { DsCard } from "@/components/design-system/DsCard";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export default function ButtonsPage() {
  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Design System
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Botones
          </h1>
        </header>

        {/* Primary */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Primario
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsButton variant="primary">COBRAR</DsButton>
              <DsButton variant="primary" size="md">GUARDAR</DsButton>
              <DsButton variant="primary" icon={<Save size={20} />}>
                CONFIRMAR VENTA
              </DsButton>
              <DsButton variant="primary" disabled>DESHABILITADO</DsButton>
            </div>
          </DsCard>
        </section>

        {/* Secondary */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Secundario
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsButton variant="secondary">CANCELAR</DsButton>
              <DsButton variant="secondary" size="md">VER MÁS</DsButton>
              <DsButton variant="secondary" icon={<ArrowLeft size={20} />}>
                VOLVER
              </DsButton>
            </div>
          </DsCard>
        </section>

        {/* Destructive */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Destructivo
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsButton variant="destructive">ELIMINAR</DsButton>
              <DsButton variant="destructive" icon={<Trash2 size={20} />}>
                ANULAR VENTA
              </DsButton>
            </div>
          </DsCard>
        </section>

        {/* With icons */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Con Iconos
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsButton icon={<Plus size={20} />}>NUEVO PRODUCTO</DsButton>
              <DsButton variant="secondary" icon={<ArrowLeft size={20} />}>
                INVENTARIO
              </DsButton>
            </div>
          </DsCard>
        </section>

        {/* Full width vs auto */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Ancho
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsButton fullWidth={false}>ANCHO AUTO</DsButton>
              <DsButton>ANCHO COMPLETO</DsButton>
            </div>
          </DsCard>
        </section>
      </div>
    </main>
  );
}
