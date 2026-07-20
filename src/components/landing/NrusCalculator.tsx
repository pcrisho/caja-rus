"use client";

import { useState } from "react";
import { Calculator, ShieldCheck, AlertTriangle, TrendingUp, Info, Plus, Minus } from "lucide-react";

function formatMoney(amount: number): string {
  return "S/ " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function NrusCalculator() {
  const [monthlySales, setMonthlySales] = useState<number>(3800);

  const cat1Limit = 5000;
  const cat2Limit = 8000;

  let categoryName = "CATEGORÍA 1";
  let sunatFee = "S/ 20.00";
  let statusColor = "emerald";
  let percentage = 0;
  let statusText = "MARGEN SEGURO · CATEGORÍA 1";
  let statusMessage =
    "Excelente. Estás dentro del tope de S/ 5,000 acumulados al mes para la Categoría 1 del NRUS.";

  if (monthlySales <= cat1Limit) {
    categoryName = "CATEGORÍA 1";
    sunatFee = "S/ 20.00";
    percentage = Math.round((monthlySales / cat1Limit) * 100);

    if (percentage >= 85) {
      statusColor = "amber";
      statusText = "ALERTA PREVENTIVA · CERCA AL LÍMITE CAT 1";
      statusMessage =
        "Te aproximas a los S/ 5,000 del mes. CajaRUS te avisará con tiempo para programar tus compras.";
    } else {
      statusColor = "emerald";
    }
  } else if (monthlySales <= cat2Limit) {
    categoryName = "CATEGORÍA 2";
    sunatFee = "S/ 50.00";
    percentage = Math.round((monthlySales / cat2Limit) * 100);

    if (percentage >= 85) {
      statusColor = "amber";
      statusText = "ALERTA PREVENTIVA · CERCA AL TOPE ABSOLUTO NRUS";
      statusMessage =
        "Estás cerca de los S/ 8,000 al mes. Si los superas, deberás cambiar al Régimen MIPE Tributario.";
    } else {
      statusColor = "emerald";
      statusText = "CATEGORÍA 2 · HASTA S/ 8,000/MES";
      statusMessage =
        "Tus ventas encajan en la Categoría 2. Tu cuota fija mensual declarada ante SUNAT es de S/ 50.00.";
    }
  } else {
    categoryName = "EXCEDE NRUS";
    sunatFee = "MIPE / RER";
    percentage = 100;
    statusColor = "red";
    statusText = "EXCEDE LÍMITE MÁXIMO NRUS (S/ 8,000)";
    statusMessage =
      "Superas el monto máximo permitido para el Nuevo RUS. Se requiere declarar en Régimen MIPE o Especial.";
  }

  const handleIncrement = () => {
    setMonthlySales((prev) => Math.min(prev + 500, 9500));
  };

  const handleDecrement = () => {
    setMonthlySales((prev) => Math.max(prev - 500, 500));
  };

  return (
    <section id="calculadora-nrus" className="py-16 sm:py-24 bg-white border-b-2 border-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-900 rounded-md px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
            <Calculator className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
            <span>SIMULADOR FINANCIERO SUNAT</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase">
            CALCULA TU CUOTA MENSUAL ANTE LA SUNAT
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mt-2 font-medium">
            Ajusta tus ventas estimadas usando los botones o el deslizador y verifica tu categoría en tiempo real.
          </p>
        </div>

        {/* Industrial Dashboard Panel */}
        <div className="bg-white border-2 border-gray-900 rounded-xl p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            {/* Sales Input Slider & Quick Touch Buttons */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2 mb-3">
                <label htmlFor="sales-slider" className="text-xs font-black tracking-widest uppercase text-gray-600">
                  VENTAS ACUMULADAS ESTIMADAS EN EL MES:
                </label>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
                  {formatMoney(monthlySales)}
                </span>
              </div>

              {/* Range Slider + Plus/Minus Controls */}
              <div className="flex items-center gap-3 my-2">
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Disminuir ventas en 500 soles"
                  className="w-11 h-11 rounded-lg bg-white border-2 border-gray-400 text-gray-900 font-bold flex items-center justify-center active:bg-gray-200 active:scale-95 transition-all shrink-0 touch-manipulation cursor-pointer"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <input
                  id="sales-slider"
                  type="range"
                  min="500"
                  max="9500"
                  step="250"
                  value={monthlySales}
                  aria-valuemin={500}
                  aria-valuemax={9500}
                  aria-valuenow={monthlySales}
                  aria-valuetext={`S/ ${monthlySales} soles al mes`}
                  onChange={(e) => setMonthlySales(Number(e.target.value))}
                  className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 touch-manipulation"
                />

                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Aumentar ventas en 500 soles"
                  className="w-11 h-11 rounded-lg bg-white border-2 border-gray-400 text-gray-900 font-bold flex items-center justify-center active:bg-gray-200 active:scale-95 transition-all shrink-0 touch-manipulation cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              {/* Quick Preset Touch Pills for Mobile */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 mt-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">PREAJUSTES:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[2500, 4500, 6500, 8500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMonthlySales(preset)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors touch-manipulation ${
                        monthlySales === preset
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {formatMoney(preset)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Industrial Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Metric Card 1 */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
                <span className="text-[11px] font-black tracking-widest uppercase text-gray-500">
                  CATEGORÍA SUNAT ASIGNADA
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono mt-2">{categoryName}</span>
                <span className="text-[11px] font-bold text-gray-600 mt-2 border-t border-gray-200 pt-2">
                  {monthlySales <= cat1Limit ? "HASTA S/ 5,000 AL MES" : monthlySales <= cat2Limit ? "HASTA S/ 8,000 AL MES" : "MAYOR A S/ 8,000 AL MES"}
                </span>
              </div>

              {/* Metric Card 2 */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
                <span className="text-[11px] font-black tracking-widest uppercase text-gray-500">
                  CUOTA FIJA MENSUAL SUNAT
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-2">{sunatFee}</span>
                <span className="text-[11px] font-bold text-gray-600 mt-2 border-t border-gray-200 pt-2">
                  PAGO OBLIGATORIO MENSUAL A SUNAT
                </span>
              </div>
            </div>

            {/* Simulated Termómetro NRUS */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-gray-900">
                  <TrendingUp className="w-4 h-4 text-gray-900 stroke-[2.5]" />
                  MARGEN DE SEGURIDAD NRUS
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                    statusColor === "emerald"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                      : statusColor === "amber"
                      ? "bg-amber-100 text-amber-900 border border-amber-400"
                      : "bg-red-100 text-red-900 border border-red-400"
                  }`}
                >
                  {percentage}% DEL LÍMITE
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-gray-200 rounded h-4 overflow-hidden border border-gray-300">
                <div
                  className={`h-full transition-all duration-300 ${
                    statusColor === "emerald"
                      ? "bg-emerald-700"
                      : statusColor === "amber"
                      ? "bg-amber-600"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              {/* Status Message */}
              <div
                className={`p-3.5 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 font-medium ${
                  statusColor === "emerald"
                    ? "bg-emerald-50 text-emerald-950 border border-emerald-300"
                    : statusColor === "amber"
                    ? "bg-amber-50 text-amber-950 border border-amber-300"
                    : "bg-red-50 text-red-950 border border-red-300"
                }`}
              >
                {statusColor === "emerald" ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 stroke-[2.5]" />
                )}
                <span>
                  <b className="uppercase tracking-wider">{statusText}:</b> {statusMessage}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-800 bg-gray-100 border border-gray-300 rounded-lg p-3 font-medium">
              <Info className="w-4 h-4 text-gray-900 shrink-0 stroke-[2.5]" />
              <span>
                <b>¿SABÍAS QUE?</b> Las compras que realizas a tus distribuidores tienen los mismos topes (S/ 5,000 o S/ 8,000 al mes). CajaRUS monitorea ventas y compras para protegerte en ambos frentes.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
