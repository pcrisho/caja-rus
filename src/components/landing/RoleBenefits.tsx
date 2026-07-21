import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";

export function RoleBenefits() {
  return (
    <section id="beneficios" className="py-16 sm:py-24 bg-gray-100 dark:bg-zinc-800 border-b-2 border-gray-300 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-gray-200 border border-gray-400 text-gray-900 dark:text-zinc-50 rounded-md px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
            <HeartHandshake className="w-4 h-4 text-gray-900 dark:text-zinc-50 stroke-[2.5]" />
            <span>ROLES Y PERMISOS DE USUARIO</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase">
            BENEFICIOS A LA MEDIDA DE QUIEN OPERA LA BODEGA
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 mt-2 font-medium">
            Herramientas diferenciadas tanto si supervisas el negocio como si atiendes en caja.
          </p>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dueño / Administrador */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 sm:p-8 border-2 border-gray-300 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-zinc-800">
                <div className="w-11 h-11 rounded-lg bg-gray-900 text-white flex items-center justify-center border border-gray-900">
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-zinc-400">ROL 01</span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-zinc-50 uppercase">ADMINISTRADOR / DUEÑO</h3>
                </div>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-gray-800 dark:text-zinc-100 font-medium">
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Control Total de Ganancias:</b> Resumen del día, márgenes reales y rentabilidad acumulada en tiempo real.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Alertas Preventivas SUNAT:</b> Cero multas o traspasos de categoría involuntarios.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Ingreso de Facturas por Foto (OCR):</b> Registra comprobantes de distribuidores fotografiando la factura física.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Auditoría y Mermas:</b> Supervisa anulaciones de venta, productos vencidos y rendimiento de cajeros.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Cajero / Operador */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 sm:p-8 border-2 border-gray-300 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-zinc-800">
                <div className="w-11 h-11 rounded-lg bg-emerald-700 text-white flex items-center justify-center border border-emerald-900">
                  <Zap className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-800">ROL 02</span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-zinc-50 uppercase">OPERADOR / CAJERO</h3>
                </div>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-gray-800 dark:text-zinc-100 font-medium">
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>POS Ultra Rápido a una Mano:</b> Cobro ágil con el pulgar para no demorar la atención al cliente.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Consulta Inmediata de Precios:</b> Encuentra cualquier producto por código de barras o buscador nítido.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Pagos Mixtos y Billeteras:</b> Registra en un toque cobros con Yape, Plin, Efectivo o Tarjeta.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>
                    <b>Cierre de Caja Transparente:</b> Conteo sencillo al terminar el turno con reporte claro sin descuadres.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
