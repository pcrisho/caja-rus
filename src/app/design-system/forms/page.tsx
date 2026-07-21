"use client";

import { useState } from "react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsInput } from "@/components/design-system/DsInput";
import { DsSelect } from "@/components/design-system/DsSelect";
import { DsButton } from "@/components/design-system/DsButton";
import { DsChip } from "@/components/design-system/DsChip";
import { Search, DollarSign, UploadCloud } from "lucide-react";

export default function FormsPage() {
  const [activeChip, setActiveChip] = useState("cash");

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Design System
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
            Formularios
          </h1>
        </header>

        {/* Basic inputs */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Inputs
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsInput
                label="Nombre del producto"
                placeholder="Ej: Aceite vegetal 1L"
              />
              <DsInput
                label="Precio"
                placeholder="0.00"
                icon={<DollarSign size={20} />}
              />
              <DsInput
                label="Buscar"
                placeholder="Buscar por nombre o código..."
                icon={<Search size={20} />}
              />
              <DsInput
                label="Con error"
                placeholder="Valor inválido"
                error="Este campo es obligatorio"
              />
            </div>
          </DsCard>
        </section>

        {/* Selects */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Selects
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <DsSelect
                label="Moneda"
                options={[
                  { value: "PEN", label: "Soles (PEN)" },
                  { value: "USD", label: "Dólares (USD)" },
                ]}
              />
              <DsSelect
                label="Tipo de producto"
                options={[
                  { value: "UNIT", label: "Por unidad" },
                  { value: "KG", label: "Por kilogramo" },
                ]}
              />
            </div>
          </DsCard>
        </section>

        {/* Chips */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Chips / Tags
          </h2>
          <DsCard>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <DsChip variant="default">Todos</DsChip>
                <DsChip variant="active">Efectivo</DsChip>
                <DsChip variant="warning">Stock bajo</DsChip>
                <DsChip variant="danger">Agotado</DsChip>
                <DsChip variant="success">Disponible</DsChip>
              </div>
              <div className="flex flex-wrap gap-2">
                <DsChip
                  variant={activeChip === "cash" ? "active" : "default"}
                  onClick={() => setActiveChip("cash")}
                  className="cursor-pointer"
                >
                  Efectivo
                </DsChip>
                <DsChip
                  variant={activeChip === "yape" ? "active" : "default"}
                  onClick={() => setActiveChip("yape")}
                  className="cursor-pointer"
                >
                  Yape
                </DsChip>
                <DsChip
                  variant={activeChip === "plin" ? "active" : "default"}
                  onClick={() => setActiveChip("plin")}
                  className="cursor-pointer"
                >
                  Plin
                </DsChip>
                <DsChip
                  variant={activeChip === "card" ? "active" : "default"}
                  onClick={() => setActiveChip("card")}
                  className="cursor-pointer"
                >
                  Tarjeta
                </DsChip>
              </div>
            </div>
          </DsCard>
        </section>

        {/* File upload */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            File Upload
          </h2>
          <DsCard>
            <div className="border-2">
              <div className="w-12 h-12 rounded-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-zinc-50 mb-1">
                SUBIR ARCHIVOS
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
                PNG, JPG, PDF hasta 10MB
              </p>
              <DsButton variant="primary" size="md" fullWidth={false}>
                EXPLORAR
              </DsButton>
            </div>
          </DsCard>
        </section>

        {/* Complete form */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Formulario Completo
          </h2>
          <DsCard>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <DsInput
                label="Nombre del producto"
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
              <DsButton type="submit">GUARDAR PRODUCTO</DsButton>
            </form>
          </DsCard>
        </section>
      </div>
    </main>
  );
}
