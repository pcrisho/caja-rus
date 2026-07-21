"use client";

import { useState } from "react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsModal } from "@/components/design-system/DsModal";
import { DsButton } from "@/components/design-system/DsButton";
import { DsInput } from "@/components/design-system/DsInput";
import { DsSelect } from "@/components/design-system/DsSelect";
import { DsListItem } from "@/components/design-system/DsListItem";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsProgressBar } from "@/components/design-system/DsProgressBar";
import { DollarSign, CreditCard, Calendar } from "lucide-react";

export default function ModalsPage() {
  const [showBasic, setShowBasic] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Design System
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Modales
          </h1>
        </header>

        {/* Trigger buttons */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Tipos de Modal
          </h2>
          <DsCard>
            <div className="flex flex-col gap-3">
              <DsButton onClick={() => setShowBasic(true)}>
                MODAL BÁSICO
              </DsButton>
              <DsButton variant="secondary" onClick={() => setShowForm(true)}>
                MODAL CON FORMULARIO
              </DsButton>
              <DsButton variant="secondary" onClick={() => setShowConfirm(true)}>
                MODAL DE CONFIRMACIÓN
              </DsButton>
              <DsButton variant="secondary" onClick={() => setShowTransfer(true)}>
                MODAL DE TRANSFERENCIA
              </DsButton>
            </div>
          </DsCard>
        </section>

        {/* Basic modal */}
        <DsModal
          open={showBasic}
          onClose={() => setShowBasic(false)}
          title="Información"
          subtitle="Detalles de la transacción"
        >
          <div className="flex flex-col gap-4">
            <p className="text-base text-gray-700 dark:text-zinc-300">
              Esta es una ventana modal básica con información. Puedes cerrarla haciendo clic en el botón X o fuera de la modal.
            </p>
            <DsButton onClick={() => setShowBasic(false)}>ENTENDIDO</DsButton>
          </div>
        </DsModal>

        {/* Form modal */}
        <DsModal
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Nuevo Producto"
          subtitle="Agrega un producto a tu inventario"
        >
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <DsInput
              label="Nombre"
              placeholder="Ej: Aceite vegetal 1L"
            />
            <DsInput
              label="Precio de venta"
              placeholder="0.00"
              icon={<DollarSign size={20} />}
            />
            <DsSelect
              label="Tipo de unidad"
              options={[
                { value: "UNIT", label: "Por unidad" },
                { value: "KG", label: "Por kilogramo" },
              ]}
            />
            <div className="flex gap-3">
              <DsButton variant="secondary" fullWidth onClick={() => setShowForm(false)}>
                CANCELAR
              </DsButton>
              <DsButton fullWidth>GUARDAR</DsButton>
            </div>
          </form>
        </DsModal>

        {/* Confirm modal */}
        <DsModal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          title="¿Anular venta?"
          subtitle="Esta acción no se puede deshacer"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <DsAlert
              variant="error"
              message="La venta #1234 por S/ 450.00 será anulada permanentemente."
            />
            <div className="flex gap-3">
              <DsButton variant="secondary" fullWidth onClick={() => setShowConfirm(false)}>
                CANCELAR
              </DsButton>
              <DsButton variant="destructive" fullWidth onClick={() => setShowConfirm(false)}>
                ANULAR VENTA
              </DsButton>
            </div>
          </div>
        </DsModal>

        {/* Transfer modal */}
        <DsModal
          open={showTransfer}
          onClose={() => setShowTransfer(false)}
          title="Transferir Fondos"
          subtitle="Mueve dinero entre tus cuentas conectadas"
        >
          <div className="flex flex-col gap-4">
            <DsInput
              label="Monto a transferir"
              placeholder="0.00"
              icon={<DollarSign size={20} />}
            />
            <DsSelect
              label="Cuenta origen"
              options={[
                { value: "checking", label: "Cuenta Corriente (•8402) — S/ 12,450.00" },
                { value: "savings", label: "Ahorro (•1192) — S/ 42,100.00" },
              ]}
            />
            <DsSelect
              label="Cuenta destino"
              options={[
                { value: "savings", label: "Ahorro (•1192) — S/ 42,100.00" },
                { value: "checking", label: "Cuenta Corriente (•8402) — S/ 12,450.00" },
              ]}
            />

            <DsCard variant="bordered">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-zinc-400">Llegada estimada</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-50">Hoy, Abr 14</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-zinc-400">Comisión</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-50">S/ 0.00</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-zinc-700 my-1" />
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900 dark:text-zinc-50">Total</span>
                  <span className="text-base font-bold text-gray-900 dark:text-zinc-50">S/ 1,200.00</span>
                </div>
              </div>
            </DsCard>

            <DsButton onClick={() => setShowTransfer(false)}>
              CONFIRMAR TRANSFERENCIA
            </DsButton>
          </div>
        </DsModal>
      </div>
    </main>
  );
}
