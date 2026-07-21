# CajaRUS — Agent Guide

Mobile-first PWA for Peruvian bodega management (NRUS/SUNAT). Next.js 16 App Router + Prisma 7 + Auth.js v5 + Neon (PostgreSQL).

## Frontend / UI work — read DESIGN.md first

**Antes de escribir o modificar cualquier componente, página, o clase de
Tailwind, lee `DESIGN.md`.** Es el sistema de diseño derivado de
`docs/02-brandboard.md` y `docs/01-vision.md`, con reglas verificadas
(contraste real calculado, no asumido) para:

- Paleta de color y qué clase de Tailwind usar para cada rol (`DESIGN.md §2`)
  — **importante:** no crear tokens custom de color vía `@theme` en
  `globals.css`, hay un bug reproducible documentado en `DESIGN.md §9` con
  la combinación actual de Next.js 16 (Turbopack) + Tailwind v4. Usar las
  clases nativas de Tailwind (`emerald-600/700`, `blue-900`, `amber-600/700`,
  `red-600`) directamente.
- Tipografía: **sin fuentes externas** (decisión de marca deliberada, por
  rendimiento en gama baja) — usar el stack de sistema / `font-sans` default.
- Tamaños táctiles (mínimo 56px en acciones primarias), espaciado,
  componentes base (botón XXL, cards, banners de estado, bottom nav,
  termómetro NRUS) y checklist de accesibilidad — todo en `DESIGN.md`.
- Voz y tono del copy: `docs/02-brandboard.md §4` (español peruano
  coloquial, nunca mensajes técnicos en inglés expuestos al usuario).

Componentes de referencia ya implementados y alineados con `DESIGN.md`:
`src/app/login/page.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`,
`src/app/loading.tsx`.

## Auditoría de seguridad / calidad

El proyecto pasó por una auditoría end-to-end con fixes aplicados. Ver:
- `docs/audit/informe-auditoria-cajarus.md` — hallazgos originales
- `docs/audit/changelog-fixes-aplicados.md` — qué se corrigió y cómo se verificó

No reintroducir estos problemas: autoregistro sin control en `signIn`
(usar siempre `BOOTSTRAP_ADMIN_EMAILS` + evento `createUser`, nunca crear
usuarios manualmente en el callback `signIn`), `redirect()` con
`callbackUrl` sin sanitizar, `fetch()` de URLs no validadas en rutas API,
o `FlatCompat` en `eslint.config.mjs` (usar el export flat nativo de
`eslint-config-next` directamente).

## Token-Saving MCP Instructions (MUST USE)

This project uses **codebase-memory-mcp** to maintain a knowledge graph of the codebase.
**ALWAYS prefer MCP graph tools over grep/glob/file-search for code discovery.**

### Priority Order

1. `search_graph` — find functions, classes, routes, variables by pattern
2. `trace_path` — trace who calls a function or what it calls
3. `get_code_snippet` — read specific function/class source code
4. `query_graph` — run Cypher queries for complex patterns
5. `get_architecture` — high-level project summary

### When to fall back to grep/glob

- Searching for string literals, error messages, config values
- Searching non-code files (Dockerfiles, shell scripts, configs)
- When MCP tools return insufficient results

### Examples

- Find a handler: `search_graph(name_pattern=".*OrderHandler.*")`
- Who calls it: `trace_path(function_name="OrderHandler", direction="inbound")`
- Read source: `get_code_snippet(qualified_name="pkg/orders.OrderHandler")`

## Quick start

```bash
pnpm install          # postinstall auto-runs prisma generate (requiere dotenv cargado, ya resuelto en prisma.config.ts)
pnpm dev              # Turbopack dev server
pnpm build            # production build
pnpm lint             # ESLint (flat config nativo de eslint-config-next, sin FlatCompat)
```

**Antes de tu primer login:** define `BOOTSTRAP_ADMIN_EMAILS` en `.env` con
tu correo de Google. Cualquier otro correo que inicie sesión se crea como
`CASHIER` con `isActive: false` (autoregistro cerrado por defecto — ver
`src/lib/auth.ts`, evento `createUser`). Si te registraste antes de definir
la variable, actívate manualmente con `pnpm db:studio`.

## Prisma 7 (adapter pattern)

- Schema: `prisma/schema.prisma` (15 models, 7 enums)
- Config: `prisma.config.ts` — Prisma 7 `defineConfig` + `env()` para `DATABASE_URL`. Carga `dotenv/config` explícitamente al inicio (Prisma 7 ya NO auto-carga `.env` para la CLI, a diferencia de versiones previas).
- Migraciones: 2 archivos en `prisma/migrations/` — el segundo (`add_waste_adjustments_and_hardening`) agrega `WasteAdjustment`, índices en `PurchaseItem`/`SaleItem`/`NrusPayment`, ajusta precisión `Decimal` de `SaleItem`/`PurchaseItem` a `(12,4)`, y agrega `CHECK` constraints (`quantity > 0`, `stock >= 0`) manualmente al final del `.sql`. Si editas `schema.prisma`, generar la migración contra una BD real (o local vía Docker) y verificar con `prisma migrate diff` que quede en cero antes de commitear.
- Client output: `src/generated/prisma/` (**gitignored**). After any schema change: `pnpm db:generate`
- Runtime: `src/lib/prisma.ts` — singleton with `@prisma/adapter-pg` + `pg.Pool` (`max: 5`, timeouts configurados) — **no** conexión directa por URL, y los parámetros `pgbouncer`/`connection_limit` de la URL no tienen efecto con este patrón (usar el endpoint `-pooler` de Neon en `DATABASE_URL`, el tamaño del pool se controla en este archivo)
- All imports from `@/generated/prisma/client` and `@/generated/prisma/enums`

Available commands: `db:push` (push without migration), `db:migrate` (create migration), `db:studio`

## Auth (Auth.js v5 beta)

- Config in `src/lib/auth.ts`. Exports `{ handlers, auth, signIn, signOut }`
- JWT strategy, Google OAuth, PrismaAdapter
- **Autoregistro cerrado por defecto**: el callback `signIn` NO crea usuarios manualmente (eso rompía el primer login por una condición de carrera con el adapter — ver changelog). La creación/activación real ocurre en el evento `events.createUser`, según `BOOTSTRAP_ADMIN_EMAILS`.
- **Revalidación de sesión**: el callback `jwt` relee `role`/`isActive` de la BD en el login inicial y cada 5 min (`token.validatedAt`), no solo una vez por los ~30 días que dura el JWT.
- **No `middleware.ts`** — Next.js 16 uses `src/proxy.ts` with `auth()` wrapper
- Route protection helpers: `src/lib/auth-helpers.ts` — `requireAuth()`, `requireRole(...roles)`
- Session type extended: `src/types/next-auth.d.ts` — adds `role`, `isActive`, `id` a `Session`/`JWT`, y también a `User` (para tipar el callback `signIn`/evento `createUser` sin `as any`)
- Auth API route: `src/app/api/auth/[...nextauth]/route.ts`
- `/login` sanitiza `callbackUrl` (solo rutas internas) antes de pasarlo a `redirect()` — no quitar esa validación (era un Open Redirect).

## Architecture notes

- **Server Components by default** — only scanner, cart, numeric keypad are Client Components
- **Path alias**: `@/*` → `./src/*`
- **Env vars**: `src/lib/env.ts` validates required vars (llamado desde `src/instrumentation.ts` al arrancar). Use `.env.example` as template. Nueva var: `BOOTSTRAP_ADMIN_EMAILS` (opcional).
- **OCR endpoint**: `POST /api/ocr` — protegido (solo ADMIN), valida formato de imagen/5MB, rate limit en memoria (`src/lib/rate-limit.ts`, best-effort — no distribuido, ver comentario en el archivo), y valida que `imageUrl` pertenezca a `R2_PUBLIC_URL` (antes era vulnerable a SSRF)
- **Offline store**: Dexie.js (`src/store/db.ts`) — products + pendingSales tables
- **R2 storage**: S3-compatible client in `src/lib/r2.ts`
- **AI model**: Gemini 1.5 Flash via `@ai-sdk/google` (`src/lib/ai.ts`)
- **PWA**: `public/manifest.json` + `public/icons/*.png` (placeholders generados con `scripts/generate-placeholder-icons.mjs` — **reemplazar por el ícono de marca definitivo** antes de publicar). `next-pwa` sigue desactivado (incompatible con Turbopack); no commitear `public/sw.js`/`public/workbox-*.js` manualmente (están en `.gitignore`, se regeneran solos cuando se reactive el plugin).

## Conventions

- `@map()` on all fields and models for snake_case DB columns
- `@db.Uuid` on all ID fields, `@db.Decimal(precision, scale)` on monetary/quantity fields
- Server Actions for all mutations (not API routes)
- Serializable transactions with `SELECT FOR UPDATE` for sales (stock race conditions)

