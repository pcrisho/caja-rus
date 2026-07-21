import Link from "next/link";
import { ArrowRight, Sparkles, Check, ShieldCheck } from "lucide-react";

export function RegisterCtaSection() {
  return (
    <section id="registro" className="py-16 sm:py-24 bg-gray-100 dark:bg-zinc-800 border-b-2 border-gray-300 dark:border-zinc-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-zinc-950  p-6 sm:p-10 text-center flex flex-col items-center gap-6">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900  px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span className="text-emerald-500">ACCESO INMEDIATO AL MVP</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase max-w-2xl">
            REGISTRA TU BODEGA EN 3 PASOS SENCILLOS Y EMPIEZA HOY
          </h2>

          <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 font-medium max-w-xl">
            Sin formularios interminables ni colas de espera. Configura tu negocio en menos de 5 minutos y toma el control de tus ventas y del NRUS SUNAT.
          </p>

          {/* Quick Step Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left my-2">
            <div className="bg-gray-50 dark:bg-zinc-900 p-3  flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">PASO 01</span>
              <p className="text-xs font-bold text-gray-900 dark:text-zinc-50 uppercase">Tus datos personales</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-900 p-3  flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">PASO 02</span>
              <p className="text-xs font-bold text-gray-900 dark:text-zinc-50 uppercase">Nombre de tu bodega</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-900 p-3  flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">PASO 03</span>
              <p className="text-xs font-bold text-gray-900 dark:text-zinc-50 uppercase">Acceso con Google o Clave</p>
            </div>
          </div>

          {/* Register CTA Button XXL (56px) */}
          <Link
            href="/register"
            className="w-full sm:w-auto bg-emerald-700 text-white  py-4 px-10 text-sm font-black font-mono uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform cursor-pointer min-h-[56px] flex items-center justify-center gap-3"
          >
            REGISTRAR MI BODEGA AHORA
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
            <span>100% Gratuito durante el lanzamiento del MVP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
