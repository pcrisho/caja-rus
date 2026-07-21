"use client";

import { useActionState } from "react";
import { submitLeadAction, SubmitLeadResult } from "@/actions/lead-action";
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

const initialState: SubmitLeadResult = {
  success: false,
  message: "",
};

export function LeadFormSection() {
  const [state, formAction, isPending] = useActionState(submitLeadAction, initialState);

  return (
    <section id="registro" className="py-16 sm:py-24 bg-gray-100 dark:bg-zinc-800 border-b-2 border-gray-300 dark:border-zinc-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-zinc-950  p-6 sm:p-10">
          {/* Form Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900  px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
              <Sparkles className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              <span>CONFIGURACIÓN ASISTIDA EN 5 MIN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase">
              SOLICITA TU DEMO GRATUITA DE CAJARUS
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 mt-2 font-medium">
              Completa tus datos y un especialista te ayudará a configurar tu bodega sin compromiso.
            </p>
          </div>

          {/* Feedback Banners */}
          {state.message && (
            <div
              role={state.success ? "status" : "alert"}
              aria-live="polite"
              className={`mb-8 p-4  text-sm flex items-start gap-3 font-medium ${
                state.success
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-950"
                  : "bg-red-100 dark:bg-red-900/30 border-red-400 text-red-950"
              }`}
            >
              {state.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-800 shrink-0 mt-0.5 stroke-[2.5]" />
              )}
              <div>
                <p className="font-black uppercase tracking-wider text-xs">{state.success ? "¡SOLICITUD REGISTRADA!" : "ATENCIÓN"}</p>
                <p className="text-sm mt-0.5">{state.message}</p>
              </div>
            </div>
          )}

          {/* Form Element */}
          {state.success ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20  p-8 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14  bg-emerald-700 text-white flex items-center justify-center font-black text-2xl border border-emerald-900">
                ✓
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tabular-nums uppercase">¡GRACIAS POR REGISTRARTE!</h3>
              <p className="text-base text-gray-800 dark:text-zinc-100 font-medium max-w-lg">
                Te contactaremos al toque por WhatsApp para activar tu demo asistida de CajaRUS.
              </p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Field 1: Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-100">
                    Nombres y Apellidos <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    aria-invalid={Boolean(state.errors?.name)}
                    aria-describedby={state.errors?.name ? "name-error" : undefined}
                    placeholder="EJ. JUAN PÉREZ"
                    className="w-full bg-transparent border-b border-gray-200 py-3 px-0 text-base font-medium text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 uppercase placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-colors"
                  />
                  {state.errors?.name && (
                    <span id="name-error" className="text-xs font-bold text-red-700">{state.errors.name}</span>
                  )}
                </div>

                {/* Field 2: Bodega Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bodegaName" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-100">
                    Nombre de tu Bodega / Comercial
                  </label>
                  <input
                    id="bodegaName"
                    name="bodegaName"
                    type="text"
                    placeholder="EJ. BODEGA DON JUAN"
                    className="w-full bg-transparent border-b border-gray-200 py-3 px-0 text-base font-medium text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 uppercase placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Field 3: Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-100">
                    Celular / WhatsApp <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    aria-invalid={Boolean(state.errors?.phone)}
                    aria-describedby={state.errors?.phone ? "phone-error" : undefined}
                    placeholder="EJ. 987 654 321"
                    className="w-full bg-transparent border-b border-gray-200 py-3 px-0 text-base font-medium text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 font-mono transition-colors"
                  />
                  {state.errors?.phone && (
                    <span id="phone-error" className="text-xs font-bold text-red-700">{state.errors.phone}</span>
                  )}
                </div>

                {/* Field 4: Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-100">
                    Correo Electrónico <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    aria-invalid={Boolean(state.errors?.email)}
                    aria-describedby={state.errors?.email ? "email-error" : undefined}
                    placeholder="juan@gmail.com"
                    className="w-full bg-transparent border-b border-gray-200 py-3 px-0 text-base font-medium text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 font-mono transition-colors"
                  />
                  {state.errors?.email && (
                    <span id="email-error" className="text-xs font-bold text-red-700">{state.errors.email}</span>
                  )}
                </div>
              </div>

              {/* Field 5: Current System */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="currentSystem" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-100">
                  ¿Cómo llevas el registro de tu bodega actualmente?
                </label>
                <select
                  id="currentSystem"
                  name="currentSystem"
                  defaultValue="cuaderno"
                  className="w-full bg-transparent border-b border-gray-200 py-3 px-0 text-sm font-bold text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 uppercase transition-colors"
                >
                  <option value="cuaderno">Anotando en cuaderno o libreta a mano</option>
                  <option value="excel">En archivo de Excel en computadora</option>
                  <option value="ninguno">De memoria / Todo mentalmente</option>
                  <option value="otro">Otro sistema o punto de venta</option>
                </select>
              </div>

              {/* Field 6: Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="notes" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-100">
                  ¿Tienes alguna duda o consulta específica? (Opcional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full bg-transparent border-b border-gray-200 py-3 px-0 text-sm font-medium text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-colors"
                ></textarea>
              </div>

              {/* XXL Submit Button (56px minimum height per DESIGN.md) */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 text-white py-4 px-6 text-sm font-black font-mono uppercase tracking-wider hover:bg-emerald-700 active:scale-95 transition-transform cursor-pointer min-h-[56px] flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
                    ENVIANDO SOLICITUD...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 stroke-[2.5]" />
                    SOLICITAR DEMO GRATUITA
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-gray-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Tus datos están protegidos · No enviamos spam
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
