"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Necesito estar conectado a internet todo el tiempo para usar CajaRUS?",
      answer:
        "No. CajaRUS está diseñada con tecnología Offline-First. Puedes seguir registrando ventas y consultando precios aun si se cae la señal en tu bodega. En cuanto se restablezca el internet, tus datos se sincronizan solos.",
    },
    {
      question: "¿Cómo me ayuda CajaRUS a controlar el régimen NRUS de la SUNAT?",
      answer:
        "CajaRUS lleva la cuenta acumulada de tus ventas y de tus compras ingresadas durante el mes. Cuenta con un termómetro visual que te advierte preventivamente si te estás acercando al tope de la Categoría 1 (S/ 5,000) o de la Categoría 2 (S/ 8,000), evitando multas o cambios sorpresa de régimen.",
    },
    {
      question: "¿Necesito comprar un equipo especial o lector de código de barras?",
      answer:
        "No necesitas comprar nada extra. Puedes usar la cámara de tu propio celular Android o iPhone para escanear el código de barras de los productos. Si ya cuentas con una lectora USB o Bluetooth, también se conecta fácilmente.",
    },
    {
      question: "¿Cómo funciona la carga de facturas por foto (OCR)?",
      answer:
        "Solo abres la app, le tomas una foto nítida a la factura o boleta física que te entrega tu proveedor y nuestro sistema de inteligencia artificial extrae automáticamente el RUC, los productos, las cantidades y el monto base.",
    },
    {
      question: "¿Qué pasa si mis cajeros o yo no somos muy expertos en tecnología?",
      answer:
        "CajaRUS fue pensada para ser operada con una sola mano y botones grandes de alto contraste. No requiere capacitación técnica: en menos de 10 minutos aprenderás a registrar ventas y cerrar tu caja.",
    },
  ];

  return (
    <section id="preguntas" className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-b-2 border-gray-300 dark:border-zinc-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-gray-200 border border-gray-400 text-gray-900 dark:text-zinc-50 rounded-md px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
            <HelpCircle className="w-4 h-4 text-gray-900 dark:text-zinc-50 stroke-[2.5]" />
            <span>RESPUESTAS OPERATIVAS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase">
            PREGUNTAS FRECUENTES
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 mt-2 font-medium">
            Aclaraciones directas a las preguntas de dueños de bodega como tú.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border-2 border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-950"
              >
                <button
                  id={`faq-btn-${index}`}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 cursor-pointer touch-manipulation active:bg-gray-100 dark:active:bg-zinc-800"
                >
                  <span className="text-base font-bold text-gray-900 dark:text-zinc-50">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-900 dark:text-zinc-50 shrink-0 stroke-[2.5] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-content-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    className="p-5 bg-white dark:bg-zinc-950 border-t-2 border-gray-200 dark:border-zinc-800 text-sm sm:text-base text-gray-800 dark:text-zinc-100 leading-relaxed font-medium"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
