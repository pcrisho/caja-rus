import { Star, MapPin, Quote } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      quote:
        "Antes terminaba exhausto a las 11 PM contando boletas y sumando en cuaderno. Ahora con CajaRUS cierro mi caja en 2 minutos desde el celular y sé exactamente cuánto me pagaron por Yape.",
      name: "LUIS ALBERTO TORRES",
      bodega: "BODEGA DON LUCHO",
      location: "LOS OLIVOS · LIMA",
      rating: 5,
    },
    {
      quote:
        "Lo que más me gusta es la alerta del NRUS. Una vez estuve a punto de pasarme del límite de Categoría 1 sin darme cuenta. La app me avisó a tiempo y me ahorró un dolor de cabeza enorme con SUNAT.",
      name: "ROSA MARIA HUAMÁN",
      bodega: "BODEGA DOÑA ROSA",
      location: "YANAHUARA · AREQUIPA",
      rating: 5,
    },
    {
      quote:
        "Mi hijo me enseñó a usar la app y en 10 minutos ya le había agarrado el truco. Mis cajeros escanean con la cámara del celular y las facturas de distribuidoras se cargan solas con foto.",
      name: "CARLOS MENDOZA",
      bodega: "MINIMARKET EL CARMEN",
      location: "TRUJILLO · LA LIBERTAD",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-b-2 border-gray-300 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900  px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase mb-3">
            <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>TESTIMONIOS OPERATIVOS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase">
            BODEGUEROS PERUANOS QUE YA TIENEN EL CONTROL
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 mt-2 font-medium">
            Descubre cómo cambia la rutina diaria de trabajo en bodegas de todo el Perú.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-950  p-6 flex flex-col justify-between relative"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 text-amber-500 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <Quote className="w-7 h-7 text-gray-400 dark:text-zinc-500 mb-2" />

                <p className="text-sm text-gray-800 dark:text-zinc-100 leading-relaxed font-medium mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-col gap-1">
                <h4 className="font-black text-gray-900 dark:text-zinc-50 text-sm uppercase tracking-wide">{item.name}</h4>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{item.bodega}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5  w-fit mt-1">
                  <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                  {item.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
