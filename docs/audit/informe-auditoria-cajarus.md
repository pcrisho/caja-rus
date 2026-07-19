# Auditoría End-to-End — CajaRUS

**Fecha:** 2026-07-18
**Alcance:** todo el repositorio (`/home/pcrisostomo/Documentos/GitHub/caja-rus`), commit `10fe32a` (rama `dev`).
**Metodología:** lectura estática de todo `src/`, `prisma/`, configuración raíz y `docs/`, más **verificación dinámica real**: se ejecutaron `pnpm install`, `pnpm build`, `pnpm lint`, `pnpm audit` y se levantó un Postgres 16 desechable en Docker para aplicar la migración y compararla con `schema.prisma` con `prisma migrate diff`. Toda la evidencia cruda está en `docs/audit/evidence/`.
**No se modificó ningún archivo de la aplicación** (solo se creó esta carpeta de auditoría).

## 0. Contexto importante para interpretar este informe

El proyecto está en una **etapa muy temprana de andamiaje**. El código real en `src/` se limita a:

```
src/app/api/auth/[...nextauth]/route.ts
src/app/api/ocr/route.ts
src/app/layout.tsx, page.tsx, login/page.tsx, globals.css
src/lib/{auth,auth-helpers,env,prisma,r2,ai}.ts
src/store/db.ts
src/proxy.ts
src/types/next-auth.d.ts
```

No existen todavía: Server Actions (`src/actions/`), páginas de POS/inventario/compras/dashboard, componentes cliente (carrito, escáner, teclado), `useOfflineStore` (Zustand), `OfflineSyncProvider`, `manifest.json`, íconos PWA, ni lógica de negocio NRUS. Todo eso solo existe **documentado** en `docs/`.

Por lo tanto, varios puntos del brief de auditoría (N+1 en Server Components, validación de `WasteAdjustment`, conflictos Zustand/Dexie, cálculo de mora NRUS, cierre de caja, etc.) **no son evaluables como código** porque el código aún no existe — se marcan como `N/A (no implementado)` y se comentan solo a nivel de riesgo de diseño/documentación.

Dicho esto, **lo que sí existe tiene defectos concretos y verificables**, incluyendo 3 que rompen el flujo básico de desarrollo (`pnpm install`, `pnpm lint`, migración vs. schema) y uno de control de acceso crítico. Ver calificación final.

---

## 1. Seguridad

### 1.1 — CRITICAL — Autoregistro sin control de acceso (account takeover / spam de cuentas)
- **Archivo:** `src/lib/auth.ts:32-51` (callback `signIn`)
- **Problema:** cualquier cuenta de Google puede iniciar sesión. Si el email no existe en `users`, el callback lo **crea automáticamente** con `role: "CASHIER"` e `isActive: true`, sin validar dominio de correo, sin invitación, sin aprobación de un ADMIN. No hay ningún allowlist en el código ni en `docs/` (`grep` de `allowlist|invite|whitelist` → 0 resultados).
- **Impacto:** cualquier persona con una cuenta de Google puede autoregistrarse como cajero **activo** en el POS de la bodega y operar el sistema (ver ventas, según lo que se implemente luego). El texto de `login/page.tsx:75` ("Solo usuarios autorizados de la bodega") es falso respecto al comportamiento real del código.
- **Solución sugerida:** en el callback `signIn`, validar contra una tabla/allowlist de invitaciones o dominio corporativo antes de crear el usuario; crear el registro con `isActive: false` por defecto y requerir activación manual de un ADMIN; alternativamente, deshabilitar la creación automática (`allowDangerousEmailAccountLinking: false` ya es el default, pero aquí el problema es la lógica manual de creación, no el linking).
- **Nota adicional:** este mismo callback duplica innecesariamente lo que `PrismaAdapter` ya hace internamente al crear el usuario OAuth (lookup + create manual), lo cual es código muerto/confuso más que un bug funcional, pero sugiere que la intención original (restringir quién puede entrar) nunca se implementó.

### 1.2 — HIGH — Open Redirect en `/login` vía `callbackUrl`
- **Archivo:** `src/app/login/page.tsx:9,12`
- **Problema:**
  ```ts
  const { error, callbackUrl } = await props.searchParams;
  if (session?.user) {
    redirect(callbackUrl ?? "/pos");
  }
  ```
  `callbackUrl` viene directo del query string (`?callbackUrl=...`), controlado 100% por el atacante, y se pasa sin validar a `redirect()` de `next/navigation`, que **no** aplica ninguna verificación de mismo origen (a diferencia del callback `redirect` interno de Auth.js, que si no se sobreescribe, sólo permite rutas relativas o mismo origen — ver `node_modules/.../@auth/core/src/index.ts:357-365`).
  Un usuario con sesión activa que visite `https://cajarus.app/login?callbackUrl=https://evil.com` será redirigido automáticamente a `evil.com`.
- **Impacto:** phishing (el link inicial es del dominio legítimo, lo que aumenta la tasa de clics), y potencial fuga de tokens en flujos que anexen fragmentos/parametros sensibles a la URL de retorno.
- **Solución sugerida:** validar que `callbackUrl` sea una ruta relativa interna (`callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")`) antes de usarla en `redirect()`; o reutilizar la misma lógica de sanitización que Auth.js aplica internamente.
- **Nota:** la llamada `signIn("google", { redirectTo: callbackUrl ?? "/pos" })` en la línea 39 **sí** está protegida porque pasa por el callback `redirect` por defecto de Auth.js (mismo origen). El problema es específicamente el `redirect()` crudo de la línea 12.

### 1.3 — HIGH — JWT/sesión no revalida `role`/`isActive` tras el login inicial
- **Archivo:** `src/lib/auth.ts:12-23` (callback `jwt`)
- **Problema:** `token.role`/`token.isActive` sólo se leen de la base de datos **cuando `user` está presente** (primer login). En requests subsecuentes, el callback simplemente retorna el `token` existente sin volver a consultar la BD. La sesión es JWT con `maxAge` por defecto de Auth.js (30 días) y no se configura `session.maxAge` en `auth.ts`.
- **Impacto:** si un ADMIN desactiva a un cajero (`isActive: false`) o le revoca el rol ADMIN, esa persona **conserva acceso completo** con su JWT ya emitido hasta que expire (hasta 30 días) o cierre sesión voluntariamente. Para un POS que maneja dinero, esto es un vector real de abuso por parte de empleados despedidos.
- **Solución sugerida:** reducir `session.maxAge`/`jwt.maxAge` a un valor corto (p.ej. 1-4 horas) y forzar refresco periódico revalidando contra la BD en el callback `jwt` (por ejemplo, guardando un `updatedAt`/versión y comparándolo cada N minutos), o migrar a estrategia `database` para sesiones críticas y usar el revocation-on-write nativo de esa estrategia.

### 1.4 — HIGH — SSRF parcial + sin rate limiting en `/api/ocr`
- **Archivo:** `src/app/api/ocr/route.ts:56-88`
- **Problema:** el endpoint recibe `imageUrl` en el body y hace `fetch(imageUrl)` sin validar que pertenezca al dominio de R2 (`R2_PUBLIC_URL`) ni a ningún allowlist. La validación de `content-type` y tamaño ocurre **después** de que la petición saliente ya se ejecutó. Además no hay ningún rate limiting (ni dependencia instalada para ello) en esta ruta, que dispara una llamada de pago a Gemini por cada request.
- **Impacto:** un usuario ADMIN (o una sesión ADMIN comprometida) puede usar el servidor como proxy para sondear la red interna/servicios cloud (SSRF), y/o generar costos ilimitados de la API de Gemini (abuso económico) al no existir límite de tasa.
- **Solución sugerida:** validar que `imageUrl` comience con `R2_PUBLIC_URL` (o resolver por `key` interno en vez de aceptar una URL arbitraria); aplicar rate limiting por usuario/IP (p.ej. Upstash Ratelimit o similar) antes de invocar `generateObject`.

### 1.5 — MEDIUM — Cabeceras de seguridad incompletas
- **Archivo:** `next.config.ts:4-13`
- **Problema:** sólo se configuran `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`. Faltan `Content-Security-Policy`, `Strict-Transport-Security` y `Permissions-Policy`.
- **Impacto:** menor profundidad de defensa contra XSS/clickjacking/downgrade a HTTP en despliegues fuera de Vercel (que añade HSTS automáticamente en su edge, pero no CSP).
- **Solución sugerida:** agregar al menos una `Content-Security-Policy` básica y `Strict-Transport-Security` explícita si no se despliega en Vercel.

### 1.6 — Positivo (buena práctica confirmada)
- `.env` **no** está en git (`git ls-files | grep '^\.env'` solo devuelve `.env.example`; `git log --all -- .env` vacío). `.env.example` usa placeholders (`your-...`, `generate-with: openssl rand -base64 32`), no hay secretos reales committeados. ✅
- No hay `dangerouslySetInnerHTML`, `eval(`, `new Function(` en `src/`. ✅
- No hay `$queryRawUnsafe`/`$executeRawUnsafe` usados en código propio (solo aparecen en las definiciones de tipos generadas por Prisma, no se usan). ✅
- El endpoint OCR sí valida sesión, rol ADMIN, `content-type` y tamaño ≤5MB (aunque con el orden de validación mejorable, ver 1.4). ✅

---

## 2. Prisma 7 & Base de Datos

### 2.1 — CRITICAL — `migration.sql` **no** refleja el schema actual: falta toda la tabla `WasteAdjustment`
- **Archivos:** `prisma/migrations/20260719012739_init_schema/migration.sql` vs `prisma/schema.prisma:63-72,178-194`
- **Problema (verificado con Postgres real, no solo por lectura):** se levantó un Postgres 16 limpio en Docker, se aplicó `prisma migrate deploy` (única migración del repo) y se comparó el resultado contra `schema.prisma` con `prisma migrate diff`. El diff no está vacío — falta por completo:
  - El enum `waste_reason`.
  - La tabla `waste_adjustments` (con sus 2 índices y 2 FKs).

  Ver evidencia completa en `docs/audit/evidence/04-migration-drift.txt`.
- **Impacto:** cualquier despliegue que use el flujo estándar y seguro de producción (`prisma migrate deploy`) generará una base de datos **sin** la tabla `waste_adjustments`. El Prisma Client generado (`src/generated/prisma`) sí expone `prisma.wasteAdjustment.*`, así que cualquier código futuro que la use fallará en runtime con `relation "waste_adjustments" does not exist`. Es un problema de integridad de datos, no solo de código.
- **Solución sugerida:** ejecutar `prisma migrate dev --name add_waste_adjustments` contra una BD de desarrollo sincronizada para generar la migración faltante, revisar que sea aditiva y aplicarla antes de cualquier despliegue real.

### 2.2 — HIGH — `PurchaseItem` sin ningún índice explícito
- **Archivo:** `prisma/schema.prisma:261-273`
- **Problema:** a diferencia de `SaleItem` (que sí tiene `@@index([productId])`), el modelo `PurchaseItem` no declara **ningún** `@@index`, ni sobre `purchaseId` ni sobre `productId`. Confirmado por `grep` en `docs/audit/evidence/06-schema-indexes.txt`.
- **Impacto:** listar los ítems de una compra o el historial de compras de un producto requerirá escaneos secuenciales completos de la tabla a medida que crece — justo el tipo de consulta frecuente en reportes de compras/inventario que el resto del schema sí optimiza.
- **Solución sugerida:** agregar `@@index([purchaseId])` y `@@index([productId])` a `PurchaseItem` (igual patrón que `SaleItem`).

### 2.3 — MEDIUM — Falta índice sobre `SaleItem.saleId` y `NrusPayment.summaryId`
- **Archivo:** `prisma/schema.prisma:218-231, 336-349`
- **Problema:** `SaleItem` solo indexa `productId`, no `saleId` (usado para renderizar el detalle de una venta). `NrusPayment` no indexa `summaryId` (usado para listar pagos de un resumen mensual).
- **Impacto:** consultas de detalle de venta / historial de pagos NRUS sin índice de soporte, más notorio al crecer el volumen de datos.
- **Solución sugerida:** agregar `@@index([saleId])` en `SaleItem` y `@@index([summaryId])` en `NrusPayment` (o evaluar si el volumen esperado —bajo, en NrusPayment— justifica omitirlo).

### 2.4 — MEDIUM — Inconsistencia de precisión `Decimal` entre catálogo y transacciones
- **Archivo:** `prisma/schema.prisma:152-153` (`Product.costPrice/sellingPrice` → `Decimal(12,4)`) vs `:222-224` (`SaleItem.unitPrice/totalPrice` → `Decimal(10,2)`) y `:265-267` (`PurchaseItem` → `Decimal(10,2)`)
- **Problema:** el precio de catálogo tiene 4 decimales (probablemente para soportar precio por kilo con productos vendidos por gramos), pero al copiarse a `SaleItem`/`PurchaseItem` con solo 2 decimales se pierde precisión. Ej.: `sellingPrice = 12.3456`/kg × `0.150` kg = `1.85184` → se trunca/redondea a `1.85` en `unitPrice`/`totalPrice`.
- **Impacto:** errores de redondeo acumulados en reportes financieros y, más grave, en el cálculo del límite NRUS (`totalSales`/`totalPurchases`), que es información con relevancia tributaria.
- **Solución sugerida:** unificar precisión (p. ej. `Decimal(12,4)` en todos los montos unitarios, `Decimal(12,2)` solo en totales agregados/monetarios finales), y decidir explícitamente una estrategia de redondeo (banker's rounding vs. half-up) documentada.

### 2.5 — MEDIUM — `WasteAdjustment.quantity` sin convención de signo ni `CHECK` a nivel de BD
- **Archivo:** `prisma/schema.prisma:182` + `docs/04-schema.md:570`
- **Problema:** `docs/04-schema.md:570` dice "las mermas reducen el stock del producto", pero no se especifica si `quantity` debe almacenarse positiva (cantidad removida) o negativa (delta aplicado directo al stock). No existe ningún `CHECK` constraint en la migración (de hecho, no hay **ningún** `CHECK` constraint en toda la BD — ni siquiera `total_amount >= 0` o `stock >= 0`).
- **Impacto:** ambigüedad de diseño que, sin una decisión explícita antes de implementar el Server Action correspondiente, puede producir bugs de doble-signo (sumar en vez de restar, o viceversa) que corrompan el stock silenciosamente.
- **Solución sugerida:** decidir la convención (recomendado: `quantity` siempre positiva = "cantidad removida", y que sea la lógica de aplicación quien reste del stock), documentarla en el schema con un comentario, y agregar `CHECK (quantity > 0)` vía migración SQL manual (Prisma no soporta `@check` nativo aún, se debe posteditar el `.sql`).

### 2.6 — MEDIUM — `pg.Pool` sin tuning explícito para entorno serverless
- **Archivo:** `src/lib/prisma.ts:9`
- **Problema:** `new Pool({ connectionString: process.env.DATABASE_URL })` no define `max`, `idleTimeoutMillis` ni `connectionTimeoutMillis`. Queda en el default de `pg` (`max: 10`). El patrón de `globalForPrisma` sí evita recrear el pool en cada hot-reload de desarrollo (correcto), pero en producción serverless (Vercel) cada instancia fría de función crea su propio proceso y, por ende, su propio `Pool` de hasta 10 conexiones.
- **Impacto:** bajo carga concurrente con múltiples instancias serverless simultáneas, riesgo de agotar el límite de conexiones de Neon (especialmente en el plan gratuito/starter).
- **Solución sugerida:** fijar explícitamente `max` (p. ej. 3-5 por instancia dado el uso del *pooled endpoint* de Neon), `idleTimeoutMillis` e `connectionTimeoutMillis`; confirmar que `DATABASE_URL` en producción usa el endpoint `-pooler` de Neon (ver 2.7).

### 2.7 — LOW — `.env.example` con `DATABASE_URL` engañosa para el patrón `adapter-pg`
- **Archivo:** `.env.example:5`
- **Problema:** el ejemplo usa un host sin sufijo `-pooler` e incluye `?pgbouncer=true&connection_limit=5`. Estos dos parámetros son específicos del *engine* nativo de Prisma (cuando Prisma arma su propio pool desde la URL); con `@prisma/adapter-pg` + `pg.Pool` (como está implementado aquí), **no tienen ningún efecto** — `pg.Pool` los ignora silenciosamente. El `.env` real de desarrollo sí usa correctamente el host `-pooler` de Neon (verificado), pero el ejemplo que verá cualquier persona nueva en el proyecto es engañoso.
- **Impacto:** confusión en onboarding; alguien podría asumir que el connection pooling está controlado por la URL cuando en realidad depende exclusivamente de las opciones de `pg.Pool` en `src/lib/prisma.ts`.
- **Solución sugerida:** actualizar `.env.example` para reflejar el host `-pooler` real de Neon y quitar los parámetros sin efecto, o añadir un comentario explicando que se ignoran con el adapter actual.

### 2.8 — LOW — Compatibilidad de `@auth/prisma-adapter` con Prisma 7 no está probada oficialmente
- **Archivo:** `package.json` (`@auth/prisma-adapter: ^2.11.2`, `@prisma/client: ^7.0.0`)
- **Problema:** el `peerDependencies` de `@auth/prisma-adapter@2.11.2` acepta `@prisma/client >=6` (rango abierto, así que Prisma 7 técnicamente satisface el rango), pero sus propios `devDependencies`/tests están fijados a `@prisma/client: ^6.0.0`. No hay garantía explícita de que el adaptador haya sido probado contra Prisma 7.
- **Impacto:** riesgo bajo pero real de incompatibilidades sutiles no cubiertas por los tests oficiales del adaptador (p. ej. cambios internos de tipos en Prisma 7).
- **Solución sugerida:** monitorear el changelog de `@auth/prisma-adapter` para una versión que declare soporte explícito de Prisma 7; mientras tanto, cubrir el flujo de login con al menos una prueba de integración.

---

## 3. Next.js 16 & Arquitectura

### 3.1 — Verificado — `next build` funciona correctamente
- **Evidencia:** `docs/audit/evidence/05-next-build-ok.txt`. Turbopack compila sin errores, TypeScript pasa, y el árbol de rutas generado coincide con lo esperado:
  - `/` y `/login` → `ƒ` (dinámicas, por el uso de `auth()`) — correcto.
  - `/_not-found` → `○` (estática) — correcto.
  - `/api/auth/[...nextauth]` y `/api/ocr` → `ƒ` — correcto.
  - `Proxy (Middleware)` se reporta correctamente como capa separada — confirma que `src/proxy.ts` es reconocido por Next 16 en reemplazo de `middleware.ts` (no coexisten, no hay conflicto).

### 3.2 — MEDIUM — Artefactos de PWA obsoletos commiteados en git
- **Archivos:** `public/sw.js`, `public/workbox-3c9d0171.js` (tracked en git desde el commit `ab5261b`)
- **Problema:** `next.config.ts` actual **no** envuelve la config con `@ducanh2912/next-pwa` (está deshabilitado, según confirma `docs/07-pwa.md:20-24`: *"desactivado temporalmente... por incompatibilidad con Turbopack"*). Sin embargo, `public/sw.js` y su `workbox-*.js` **sí siguen versionados en git**, generados por un build anterior con Webpack, y contienen hashes de chunks de esa build antigua (`/_next/static/chunks/app/page-d51d697a3d777642.js`, etc.) que ya no existen tras el build actual.
  Actualmente esto es inofensivo porque no hay ninguna llamada a `navigator.serviceWorker.register(...)` en todo `src/` (verificado por grep), así que el navegador nunca instala este SW. Pero es un artefacto de build que no debería estar en control de versiones.
- **Impacto:** si en el futuro alguien reactiva PWA y agrega el `register()` sin notar que estos archivos son residuos viejos, el navegador instalará un Service Worker que intenta precachear archivos inexistentes (404s) y puede romper la carga offline en vez de habilitarla.
- **Solución sugerida:** eliminar `public/sw.js` y `public/workbox-*.js` del repo, añadirlos a `.gitignore` (son artefactos de build), y regenerarlos correctamente cuando next-pwa se reactive de forma compatible con Turbopack (o se mueva la generación del SW a un paso de build no versionado).

### 3.3 — MEDIUM — Falta `manifest.json` e íconos, pese a estar referenciados
- **Archivos:** `src/proxy.ts:8,10` (rutas públicas `/manifest.json`, `/icons`), `docs/07-pwa.md:1-23`
- **Problema:** `proxy.ts` trata `/manifest.json` e `/icons` como rutas públicas, y `docs/07-pwa.md` documenta el contenido esperado del manifest — pero **no existe** `public/manifest.json` ni una carpeta `public/icons/` en el repo (`find` no encontró ninguno). Tampoco hay `<link rel="manifest">` en `src/app/layout.tsx`.
- **Impacto:** la PWA no es instalable actualmente (ningún navegador detectará el manifest). No es un bug de seguridad, pero contradice la propuesta de valor "PWA" del producto.
- **Solución sugerida:** crear `public/manifest.json` según lo documentado, generar los íconos, y enlazar el manifest desde `layout.tsx` (`<link rel="manifest" href="/manifest.json" />` o vía el objeto `metadata` de Next con la propiedad `manifest`).

### 3.4 — LOW — Sin `error.tsx`, `loading.tsx` ni `not-found.tsx` personalizados
- **Archivo:** `src/app/` (ausentes)
- **Problema:** no existen boundaries de error/carga personalizados; se depende 100% de los defaults de Next.js.
- **Impacto:** experiencia de error genérica de Next en producción; en un POS mobile-first esto puede confundir al cajero ante un fallo transitorio de red.
- **Solución sugerida:** agregar al menos un `error.tsx` global con mensaje amigable y botón de reintento, dado el contexto offline-first del producto.

### 3.5 — Positivo
- ESM consistente: `package.json` con `"type": "module"`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `prisma.config.ts` todos usan `import`/`export default`. No se detectó ningún `require()` oculto. ✅
- `SessionProvider` correctamente ubicado como único punto client-side necesario en `layout.tsx` (Server Component por defecto en todo lo demás). ✅
- `src/proxy.ts` con matcher `["/((?!_next/static|_next/image|favicon.ico).*)"]` sigue un patrón *deny-by-default* correcto: protege todo excepto lo explícitamente listado como público. ✅ (el defecto real está en el manejo de `callbackUrl`, no en el matcher).

---

## 4. Auth.js v5

### 4.1 — Ver 1.1, 1.2, 1.3 (autoregistro abierto, open redirect, staleness de JWT) — son, en esencia, los hallazgos de Auth.js.

### 4.2 — Verificado — Compatibilidad de versiones @auth/core
- **Evidencia:** `next-auth@5.0.0-beta.31` y `@auth/prisma-adapter@2.11.2` dependen ambos de `@auth/core@0.41.2` (versión idéntica, confirmado en `node_modules`). No hay conflicto de versión de `@auth/core` entre el core y el adapter. ✅

### 4.3 — INFO — `AUTH_TRUST_HOST` no declarado
- **Archivo:** `src/lib/env.ts` (no incluye `AUTH_TRUST_HOST`)
- **Problema:** Auth.js v5 requiere confiar explícitamente en el host cuando no se detecta automáticamente la plataforma (Vercel setea `VERCEL=1` y Auth.js lo detecta solo). Si el despliegue no es Vercel, faltará `AUTH_TRUST_HOST=true` y Auth.js rechazará las requests con error `UntrustedHost`.
- **Solución sugerida:** documentar/añadir `AUTH_TRUST_HOST` en `.env.example` si el despliegue objetivo no es exclusivamente Vercel.

### 4.4 — Verificado — `next-auth.d.ts` correcto
- **Archivo:** `src/types/next-auth.d.ts`
- La augmentación de tipos de `Session`/`JWT` importa `UserRole` desde `@/generated/prisma/enums` correctamente y es consistente con su uso en `auth.ts`, `auth-helpers.ts` y `proxy.ts`. ✅ Sin problemas de tipos detectados (compila limpio, ver evidencia de build).

---

## 5. Tipos TypeScript & Code Quality

### 5.1 — CRITICAL — `pnpm lint` está completamente roto
- **Archivo:** `eslint.config.mjs`, dependencias en `package.json`
- **Problema (reproducido, no solo leído):** ejecutar `pnpm lint` (`eslint .`) falla siempre con:
  ```
  TypeError: Converting circular structure to JSON
    ... property 'react' closes the circle
  ```
  antes incluso de analizar un solo archivo — falla al cargar la configuración compartida `next/core-web-vitals` a través de `FlatCompat`. Confirmado con las versiones instaladas: `eslint@9.39.5` + `eslint-config-next@16.2.10` + `@eslint/eslintrc@3.3.6` + `eslint-plugin-react@7.37.5` (todas dentro de los rangos declarados en `package.json`, es decir, **una instalación limpia con `pnpm install` reproduce el fallo**, no es un problema de un `node_modules` corrupto). Ver `docs/audit/evidence/02-lint-fail.txt`.
- **Impacto:** cero cobertura de ESLint en el proyecto — ni localmente ni en CI, si existiera. Cualquier regla de `next/core-web-vitals` (incluyendo detección de problemas de accesibilidad, hooks mal usados, `<img>` sin optimizar, etc.) no se está aplicando.
- **Solución sugerida:** fijar (no usar `^`) una combinación de versiones conocida-buena de `eslint`/`eslint-config-next`/`@eslint/eslintrc`, o usar `pnpm.overrides` para forzar una versión compatible de `eslint-plugin-react`; alternativamente, monitorear si `eslint-config-next` publica un export "flat" nativo (hoy `./core-web-vitals` sigue siendo CommonJS legacy pensado para `FlatCompat`, ver `node_modules/eslint-config-next/package.json` → `exports`). Como mitigación inmediata, correr `eslint` con `--no-eslintrc`/ajustar a una config mínima propia sin depender de `next/core-web-vitals` hasta resolver la incompatibilidad upstream.

### 5.2 — MEDIUM — `dotenv` es una dependencia instalada pero nunca usada
- **Archivo:** `package.json` (`"dotenv": "^16.5.0"` en `dependencies`)
- **Problema:** ningún archivo del proyecto importa `dotenv` (`grep -rn "dotenv"` sobre `src/*.ts`, `*.mjs`, `*.js` → 0 resultados). Es precisamente la pieza que falta para arreglar el bug crítico de `prisma.config.ts` (ver 9.1/CRITICAL).
- **Solución sugerida:** usarla en `prisma.config.ts` (`import "dotenv/config"` antes de `defineConfig`) — ver hallazgo 9.1 para el detalle completo.

### 5.3 — LOW — `catch (error: any)` en el único route handler no trivial
- **Archivo:** `src/app/api/ocr/route.ts:111`
- **Problema:** con `strict: true` en `tsconfig.json`, `any` explícito sigue siendo válido pero evita el chequeo de tipos en el bloque catch.
- **Solución sugerida:** usar `catch (error: unknown)` y hacer narrowing (`error instanceof Error ? error.message : "..."`).

### 5.4 — MEDIUM — Zod schema de OCR no valida formato de campos legalmente sensibles
- **Archivo:** `src/app/api/ocr/route.ts:8-10` vs `prisma/schema.prisma:240` (`supplierRuc @db.Char(11)`)
- **Problema:** `supplierRuc: z.string().describe("RUC del proveedor. 11 dígitos numéricos.")` — el `.describe()` es solo una pista para el modelo de IA (usado por `generateObject`), **no** una validación real de Zod. El schema acepta cualquier string de cualquier longitud/formato.
- **Impacto:** si el OCR de Gemini alucina o lee mal el RUC (p. ej. devuelve 9 o 13 caracteres), ese valor pasaría la validación de Zod pero, al intentar insertarse en una columna `CHAR(11)` de Postgres, provocaría un error de base de datos (`value too long for type character(11)`) el día que se implemente el guardado de compras. Actualmente no hay ningún Server Action que persista esto, así que el riesgo es 100% prospectivo pero real.
- **Solución sugerida:** agregar `.length(11).regex(/^\d{11}$/)` (o similar) a `supplierRuc` en el schema Zod, y validar/normalizar antes de cualquier insert.

### 5.5 — MEDIUM — Montos monetarios del OCR como `number` (float) en vez de tipo decimal-safe
- **Archivo:** `src/app/api/ocr/route.ts:27-40` (`unitCost`, `totalCost`, `baseAmount`, `igvAmount`, `totalAmount` → todos `z.number()`)
- **Problema:** los montos se validan como `number` de JavaScript (IEEE754), no como string a convertir a `Prisma.Decimal`. Los campos destino en el schema (`Decimal(10,2)`) requieren precisión exacta.
- **Impacto:** errores de redondeo clásicos de punto flotante (`0.1 + 0.2 !== 0.3`) al momento de persistir montos financieros, con relevancia tributaria (NRUS).
- **Solución sugerida:** al persistir, convertir explícitamente con `new Prisma.Decimal(value.toFixed(2))` en vez de pasar el `number` crudo al ORM; considerar que el schema de IA devuelva strings para los montos.

### 5.6 — Positivo
- `tsconfig.json` con `strict: true`, paths (`@/*`) correctos, `include`/`exclude` correctos, `jsx: react-jsx` (Next.js no lo sobreescribe con un valor incompatible). Build de TypeScript pasa limpio (`Finished TypeScript in ~1.5s` en el build real). ✅
- `src/lib/env.ts` valida las 4 variables verdaderamente indispensables para arrancar (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) — aunque nótese que `assertEnv()` no se invoca en ningún punto de arranque de la app (ni en `layout.tsx` ni en `next.config.ts`), por lo que hoy es una función sin efecto hasta que alguien la llame explícitamente (LOW, dead code).

---

## 6. Offline / PWA / Dexie.js

### 6.1 — Verificado — `src/store/db.ts`
- **Archivo:** `src/store/db.ts:23-31`
- Versionado de Dexie correcto (`db.version(1).stores(...)`), claves primarias (`&id`) e índices razonables para las queries esperadas (`products`: `barcode`, `name`, `*updatedAt`; `pendingSales`: `synced`, `saleDate`). El campo `synced: boolean` en `PendingSale` existe tal como pide el brief. ✅
- **MEDIUM — Falta:** no hay ningún código que **use** `db` todavía (ni Server Actions de sync, ni `useOfflineStore`, ni `OfflineSyncProvider` — todos documentados en `docs/07-pwa.md` pero inexistentes en `src/`). El store está definido pero es código muerto hasta que se conecte al flujo de venta.

### 6.2 — N/A (no implementado) — Sincronización offline / conflictos Zustand-Dexie
- No hay `useOfflineStore` ni `OfflineSyncProvider` en el código (solo en `docs/07-pwa.md` como snippets de referencia). No se puede auditar un conflicto que no existe en código todavía. Riesgo a vigilar cuando se implemente: la doble capa Zustand (efímera) + Dexie (persistente) descrita en la documentación no define claramente quién es la fuente de verdad durante una reconexión — recomendar que Dexie sea siempre la fuente de verdad persistente y Zustand solo un espejo de UI.

### 6.3 — Ver 3.2 y 3.3 (Service Worker obsoleto commiteado, manifest/íconos faltantes).

---

## 7. NRUS / Lógica de Negocio

### 7.1 — N/A (no implementado en código) — Toda la lógica NRUS vive solo en `docs/08-nrus-rules.md`
- No existe ningún Server Action, función de cálculo, ni tabla de configuración en `src/` relacionada a NRUS. El modelo `NrusMonthlySummary`/`NrusPayment` existe en el schema (y su tabla en la migración, correctamente), pero cero lógica de negocio implementada.

### 7.2 — INFO — Discrepancia entre las cifras citadas en el brief de auditoría y las documentadas en el repo
- El brief de auditoría menciona topes anuales de **S/107,000 (Cat. 1)** y **S/119,000 (Cat. 2)**. `docs/08-nrus-rules.md:9-13` documenta, en cambio, topes **mensuales** de **S/5,000 (Cat. 1)** y **S/8,000 (Cat. 2)**, con cuotas S/20 y S/50 respectivamente (esto último sí coincide con lo citado en el brief).
- No tengo forma de verificar contra la Resolución SUNAT vigente para 2026 cuál cifra es la correcta (no hay acceso a fuentes oficiales en vivo desde este entorno). **No se puede confirmar ni desmentir** ninguna de las dos cifras con el material disponible en el repo.
- **Recomendación:** antes de implementar cualquier lógica de categorización NRUS, validar las cifras vigentes directamente contra la fuente oficial de SUNAT (no contra este documento ni contra el brief), y almacenarlas como **configuración versionada** (tabla o archivo de config con fecha de vigencia) en vez de constantes hardcodeadas en el código — SUNAT actualiza estos montos periódicamente y un valor fijo en código obliga a un despliegue cada vez que cambian.

### 7.3 — MEDIUM — `consecutiveExcess`: falta de especificación formal de qué dispara el reset
- **Archivo:** `prisma/schema.prisma:325` + `docs/08-nrus-rules.md`
- El campo existe en el schema y la documentación describe la regla (incrementar/resetear/excluir a las 2 veces consecutivas), pero al no existir código, no hay forma de verificar que la implementación futura respete exactamente esa regla. Se deja como recordatorio para la revisión de código cuando se implemente el Server Action correspondiente (el snippet de ejemplo en `docs/08-nrus-rules.md` en sí mismo tiene una inconsistencia menor: usa `year_month` como nombre de constraint compuesta pero el schema real la nombra `userId_year_month` por incluir `userId` en la unicidad — la documentación no está sincronizada 1:1 con el schema final).

---

## 8. Performance

### 8.1 — Ver 2.2/2.3 (índices faltantes en `PurchaseItem`, `SaleItem.saleId`, `NrusPayment.summaryId`).

### 8.2 — N/A (no implementado) — No hay Server Components con `include`/`select` que auditar todavía (no hay queries de Prisma en ningún componente de `src/app/` más allá de `auth()`).

### 8.3 — INFO — `next.config.ts` sin configuración de `images`
- No hay `images.remotePatterns` para el dominio de R2. Actualmente no se usa `next/image` en ningún componente, así que no es un problema activo — pero será necesario configurarlo en cuanto se muestren imágenes de productos/facturas alojadas en R2.

### 8.4 — Positivo
- `lucide-react` se importa como paquete completo en `package.json` pero no se usa todavía en ningún componente (`grep -rn "lucide-react" src/` → sin resultados) — no hay problema de tree-shaking que auditar aún porque no hay imports concretos que revisar.

---

## 9. Configuración

### 9.1 — CRITICAL — `pnpm install` falla out-of-the-box (`postinstall` roto)
- **Archivo:** `prisma.config.ts:1-8`, `package.json` (`"postinstall": "prisma generate"`)
- **Problema (reproducido con una instalación limpia, `pnpm install --frozen-lockfile`):**
  ```
  > caja-rus@0.1.0 postinstall
  > prisma generate

  Failed to load config file ... Error: PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.
  ELIFECYCLE  Command failed with exit code 1.
  ```
  `prisma.config.ts` usa `env("DATABASE_URL")` de `prisma/config`, pero **nunca carga `.env`** — a diferencia de versiones previas de Prisma, el nuevo sistema de configuración (Prisma 7) **no** auto-carga `.env` para comandos de la CLI (`generate`, `migrate`, `db push`, `studio`); solo Next.js (en runtime de la app) carga `.env` automáticamente. Se confirmó exportando `DATABASE_URL` manualmente en el shell (`DATABASE_URL=... npx prisma generate` → funciona sin error), lo cual aísla la causa exacta: falta cargar `.env` dentro de `prisma.config.ts`. Ver `docs/audit/evidence/01-postinstall-fail.txt`.
  Irónicamente, `dotenv` **ya está instalado** como dependencia (`package.json`) pero nunca se usa (ver 5.2) — es la pieza que falta.
- **Impacto:** cualquier persona (o pipeline de CI/CD) que clone el repo y corra `pnpm install` siguiendo el "Quick start" del propio `AGENTS.md` **falla inmediatamente**, salvo que ya tenga `DATABASE_URL` exportada como variable de entorno del shell (no solo en `.env`). Esto bloquea onboarding y cualquier CI que no exporte manualmente la variable.
- **Solución sugerida:**
  ```ts
  // prisma.config.ts
  import "dotenv/config";
  import { defineConfig, env } from "prisma/config";

  export default defineConfig({
    datasource: { url: env("DATABASE_URL") },
    schema: "./prisma/schema.prisma",
  });
  ```
  (verificado conceptualmente: el error desaparece en cuanto `DATABASE_URL` está disponible en `process.env` antes de que `defineConfig` la resuelva).

### 9.2 — HIGH — Vulnerabilidad RCE (CVSS 8.1) activa vía dependencia de una feature deshabilitada
- **Archivo:** `package.json` (`"@ducanh2912/next-pwa": "^10.2.9"` en `dependencies`)
- **Problema:** `pnpm audit` reporta `serialize-javascript <=7.0.2` con severidad **high** (CVSS 8.1, RCE vía `RegExp.flags`/`Date.toISOString()`) y otra de severidad moderate (DoS), ambas llegando por la cadena `@ducanh2912/next-pwa > workbox-build > @rollup/plugin-terser > serialize-javascript`. Esta dependencia corresponde exactamente al plugin PWA que está **desactivado** (ver 3.2). Ver `docs/audit/evidence/03-pnpm-audit.txt`.
- **Impacto:** una vulnerabilidad de severidad alta instalada en el proyecto por una feature que ni siquiera está en uso — puro riesgo sin beneficio actual.
- **Solución sugerida:** mover `@ducanh2912/next-pwa` a un estado explícitamente no instalado hasta que se reactive (o forzar la resolución de `serialize-javascript` a `>=7.0.5` vía `pnpm.overrides` mientras tanto), reduciendo la superficie de auditoría a 0 vulnerabilidades de severidad alta.

### 9.3 — MEDIUM (informativo) — Otras 2 vulnerabilidades moderate no accionables directamente
- `postcss <8.5.10` (vía `next`) y `@hono/node-server <1.19.13` (vía `prisma>@prisma/dev`) — ambas transitivas de dependencias raíz ya actualizadas a su última versión estable disponible al momento de la auditoría (`next@16.2.10`, `prisma@7.8.0`). No accionable sin esperar un parche upstream; solo monitorear.

### 9.4 — Verificado — scripts de `package.json`
- `dev`, `build`, `start`, `lint` (roto, ver 5.1), `postinstall` (roto, ver 9.1), `db:generate/push/migrate/studio` — todos presentes y con nombres estándar. `packageManager: "pnpm@10.8.0"` fijado explícitamente. ✅ estructura correcta, solo fallan 2 de los 8 scripts por los bugs ya descritos.

### 9.5 — LOW — Dependencias de desarrollo desactualizadas (no urgente)
- `pnpm outdated` (ver `docs/audit/evidence`): `eslint` (9.39.5 → 10.7.0), `typescript` (5.9.3 → 7.0.2), `@types/node` (22.20.1 → 26.1.1), `dotenv` (16.6.1 → 17.4.2). Todas devDependencies o de bajo riesgo; no urgente pero conviene planificar la actualización de `eslint`/`typescript` junto con la resolución de 5.1.

---

## Resumen de hallazgos por severidad

| Severidad | Cantidad | IDs |
|---|---|---|
| CRITICAL | 3 | 1.1, 2.1, 9.1 |
| HIGH | 6 | 1.2, 1.3, 1.4, 2.2, 5.1, 9.2 |
| MEDIUM | 12 | 1.5, 2.3, 2.4, 2.5, 2.6, 3.2, 3.3, 5.2, 5.4, 5.5, 6.1, 7.3, 9.3 |
| LOW/INFO | 9 | 2.7, 2.8, 3.4, 4.3, 5.3, 5.6(nota), 7.2, 8.3, 9.5 |

*(5.1 lint roto se cuenta también HIGH por su impacto en calidad continua, aunque la causa raíz sea una incompatibilidad de dependencias, no un error de diseño del equipo.)*

---

## Calificación general: **D+**

**Justificación:** la calificación no penaliza que falten features (es esperable en esta etapa: ~90% del producto documentado todavía no tiene código). Penaliza que **lo poco que existe tiene 3 fallas críticas verificadas por ejecución real**, no solo hipótesis de lectura de código:

1. El propio comando de arranque documentado en `AGENTS.md` (`pnpm install`) **falla siempre** en una instalación limpia.
2. La única migración de base de datos del repo **no coincide** con el schema (falta una tabla entera) — confirmado aplicándola a un Postgres real.
3. El control de acceso permite que **cualquier persona con cuenta de Google se autoregistre activa** en el sistema, sin aprobación.

A esto se suma que `pnpm lint` está roto (cero cobertura estática) y hay una vulnerabilidad RCE de severidad alta instalada por una dependencia que ni siquiera se usa.

Lo positivo: las decisiones de arquitectura que sí están tomadas son sólidas (estrategia de `onDelete` por tabla coherente con un ledger financiero append-only + soft-delete vía `isActive`; patrón `proxy.ts` deny-by-default; separación Server/Client Components; adapter-pg + pool singleton correctamente cacheado en `globalThis`; ESM consistente; `.env` nunca comprometido en git). El problema no es el diseño, son bugs puntuales y corregibles en 1-2 días de trabajo enfocado.

## Top 5 cambios más urgentes

1. **Arreglar `prisma.config.ts`** agregando `import "dotenv/config"` — desbloquea `pnpm install`/`postinstall`/`db:*` para cualquier persona que clone el repo (hallazgo 9.1).
2. **Generar y aplicar la migración faltante de `WasteAdjustment`/`waste_reason`** (`prisma migrate dev --name add_waste_adjustments`) antes de tocar cualquier entorno real — hoy la BD real quedaría sin esa tabla (hallazgo 2.1).
3. **Cerrar el autoregistro sin control** en el callback `signIn` de `src/lib/auth.ts` (allowlist de dominio/invitación + `isActive: false` por defecto hasta aprobación de un ADMIN) — hoy cualquiera con Google se vuelve cajero activo (hallazgo 1.1).
4. **Corregir el Open Redirect** en `src/app/login/page.tsx:12` validando que `callbackUrl` sea una ruta interna antes de pasarla a `redirect()` (hallazgo 1.2).
5. **Reparar `pnpm lint`** (pin/override de versiones compatibles de `eslint`/`eslint-config-next`) **y** eliminar o aislar `@ducanh2912/next-pwa` mientras esté desactivado, para recuperar cobertura estática y resolver la vulnerabilidad RCE alta de paso (hallazgos 5.1 y 9.2).

---

## Evidencia adjunta

Todos los comandos abajo se ejecutaron realmente contra este repositorio (no son hipotéticos) y sus salidas completas están en `docs/audit/evidence/`:

| Archivo | Comando | Resultado |
|---|---|---|
| `01-postinstall-fail.txt` | `pnpm install --frozen-lockfile` | ❌ falla en `postinstall` (`prisma generate`) |
| `02-lint-fail.txt` | `pnpm lint` | ❌ falla con `TypeError` antes de analizar archivos |
| `03-pnpm-audit.txt` | `pnpm audit` | 1 high + 3 moderate (ver detalle) |
| `04-migration-drift.txt` | `prisma migrate deploy` + `prisma migrate diff` contra Postgres 16 real (Docker) | ❌ falta tabla `waste_adjustments` y enum `waste_reason` |
| `05-next-build-ok.txt` | `pnpm build` | ✅ build correcto, rutas dinámicas/estáticas como se espera |
| `06-schema-indexes.txt` | `grep` de `@@index`/`@@unique` en `schema.prisma` | confirma ausencia total de índices en `PurchaseItem` |
