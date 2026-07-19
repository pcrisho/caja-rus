# Changelog de correcciones — Auditoría CajaRUS

**Fecha:** 2026-07-18/19
**Referencia:** `docs/audit/informe-auditoria-cajarus.md`

Todos los fixes fueron verificados por ejecución real (no solo lectura de código): `pnpm install` limpio (sin `DATABASE_URL` en el shell), `pnpm build`, `pnpm lint`, `pnpm audit`, y aplicación de las migraciones contra un Postgres 16 real desechable (Docker) comparado con `prisma migrate diff`.

## CRITICAL

### 1.1 — Autoregistro sin control de acceso
- **Archivos:** `src/lib/auth.ts`, `src/lib/env.ts`, `.env.example`, `.env`, `src/types/next-auth.d.ts`
- **Hallazgo adicional durante el fix:** al rastrear el flujo interno de `@auth/core` (`handle-login.ts`, `callback/index.ts`), se confirmó que el callback `signIn` se ejecuta **antes** de que el adapter cree al usuario. La lógica manual original (`prisma.user.findUnique` + `create` dentro de `signIn`) competía con el adapter y provocaba que el primer login de **cualquier** usuario nuevo lanzara `OAuthAccountNotLinked` (el adapter, al intentar vincular la cuenta OAuth, encontraba un `User` ya creado por email sin `Account` vinculada). Es decir: el login con Google probablemente no funcionaba para usuarios nuevos en el código original.
- **Fix:** se removió la creación manual. Ahora:
  - `signIn` solo verifica `isActive` (si el adapter ya resolvió una fila existente) y bloquea con redirect a `/login?error=inactive`.
  - Se agregó el evento `events.createUser` (se dispara una única vez, justo después de que el adapter crea la fila, sin condiciones de carrera) que decide `role`/`isActive` según `BOOTSTRAP_ADMIN_EMAILS`.
  - Nueva env var `BOOTSTRAP_ADMIN_EMAILS` (opcional, coma-separado): los correos listados se activan como `ADMIN` desde su primer login; cualquier otro correo se crea como `CASHIER` con `isActive: false` (pendiente de activación manual vía `pnpm db:studio` hasta que exista panel de admin).
  - `next-auth.d.ts` ahora augmenta también la interfaz `User` (no solo `Session`/`JWT`) con `role`/`isActive` para tipado correcto sin `as any`.
- **Acción requerida por ti:** completar `BOOTSTRAP_ADMIN_EMAILS` en tu `.env` con tu correo de Google antes de tu primer login (quedó con valor vacío `""` como placeholder). Si ya iniciaste sesión antes de este fix, actívate manualmente en `pnpm db:studio` (tabla `users`).
- **Bonus:** se corrigió también un espacio en blanco accidental en `AUTH_GOOGLE_ID` dentro de `.env` (`" 8474...com "`) que probablemente rompía el matching exacto que exige Google OAuth, y se agregó `.trim()` defensivo en `auth.ts` para blindar contra ese tipo de error a futuro.

### 2.1 — Migración faltante de `WasteAdjustment`
- **Archivo nuevo:** `prisma/migrations/20260719040546_add_waste_adjustments_and_hardening/migration.sql`
- Generada corriendo `prisma migrate dev` contra un Postgres local temporal (Docker) que ya tenía aplicada la migración original — **no se tocó ninguna base de datos real de Neon**. Contiene: la tabla `waste_adjustments` + enum `waste_reason` (lo que faltaba), más los demás fixes de schema aplicados en el mismo paso (ver 2.3–2.5 abajo) para no dejar una segunda migración de "parches" a medias.
- Verificado con `prisma migrate diff` tras aplicar ambas migraciones desde cero: diff vacío (schema y BD 100% sincronizados).

### 9.1 — `pnpm install` roto
- **Archivo:** `prisma.config.ts`
- Fix: `import "dotenv/config";` al inicio del archivo. Verificado con `env -i pnpm install --frozen-lockfile` (entorno de shell completamente limpio, sin `DATABASE_URL` exportada) → `postinstall` (`prisma generate`) ahora funciona.

## HIGH

### 1.2 — Open Redirect en `/login`
- **Archivo:** `src/app/login/page.tsx`
- Se agregó `sanitizeCallbackUrl()`: solo permite rutas internas (`startsWith("/")`, rechaza `//` protocol-relative). Se usa tanto en el `redirect()` crudo como en `signIn({ redirectTo })`.

### 1.3 — Staleness de JWT (sesión no revalida `role`/`isActive`)
- **Archivo:** `src/lib/auth.ts`, `src/types/next-auth.d.ts`
- El callback `jwt` ahora relee `role`/`isActive` desde la BD tanto en el login inicial (evita el problema de que el objeto `user` en memoria pueda estar desactualizado respecto a lo que `events.createUser` acaba de escribir) como periódicamente cada 5 minutos (`token.validatedAt`), en vez de solo una vez al inicio de la sesión de 30 días. Si el usuario fue borrado, se fuerza `isActive: false`.

### 1.4 — SSRF + sin rate limiting en `/api/ocr`
- **Archivos:** `src/app/api/ocr/route.ts`, `src/lib/rate-limit.ts` (nuevo)
- `imageUrl` ahora se valida contra `R2_PUBLIC_URL` antes de hacer `fetch()` (rechaza cualquier otro dominio).
- Rate limiter en memoria (`checkRateLimit`, ventana fija: 10 requests / 5 min por usuario) — best-effort según lo acordado contigo; documentado explícitamente que no es distribuido/exacto en serverless multi-instancia, con nota de cómo migrar a Upstash Redis cuando haga falta.
- De paso: `catch (error: any)` → `catch (error: unknown)` con narrowing.

### 2.2 / 2.3 — Índices faltantes
- **Archivo:** `prisma/schema.prisma` (+ migración 2.1)
- Agregados: `PurchaseItem.@@index([purchaseId])` y `@@index([productId])` (no tenía ninguno), `SaleItem.@@index([saleId])`, `NrusPayment.@@index([summaryId])`.

### 5.1 — `pnpm lint` roto
- **Archivo:** `eslint.config.mjs`, `package.json` (removida `@eslint/eslintrc`, ya sin uso)
- **Causa raíz encontrada:** `eslint-config-next` (desde v15+) ya exporta un **flat config nativo** (array de objetos, no un shareable config legacy). El código usaba `FlatCompat.extends("next/core-web-vitals")`, pensado para reinterpretar configs *legacy*; al pasarle un array ya-flat, el validador de `@eslint/eslintrc` chocaba con la autoreferencia circular que `eslint-plugin-react` declara en su propio export flat (`configs.flat.recommended.plugins.react === plugin`), y el error no era ni siquiera reportable (`TypeError: Converting circular structure to JSON`).
- **Fix:** `import nextCoreWebVitals from "eslint-config-next/core-web-vitals"` directo, sin `FlatCompat`. Verificado: `pnpm lint` corre limpio, y con un archivo de prueba deliberadamente malo (`<img>` sin alt) detectó los 2 warnings esperados (`@next/next/no-img-element`, `jsx-a11y/alt-text`) antes de eliminarlo.

### 9.2 — Vulnerabilidad RCE (`serialize-javascript`) vía `next-pwa` no usado
- **Archivo:** `package.json` (`pnpm.overrides`)
- Se agregaron overrides: `serialize-javascript@^7.0.7`, `@hono/node-server@^1.19.14` (dentro de la misma línea 1.x, sin bump de major), `postcss@^8.5.19`. Resultado: **`pnpm audit` pasó de 1 high + 3 moderate a 0 vulnerabilidades**. Se mantuvo `@ducanh2912/next-pwa` como dependencia (documentado que se reactivará más adelante), solo se neutralizó la cadena vulnerable.

## MEDIUM

- **1.5 — Headers de seguridad** (`next.config.ts`): agregados `Strict-Transport-Security`, `Permissions-Policy` y una `Content-Security-Policy` inicial (documentada como punto de partida a endurecer, no una CSP estricta final).
- **2.4 — Precisión `Decimal` inconsistente**: `SaleItem.unitPrice/totalPrice` y `PurchaseItem.unitCost/totalCost` pasaron de `Decimal(10,2)` a `Decimal(12,4)` (igual que `Product`), para no perder precisión en productos fraccionados (KG). Los totales agregados (`Sale.totalAmount`, `Purchase.totalAmount`, etc.) se mantuvieron en `Decimal(10,2)` (montos finales en soles).
- **2.5 — Convención de signo de `WasteAdjustment.quantity`**: documentada en el schema (siempre positiva = "cantidad removida") + `CHECK (quantity > 0)` agregado manualmente en la migración. De paso, se agregaron `CHECK` de defensa en profundidad: `products.stock >= 0`, `sale_items.quantity > 0`, `purchase_items.quantity > 0` (ninguna tabla tenía CHECK constraints antes).
- **2.6 — `pg.Pool` sin tuning** (`src/lib/prisma.ts`): `max: 5`, `idleTimeoutMillis: 10s`, `connectionTimeoutMillis: 10s`, explícitos para el patrón serverless + Neon pooler.
- **2.7 — `.env.example` engañoso**: `DATABASE_URL` de ejemplo ahora usa el patrón `-pooler` real de Neon y se quitaron `pgbouncer`/`connection_limit` (sin efecto con `adapter-pg`), con comentario explicando por qué.
- **3.2 — Artefactos PWA obsoletos**: `public/sw.js` y `public/workbox-3c9d0171.js` eliminados de git y del filesystem; agregados a `.gitignore` (se regeneran solos cuando se reactive next-pwa).
- **3.3 — Manifest/íconos faltantes**: `public/manifest.json` creado según lo documentado en `docs/07-pwa.md`; 3 íconos PNG placeholder generados con `sharp` (script de un solo uso en `scripts/generate-placeholder-icons.mjs`) usando el verde de marca (#059669) — **reemplazar por el ícono de marca definitivo antes de publicar**. Enlazado desde `layout.tsx` vía `metadata.manifest` + `viewport.themeColor`.
- **3.4 — Sin `error.tsx`/`loading.tsx`/`not-found.tsx`**: los 3 creados, con el tono de voz coloquial peruano del brandboard ("Algo salió mal. Ya estamos trabajando para arreglarlo").
- **5.4 — Zod schema OCR sin validar formato**: `supplierRuc` ahora exige `.length(11).regex(/^\d{11}$/)`; se agregaron `.positive()`/`.nonnegative()` a los campos numéricos y `.min(1)` a arrays/strings requeridos.
- **8.3 — Falta config de `images` para R2**: `next.config.ts` ahora arma `images.remotePatterns` a partir de `R2_PUBLIC_URL` si está definida.

## LOW / INFO

- **4.3 — `AUTH_TRUST_HOST`**: documentado (comentado) en `.env.example` para despliegues fuera de Vercel.
- **5.6 — `assertEnv()` nunca se invocaba**: ahora se llama desde `src/instrumentation.ts` (hook de arranque de Next.js), y se simplificó su implementación interna.
- **NEXT_PUBLIC_APP_URL sin uso**: ahora alimenta `metadata.metadataBase` en `layout.tsx`.
- **7.2 — Cifras NRUS**: se agregó una nota de advertencia al inicio de `docs/08-nrus-rules.md` recomendando validar contra la fuente oficial de SUNAT antes de implementar, y almacenar como configuración versionada en vez de constantes.

## Deliberadamente NO aplicado (con justificación)

- **9.5 — Bumps de versión mayor** (`eslint` 9→10, `typescript` 5→7, `dotenv` 16→17, `@types/node` 22→26): no se forzaron. El objetivo de esta ronda era estabilizar, no introducir riesgo nuevo justo después de reparar el toolchain (`pnpm lint`). Quedan documentados como disponibles para una futura actualización deliberada y probada por separado.
- **2.8 — Compatibilidad `@auth/prisma-adapter` con Prisma 7**: no hay acción de código posible; se deja como punto de vigilancia (monitorear el changelog del adapter).
- **7.3 — Lógica `consecutiveExcess`**: no implementable como "fix" porque no existe código de negocio NRUS todavía (correcto, es responsabilidad del desarrollo futuro, no de esta limpieza).

## Verificación final (todo en verde)

| Comando | Resultado |
|---|---|
| `env -i pnpm install --frozen-lockfile` | ✅ postinstall corre sin `DATABASE_URL` en el shell |
| `pnpm lint` | ✅ 0 errores/warnings (y detecta problemas reales cuando se le da código malo, verificado) |
| `pnpm build` | ✅ compila y genera las rutas esperadas |
| `pnpm audit` | ✅ 0 vulnerabilidades (antes: 1 high + 3 moderate) |
| `prisma migrate deploy` + `prisma migrate diff` (Postgres 16 real, Docker) | ✅ diff vacío, sin drift |
