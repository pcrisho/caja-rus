import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Barcode,
  Zap,
  Check,
  Building2,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-gray-100 pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden border-b-2 border-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Main Column: Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            {/* Technical Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 border-2 border-emerald-400 text-emerald-900 rounded-md px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase">
              <span className="flex h-2 w-2 rounded-full bg-emerald-700"></span>
              <span>SISTEMA POS BODEGA · NRUS SUNAT PERÚ</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              EL CONTROL DE TU BODEGA, <br className="hidden sm:inline" />
              <span className="bg-emerald-700 text-white px-2 py-0.5 inline-block mt-1">
                AL TOQUE.
              </span>
            </h1>

            {/* Subhead / Value Prop */}
            <p className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed max-w-2xl">
              Sin cuadernos manchados, sin descuadres de dinero al fin del día y sin miedo a las entidades fiscales. Registra ventas en segundos con tu celular, controla tu inventario y gestiona tu bodega sin estrés.
            </p>

            {/* Key Value Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 uppercase tracking-wide bg-white border border-gray-300 px-3 py-2 rounded-lg">
                <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Gestión Ultra Rápida</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 uppercase tracking-wide bg-white border border-gray-300 px-3 py-2 rounded-lg">
                <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Alertas Preventivas de NRUS SUNAT</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 uppercase tracking-wide bg-white border border-gray-300 px-3 py-2 rounded-lg">
                <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Lectura de Facturas con Foto</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 uppercase tracking-wide bg-white border border-gray-300 px-3 py-2 rounded-lg">
                <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Cierres de Caja ágiles</span>
              </div>
            </div>

            {/* Action Buttons (XXL 56px height per DESIGN.md) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-3">
              <a
                href="/register"
                className="w-full sm:w-auto bg-emerald-700 text-white rounded-lg py-4 px-8 text-sm font-bold uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform cursor-pointer text-center flex items-center justify-center gap-3 border-2 border-emerald-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 min-h-[56px]"
              >
                REGISTRARSE
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </a>

              <a
                href="/login"
                className="w-full sm:w-auto bg-white border-2 border-gray-900 rounded-lg py-4 px-8 text-sm font-bold uppercase tracking-wider text-gray-900 hover:bg-gray-900 hover:text-white active:scale-95 transition-transform cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 min-h-[56px] flex items-center justify-center"
              >
                INGRESAR
              </a>
            </div>

            {/* Guarantee Note */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 pt-1">
              <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
              <span>Configuración asistida en 5 min · 100% Mobile-First</span>
            </div>
          </div>

          {/* Right Column: Industrial POS Terminal Mockup */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-gray-900 rounded-2xl p-3 border-4 border-gray-900 shadow-2xl">
              {/* Phone Screen Container */}
              <div className="bg-white rounded-xl overflow-hidden pt-3 pb-3 px-3 flex flex-col gap-3 border border-gray-300">
                {/* Header Terminal */}
                <div className="bg-gray-900 text-white p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-emerald-700 flex items-center justify-center font-bold text-xs">
                      POS
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">BODEGA ACTIVA</p>
                      <p className="text-xs font-bold leading-tight uppercase">DON LUCHO · LOS OLIVOS</p>
                    </div>
                  </div>
                  <span className="bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
                    EN LÍNEA
                  </span>
                </div>

                {/* Industrial Dashboard Widget: NRUS Thermometer */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-gray-700 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-900 stroke-[2.5]" />
                      LÍMITE SUNAT NRUS
                    </span>
                    <span className="text-emerald-800 font-mono bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                      CAT 1 (S/ 5,000)
                    </span>
                  </div>

                  <div className="bg-gray-200 rounded h-3 overflow-hidden border border-gray-300">
                    <div
                      className="bg-emerald-700 h-full rounded-sm"
                      style={{ width: "62%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-gray-800">
                    <span>ACUMULADO: <b>S/ 3,100</b></span>
                    <span className="text-emerald-800 font-bold">MARGEN: S/ 1,900 OK</span>
                  </div>
                </div>

                {/* Quick Sale Cart Container */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b-2 border-gray-200 pb-1.5">
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-1">
                      <Barcode className="w-4 h-4 text-gray-700 stroke-[2.5]" />
                      CARRITO DE VENTA
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      3 ITEMS
                    </span>
                  </div>

                  {/* Cart Items */}
                  <div className="flex flex-col gap-1 text-[11px] font-mono">
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                      <span className="font-bold text-gray-800">2x LECHE GLORIA AZUL 400G</span>
                      <span className="font-extrabold text-gray-900">S/ 9.60</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                      <span className="font-bold text-gray-800">1x PAN MOLDE BIMBO 500G</span>
                      <span className="font-extrabold text-gray-900">S/ 7.50</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="font-bold text-gray-800">1x GASEOSA INKA KOLA 1.5L</span>
                      <span className="font-extrabold text-gray-900">S/ 6.20</span>
                    </div>
                  </div>

                  {/* Payment Method Selector Chips */}
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <span className="text-center bg-gray-900 text-white rounded py-1 text-[10px] font-bold uppercase tracking-wider">
                      YAPE / PLIN
                    </span>
                    <span className="text-center bg-white border border-gray-400 text-gray-900 rounded py-1 text-[10px] font-bold uppercase tracking-wider">
                      EFECTIVO
                    </span>
                    <span className="text-center bg-white border border-gray-400 text-gray-900 rounded py-1 text-[10px] font-bold uppercase tracking-wider">
                      TARJETA
                    </span>
                  </div>

                  {/* Total & Charge Button */}
                  <div className="pt-1 border-t-2 border-gray-200">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">TOTAL</span>
                      <span className="text-xl font-black text-gray-900 font-mono">S/ 23.30</span>
                    </div>
                    <div className="w-full bg-emerald-700 text-white rounded-lg py-2.5 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-900">
                      <Zap className="w-4 h-4 stroke-[3]" />
                      COBRAR S/ 23.30
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
