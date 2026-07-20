import { XCircle, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-16 sm:py-24 bg-white border-b-2 border-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 border-2 border-amber-400 text-amber-900 rounded-md px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-800 stroke-[2.5]" />
            <span>DIAGNÓSTICO OPERATIVO</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase">
            EL CONTROL DE TU BODEGA NO DEBE SER UN DOLOR DE CABEZA
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mt-2 font-medium">
            Compara el día a día tradicional frente a la eficiencia del sistema CajaRUS.
          </p>
        </div>

        {/* Side-by-side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Traditional Way */}
          <div className="bg-white border-2 border-red-300 rounded-xl p-6 sm:p-8 flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b-2 border-red-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 border border-red-300 flex items-center justify-center font-black text-lg">
                  ✕
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-red-700">MÉTODO MANUAL</span>
                  <h3 className="text-xl font-bold text-gray-900 uppercase">LA BODEGA TRADICIONAL</h3>
                </div>
              </div>
            </div>

            <ul className="flex flex-col gap-4 text-sm sm:text-base text-gray-900 font-medium">
              <li className="flex items-start gap-3 bg-red-50/50 p-3 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Descuadres de caja a las 10 PM:</b> Dudas constantes sobre vuelto mal entregado o billetes olvidados.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-red-50/50 p-3 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Perder ventas por agotados:</b> Descubres que falta aceite o leche cuando el cliente ya está al frente.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-red-50/50 p-3 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Susto constante con la SUNAT:</b> Desconocimiento del acumulado mensual y riesgo de multas NRUS.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-red-50/50 p-3 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Cuadernos manchados o perdidos:</b> Horas anotando precios a mano y buscando comprobantes viejos.
                </span>
              </li>
            </ul>
          </div>

          {/* Card: CajaRUS Solution */}
          <div className="bg-white border-2 border-emerald-400 rounded-xl p-6 sm:p-8 flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b-2 border-emerald-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-lg">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-800">SISTEMA POS DIGITAL</span>
                  <h3 className="text-xl font-bold text-gray-900 uppercase">LA BODEGA CON CAJARUS</h3>
                </div>
              </div>
              <span className="bg-emerald-700 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                RECOMENDADO
              </span>
            </div>

            <ul className="flex flex-col gap-4 text-sm sm:text-base text-gray-900 font-medium">
              <li className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Cierre de caja exacto en 1 minuto:</b> Desglose nítido de lo cobrado en Efectivo, Yape, Plin y Tarjeta.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Inventario y alertas de stock:</b> El sistema descuenta productos solos y te avisa antes de agotar productos clave.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Termómetro NRUS SUNAT:</b> Supervisión en tiempo real del límite acumulado del mes sin sorpresas.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  <b>Lectura de facturas por foto (OCR):</b> Ingreso automático de compras fotografiando la factura física.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
