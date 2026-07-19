# DESIGN.md — Sistema de Diseño de CajaRUS

Este documento traduce `docs/02-brandboard.md` y `docs/01-vision.md` en reglas
concretas y verificadas para construir la interfaz. Es la referencia
obligatoria para cualquier trabajo de frontend — ver también `AGENTS.md`.

Todo lo que aquí se afirma sobre contraste de color y comportamiento de
Tailwind fue **verificado por ejecución real** (cálculo matemático de
contraste WCAG y pruebas de build/dev server), no asumido. Ver la sección 9
para el detalle de qué se probó y por qué.

## 0. Principios rectores

1. **El usuario no es nativo digital.** Dueños y cajeros de bodega, muchas
   veces usando el celular con una mano mientras atienden. Prioridad #1:
   que nunca se sientan perdidos o "tontos" usando la app.
2. **Una mano, un pulgar.** Todo lo accionable debe alcanzarse con el pulgar
   sin cambiar el agarre del celular. De ahí los botones XXL y el bottom nav.
3. **Luz solar directa.** La bodega no es una oficina con luz controlada.
   Alto contraste no es un "nice to have" de accesibilidad — es requisito
   funcional para poder leer la pantalla al mediodía.
4. **Cercano, no corporativo.** El tono es el de un vecino que sabe de
   números, no el de un banco. Ver §7 Voz y Tono.
5. **Mobile-first estricto.** No hay diseño de escritorio en el roadmap del
   MVP (docs/01-vision.md). Todo se diseña para pantalla de celular primero;
   si algún día hay una vista de escritorio, es una adaptación, no al revés.
6. **Offline-first se ve, no se esconde.** Cuando no hay conexión, la UI debe
   decirlo explícitamente (banner ámbar), nunca fallar en silencio.

## 1. Tipografía

**Decisión de marca (docs/02-brandboard.md línea 41): NO se cargan fuentes
externas.** Es intencional, no un descuido — prioriza rendimiento en
celulares de gama baja (el público objetivo). Usar el stack de fuentes del
sistema operativo:

```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
```

Este es exactamente el `--font-sans` que ya trae Tailwind v4 por defecto
(`font-sans`), así que **no hace falta configurar nada**: no usar
`next/font/google` ni añadir `@font-face`. Ver también §10 sobre la pregunta
de si vale la pena una fuente custom.

| Uso | Peso | Tamaño (clase Tailwind) | Notas |
|---|---|---|---|
| Títulos de pantalla | Bold (`font-bold`, 700) | `text-2xl` a `text-3xl` (24–30px) | Ej. "CajaRUS" en login |
| Montos / totales | Bold (`font-bold`) | `text-2xl` o mayor (24px+) | Nunca mostrar un monto en peso regular |
| Texto de botones XXL | Semibold/Bold (`font-semibold`/`font-bold`) | `text-lg` (18px) mínimo | Ver §5, es también el mínimo por contraste |
| Texto de cuerpo | Regular (`font-normal`) | `text-base` (16px) o `text-lg` (18px) | El brandboard pide 18px mínimo — preferir `text-lg` sobre `text-base` cuando el layout lo permita |
| Modo "texto grande" (accesibilidad) | Regular | `text-2xl` (24px) | Futuro toggle en Ajustes — dejar los componentes preparados para escalar con una clase condicional, no con tamaños hardcodeados en px |
| Texto secundario/ayuda | Regular | `text-sm` (14px) | Usar con moderación: por default preferir `text-base`/`text-lg` |

**Regla dura:** nunca bajar de `text-sm` (14px) para texto con el que el
usuario deba interactuar o leer para tomar una decisión (precios, alertas,
botones). `text-xs` (12px) solo para metadatos no críticos (timestamps,
IDs internos).

## 2. Color

### 2.1 Paleta e intención

| Rol | Nombre de marca | Hex | Clase Tailwind a usar | Significado |
|---|---|---|---|---|
| Primario / Acción | Verde Caja | `#059669` | `emerald-600` | Cobrar, ingresos, stock OK, éxito |
| Primario (texto normal) | Verde Caja oscuro | `#047857` | `emerald-700` | Ver §2.2 — variante obligatoria para texto de tamaño normal |
| Secundario / Navegación | Azul Control | `#1E3A8A` | `blue-900` | Headers, nav, confianza/orden |
| Advertencia | Ámbar Alerta | `#D97706` | `amber-600` | Stock bajo, NRUS al 85% |
| Advertencia (texto normal) | Ámbar oscuro | `#B45309` | `amber-700` | Ver §2.2 |
| Peligro / Destructivo | *(no está en el brandboard original)* | `#DC2626` | `red-600` | Anular venta, eliminar — agregado por necesidad funcional, confirmar con negocio/marca si se define un rojo propio |
| Fondo de página | Blanco/Gris | `#FFFFFF` / `#F9FAFB` | `white` / `gray-50` | Fondo general |
| Fondo de tarjetas | Gris | `#F3F4F6` | `gray-100` | Cards sobre el fondo de página |

> **Importante — cómo implementar esto:** se intentó crear tokens semánticos
> custom (`bg-brand-primary`, etc.) vía `@theme` en `globals.css`, pero se
> encontró un bug/limitación reproducible en Next.js 16.2.10 (Turbopack) +
> Tailwind CSS v4.3.3 donde clases de utilidad nuevas basadas en colores
> custom no se generan al usarlas desde archivos `.tsx` (sí funcionan con
> `@apply` dentro de un `.css`, confirmado). Por eso: **usar las clases
> nativas de Tailwind de la tabla de arriba directamente** (`bg-emerald-600`,
> `text-blue-900`, etc.), no inventar nombres custom. Ver `src/app/globals.css`
> para el detalle completo de la investigación, y §9 de este documento.

### 2.2 Contraste — verificado matemáticamente, no asumido

`docs/02-brandboard.md` (línea 53) afirma que el verde y el azul "cumplen
4.5:1 sobre fondo blanco". Se calculó el contraste real (fórmula WCAG,
luminancia relativa):

| Color sobre blanco | Contraste real | ¿Cumple 4.5:1 (texto normal)? | ¿Cumple 3:1 (texto grande ≥24px o ≥18.66px bold / UI)? |
|---|---|---|---|
| `emerald-600` `#059669` | **3.77:1** | ❌ NO | ✅ Sí |
| `blue-900` `#1E3A8A` | **10.36:1** | ✅ Sí | ✅ Sí |
| `amber-600` `#D97706` | **3.19:1** | ❌ NO | ✅ Sí (por poco) |
| `emerald-700` `#047857` | **5.48:1** | ✅ Sí | ✅ Sí |
| `amber-700` `#B45309` | **5.02:1** | ✅ Sí | ✅ Sí |

**Conclusión:** el azul cumple lo que dice el brandboard, pero el verde y el
ámbar **no** — solo sirven para texto grande/bold (≥24px regular o ≥18.66px
bold, p. ej. `text-lg font-bold` en adelante) o para elementos no-texto
(bordes de botón, íconos, fondos con texto blanco bold grande encima).

**Reglas de uso:**
- Texto de **cuerpo/párrafo normal** en verde o ámbar → usar `emerald-700` /
  `amber-700`, nunca `emerald-600`/`amber-600`.
- Texto **grande y bold** (títulos, montos, texto de botón ≥18px bold) →
  `emerald-600`/`amber-600` está bien.
- Fondo sólido de botón (`bg-emerald-600`) con texto blanco encima → el
  texto del botón debe ser bold y ≥18px (ver §5, ya es el estándar de los
  botones XXL), igual que arriba.
- Nunca usar `emerald-600`/`amber-600` como color de texto pequeño
  (`text-sm` o menor) sobre blanco.

### 2.3 Dark mode

**No está planeado y no se debe implementar en el MVP.** El principio de
"luz solar directa" (§0.3) apunta a UN modo de alto contraste optimizado
para exteriores/interiores muy iluminados, no a dos modos. Si se agrega
dark mode a futuro, debe re-validarse el contraste de cero, no asumir que
invertir los colores actuales sea seguro.

## 3. Espaciado y tamaños táctiles

- **Escala de espaciado:** usar la escala default de Tailwind (`p-4`, `p-6`,
  `gap-3`, etc. — múltiplos de 0.25rem). No introducir una escala custom.
- **Altura mínima de elementos táctiles: 56px** (`h-14` en Tailwind, o
  `py-4`/`py-5` + el alto de línea del texto, como ya hace
  `src/app/login/page.tsx`). Esto viene directo del brandboard ("Botones
  XXL... mínimo 56px").
- **Área táctil mínima general (no solo botones primarios): 44×44px**
  (mínimo WCAG 2.5.5/2.5.8), aunque el estándar del proyecto es 56px para
  todo lo que sea una acción primaria de una pantalla.
- **Separación entre elementos tocables:** mínimo `gap-3` (12px) para evitar
  toques accidentales con dedos grandes o guantes.
- **Safe areas (PWA / notch / home indicator):** usar `min-h-dvh` (ya se usa
  en login) en vez de `min-h-screen`, y `viewport-fit: cover` (ya configurado
  en `layout.tsx`). Para el bottom nav (cuando se implemente), envolver el
  contenido con `pb-[env(safe-area-inset-bottom)]` para no quedar debajo del
  home indicator de iOS.

## 4. Layout

- **Contenedor principal:** `max-w-sm` (24rem/384px) centrado, tal como ya
  hace `login/page.tsx`. Es intencional: en un celular normal esto ocupa
  casi todo el ancho sin sentirse forzado, y evita que el contenido se vea
  absurdamente estirado en pantallas más anchas (tablets usadas en
  horizontal, por ejemplo).
- **Bottom Navigation** (docs/02-brandboard.md §3): barra fija inferior,
  ícono + texto, siempre visible en las pantallas autenticadas (POS,
  Inventario, Finanzas, NRUS, Ajustes). No usar menú hamburguesa — es
  exactamente el patrón que el brandboard descarta explícitamente.
  - 5 items máximo (ya definidos: Ventas/Carrito, Inventario/Caja,
    Finanzas/Billete, NRUS/Gráfico, Ajustes/Engranaje).
  - Alto recomendado: 64px + safe-area-inset-bottom.
  - El contenido scrolleable de cada pantalla necesita `pb-20` (o similar)
    para no quedar tapado por la barra fija.
- **Cards:** fondo `bg-gray-100`, esquinas `rounded-xl` o `rounded-2xl`,
  padding `p-4`/`p-6`. Ya es el patrón usado en los banners de error de
  `login/page.tsx` (aunque ahí con colores semánticos, no gris neutro).

## 5. Componentes base (patrones, no una librería instalada)

Hoy no hay ninguna librería de componentes instalada (no shadcn/ui, no
`class-variance-authority`, no `clsx`). Estos son los patrones a seguir
usando Tailwind directo, consistentes con lo ya escrito en
`src/app/login/page.tsx`, `error.tsx`, `not-found.tsx`:

### Botón primario (XXL)
```
className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg
  font-semibold hover:bg-emerald-700 active:scale-95 transition-transform
  cursor-pointer"
```
- `active:scale-95 transition-transform` es el micro-feedback táctil
  estándar del proyecto — úsalo en TODO elemento presionable, da la
  sensación de "esto respondió a mi toque" crítica en una pantalla sin
  mouse.
- Estado deshabilitado: `disabled:opacity-50 disabled:pointer-events-none`.

### Botón secundario/outline
```
className="w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6
  text-lg font-semibold hover:bg-gray-50 active:scale-95
  transition-transform cursor-pointer"
```
(patrón ya usado para el botón de Google en login).

### Botón destructivo
```
className="w-full bg-red-600 text-white rounded-xl py-4 px-6 text-lg
  font-semibold hover:bg-red-700 active:scale-95 transition-transform"
```
Siempre con confirmación previa (ver tabla de voz/tono — "¿Seguro que
quieres anular esta venta?").

### Banner de alerta/estado (patrón ya usado en login)
```
// Error / peligro
className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl
  text-base"
// Advertencia
className="bg-amber-100 border border-amber-200 text-amber-700 p-4
  rounded-xl text-base"
// Éxito / confirmación
className="bg-emerald-100 border border-emerald-200 text-emerald-700 p-4
  rounded-xl text-base"
```
Nota: `emerald-700`/`amber-700`/`red-700` para el texto (no los 600) porque
es texto normal sobre un fondo claro — ver tabla de contraste §2.2 (aplica
igual sobre fondos -100, no solo blanco).

### Banner "sin conexión" (ya documentado en docs/07-pwa.md, aún sin código)
```
className="bg-amber-600 text-white text-xs font-bold text-center py-2
  sticky top-0 z-50 animate-pulse"
```
Mantenerlo tal como está documentado — es el único lugar donde `amber-600`
con texto pequeño (`text-xs`) sobre él es aceptable, porque es bold y su
función es ser una interrupción visual momentánea, no texto de lectura.

### Termómetro NRUS (nuevo patrón, no existe código aún)
Barra de progreso horizontal mostrando `L_mes` contra el tope de la
categoría actual (docs/08-nrus-rules.md):
- 0–84% del tope: `bg-emerald-600` (con texto emerald-700 al lado)
- 85–99% del tope: `bg-amber-600` (alerta preventiva)
- ≥100%: `bg-red-600` (alerta crítica, excedido)
- Contenedor: `bg-gray-100 rounded-full h-4 overflow-hidden`, relleno con
  `transition-all duration-500` para que el cambio de porcentaje se sienta
  animado, no un salto brusco.

## 6. Iconografía

- **Librería:** `lucide-react` (ya está en `package.json`). Trazo grueso por
  default, consistente con lo que pide el brandboard ("Iconografía Simple:
  Trazo grueso").
- **Tamaño estándar:** `size={24}` para bottom nav e íconos inline con texto
  `text-lg`; `size={20}` para íconos dentro de banners/inputs.
- **Nunca** un ícono solo sin `aria-label` o texto visible al lado — el
  bottom nav usa ícono + texto siempre (no solo ícono), tal como pide el
  brandboard.
- Import selectivo siempre: `import { ShoppingCart } from "lucide-react"`
  (no `import * as Icons`), para que el tree-shaking de Next.js funcione.

## 7. Voz y tono (contenido)

Ver la tabla completa en `docs/02-brandboard.md` §4 — no se repite aquí para
evitar que quede desincronizada; ese es el documento fuente. Reglas rápidas
para cualquier copy nuevo que se escriba:

- Español peruano coloquial, nunca mensajes técnicos en inglés expuestos al
  usuario ("Network request failed" → "Sin señal. Revisa tu internet...").
- Directo, sin rodeos, pero nunca frío ni acusatorio (evitar "Error: campo
  requerido"; preferir "Falta el precio de venta").
- Confirmaciones destructivas siempre en pregunta directa: "¿Seguro que
  quieres...? Esta acción no se puede deshacer."
- Los 3 componentes de estado ya creados (`error.tsx`, `not-found.tsx`,
  `loading.tsx`) siguen este tono — usarlos como referencia para nuevo copy.

## 8. Accesibilidad — checklist obligatoria por componente

1. Contraste verificado según §2.2 (no asumir, medir si se usa un color
   nuevo no listado aquí).
2. Área táctil ≥44px (ideal 56px) y separación ≥12px entre elementos.
3. Todo `<img>`/ícono decorativo con `alt=""`; todo ícono funcional con
   `aria-label`.
4. Estados de foco visibles (`focus-visible:ring-2 focus-visible:ring-blue-900
  focus-visible:ring-offset-2`) en cualquier elemento interactivo — hoy
   ningún componente lo tiene explícito, agregarlo al crear los primeros
   componentes reales.
5. Formularios: `<label>` asociado siempre, nunca solo `placeholder` como
   única pista del campo.
6. Textos de error de formulario anunciados (`aria-live="polite"` en el
   contenedor del mensaje), dado que muchos flujos son de una sola mano y
   el usuario puede no estar mirando el campo exacto que falló.

## 9. Nota técnica: limitación de Tailwind v4 encontrada durante esta auditoría

Al intentar configurar tokens de color custom (`@theme { --color-brand-primary: ... }`
en `src/app/globals.css`) para poder escribir `bg-brand-primary` en vez de
`bg-emerald-600`, se encontró que **en este stack exacto** (Next.js 16.2.10
con Turbopack + Tailwind CSS v4.3.3 + `@tailwindcss/postcss`), las clases de
utilidad basadas en colores custom **no se generan** cuando se usan en
archivos `.tsx`, con build limpio (`rm -rf .next && pnpm build`) y también
en caliente con `pnpm dev`. Se confirmó que:
- El token SÍ se registra correctamente (`@apply bg-brand-primary` dentro de
  un `.css` funciona).
- Clases nativas de Tailwind (`bg-emerald-600`) SÍ se generan sin problema
  desde los mismos archivos `.tsx`.
- Un valor arbitrario no relacionado a colores (`p-[13px]`) SÍ se genera
  correctamente.
- Un valor arbitrario referenciando la variable custom (`bg-[var(--color-brand-primary)]`)
  **tampoco** se generó.

Es decir: el problema es específico a "utilidad de color derivada de un
`@theme` custom nuevo, usada desde un archivo `.tsx`", en esta combinación
de versiones. Por eso este documento recomienda usar las clases nativas de
Tailwind directamente (tabla §2.1) en vez de tokens custom. Si se actualiza
Next.js/Tailwind más adelante, vale la pena reintentar el enfoque de tokens
semánticos — puede que la próxima versión lo resuelva.

## 10. Sobre agregar una fuente custom

**Recomendación: no, por ahora.** Ver conversación de auditoría — el
brandboard ya tomó esta decisión deliberadamente (rendimiento en gama baja).
Si en algún momento el negocio quiere una identidad tipográfica más marcada
(por ejemplo, para el logo/splash o materiales de marketing, no
necesariamente la UI completa de la app), la vía correcta sería `next/font`
con **una sola** familia display para títulos grandes (no para texto de
UI/formularios), auto-hospedada (`next/font/google` descarga y sirve el
archivo localmente, sin request a Google Fonts en runtime, así que no
rompe el principio de "sin fuentes externas" en el sentido de privacidad/
requests de red — sólo hay que medir el peso del archivo `.woff2` contra el
público de gama baja antes de decidir).
