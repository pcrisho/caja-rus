# Auditoría de Frontend - CajaRUS vs DESIGN.md

> Fecha: 2026-07-19
> Alcance: 19 rutas + 28 componentes + dark mode readiness
> Referencia: `DESIGN.md` (524 líneas, High-Contrast Industrial POS)

---

## 0. Resumen Ejecutivo

**Hallazgo principal:** El proyecto tiene ~70% de adherencia al DESIGN.md. Las páginas de autenticación (login/register) son las más alineadas. Las páginas de la app bajo `/t/[tenantSlug]` tienen desviaciones sistemáticas en 3 áreas: uso de sombras en vez de bordes, labels con texto por debajo de `text-sm`, y botones de confirmación que usan `bg-blue-900` en vez de `bg-emerald-600`.

**Dark mode:** El proyecto NO está preparado para dark mode dinámico. Implementarlo requiere refactoring significativo de todos los componentes (reemplazar clases hardcodeadas por tokens semánticos) + resolver el bug de Tailwind v4/Turbopack documentado en `DESIGN.md §9.2`.

**Severidad de hallazgos:** 6 críticos, 12 mayores, 18 menores.

---

## 1. Evaluación de Dark Mode Readiness

### 1.1 Estado actual: NO preparado

| Aspecto | Estado | Detalle |
|---|---|---|
| `<html>` class toggling | ❌ Ausente | Solo `lang="es"`, sin `class` ni `data-theme` |
| `color-scheme` meta | ❌ Ausente | No declarado en metadata ni viewport |
| CSS variables para dark | ❌ Ausente | Solo `:root` con valores light |
| Tailwind `dark:` prefix | ❌ No usado | Ningún componente usa `dark:` en clases |
| ThemeProvider / Context | ❌ Ausente | No existe toggle ni provider |
| `prefers-color-scheme` | ❌ No implementado | Sin media query ni detección JS |

### 1.2 Bloqueadores técnicos

1. **Bug Tailwind v4 + Turbopack (DESIGN.md §9.2):** Las clases de utilidad basadas en tokens custom de `@theme` NO se generan para archivos `.tsx`. Esto significa que no se puede hacer `bg-surface` con un token semántico y esperar que `dark:bg-surface-dark` funcione vía `@theme`.
2. **Clases hardcodeadas en TODOS los componentes:** Cada componente usa clases literales (`bg-white`, `text-gray-900`, `bg-gray-100`) en vez de tokens semánticos. Migrar a dark mode requeriría tocar cada className.
3. **Sin infraestructura de tema:** No hay `ThemeProvider`, no hay `useTheme()`, no hay `localStorage` persist.

### 1.3 Estrategia recomendada para dark mode

Dado el bug de Tailwind v4, hay 3 opciones viables:

| Opción | Descripción | Esfuerzo | Viabilidad |
|---|---|---|---|
| **A) `dark:` prefix directo** | Usar `dark:bg-gray-900 dark:text-white` en cada componente | Alto (~1000 cambios manuales) | ✅ Funciona, pero verboso |
| **B) CSS custom properties + `dark:` class** | Definir `:root { --bg: white }` y `.dark { --bg: #111 }` en CSS, usar `bg-[var(--bg)]` en TSX | Alto | ❌ `bg-[var(--x)]` NO funciona en TSX con Turbopack (mismo bug §9.2) |
| **C) CSS-only approach con `@variant` + `@apply`** | Definir estilos en `.css` con `@variant dark`, aplicar vía clases compuestas | Medio | ✅ Requiere mover estilos a CSS, pero es la más robusta |

**Recomendación: Opción A (`dark:` prefix directo).** Aunque es verbosa, es la única que funciona garantizado con el stack actual (Tailwind v4 + Turbopack). Las otras dos chocan con el bug documentado en §9.2.

### 1.4 Plan de dark mode (7 fases)

1. **Infraestructura:** Agregar `ThemeProvider` (React context), `localStorage` persist, toggle en Settings, `<html class="dark">` toggling
2. **Tokens semánticos en `globals.css`:** Definir `:root` y `.dark` variables CSS para uso en SVG/inline styles (único contexto donde `var()` funciona)
3. **Colores de canvas/fondo:** Reemplazar `bg-white`/`bg-gray-50`/`bg-gray-100` por variantes `dark:bg-gray-900`/`dark:bg-gray-800`/`dark:bg-gray-950`
4. **Texto:** Reemplazar `text-gray-900`/`text-gray-700`/`text-gray-500` por `dark:text-gray-100`/`dark:text-gray-300`/`dark:text-gray-400`
5. **Semánticos:** Añadir `dark:` variantes para emerald/amber/red/blue manteniendo contraste WCAG
6. **Verificación de contraste:** Recalcular TODOS los ratios WCAG para dark mode (emerald/amber/red sobre fondo oscuro)
7. **Test visual:** Recorrer cada ruta en ambos temas

---

## 2. Auditoría Ruta por Ruta

### Leyenda

- ✅ Conforme con DESIGN.md
- ⚠️ Desviación menor (no bloqueante, mejora estética)
- 🔶 Desviación mayor (rompe una regla explícita del DESIGN.md)
- ❌ Violación crítica (rompe regla de contraste/accesibilidad o usa patrón prohibido)

---

### R1. `src/app/layout.tsx` (Root Layout)

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R1.1 | `<html>` no tiene `class` para dark mode toggling | ❌ | §8 (nuevo requerimiento) |
| R1.2 | `appleWebApp.statusBarStyle: "default"` — debería ser `"black-translucent"` para consistencia con el themeColor verde | ⚠️ | — |
| R1.3 | Falta `<meta name="color-scheme" content="light dark">` para preparar dark mode | ❌ | §8 (nuevo) |

**Veredicto:** Estructuralmente correcto para light-only. Necesita cambios para dark mode.

---

### R2. `src/app/globals.css`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R2.1 | Solo define `:root`, no tiene bloque `.dark` | ❌ | §8 (nuevo) |
| R2.2 | Variables CSS son correctas y documentadas | ✅ | §9.2 |
| R2.3 | Usa `@import "tailwindcss"` (Tailwind v4 CSS-first config) | ✅ | — |
| R2.4 | Sin `@theme` block (correcto, por bug documentado) | ✅ | §9.2 |

**Veredicto:** Correcto para light-only. Necesita bloque `.dark` para dark mode.

---

### R3. `src/app/page.tsx` (Landing Page)

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R3.1 | Usa `min-h-dvh`, `bg-white`, `font-sans`, `text-gray-900` — correcto | ✅ | §4 |
| R3.2 | `selection:bg-emerald-200 selection:text-emerald-900` — buen detalle | ✅ | — |
| R3.3 | Componentes de landing no fueron auditados en detalle (son marketing, no app) | ⚠️ | §0.5 (mobile-first) |

**Veredicto:** Página de marketing, no pertenece al core de la app. Baja prioridad.

---

### R4. `src/app/login/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R4.1 | Wrapper usa `bg-gray-100` (correcto para superficie secundaria) | ✅ | §1.1 |
| R4.2 | Card principal usa `border-2 border-gray-900` + `shadow-md` — sombra innecesaria | ⚠️ | §3 (preferir bordes sobre sombras) |
| R4.3 | Inputs usan `rounded-lg` — DESIGN.md pide `rounded-xl` para inputs | 🔶 | §3 |
| R4.4 | Error banner usa `text-red-950` — debería ser `text-red-700` | 🔶 | §1.2, §5 |
| R4.5 | Botón submit usa `bg-emerald-700` + `min-h-[56px]` — CORRECTO | ✅ | §3, §5 |
| R4.6 | Texto del botón usa `text-xs` en vez de `text-lg font-semibold` | 🔶 | §2, §5 |
| R4.7 | Google OAuth button usa `rounded-lg` — debería ser `rounded-xl` | 🔶 | §3 |
| R4.8 | Label "INGRESO A TU BODEGA" usa `text-[10px]` — muy pequeño | ⚠️ | §2 (mínimo text-xs para no interactivo, pero esto es un badge decorativo) |
| R4.9 | Focus ring usa `focus-visible:ring-gray-900` — debería ser `ring-blue-900` | 🔶 | §5 |
| R4.10 | Usa `shadow-xs` en múltiples botones | ⚠️ | §3 |

**Veredicto:** Página de referencia bien implementada pero con desviaciones en radios de borde y colores de texto de error.

---

### R5. `src/app/register/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R5.1 | Mismos problemas de `rounded-lg` vs `rounded-xl` que login | 🔶 | §3 |
| R5.2 | Error banner usa `text-red-950` — debería ser `text-red-700` | 🔶 | §1.2 |
| R5.3 | Inputs con `placeholder:text-gray-400` + `uppercase` — correcto | ✅ | — |
| R5.4 | Progress bar usa `bg-emerald-700` — correcto | ✅ | §1.1 |
| R5.5 | Botones de paso usan `text-xs` en vez de `text-lg font-semibold` | 🔶 | §2, §5 |
| R5.6 | Botón "VOLVER" usa `border-gray-900` — correcto outline secundario | ✅ | §5 |
| R5.7 | Invitación de colaborador usa `bg-gray-900` para botón — no semántico pero aceptable para acción terciaria | ⚠️ | §0.7 |
| R5.8 | Usa `shadow-xs` en botones | ⚠️ | §3 |

**Veredicto:** Similar a login. Necesita ajustes de borde y texto.

---

### R6. `src/app/tenants/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R6.1 | Estado "sin bodega" usa el patrón de banner correcto | ✅ | §5 |
| R6.2 | Estado "cargando" usa `bg-white` en vez de `bg-gray-50` | ⚠️ | §1.1 |
| R6.3 | Cards de bodega usan `bg-gray-100 rounded-xl p-5` — patrón correcto | ✅ | §5 |
| R6.4 | Badge de rol usa `rounded-full border` — patrón chip correcto | ✅ | §5 |

**Veredicto:** Buena adherencia. Cambios menores.

---

### R7. `src/app/error.tsx` y `src/app/not-found.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R7.1 | Ambos usan el patrón de botón primario correcto | ✅ | §5 |
| R7.2 | `bg-gray-50` como fondo — correcto | ✅ | §1.1 |
| R7.3 | `text-emerald-600` en título — OK para texto grande (>24px bold) | ✅ | §1.2 |
| R7.4 | Copy en español coloquial peruano | ✅ | §7 |

**Veredicto:** Implementación de referencia. Sin cambios necesarios.

---

### R8. `src/app/loading.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R8.1 | Spinner usa colores emerald — correcto | ✅ | — |
| R8.2 | `bg-gray-50` como fondo — correcto | ✅ | — |

**Veredicto:** Correcto.

---

### R9. `src/app/t/[tenantSlug]/layout.tsx` (Tenant Layout)

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R9.1 | `pb-20` para espacio del bottom nav — correcto | ✅ | §4 |
| R9.2 | `bg-white` como canvas — correcto | ✅ | §1.1 |
| R9.3 | `min-h-dvh` en vez de `min-h-screen` — correcto | ✅ | §3 |
| R9.4 | Sin `flex-col` en el wrapper (el children no crece para llenar) | ⚠️ | — |

**Veredicto:** Correcto. Layout limpio y funcional.

---

### R10. `src/components/layout/BottomNav.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R10.1 | `h-16` (64px) — altura correcta | ✅ | §4 |
| R10.2 | `pb-[env(safe-area-inset-bottom)]` — correcto | ✅ | §3 |
| R10.3 | 5 items con íconos `size={24}` + labels `text-xs` — correcto | ✅ | §5 |
| R10.4 | Estado activo `text-emerald-700 font-semibold` — correcto | ✅ | §5 |
| R10.5 | Inactivo `text-gray-500` — correcto | ✅ | §5 |
| R10.6 | `min-w-[44px] min-h-[44px]` — área táctil correcta | ✅ | §3 |
| R10.7 | `border-t border-gray-200` — separación por borde, no sombra | ✅ | §3 |
| R10.8 | Falta `aria-label="Navegación principal"` en `<nav>` | ⚠️ | §12 |
| R10.9 | Nombres de secciones no coinciden 100% con DESIGN.md §4: dice "NRUS (gráfico)" pero el nav muestra "Finanzas" con `BarChart2` | ⚠️ | §4 |

**Veredicto:** Excelente adherencia. El componente mejor implementado del proyecto.

---

### R11. `src/app/t/[tenantSlug]/pos/page.tsx` (POS Server)

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R11.1 | Header usa `rounded-2xl border border-gray-200 bg-white shadow-sm` — sombra innecesaria | ⚠️ | §3 |
| R11.2 | `bg-gray-50` como canvas de página — correcto | ✅ | §1.1 |
| R11.3 | `max-w-sm` centrado — correcto | ✅ | §4 |

---

### R11b. `src/components/pos/PosClient.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R11b.1 | Input de búsqueda: `rounded-xl`, `focus-visible:ring-blue-900` — correcto | ✅ | §5 |
| R11b.2 | `border-2` en input — correcto (el spec dice `border-2`) | ✅ | §5 |
| R11b.3 | Empty state usa emoji `🛒` en vez de ícono Lucide | ⚠️ | §6 |
| R11b.4 | Toast usa `shadow-sm` — debería usar borde | ⚠️ | §3 |
| R11b.5 | Botón "Cobrar": `bg-emerald-600`, `text-xl font-bold`, `rounded-xl`, `py-5` (56px+) — correcto | ✅ | §5 |
| R11b.6 | `active:scale-95 transition-transform` en botones — correcto | ✅ | §5 |
| R11b.7 | Colores de stock: `text-red-600` (agotado), `text-amber-700` (bajo), `text-gray-500` (normal) — correcto | ✅ | §1.1, §1.2 |
| R11b.8 | Precios en `text-emerald-700 font-bold` — correcto | ✅ | §1.2 |
| R11b.9 | "No encontramos" usa banner `bg-amber-100 border-amber-200 text-amber-700` — correcto | ✅ | §5 |
| R11b.10 | Resultados de búsqueda sin `max-w-sm` constraint — se estiran | ⚠️ | §4 |

**Veredicto:** Muy buena adherencia. El componente POS está bien implementado.

---

### R11c. `src/components/pos/CartItem.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R11c.1 | `bg-white rounded-xl border border-gray-200` — patrón card correcto | ✅ | §5 |
| R11c.2 | `text-gray-900 font-bold` para precios — correcto | ✅ | §1.1 |
| R11c.3 | Botones +/- usan `rounded-full bg-gray-100 w-8 h-8` — correcto | ✅ | §5 |
| R11c.4 | Botón eliminar usa `text-red-600` — correcto | ✅ | §1.1 |

**Veredicto:** Correcto.

---

### R11d. `src/components/pos/WeightKeypad.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R11d.1 | Keypad usa `bg-gray-100 rounded-xl h-16` para teclas — `h-16` (64px) excelente para touch | ✅ | §3 |
| R11d.2 | Botón "Agregar": `bg-emerald-600`, `rounded-xl`, `py-4`, `text-lg font-semibold` — correcto | ✅ | §5 |
| R11d.3 | Botón "Cancelar": `bg-white border-2 border-gray-300` — correcto outline | ✅ | §5 |
| R11d.4 | `active:scale-95` en todas las teclas — correcto | ✅ | §5 |

**Veredicto:** Excelente implementación.

---

### R11e. `src/components/pos/PaymentSelector.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R11e.1 | Chips usan `rounded-full px-4 py-2 text-sm font-medium border` — correcto | ✅ | §5 |
| R11e.2 | Estado activo: `bg-blue-900 text-white border-blue-900` — correcto | ✅ | §5 |
| R11e.3 | Panel MIXED: `bg-gray-100 rounded-xl p-4` — correcto | ✅ | §5 |
| R11e.4 | Diferencia usa colores semánticos correctos (emerald/amber/red) | ✅ | §1.1 |
| R11e.5 | Inputs usan `border-2 border-gray-300 rounded-xl` — correcto | ✅ | §5 |

**Veredicto:** Correcto.

---

### R12. `src/app/t/[tenantSlug]/dashboard/page.tsx` y componentes

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R12.1 | Header usa `shadow-sm` — sombra innecesaria | ⚠️ | §3 |
| R12.2 | `bg-gray-50`, `max-w-sm`, `gap-6` — layout correcto | ✅ | §4 |
| R12.3 | Mensaje de error inline usa `text-red-600 bg-red-100 rounded-xl` — correcto | ✅ | §5 |

---

### R12b. `src/components/dashboard/NrusSummaryCard.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R12b.1 | `bg-gray-100 rounded-2xl p-6` — patrón card hero correcto | ✅ | §5 |
| R12b.2 | Labels `text-xs font-bold uppercase tracking-wider` — correcto | ✅ | §0 |
| R12b.3 | Alerta exclusión usa colores semánticos correctos (red/amber) | ✅ | §1.1 |
| R12b.4 | Métricas en `bg-white rounded-xl p-4` dentro de card — correcto | ✅ | — |
| R12b.5 | Copy en español, tono directo ("Debes migrar al Régimen MYPE") | ✅ | §7 |

**Veredicto:** Excelente. Componente de referencia.

---

### R12c. `src/components/dashboard/NrusThermometer.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R12c.1 | Implementación EXACTA del spec en DESIGN.md §5: `bg-gray-200 rounded-full h-4`, colores por umbral, `transition-all duration-500` | ✅ | §5 |
| R12c.2 | `role="progressbar"` con `aria-valuenow/valuemax` — correcto | ✅ | §12 |
| R12c.3 | Texto de estado usa `-700` para normal: `text-emerald-700`/`text-amber-700`/`text-red-700` — correcto | ✅ | §1.2 |

**Veredicto:** Implementación perfecta del spec.

---

### R12d. `src/components/dashboard/SalesSummaryChart.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R12d.1 | `bg-gray-100 rounded-xl p-4` — correcto | ✅ | §5 |
| R12d.2 | Barras: hoy `bg-emerald-600`, otros `bg-blue-900` — correcto | ✅ | §1.1 |
| R12d.3 | `text-xs font-bold uppercase tracking-wider` para título — correcto | ✅ | §0 |
| R12d.4 | Leyenda con indicadores de color — buen detalle UX | ✅ | — |

**Veredicto:** Correcto.

---

### R12e. `src/components/dashboard/ExpenseList.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R12e.1 | Botón "+" usa `bg-emerald-600 rounded-full w-10 h-10` — correcto | ✅ | — |
| R12e.2 | Form inline usa `bg-white rounded-xl border border-gray-200` — correcto | ✅ | §5 |
| R12e.3 | Input `border-2 border-gray-300 rounded-xl py-3 text-base` — correcto | ✅ | §5 |
| R12e.4 | Botón "Registrar gasto": `bg-emerald-600 rounded-xl py-4 text-lg font-semibold` — correcto | ✅ | §5 |
| R12e.5 | Label usa `text-sm font-semibold text-gray-700` — OK pero el spec pide `text-xs font-bold uppercase tracking-wider` para labels | ⚠️ | §0 |

**Veredicto:** Bueno.

---

### R13. `src/app/t/[tenantSlug]/inventory/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R13.1 | Header `bg-blue-900 text-white shadow-sm` — sombra innecesaria | ⚠️ | §3 |
| R13.2 | Botón "NUEVO": `bg-emerald-600 rounded-xl py-4` — correcto | ✅ | §5 |
| R13.3 | Botón "CSV": `bg-white border-2 border-gray-300 rounded-xl py-4` — correcto outline | ✅ | §5 |
| R13.4 | Filtros chip usan `rounded-full` — correcto | ✅ | §5 |
| R13.5 | Chip "Stock bajo": `bg-amber-600 text-white` (activo) — correcto | ✅ | §1.1 |
| R13.6 | Texto del header usa `text-blue-200` para subtitle — no en DESIGN.md (la paleta solo menciona blue-900) | ⚠️ | §1.1 |
| R13.7 | Input de búsqueda usa `border` (1px) en vez de `border-2` (2px) | 🔶 | §5 |
| R13.8 | Fondo `bg-white` en vez de `bg-gray-50` para la página | ⚠️ | §1.1 |
| R13.9 | Texto "No se encontraron productos" usa `text-gray-500 text-lg` — OK | ✅ | — |

---

### R13b. `src/components/inventory/ProductCard.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R13b.1 | `bg-gray-100 rounded-xl p-4` — patrón card correcto | ✅ | §5 |
| R13b.2 | Precio `text-emerald-700 font-bold text-xl` — correcto | ✅ | §1.2 |
| R13b.3 | Badge "Agotado": `bg-red-100 text-red-700 rounded-full` — correcto | ✅ | §5 |
| R13b.4 | Badge "Stock bajo": `bg-amber-100 text-amber-700 rounded-full` — correcto | ✅ | §5 |
| R13b.5 | Botón "EDITAR": `bg-white border-2 border-gray-300 rounded-xl` — correcto outline | ✅ | §5 |
| R13b.6 | Labels `text-gray-500 text-xs uppercase tracking-wider font-bold` — correcto | ✅ | §0 |

**Veredicto:** Excelente implementación.

---

### R14. `src/app/t/[tenantSlug]/inventory/new/page.tsx` y `[productId]/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R14.1 | Header `bg-blue-900` con `shadow-sm` — sombra innecesaria | ⚠️ | §3 |
| R14.2 | Sin `max-w-sm` en `<main>` — contenido se estira en desktop | 🔶 | §4 |
| R14.3 | Ambos comparten patrón consistente — bueno | ✅ | — |

---

### R14b. `src/components/inventory/ProductForm.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R14b.1 | Labels usan `text-[11px]` — VIOLACIÓN: DESIGN.md §2 exige mínimo `text-sm` (14px) para texto interactivo | ❌ | §2 |
| R14b.2 | Inputs `border-2 border-gray-300 rounded-xl py-4 px-4 text-lg` — correcto | ✅ | §5 |
| R14b.3 | Botón guardar: `bg-emerald-600 rounded-xl py-4 text-lg font-semibold` — correcto | ✅ | §5 |
| R14b.4 | Botón eliminar: `bg-red-600 rounded-xl` — correcto | ✅ | §5 |
| R14b.5 | Botón "REGISTRAR MERMA": `border-amber-600 text-amber-700` — correcto outline | ✅ | §5 |
| R14b.6 | Chips UNIDAD/KILOGRAMO: `rounded-full` con estado activo `bg-blue-900` — correcto | ✅ | §5 |
| R14b.7 | Modal de merma usa `focus-visible:ring-amber-600` en vez de `ring-blue-900` | ⚠️ | §5 |
| R14b.8 | Modal usa `animate-in slide-in-from-bottom-4` — clase custom no estándar | ⚠️ | — |
| R14b.9 | Error banner `bg-red-100 border-red-200 text-red-700` — correcto | ✅ | §5 |

**Veredicto:** Bueno pero con VIOLACIÓN CRÍTICA en labels `< text-sm`.

---

### R15. `src/components/inventory/CsvImport.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R15.1 | Upload area: `bg-gray-100 rounded-xl border-2 border-dashed border-gray-300` — correcto | ✅ | — |
| R15.2 | Botón importar: `bg-emerald-600 rounded-xl py-4 text-lg font-semibold` — correcto | ✅ | §5 |
| R15.3 | Preview usa alerta `bg-amber-50 border-amber-200` — correcto | ✅ | §5 |
| R15.4 | Éxito banner: `bg-emerald-100 border-emerald-200 text-emerald-700` — correcto | ✅ | §5 |

**Veredicto:** Correcto.

---

### R16. `src/app/t/[tenantSlug]/purchases/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R16.1 | Header `bg-blue-900 text-white shadow-sm` — sombra | ⚠️ | §3 |
| R16.2 | Botón "REGISTRAR COMPRA": `bg-emerald-600 rounded-xl py-4 font-bold text-lg` — correcto | ✅ | §5 |
| R16.3 | `text-blue-200` para subtitle — no en paleta documentada | ⚠️ | §1.1 |
| R16.4 | Cards de compra: `bg-gray-100 rounded-xl p-4` con `border-b border-gray-200` — correcto | ✅ | §5 |
| R16.5 | Fechas en español peruano con `toLocaleDateString('es-PE')` — correcto | ✅ | §7 |

---

### R17. `src/app/t/[tenantSlug]/purchases/new/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R17.1 | Header `bg-blue-900` con `shadow-sm` | ⚠️ | §3 |
| R17.2 | `<main>` sin `max-w-sm` ni `mx-auto` | 🔶 | §4 |

---

### R17b. `src/components/purchases/OcrUploader.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R17b.1 | Upload area visualmente correcta (dashed border, icono, texto) | ✅ | — |
| R17b.2 | Spinner usa `border-blue-900` — correcto | ✅ | — |
| R17b.3 | Mock de OCR (setTimeout con datos fake) — esto es código de desarrollo, no producción | ❌ | — |
| R17b.4 | El mock hace que el componente no sea funcional | ❌ | — |

**Veredicto:** El mock de OCR DEBE ser reemplazado por la integración real con `/api/ocr`. Es código de demo.

---

### R17c. `src/components/purchases/PurchaseReviewForm.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R17c.1 | Labels usan `text-[11px]` — misma violación que ProductForm | ❌ | §2 |
| R17c.2 | Total input usa `text-2xl font-bold text-emerald-700` — correcto para monto grande | ✅ | §1.2, §2 |
| R17c.3 | Botón confirmar: `bg-emerald-600 rounded-xl py-4 text-lg font-semibold` — correcto | ✅ | §5 |
| R17c.4 | Items usan `border` (1px) + `rounded-lg` — debería ser `border-2` + `rounded-xl` | 🔶 | §3, §5 |
| R17c.5 | Labels de item ("Cant.", "C. Unit.", "Subtotal") usan `text-[10px]` — muy pequeño | ❌ | §2 |
| R17c.6 | Inputs de item usan `rounded-lg` en vez de `rounded-xl` | 🔶 | §3 |

---

### R18. `src/app/t/[tenantSlug]/cash-closure/page.tsx` y `CashClosureForm.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R18.1 | Header usa `shadow-sm` | ⚠️ | §3 |
| R18.2 | Botón "Cerrar Turno": usa `bg-blue-900` — VIOLACIÓN: es una acción de CONFIRMACIÓN, debe usar `bg-emerald-600` | ❌ | §1.1, §5 |
| R18.3 | Cards de resumen: `bg-gray-50 rounded-xl p-4` — correcto | ✅ | §5 |
| R18.4 | Input de monto: `text-2xl font-bold border-2 rounded-xl` — correcto | ✅ | §5 |
| R18.5 | Estados de diferencia usan colores semánticos correctos | ✅ | §1.1 |
| R18.6 | `focus:outline-none focus:border-blue-900` — debe usar `focus-visible:` | 🔶 | §5 |

---

### R19. `src/app/t/[tenantSlug]/returns/page.tsx` y `ReturnForm.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R19.1 | Header category usa `text-red-600` — correcto (devolución = peligro) | ✅ | §1.1 |
| R19.2 | Botón "Confirmar Devolución": `bg-red-600` — correcto para acción destructiva | ✅ | §5 |
| R19.3 | Botón "Buscar": `bg-blue-900` — correcto para navegación/consulta | ✅ | §1.1 |
| R19.4 | Total reembolso: `text-red-600 font-bold text-2xl` — correcto | ✅ | §1.2 |
| R19.5 | Inputs usan `focus:outline-none` en vez de `focus-visible:` | 🔶 | §5 |
| R19.6 | `rounded-lg` en alguns elementos en vez de `rounded-xl` | 🔶 | §3 |

---

### R20. `src/app/t/[tenantSlug]/settings/page.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R20.1 | Header usa `shadow-sm` | ⚠️ | §3 |
| R20.2 | Section cards: `bg-white border border-gray-200 rounded-2xl p-6 shadow-sm` — doble sombra/borde | ⚠️ | §3 |
| R20.3 | Links de navegación: `bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border` — correcto | ✅ | §5 |

---

### R21. `src/app/t/[tenantSlug]/settings/users/page.tsx` y `UsersClient.tsx`

| # | Hallazgo | Severidad | DESIGN.md ref |
|---|---|---|---|
| R21.1 | Header usa `shadow-sm` | ⚠️ | §3 |
| R21.2 | Member cards: `bg-white border border-gray-200 rounded-2xl shadow-sm` | ⚠️ | §3 |
| R21.3 | Badge "Activo": `bg-emerald-100 text-emerald-700` — correcto | ✅ | §1.1 |
| R21.4 | Select de rol: `border-2 border-gray-300 rounded-xl` — correcto | ✅ | §5 |
| R21.5 | Botón "Desactivar": `text-red-600 bg-red-50` — correcto | ✅ | §1.1 |

---

## 3. Resumen de Violaciones por Tipo

### Violaciones Críticas (❌)

| ID | Ruta/Componente | Hallazgo |
|---|---|---|
| V1 | `ProductForm.tsx:133` | Label usa `text-[11px]` (< `text-sm` mínimo) |
| V2 | `PurchaseReviewForm.tsx:115` | Label usa `text-[11px]` |
| V3 | `PurchaseReviewForm.tsx:197` | Labels de ítems usan `text-[10px]` |
| V4 | `CashClosureForm.tsx:121` | Botón "Cerrar Turno" usa `bg-blue-900` (confirmación debe ser `bg-emerald-600`) |
| V5 | `OcrUploader.tsx:57-72` | Mock de OCR con setTimeout() — no es funcional |
| V6 | `layout.tsx` | Sin infraestructura de tema (html class, color-scheme) |

### Violaciones Mayores (🔶)

| ID | Ruta/Componente | Hallazgo |
|---|---|---|
| M1 | `login/page.tsx`, `register/page.tsx` | Inputs usan `rounded-lg` en vez de `rounded-xl` |
| M2 | `login/page.tsx`, `register/page.tsx` | Error text usa `text-red-950` en vez de `text-red-700` |
| M3 | `login/page.tsx`, `register/page.tsx` | Botones usan `text-xs` en vez de `text-lg font-semibold` |
| M4 | `login/page.tsx:211` | Focus ring usa `ring-gray-900` en vez de `ring-blue-900` |
| M5 | `inventory/page.tsx:71` | Input search usa `border` (1px) en vez de `border-2` |
| M6 | `inventory/new/page.tsx`, `[productId]/page.tsx` | `<main>` sin `max-w-sm` |
| M7 | `purchases/new/page.tsx:23` | `<main>` sin `max-w-sm` |
| M8 | `PurchaseReviewForm.tsx` | Items usan `border` + `rounded-lg` en vez de `border-2` + `rounded-xl` |
| M9 | `CashClosureForm.tsx:94` | `focus:outline-none` en vez de `focus-visible:outline-none` |
| M10 | `ReturnForm.tsx` | `focus:outline-none` en vez de `focus-visible:` |
| M11 | `ReturnForm.tsx` | `rounded-lg` en elementos (debe ser `rounded-xl`) |
| M12 | Varias páginas | `text-blue-200` no documentado en la paleta |

### Violaciones Menores (⚠️)

| ID | Ruta/Componente | Hallazgo |
|---|---|---|
| W1 | 8+ componentes | Uso de `shadow-sm` en cards/headers (debe preferirse borde) |
| W2 | `login/page.tsx` | `shadow-xs` en botones |
| W3 | `PosClient.tsx:258` | Emoji `🛒` en vez de ícono Lucide (`ShoppingCart`) |
| W4 | `PosClient.tsx:115` | Toast usa `shadow-sm` |
| W5 | `ExpenseList.tsx:104` | Labels inconsistentes con el patrón del DESIGN.md |
| W6 | `ProductForm.tsx:307` | Modal usa `focus-visible:ring-amber-600` en vez del estándar `ring-blue-900` |
| W7 | `ProductForm.tsx:307` | `animate-in slide-in-from-bottom-4` no es clase estándar de Tailwind |
| W8 | `BottomNav.tsx:17` | Falta `aria-label` en `<nav>` |
| W9 | `BottomNav.tsx` | Nombres de secciones no coinciden 100% con DESIGN.md §4 |
| W10 | `inventory/page.tsx` | `text-blue-200` para subtitle (no documentado) |
| W11 | `purchases/page.tsx:26` | `text-blue-200` para subtitle (no documentado) |
| W12 | `tenants/page.tsx:25` | Loading state usa `bg-white` en vez de `bg-gray-50` |
| W13 | `settings/page.tsx` | Section cards usan `shadow-sm` |
| W14 | `UsersClient.tsx` | Member cards usan `shadow-sm` |
| W15 | `dashboard/page.tsx`, `cash-closure/page.tsx`, `returns/page.tsx` | Headers usan `shadow-sm` |

---

## 4. Plan de Acción Priorizado

### Fase 1: Infraestructura de Tema (Dark Mode) — 2-3 días

1. Agregar `ThemeProvider` con React Context + `localStorage`
2. Agregar `<html class="dark">` toggling
3. Agregar `color-scheme` meta tag
4. Definir variables `.dark` en `globals.css` para contextos SVG/inline
5. Implementar toggle en Settings page
6. **ATENCIÓN:** actualizar DESIGN.md §8 para reflejar la nueva decisión

### Fase 2: Correcciones Críticas — 1 día

1. V1-V3: Subir labels `text-[11px]`/`text-[10px]` a mínimo `text-xs` (12px), ideal `text-sm` (14px) — `ProductForm.tsx`, `PurchaseReviewForm.tsx`
2. V4: Cambiar botón "Cerrar Turno" de `bg-blue-900` a `bg-emerald-600`
3. V5: Implementar integración real OCR (consumir `/api/ocr` endpoint) — quitar mock
4. V6: Agregar `class` toggling en `<html>`

### Fase 3: Correcciones Mayores — 1-2 días

1. M1: `rounded-lg` → `rounded-xl` en inputs de login/register
2. M2: `text-red-950` → `text-red-700` en error banners de login/register
3. M3: `text-xs` → `text-lg font-semibold` en botones de login/register
4. M4: Focus ring `ring-gray-900` → `ring-blue-900` en login
5. M5: `border` → `border-2` en search input de inventory
6. M6-M7: Agregar `max-w-sm mx-auto` a páginas sin constrain
7. M8: `border` + `rounded-lg` → `border-2` + `rounded-xl` en PurchaseReviewForm items
8. M9-M10: `focus:outline-none` → `focus-visible:outline-none` en CashClosure y Returns
9. M11: `rounded-lg` → `rounded-xl` en Returns
10. M12: `text-blue-200` → definir y documentar en DESIGN.md o cambiar

### Fase 4: Correcciones Menores — 1 día

1. W1-W15: Eliminar `shadow-sm` de todos los componentes que usan bordes
2. W2: Eliminar `shadow-xs` de botones
3. W3: Reemplazar emoji por ícono Lucide `ShoppingCart`
4. W5: Estandarizar labels de ExpenseList
5. W6: `ring-amber-600` → `ring-blue-900` en modal de merma
6. W7: Reemplazar `animate-in slide-in-from-bottom-4` por utilidades Tailwind estándar
7. W8: Agregar `aria-label` en BottomNav
8. W9: Revisar nombres de secciones del nav

### Fase 5: Dark Mode por Componente — 3-4 días

1. Canvas/fondo en cada ruta: agregar `dark:bg-gray-950` a `bg-white`, `dark:bg-gray-900` a `bg-gray-50`
2. Cards: agregar `dark:bg-gray-800` a `bg-gray-100`, `dark:border-gray-700` a bordes
3. Texto: `dark:text-gray-100` a `text-gray-900`, `dark:text-gray-300` a `text-gray-700`, `dark:text-gray-400` a `text-gray-500`
4. Headers blue-900: `dark:bg-blue-950` o mantener azul
5. Verificar contraste de emerald-600, amber-600, red-600 sobre fondos oscuros
6. Ajustar colores semánticos si el contraste no cumple WCAG

---

## 5. Métricas

| Métrica | Valor |
|---|---|
| Rutas auditadas | 19 |
| Componentes auditados | 28 |
| Total archivos revisados | 47 |
| Violaciones críticas (❌) | 6 |
| Violaciones mayores (🔶) | 12 |
| Violaciones menores (⚠️) | 15 |
| Adherencia estimada a DESIGN.md | ~70% |
| Esfuerzo total estimado | 8-11 días |

---

## 6. Requiere decisión del stakeholder

1. **Confirmar dark mode:** ¿Se procede con el plan? Implica ~50% del esfuerzo total.
2. **`text-blue-200` en subtítulos:** ¿Se documenta en DESIGN.md o se cambia por `text-blue-100`/`text-white/70`?
3. **Nombres del Bottom Nav:** DESIGN.md §4 dice "NRUS (gráfico)" como 4to ítem, pero el código usa "Finanzas" con `BarChart2`. ¿Cuál es el correcto?
4. **Fuente `font-mono` en inputs:** Login y register usan `font-mono` en campos de texto. DESIGN.md no menciona monoespaciado. ¿Se mantiene o se unifica a `font-sans`?
