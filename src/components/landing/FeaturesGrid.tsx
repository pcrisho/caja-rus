import {
  ShoppingCart,
  Package,
  TrendingUp,
  Calculator,
  Camera,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: ShoppingCart,
      color: "bg-emerald-700 text-white",
      badge: "MÓDULO 01 · POS",
      title: "VENTAS A VELOCIDAD DE ATENCIÓN",
      description:
        "Registra productos con la cámara de tu celular o escáner. Admite cobro mixto en Efectivo, Yape, Plin y Tarjeta en segundos.",
    },
    {
      icon: Package,
      color: "bg-gray-900 text-white",
      badge: "MÓDULO 02 · STOCK",
      title: "CONTROL DE INVENTARIO AUTOMÁTICO",
      description:
        "El stock se descuenta con cada venta. Recibe alertas en pantalla cuando tus productos estrella estén por agotarse.",
    },
    {
      icon: TrendingUp,
      color: "bg-amber-600 text-white",
      badge: "MÓDULO 03 · SUNAT",
      title: "ALERTAS PREVENTIVAS DEL NRUS",
      description:
        "Monitorea el acumulado mensual de ventas y compras para mantenerte en Categoría 1 o 2 sin sorpresas de multas.",
    },
    {
      icon: Calculator,
      color: "bg-emerald-700 text-white",
      badge: "MÓDULO 04 · CAJA",
      title: "CIERRE DE CAJA EN 1 MINUTO",
      description:
        "Compara lo contado físicamente en el cajón contra el reporte del sistema. Detecta descuadres de inmediato por turno.",
    },
    {
      icon: Camera,
      color: "bg-gray-900 text-white",
      badge: "MÓDULO 05 · OCR",
      title: "CARGA DE FACTURAS CON FOTO",
      description:
        "Fotografía tus comprobantes de proveedores. La inteligencia artificial extrae productos, precios y cantidades al instante.",
    },
    {
      icon: ShieldCheck,
      color: "bg-emerald-700 text-white",
      badge: "MÓDULO 06 · SEGURIDAD",
      title: "PERMISOS DE ADMINISTRADOR Y CAJERO",
      description:
        "Restringe permisos a tus colaboradores. Como dueño, autorizas mermas, anulaciones de venta y ajustes de inventario.",
    },
  ];

  return (
    <section id="caracteristicas" className="py-16 sm:py-24 bg-gray-100 dark:bg-zinc-800 border-b-2 border-gray-300 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-gray-200 dark:bg-emerald-900/30 text-emerald-500 dark:text-zinc-50  px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
            <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-500 stroke-[2.5]" />
            <span className="text-emerald-500 dark:text-emerald-500">ARQUITECTURA DE MÓDULOS POS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase">
            TODO LO QUE TU BODEGA NECESITA EN TU CELULAR
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 mt-2 font-medium">
            Herramientas diseñadas para el trabajo real en la bodega: nítidas, directas y sin rodeos.
          </p>
        </div>

        {/* Grid of 6 Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-950  p-6 hover:border-gray-900 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11  ${item.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 px-2.5 py-1  uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-gray-900 dark:text-zinc-50 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed font-medium">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
