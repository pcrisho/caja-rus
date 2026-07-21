# DESIGN.md — CajaRUS Style Reference (sera-style Flat POS)

> Inspirado en el style `sera` de shadcn (`--preset b3Zheoix4U`):
> **cero border-radius, cero bordes en cards, inputs underline.
> Estilo financiero plano, cuadriculado, de alto contraste.
> Cards separadas por contraste de fondo (blanco sobre gris-50),
> no por bordes.

**Theme:** light + dark (toggle nativo con `dark:` prefix de Tailwind v4)

CajaRUS corre sobre un lienzo neutro, técnico y luminoso: blanco puro (`#FFFFFF`)
y gris de soporte (`gray-50`/`gray-100`) sosteniendo texto casi negro
(`gray-900`). Sin bordes redondeados, sin sombras, sin bordes en cards —
solo contraste de fondo y separadores hairline entre items internos.

## 0. Principios rectores

1. **El usuario no es nativo digital.** Dueños y cajeros de bodega, muchas
   veces usando el celular con una mano mientras atienden. Prioridad #1:
   que nunca se sientan perdidos o "tontos" usando la app.
2. **Una mano, un pulgar.** Todo lo accionable debe alcanzarse con el pulgar
   sin cambiar el agarre del celular. De ahí los botones XXL y el bottom nav.
3. **Luz solar directa.** La bodega no es una oficina con luz controlada.
   Alto contraste no es un "nice to have" de accesibilidad — es requisito
   funcional. Es también la razón por la que este sistema prefiere bordes
   hairline sobre sombras: una sombra difusa pierde definición con luz solar.
4. **Cercano, no corporativo.** El tono es el de un vecino que sabe de
   números, no el de un banco. Ver §7 Voz y Tono.
5. **Mobile-first estricto.** No hay diseño de escritorio en el roadmap del
   MVP. Todo se diseña para pantalla de celular primero.
6. **Offline-first se ve, no se esconde.** Cuando no hay conexión, la UI debe
   decirlo explícitamente (banner ámbar), nunca fallar en silencio.
7. **Color con significado, no decoración.** Verde/ámbar/rojo/azul están
   atados a estados funcionales (bien/alerta/peligro/navegación).

## 1. Tokens — Color

Idéntico a la versión anterior del DESIGN.md §1. No hubo cambios en la
paleta. Ver la tabla completa en el DESIGN.md previo o en `docs/02-brandboard.md`.

Resumen rápido:
- Canvas: `bg-white` / `dark:bg-zinc-950`
- Card: `bg-white` / `dark:bg-zinc-900`
- Acción: `bg-emerald-600` / `text-emerald-700`
- Navegación: `bg-blue-900` / `text-blue-900`
- Advertencia: `bg-amber-600` / `text-amber-700`
- Peligro: `bg-red-600`
- Borde/hairline: `border-gray-200` / `dark:border-zinc-800`

## 2. Tokens — Tipografía

- **Stack:** `font-sans` de Tailwind (sistema operativo). Sin fuentes externas.
- **Botones:** `font-mono` — todos los botones usan fuente monospace.
- **Montos/Números:** `tabular-nums` — en todo valor monetario o numérico
  para alineación vertical correcta.
- **Escala:** Sin cambios respecto al DESIGN.md anterior.

### Font stack
```
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

## 3. Tokens — Espaciado y formas

### Border-radius: CERO

**Decisión de diseño basada en style `sera` (shadcn preset `b3Zheoix4U`):**
no se usa `rounded-*` en ningún componente. Todo es completamente cuadrado.

| Elemento | Clase | Valor |
|---|---|---|
| Botones (todos) | *(ninguna)* | 0px |
| Cards | *(ninguna)* | 0px |
| Inputs | *(ninguna)* | 0px |
| Chips / badges / tags | *(ninguna)* | 0px |
| Modales | *(ninguna)* | 0px |
| Banners de alerta | *(ninguna)* | 0px |

### Bordes en cards: NO

Las cards NO tienen `border`. Se separan por contraste de fondo
(`bg-white` sobre `bg-gray-50` / `dark:bg-zinc-900` sobre `dark:bg-zinc-950`).

Únicos bordes permitidos:
- `border-t` / `border-b` / `border-gray-100` — separador hairline entre
  items internos de una card (muy sutil).
- `border-b border-gray-200` — underline de inputs y selects.

### Sombras / elevación
Sin sombras (`shadow-none`). Las superficies se distinguen por color de fondo.

### Tamaños táctiles
- **Altura mínima acciones primarias: 56px** (`py-4` + font)
- **Área táctil mínima general: 44×44px** (WCAG 2.5.5)
- **Separación entre elementos tocables:** mínimo `gap-3` (12px)
- **Safe areas:** `min-h-dvh`, `viewport-fit: cover`

## 4. Layout

- **Contenedor principal:** `max-w-md` (448px) centrado
- **Bottom Navigation:** barra fija inferior, 5 items, 64px + safe-area
- **Section gap:** `gap-6`/`gap-8` entre bloques
- **Card padding:** `p-4` (lista), `p-6` (hero/destacada)

## 5. Componentes

No hay librería de componentes instalada (no shadcn/ui, no CVA, no clsx).
Los componentes del design system viven en `src/components/design-system/`.
Se listan aquí con su className exacto:

### DsButton
```tsx
// Primario
<button className="w-full bg-emerald-600 text-white py-4 px-6 text-lg
  font-semibold font-mono hover:bg-emerald-700 active:scale-95
  transition-transform cursor-pointer disabled:opacity-50
  disabled:pointer-events-none">
  COBRAR
</button>

// Secundario
<button className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-900
  dark:text-zinc-50 py-4 px-6 text-lg font-semibold font-mono
  hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95
  transition-transform cursor-pointer">
  CANCELAR
</button>

// Destructivo
<button className="w-full bg-red-600 text-white py-4 px-6 text-lg
  font-semibold font-mono hover:bg-red-700 active:scale-95
  transition-transform cursor-pointer">
  ELIMINAR
</button>
```

### DsCard
```tsx
// Default (blanco sobre gris, sin borde)
<div className="bg-white dark:bg-zinc-900 p-6">
  {children}
</div>

// Flat (gris sobre gris, para fondos internos)
<div className="bg-gray-50 dark:bg-zinc-800 p-6">
  {children}
</div>
```

### DsInput
```tsx
<div className="flex flex-col gap-2">
  <label className="text-xs font-bold uppercase tracking-wider
    text-gray-800 dark:text-zinc-200">
    Label
  </label>
  <input className="w-full bg-transparent border-b border-gray-200
    dark:border-zinc-700 py-3 text-base text-gray-900 dark:text-zinc-50
    placeholder:text-gray-400 dark:placeholder:text-zinc-500
    focus-visible:outline-none focus-visible:border-blue-900
    transition-colors" />
</div>
```

### DsSelect
```tsx
<select className="w-full appearance-none bg-transparent border-b
  border-gray-200 dark:border-zinc-700 py-3 pr-8 text-base
  text-gray-900 dark:text-zinc-50 focus-visible:outline-none
  focus-visible:border-blue-900 transition-colors">
  <option>Opción</option>
</select>
```

### DsModal
Modal full-height con backdrop negro semitransparente, sin border-radius.
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
  <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md
    max-h-[85vh] overflow-y-auto">
    <div className="flex items-start justify-between gap-4 p-6 pb-0">
      <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">
        Título
      </h2>
      <button onClick={onClose} aria-label="Cerrar">✕</button>
    </div>
    <div className="p-6">{children}</div>
  </div>
</div>
```

### DsBadge
```tsx
// Outline
<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs
  font-semibold border border-gray-200 dark:border-zinc-700
  text-gray-700 dark:text-zinc-300">ETF</span>

// Secondary
<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs
  font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700
  dark:text-zinc-300">Pendiente</span>

// Destructive
<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs
  font-semibold bg-red-600 text-white">Inactivo</span>

// Success
<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs
  font-semibold bg-emerald-100 dark:bg-emerald-900/30
  text-emerald-700 dark:text-emerald-400">Activo</span>
```

### DsListItem
```tsx
<div className="w-full flex items-center gap-4 py-4 border-b
  border-gray-100 dark:border-zinc-800 last:border-0">
  <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 flex
    items-center justify-center text-gray-600 dark:text-zinc-400
    shrink-0">{icon}</div>
  <div className="flex-1 min-w-0">
    <p className="text-base font-semibold text-gray-900
      dark:text-zinc-50 truncate">{title}</p>
    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5
      truncate">{subtitle}</p>
  </div>
  <ChevronRight size={20} className="text-gray-400 dark:text-zinc-500" />
</div>
```

### DsTabs (pills)
```tsx
<button className="flex items-center gap-2 whitespace-nowrap px-4 py-2
  text-sm font-medium transition-colors bg-blue-900 text-white">
  Activo
</button>
<button className="flex items-center gap-2 whitespace-nowrap px-4 py-2
  text-sm font-medium transition-colors bg-gray-100 dark:bg-zinc-800
  text-gray-700 dark:text-zinc-300 hover:bg-gray-200
  dark:hover:bg-zinc-700">
  Inactivo
</button>
```

### DsProgressBar
```tsx
<div className="flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <p className="text-xs font-bold uppercase tracking-wider
      text-gray-500 dark:text-zinc-400">Label</p>
    <p className="text-sm font-bold text-gray-900 dark:text-zinc-50
      tabular-nums">65%</p>
  </div>
  <div className="bg-gray-200 dark:bg-zinc-700 overflow-hidden">
    <div className="bg-emerald-600 h-4 transition-all duration-500"
      style={{ width: '65%' }} />
  </div>
</div>
```

### DsStatsCard
```tsx
<div className="bg-white dark:bg-zinc-900 p-4">
  <div className="flex items-center gap-2 text-gray-500
    dark:text-zinc-400 mb-2">
    {icon}
    <p className="text-xs font-bold uppercase tracking-wider">Label</p>
  </div>
  <div className="flex items-end justify-between">
    <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50
      tabular-nums">S/ 1,250</p>
    <p className="text-sm font-semibold tabular-nums
      text-emerald-700 dark:text-emerald-400">+12%</p>
  </div>
</div>
```

### DsEmptyState
```tsx
<div className="flex flex-col items-center justify-center py-12 px-4
  text-center">
  <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 flex
    items-center justify-center text-gray-400 dark:text-zinc-500 mb-4">
    {icon}
  </div>
  <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-1">
    Título
  </h3>
  <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mb-4">
    Descripción
  </p>
  {action}
</div>
```

### DsToggle
```tsx
<button type="button" role="switch" aria-checked={checked}
  className={`relative inline-flex h-6 w-11 shrink-0 transition-colors
    ${checked ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-600"}`}>
  <span className={`pointer-events-none inline-block h-5 w-5 transform
    bg-white shadow-lg transition duration-200
    ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
</button>
```

### DsAlert
```tsx
// Success
<div className="flex items-start gap-3 p-4 bg-emerald-100
  dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
  role="alert">...</div>
// Warning
<div className="flex items-start gap-3 p-4 bg-amber-100
  dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
  role="alert">...</div>
// Error
<div className="flex items-start gap-3 p-4 bg-red-100
  dark:bg-red-900/30 text-red-700 dark:text-red-400"
  role="alert">...</div>
```

### DsSkeleton
```tsx
<div className="animate-pulse bg-gray-200 dark:bg-zinc-700 h-4 w-full" />
```

### DsChip
```tsx
<span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm
  font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700
  dark:text-zinc-300">Default</span>
<span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm
  font-medium bg-blue-900 text-white">Activo</span>
<span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm
  font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700
  dark:text-amber-400">Warning</span>
```

## 6. Iconografía

- **Librería:** `lucide-react`. Trazo grueso por default.
- **Tamaño estándar:** `size={24}` en bottom nav e íconos junto a `text-lg`;
  `size={20}` dentro de banners/inputs.
- **Nunca** un ícono solo sin `aria-label` o texto visible al lado.

## 7. Voz y tono (contenido)

Ver `docs/02-brandboard.md` §4. Español peruano coloquial, nunca mensajes
técnicos en inglés expuestos al usuario.

## 8. Dark mode

Soportado con `dark:` prefix de Tailwind v4. Neutros en `zinc-*` (sin tinte
azul). Los semánticos emerald/amber/red/blue se mantienen iguales en ambos temas.

Ver tabla completa en DESIGN.md previo §8.

## 9. Referencia de diseño validada

El design system actual se validó contra el shadcn preset `b3Zheoix4U`
(style: `sera`, theme: `emerald`, baseColor: `stone`).

Este preset se puede inspeccionar con:
```bash
npx shadcn@latest preset decode b3Zheoix4U
```

URL: https://ui.shadcn.com/create?preset=b3Zheoix4U

## 10. Ruta de validación (Design System)

Todos los componentes se pueden validar visualmente en:
```
http://localhost:3000/design-system
```

Ruta pública (sin auth, configurada en `src/proxy.ts` como
`publicRoutePrefix`).

## 11. Checklist de accesibilidad por componente

1. Contraste verificado (nunca asumir — medir si se usa color nuevo).
2. Área táctil ≥44px (ideal 56px) y separación ≥12px entre elementos.
3. Todo `<img>`/ícono decorativo con `alt=""`; todo ícono funcional con
   `aria-label`.
4. Estados de foco visibles (`focus-visible:ring-2 focus-visible:ring-blue-900`)
   en cualquier elemento interactivo.
5. Formularios: `<label>` asociado siempre, nunca solo `placeholder`.
6. Textos de error de formulario anunciados (`aria-live="polite"`).
7. Inputs con `bg-transparent` + `border-b` — mantener contraste suficiente
   contra el fondo.

## 12. Notas técnicas (Tailwind v4 + Turbopack)

Repetir las notas de DESIGN.md previo §9 sobre OKLCH y el bug de `@theme`.
Sin cambios en esta área.

## 13. Quick Start

### Componentes de referencia ya implementados

Ver `src/components/design-system/`:
- `DsCard` — Card base (blanco, sin borde)
- `DsButton` — Botón primario/secundario/destructivo con `font-mono`
- `DsInput` / `DsSelect` — Inputs con underline `border-b`
- `DsModal` — Modal sin border-radius
- `DsListItem` — Item de lista con separator hairline
- `DsTabs` — Tabs pills sin borde
- `DsProgressBar` — Barra de progreso
- `DsStatsCard` — Card de métrica
- `DsBadge` — Badge outline/secondary/destructive/success
- `DsEmptyState` — Estado vacío
- `DsAlert` — Banner de alerta
- `DsChip` — Chip de estado
- `DsToggle` — Toggle switch rectangular
- `DsSkeleton` — Skeleton loading placeholder

Siempre que se implemente un nuevo componente en el app real, usar estos
como referencia — no reintroducir `border-radius`, `border` en cards, ni
`bg-gray-50` con relleno en inputs.
