# DESIGN.md — CajaRUS Style Reference (High-Contrast Industrial POS)

> Bodega al mediodía, no oficina de SaaS genérica. Estructura tipo caja
> registradora industrial: bordes nítidos de 1px/2px, etiquetas en mayúsculas
> con tracking técnico, montos en bold nítido y botones sólidos en verde
> esmeralda profundo — sobre blanco y gris cálido, diseñado para leerse bajo
> el sol con una sola mano.

**Theme:** light + dark (toggle nativo con `dark:` prefix de Tailwind v4)

CajaRUS corre sobre un lienzo neutro, técnico y luminoso: blanco puro (`#FFFFFF`) y un gris
de soporte (`gray-50`/`gray-100`) sosteniendo texto casi negro (`gray-900`).
Inspirado en interfaces financieras e industriales de alto contraste (Industrial POS),
el sistema elimina los degradados difusos, sombras sucias y botones redondeados genéricos.
En su lugar, emplea:
- **Etiquetas y Subtítulos Técnicos:** En mayúsculas nítidas con espaciado (`text-[11px] font-bold tracking-wider uppercase text-gray-500`).
- **Tarjetas Estructuradas:** Bloques blancos nítidos con bordes definidos de 1px o 2px (`border border-gray-300` / `border-2 border-gray-200`) y radio controlado (`rounded-xl` / `rounded-lg`).
- **Botones de Acción de Alto Impacto:** Botones rectangulares táctiles XXL (56px) en verde esmeralda profundo (`bg-emerald-700` / `text-white font-bold uppercase tracking-wide`), con retroalimentación física inmediata (`active:scale-95`).

Este documento es la referencia obligatoria para cualquier trabajo de
frontend (ver `AGENTS.md`). Todo lo afirmado sobre contraste de color y
comportamiento real de Tailwind fue **verificado por ejecución real**
(cálculo matemático WCAG + inspección del CSS compilado), no asumido —
ver §9 "Notas técnicas verificadas".

## 0. Principios rectores


1. **El usuario no es nativo digital.** Dueños y cajeros de bodega, muchas
   veces usando el celular con una mano mientras atienden. Prioridad #1:
   que nunca se sientan perdidos o "tontos" usando la app.
2. **Una mano, un pulgar.** Todo lo accionable debe alcanzarse con el pulgar
   sin cambiar el agarre del celular. De ahí los botones XXL y el bottom nav.
3. **Luz solar directa.** La bodega no es una oficina con luz controlada.
   Alto contraste no es un "nice to have" de accesibilidad — es requisito
   funcional para poder leer la pantalla al mediodía. Es también la razón
   por la que este sistema prefiere bordes de 1px sobre sombras: una sombra
   difusa pierde definición con luz ambiente fuerte, un borde nítido no.
4. **Cercano, no corporativo.** El tono es el de un vecino que sabe de
   números, no el de un banco. Ver §7 Voz y Tono.
5. **Mobile-first estricto.** No hay diseño de escritorio en el roadmap del
   MVP (docs/01-vision.md). Todo se diseña para pantalla de celular primero.
6. **Offline-first se ve, no se esconde.** Cuando no hay conexión, la UI debe
   decirlo explícitamente (banner ámbar), nunca fallar en silencio.
7. **Color con significado, no decoración.** Verde/ámbar/rojo/azul están
   atados a estados funcionales (bien/alerta/peligro/navegación). Nunca
   introducir un color nuevo solo por variedad visual — cada color nuevo es
   una pregunta de negocio antes que una pregunta de diseño.

## 1. Tokens — Color

### 1.1 Paleta e intención

**Decisión de marca:** no hay modo oscuro (§8) y el 100% del color tiene
un rol semántico — no existe un color "solo decorativo" en este sistema
(a diferencia de sistemas editoriales que reservan un acento para
ilustración; aquí no hay ilustración, hay estados: cobrado, alerta, error).

| Rol | Nombre de marca | Hex marca (brandboard) | Hex real Tailwind v4† | Clase Tailwind | Uso |
|---|---|---|---|---|---|
| Canvas / fondo de página | Blanco | `#FFFFFF` | `#FFFFFF` | `bg-white` | Fondo base de toda pantalla |
| Superficie secundaria | — | `#F9FAFB` | `#f9fafb` | `bg-gray-50` | Wrapper de página cuando se quiere un blanco "roto" (ver login actual) |
| Superficie de tarjeta | Gris | `#F3F4F6` | `#f3f4f6` (idéntico) | `bg-gray-100` | Cards, fondos de íconos/plates |
| Borde / hairline | — | — | `#e5e7eb` | `border-gray-200` | Separadores, bordes de card en vez de sombra |
| Texto primario | — | — | `#101828` | `text-gray-900` | Texto de mayor peso informativo (ver §1.3, preferido sobre negro puro) |
| Texto secundario | — | — | `#364153` | `text-gray-700` | Texto de cuerpo normal |
| Texto muted/terciario | — | — | `#6a7282` | `text-gray-500` | Ayuda, metadatos, timestamps |
| **Primario / Acción** | Verde Caja | `#059669` | `#009767` | `bg-emerald-600` | Cobrar, ingresos, stock OK, éxito — **solo texto/ícono grande o bold, ver §1.2** |
| Primario (texto normal) | Verde Caja oscuro | `#047857` | `#007956` | `text-emerald-700` | Texto normal en verde que necesite 4.5:1 real |
| **Secundario / Navegación** | Azul Control | `#1E3A8A` | `#1c398e` | `bg-blue-900` / `text-blue-900` | Headers, nav, foco, confianza — cumple 4.5:1 en cualquier tamaño |
| **Advertencia** | Ámbar Alerta | `#D97706` | `#dd7400` | `bg-amber-600` | Stock bajo, NRUS al 85% — **solo texto/ícono grande o bold** |
| Advertencia (texto normal) | Ámbar oscuro | `#B45309` | `#b75000` | `text-amber-700` | Texto normal en ámbar |
| **Peligro / Destructivo** | *(no está en el brandboard original)* | `#DC2626` | `#e40014` | `bg-red-600` | Anular venta, eliminar — agregado por necesidad funcional; confirmar con negocio si se define un rojo propio de marca |

† *Ver §9.1 — Tailwind v4 recalculó su paleta a OKLCH; el hex que realmente
se renderiza con `bg-emerald-600` no es pixel-idéntico al hex que especifica
el brandboard. La diferencia es sutil y no cambia ninguna conclusión de
contraste (§1.2), pero si algún día se necesita fidelidad exacta de marca
(p. ej. un mockup de Figma comparado pixel a pixel), usar `bg-[#059669]`
en vez de `bg-emerald-600` — confirmado que las clases arbitrarias con hex
literal sí se generan correctamente (a diferencia de las basadas en
variables custom, ver §9.2).

### 1.2 Contraste — verificado matemáticamente, no asumido

`docs/02-brandboard.md` (línea 53) afirma que el verde y el azul "cumplen
4.5:1 sobre fondo blanco". Se calculó el contraste real (fórmula WCAG,
luminancia relativa) usando tanto el hex de marca como el hex real que
Tailwind v4 termina renderizando — el resultado es el mismo en ambos casos:

| Color sobre blanco | Contraste (hex marca) | Contraste (hex real TW v4) | ¿4.5:1 texto normal? | ¿3:1 texto grande/UI? |
|---|---|---|---|---|
| `emerald-600` | 3.77:1 | 3.73:1 | ❌ NO | ✅ Sí |
| `blue-900` | 10.36:1 | 10.37:1 | ✅ Sí | ✅ Sí |
| `amber-600` | 3.19:1 | 3.20:1 | ❌ NO | ✅ Sí (por poco) |
| `emerald-700` | 5.48:1 | 5.43:1 | ✅ Sí | ✅ Sí |
| `amber-700` | 5.02:1 | 5.05:1 | ✅ Sí | ✅ Sí |
| `gray-900` (texto primario) | — | 17.75:1 | ✅ Sí | ✅ Sí |
| `gray-700` (texto secundario) | — | 10.30:1 | ✅ Sí | ✅ Sí |
| `gray-500` (texto muted) | — | 4.84:1 | ✅ Sí (al límite) | ✅ Sí |

**Conclusión:** el azul cumple lo que dice el brandboard; el verde y el
ámbar **no** para texto normal — solo sirven para texto grande/bold (≥24px
regular o ≥18.66px bold) o elementos no-texto (fondos de botón con texto
blanco bold grande, bordes, íconos).

**Reglas de uso — no negociables:**
- Texto de **cuerpo/párrafo normal** en verde o ámbar → `text-emerald-700` /
  `text-amber-700`, nunca `text-emerald-600`/`text-amber-600`.
- Texto **grande y bold** (títulos, montos, texto de botón ≥18px bold) →
  `emerald-600`/`amber-600` está bien.
- `text-gray-500` (muted) está al límite (4.84:1) — no usarlo por debajo de
  `text-sm` (14px); para texto aún más pequeño, usar `text-gray-700`.
- Nunca usar `emerald-600`/`amber-600` como color de texto pequeño
  (`text-sm` o menor) sobre blanco.

### 1.3 Texto primario: `gray-900`, no negro puro

Se eligió `gray-900` (`#101828`, 17.75:1) sobre `#000000` puro para el
texto primario — es una diferencia casi imperceptible visualmente pero
evita el "vibrado" de alto contraste que el negro puro produce en
pantallas OLED de gama baja, sin sacrificar legibilidad al sol (sigue
siendo altísimo contraste). Si en el futuro se prioriza legibilidad
extrema sobre confort visual, `#000000` (`text-black`) es intercambiable
sin romper ninguna regla de este documento.

## 2. Tokens — Tipografía

**Decisión de marca (docs/02-brandboard.md línea 41): NO se cargan fuentes
externas.** Es intencional — prioriza rendimiento en celulares de gama baja
(el público objetivo). Usar el stack de fuentes del sistema operativo, que
es exactamente `font-sans` de Tailwind por defecto:

```
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

No usar `next/font/google`, no añadir `@font-face`. Ver §10 sobre la
pregunta de si vale la pena una fuente custom (no, por ahora).

### Escala tipográfica

| Rol | Tamaño | Peso | Clase Tailwind | Uso |
|---|---|---|---|---|
| Display / título de pantalla | 30px | Bold (700) | `text-3xl font-bold` | "CajaRUS" en login, títulos de sección |
| Monto grande / total | 24–30px | Bold (700) | `text-2xl font-bold` o mayor | Nunca un monto en peso regular |
| Texto de botón XXL | 18px | Semibold/Bold (600/700) | `text-lg font-semibold` | Mínimo también por contraste (§1.2) |
| Subtítulo / cuerpo destacado | 18px | Regular (400) | `text-lg` | El brandboard pide 18px mínimo para cuerpo |
| Cuerpo estándar | 16px | Regular (400) | `text-base` | Cuando el layout no permite 18px |
| Texto grande (accesibilidad) | 24px | Regular (400) | `text-2xl` | Futuro toggle en Ajustes — preparar componentes para escalar con una prop/clase condicional, no tamaños hardcodeados en px |
| Texto secundario/ayuda | 14px | Regular (400) | `text-sm` | Único tamaño bajo 16px permitido para texto legible |
| Metadato no crítico | 12px | Regular (400) | `text-xs` | IDs, timestamps — nunca para algo que el usuario deba leer para decidir |

**Regla dura:** nunca bajar de `text-sm` (14px) para texto con el que el
usuario deba interactuar o leer para tomar una decisión (precios, alertas,
botones). `text-xs` solo para metadatos no críticos.

## 3. Tokens — Espaciado y formas

- **Escala de espaciado:** la escala default de Tailwind (múltiplos de
  0.25rem/4px: `p-1`…`p-16`). No introducir una escala custom.
- **Unidad base:** 4px (heredada de Tailwind, no redefinida).

### Radios de borde (por tipo de elemento)

| Elemento | Clase | Valor | Razón |
|---|---|---|---|
| Botones (todos) | `rounded-xl` | 12px | Ya establecido en `login/page.tsx` — no se adopta el "pill" (9999px) de otros sistemas para no romper consistencia con lo ya implementado |
| Cards | `rounded-xl` / `rounded-2xl` | 12px / 16px | `xl` para cards normales, `2xl` para cards "hero"/destacadas |
| Inputs | `rounded-xl` | 12px | Consistente con botones — un formulario con inputs y botón de submit no debe mezclar radios |
| Chips / badges / tags | `rounded-full` | 9999px | **Sí adoptado** de sistemas tipo ElevenLabs — funciona bien para selector de método de pago, badge de categoría NRUS, tab pills |
| Banner de alerta | `rounded-xl` | 12px | Igual que cards |

### Sombras / elevación — preferir bordes sobre sombras

A diferencia de un sistema con sombras marcadas, CajaRUS usa **elevación
mínima**: la mayoría de superficies son planas (`bg-gray-100`, sin sombra)
separadas por color de fondo o un borde de 1px, no por sombra. Razón: una
sombra difusa pierde nitidez con luz solar directa; un borde de 1px no.

| Nombre | Valor | Uso |
|---|---|---|
| `shadow-none` (default) | — | Cards estándar (`bg-gray-100`, sin sombra ni borde) |
| `border` hairline | `border border-gray-200` | Cuando una card blanca necesita separarse de un fondo también blanco/gris-50 |
| `shadow-sm` (excepción) | sombra sutil de Tailwind default | Solo para elementos que deben sentirse "flotantes" sobre contenido (modal, sheet, dropdown) — no para cards de contenido normal |

### Tamaños táctiles

- **Altura mínima de acciones primarias: 56px** (`h-14`, o `py-4`/`py-5` +
  alto de línea del texto — patrón ya usado en `login/page.tsx`).
- **Área táctil mínima general: 44×44px** (mínimo WCAG 2.5.5/2.5.8) para
  cualquier elemento tocable que no sea una acción primaria de pantalla.
- **Separación entre elementos tocables:** mínimo `gap-3` (12px).
- **Safe areas (PWA):** `min-h-dvh` (no `min-h-screen`), `viewport-fit: cover`
  (ya configurado en `layout.tsx`). El bottom nav (cuando se implemente)
  necesita `pb-[env(safe-area-inset-bottom)]`.

## 4. Layout

- **Contenedor principal:** `max-w-sm` (384px) centrado — patrón ya usado
  en `login/page.tsx`, intencional para que el contenido no se sienta
  estirado en pantallas más anchas (tablets en horizontal).
- **Bottom Navigation** (docs/02-brandboard.md §3): barra fija inferior,
  ícono + texto, siempre visible en pantallas autenticadas. No usar menú
  hamburguesa — el brandboard lo descarta explícitamente.
  - 5 items máximo: Ventas (carrito), Inventario (caja), Finanzas (billete),
    NRUS (gráfico), Ajustes (engranaje).
  - Alto recomendado: 64px + `env(safe-area-inset-bottom)`.
  - El contenido scrolleable necesita `pb-20` para no quedar tapado.
- **Section gap:** `gap-6`/`gap-8` (24–32px) entre bloques de una misma
  pantalla — no se necesita el espaciado editorial de 96px+ de un sitio de
  marketing; esto es una herramienta de trabajo densa en información.
- **Card padding:** `p-4` (16px) para cards de lista, `p-6` (24px) para
  cards destacadas/hero (resumen NRUS, total del día).

## 5. Componentes

Hoy no hay ninguna librería de componentes instalada (no shadcn/ui, no
`class-variance-authority`, no `clsx`). Estos son los patrones a seguir con
Tailwind directo, consistentes con `login/page.tsx`, `error.tsx`,
`not-found.tsx`:

### Botón primario (XXL)
**Rol:** acción principal de pantalla (Cobrar, Guardar, Confirmar)
```
className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg
  font-semibold hover:bg-emerald-700 active:scale-95 transition-transform
  cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
```
`active:scale-95 transition-transform` es el micro-feedback táctil
estándar del proyecto — usarlo en TODO elemento presionable.

### Botón secundario / outline
**Rol:** acción alternativa, menor peso visual
```
className="w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6
  text-lg font-semibold hover:bg-gray-50 active:scale-95
  transition-transform cursor-pointer"
```

### Botón destructivo
**Rol:** anular venta, eliminar — siempre con confirmación previa
```
className="w-full bg-red-600 text-white rounded-xl py-4 px-6 text-lg
  font-semibold hover:bg-red-700 active:scale-95 transition-transform"
```

### Card (superficie estándar)
**Rol:** agrupar información relacionada
```
className="bg-gray-100 rounded-xl p-4"
```

### Card destacada / hero
**Rol:** resumen NRUS, total del día — necesita más peso visual
```
className="bg-gray-100 rounded-2xl p-6"
```

### Chip / tag (método de pago, categoría)
**Rol:** selección de una opción entre pocas, o etiqueta de estado corta
```
className="bg-white border border-gray-300 rounded-full px-4 py-2
  text-sm font-medium"
// estado activo/seleccionado:
className="bg-blue-900 text-white rounded-full px-4 py-2 text-sm font-medium"
```

### Banner de alerta (éxito / advertencia / error)
```
// Error / peligro
className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-base"
// Advertencia
className="bg-amber-100 border border-amber-200 text-amber-700 p-4 rounded-xl text-base"
// Éxito / confirmación
className="bg-emerald-100 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-base"
```
Nota: siempre la variante `-700` para el texto (no `-600`) — texto normal
sobre fondo claro, ver §1.2.

### Banner "sin conexión"
Ya documentado en `docs/07-pwa.md`, aún sin código — mantenerlo tal cual:
```
className="bg-amber-600 text-white text-xs font-bold text-center py-2
  sticky top-0 z-50 animate-pulse"
```
Único lugar donde `amber-600` con `text-xs` es aceptable: es bold y es una
interrupción visual momentánea, no texto de lectura.

### Termómetro NRUS
**Rol:** mostrar `L_mes` contra el tope de la categoría actual (docs/08-nrus-rules.md)
- 0–84% del tope: `bg-emerald-600`
- 85–99% del tope: `bg-amber-600` (alerta preventiva)
- ≥100%: `bg-red-600` (excedido)
- Contenedor: `bg-gray-100 rounded-full h-4 overflow-hidden`, relleno con
  `transition-all duration-500`.

### Bottom Nav Item
```
// inactivo
className="flex flex-col items-center gap-1 text-gray-500 text-xs"
// activo
className="flex flex-col items-center gap-1 text-emerald-700 text-xs font-semibold"
```
Ícono `size={24}` arriba del texto, nunca ícono solo sin texto.

### Input de formulario
```
className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900
  focus-visible:border-blue-900"
```
Siempre con `<label>` asociado — nunca solo `placeholder` como única pista.

## 6. Iconografía

- **Librería:** `lucide-react` (ya en `package.json`). Trazo grueso por
  default — coincide con lo que pide el brandboard.
- **Tamaño estándar:** `size={24}` en bottom nav e íconos junto a texto
  `text-lg`; `size={20}` dentro de banners/inputs.
- **Nunca** un ícono solo sin `aria-label` o texto visible al lado.
- Import selectivo siempre: `import { ShoppingCart } from "lucide-react"`
  (no `import * as Icons`) para que el tree-shaking funcione.

## 7. Voz y tono (contenido)

Ver la tabla completa en `docs/02-brandboard.md` §4 — no se repite aquí
para evitar que quede desincronizada. Reglas rápidas para copy nuevo:

- Español peruano coloquial, nunca mensajes técnicos en inglés expuestos al
  usuario ("Network request failed" → "Sin señal. Revisa tu internet...").
- Directo, sin rodeos, pero nunca frío ni acusatorio.
- Confirmaciones destructivas siempre en pregunta directa: "¿Seguro que
  quieres...? Esta acción no se puede deshacer."
- `error.tsx`, `not-found.tsx`, `loading.tsx` ya siguen este tono — usarlos
  como referencia para nuevo copy.

## 8. Dark mode

Soportado desde julio 2026 con `dark:` prefix de Tailwind v4 directamente en
clases, sin tokens custom (el bug documentado en §9.2 impide usar `@theme`).
El toggle persiste en `localStorage` y respeta `prefers-color-scheme` en
primera carga.

**Paleta dark mode:**

Neutros en `zinc-*` (estilo shadcn — grises puros sin tinte azul; el `gray-*`
de Tailwind tiene matiz azulado que en dark se percibe "frío SaaS"). Los
semánticos emerald/amber/red/blue se mantienen iguales en ambos temas.

| Rol | Clase Tailwind (light) | Clase Tailwind (dark) |
|---|---|---|
| Canvas / fondo de página | `bg-white` | `dark:bg-zinc-950` |
| Superficie secundaria | `bg-gray-50` | `dark:bg-zinc-900` |
| Superficie de tarjeta | `bg-gray-100` | `dark:bg-zinc-800` |
| Superficie elevada (badge/chip) | `bg-white` | `dark:bg-zinc-700` |
| Borde / hairline | `border-gray-200` | `dark:border-zinc-800` |
| Borde 2px | `border-gray-300` | `dark:border-zinc-700` |
| Texto primario | `text-gray-900` | `dark:text-zinc-50` |
| Texto secundario | `text-gray-700` | `dark:text-zinc-300` |
| Texto muted | `text-gray-500` | `dark:text-zinc-400` |
| Acción (texto) | `text-emerald-700` | `dark:text-emerald-400` |
| Navegación (texto) | `text-blue-900` | `dark:text-blue-400` |
| Advertencia (texto) | `text-amber-700` | `dark:text-amber-400` |
| Peligro (texto) | `text-red-700` | `dark:text-red-400` |
| Badge éxito | `bg-emerald-100` | `dark:bg-emerald-900/30` |
| Badge advertencia | `bg-amber-100` | `dark:bg-amber-900/30` |
| Badge peligro | `bg-red-100` | `dark:bg-red-900/30` |

**Reglas dark mode:**
- Los botones de acción (`bg-emerald-600`, `bg-red-600`, `bg-amber-600`) se
  mantienen sin variante dark — funcionan bien sobre fondo oscuro.
- Headers `bg-blue-900` se mantienen sin variante dark — el azul profundo
  contrasta bien en ambos modos.
- Subtítulos de header azul usan `text-blue-100` (no `text-blue-200`).
- Todo color nuevo debe verificarse en ambos temas.
- Si se necesita fidelidad exacta a un hex de marca en un contexto
  específico, usar el valor arbitrario literal (ej. `text-[#059669]`) —
  **no usar `var(--x)` en className** (ver §9.2).

## 9. Notas técnicas verificadas (Tailwind v4 + Turbopack)

### 9.1 — La paleta de Tailwind v4 no es pixel-idéntica a la de v3/brandboard

Tailwind v4 recalculó su paleta por defecto usando OKLCH (espacio de color
perceptualmente uniforme) en vez de los hex fijos de v3. Se verificó
extrayendo los valores reales del CSS compilado (`grep` sobre el build de
`pnpm build`, no supuestos):

| Clase | Hex especificado en brandboard/v3 | Hex real renderizado (fallback sRGB de v4) |
|---|---|---|
| `emerald-600` | `#059669` | `#009767` |
| `emerald-700` | `#047857` | `#007956` |
| `blue-900` | `#1E3A8A` | `#1c398e` |
| `amber-600` | `#D97706` | `#dd7400` |
| `amber-700` | `#B45309` | `#b75000` |
| `red-600` | `#DC2626` | `#e40014` |

La diferencia no cambia ninguna conclusión de contraste de §1.2 (se
recalculó con ambos valores, mismo resultado). Si se necesita fidelidad
exacta de marca (comparación pixel a pixel contra un mockup), usar la
sintaxis de valor arbitrario con el hex literal de marca: `bg-[#059669]`
— **confirmado que esto se genera correctamente** (a diferencia de lo
descrito en 9.2).

### 9.2 — Tokens de color custom vía `@theme` no se generan en `.tsx` en este stack

Se intentó definir tokens semánticos custom (`--color-brand-primary` en
`@theme`, para poder escribir `bg-brand-primary`) en `src/app/globals.css`.
Se encontró un bug/limitación reproducible en la combinación exacta
Next.js 16.2.10 (Turbopack) + Tailwind CSS v4.3.3 + `@tailwindcss/postcss`:

- Clases de utilidad basadas en colores custom de `@theme`, usadas desde
  archivos `.tsx`, **no se generan** — ni en build limpio (`pnpm build`)
  ni en caliente (`pnpm dev`).
- El mismo problema ocurre con variables custom declaradas en un `:root`
  plano (fuera de `@theme`) y referenciadas vía valor arbitrario
  (`bg-[var(--mi-variable)]`) — **tampoco se genera la clase**.
- Sin embargo, la variable CSS en sí **sí se registra correctamente**: es
  usable con `@apply` dentro de un archivo `.css`, y es resoluble de forma
  nativa si se usa fuera del pipeline de utilidades de Tailwind — por
  ejemplo en un `style={{ color: "var(--mi-variable)" }}` inline, o en un
  `<svg fill="var(--mi-variable)">`, ya que ahí la resolución de
  `var()` la hace el navegador directamente, no el escaneo de clases de
  Tailwind (mecanismo completamente distinto, no afectado por este bug).
- Clases nativas de Tailwind (`bg-emerald-600`) y valores arbitrarios
  **literales** sin `var()` (`p-[13px]`, `bg-[#059669]`) sí se generan sin
  problema desde los mismos archivos `.tsx`.

**Conclusión práctica:** usar las clases nativas de Tailwind de la tabla
§1.1 directamente. Si se necesita una variable custom para un contexto que
NO sea `className` de Tailwind (SVG, canvas, chart, estilo inline
dinámico), un `:root` plano en `globals.css` sigue siendo válido para ese
uso específico — solo no sirve como fuente de clases de utilidad nuevas.
Si se actualiza Next.js/Tailwind más adelante, vale la pena reintentar el
enfoque de tokens semánticos vía `@theme`.

## 10. ¿Vale la pena una fuente custom?

**No, por ahora.** El brandboard ya tomó esta decisión deliberadamente
(rendimiento en gama baja — el público objetivo). Si en algún momento el
negocio quiere una identidad tipográfica más marcada (logo, splash,
marketing — no necesariamente toda la UI), la vía correcta sería
`next/font/google` con **una sola** familia display para títulos grandes
(nunca para texto de UI/formularios), auto-hospedada (sin request a Google
Fonts en runtime) — midiendo el peso del `.woff2` contra el público de
gama baja antes de decidir.

## 11. Apps de referencia (no de dónde copiar estilo, sino contexto de uso)

A diferencia de un sistema inspirado en SaaS de diseño premium, las
referencias reales de CajaRUS son apps financieras/POS usadas por el mismo
tipo de usuario en el mismo contexto (una mano, sol, poca experiencia
digital):

- **Yape** (Perú) — la app de pagos más usada por el público objetivo;
  botones grandes, colores saturados con significado, cero jerga técnica.
  Referencia directa de tono y densidad de información.
- **Interbank / BBVA app móvil (Perú)** — uso de azul como color de
  confianza/navegación, exactamente el rol que cumple `blue-900` aquí.
- **Square POS / Toast POS** — referencia de patrones de punto de venta:
  carrito, selector de método de pago, botón de cobro dominante.
- **Clip (México/LatAm)** — POS mobile-first para comercios pequeños,
  mismo público (pequeño comercio, no cadena grande).

## 12. Checklist de accesibilidad por componente

1. Contraste verificado según §1.2 (no asumir, medir si se usa un color
   nuevo no listado aquí).
2. Área táctil ≥44px (ideal 56px) y separación ≥12px entre elementos.
3. Todo `<img>`/ícono decorativo con `alt=""`; todo ícono funcional con
   `aria-label`.
4. Estados de foco visibles (`focus-visible:ring-2 focus-visible:ring-blue-900
   focus-visible:ring-offset-2`) en cualquier elemento interactivo.
5. Formularios: `<label>` asociado siempre, nunca solo `placeholder`.
6. Textos de error de formulario anunciados (`aria-live="polite"`).

## 13. Agent Prompt Guide

### Referencia rápida de color

- texto primario: `text-gray-900` · secundario: `text-gray-700` · muted: `text-gray-500`
- fondo: `bg-white` (canvas) · `bg-gray-100` (card)
- borde: `border-gray-200`
- acción primaria: `bg-emerald-600` (fondo) + `text-emerald-700` (texto normal)
- navegación/confianza: `bg-blue-900` / `text-blue-900`
- advertencia: `bg-amber-600` (fondo) + `text-amber-700` (texto normal)
- peligro: `bg-red-600`

### 5 prompts de ejemplo para generar componentes

1. Crea el botón "Cobrar" del POS: ancho completo, `bg-emerald-600`, texto
   blanco `text-lg font-semibold`, `rounded-xl`, altura mínima 56px
   (`py-4`), `active:scale-95 transition-transform`, ícono de check a la
   izquierda del texto con `lucide-react` `size={24}`.

2. Crea una card de alerta de stock bajo: `bg-amber-100 border
   border-amber-200 rounded-xl p-4`, texto `text-amber-700 text-base`,
   ícono `AlertTriangle` de `lucide-react` a la izquierda, mensaje en
   español peruano coloquial ("Solo tienes 3 unidades de este producto").

3. Crea el termómetro NRUS: barra `bg-gray-100 rounded-full h-4
   overflow-hidden`, relleno interno con ancho dinámico según porcentaje,
   color `bg-emerald-600` bajo 85%, `bg-amber-600` entre 85-99%,
   `bg-red-600` en 100%+, transición `transition-all duration-500`.

4. Crea un item del bottom nav: ícono `lucide-react` `size={24}` + label
   `text-xs`, estado inactivo `text-gray-500`, estado activo
   `text-emerald-700 font-semibold`, área táctil mínima 44×44px, sin fondo.

5. Crea un chip de método de pago (Efectivo/Yape/Plin/Tarjeta): `rounded-full
   border border-gray-300 px-4 py-2 text-sm font-medium`, estado
   seleccionado `bg-blue-900 text-white border-blue-900`.

## 14. Quick Start

### CSS Custom Properties (solo para contextos fuera de className — ver §9.2)

```css
:root {
  /* Superficies */
  --color-canvas: #ffffff;
  --color-surface-card: #f3f4f6;
  --color-border-hairline: #e5e7eb;

  /* Texto */
  --color-text-primary: #101828;   /* gray-900 */
  --color-text-secondary: #364153; /* gray-700 */
  --color-text-muted: #6a7282;     /* gray-500 */

  /* Semánticos (valores reales renderizados por Tailwind v4, ver §9.1) */
  --color-action: #009767;         /* emerald-600 */
  --color-action-text: #007956;    /* emerald-700 */
  --color-nav: #1c398e;            /* blue-900 */
  --color-warning: #dd7400;        /* amber-600 */
  --color-warning-text: #b75000;   /* amber-700 */
  --color-danger: #e40014;         /* red-600 */
}
```

### Tailwind v4 — usar clases nativas directamente (no `@theme` custom, ver §9.2)

```tsx
// Botón primario
<button className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6
  text-lg font-semibold hover:bg-emerald-700 active:scale-95
  transition-transform">
  Cobrar
</button>

// Card
<div className="bg-gray-100 rounded-xl p-4">...</div>

// Texto de cuerpo con color de marca (SIEMPRE -700 para texto normal)
<p className="text-emerald-700 text-base">¡Buen margen! Estás ganando...</p>
```
