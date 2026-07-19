# CajaRUS — Agent Guide

Mobile-first PWA for Peruvian bodega management (NRUS/SUNAT). Next.js 16 App Router + Prisma 7 + Auth.js v5 + Neon (PostgreSQL).

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
pnpm install          # postinstall auto-runs prisma generate
pnpm dev              # Turbopack dev server
pnpm build            # production build
pnpm lint             # ESLint (next/core-web-vitals flat config)
```

## Prisma 7 (adapter pattern)

- Schema: `prisma/schema.prisma` (15 models, 7 enums)
- Config: `prisma.config.ts` — uses Prisma 7 `defineConfig` + `env()` for DATABASE_URL
- Client output: `src/generated/prisma/` (**gitignored**). After any schema change: `pnpm db:generate`
- Runtime: `src/lib/prisma.ts` — singleton with `@prisma/adapter-pg` + `pg.Pool` (not direct URL)
- All imports from `@/generated/prisma/client` and `@/generated/prisma/enums`

Available commands: `db:push` (push without migration), `db:migrate` (create migration), `db:studio`

## Auth (Auth.js v5 beta)

- Config in `src/lib/auth.ts`. Exports `{ handlers, auth, signIn, signOut }`
- JWT strategy, Google OAuth, PrismaAdapter
- **No `middleware.ts`** — Next.js 16 uses `src/proxy.ts` with `auth()` wrapper
- Route protection helpers: `src/lib/auth-helpers.ts` — `requireAuth()`, `requireRole(...roles)`
- Session type extended: `src/types/next-auth.d.ts` — adds `role`, `isActive`, `id`
- Auth API route: `src/app/api/auth/[...nextauth]/route.ts`

## Architecture notes

- **Server Components by default** — only scanner, cart, numeric keypad are Client Components
- **Path alias**: `@/*` → `./src/*`
- **Env vars**: `src/lib/env.ts` validates required vars. Use `.env.example` as template
- **OCR endpoint**: `POST /api/ocr` — protected (ADMIN only), validates image format/5MB limit
- **Offline store**: Dexie.js (`src/store/db.ts`) — products + pendingSales tables
- **R2 storage**: S3-compatible client in `src/lib/r2.ts`
- **AI model**: Gemini 1.5 Flash via `@ai-sdk/google` (`src/lib/ai.ts`)

## Conventions

- `@map()` on all fields and models for snake_case DB columns
- `@db.Uuid` on all ID fields, `@db.Decimal(precision, scale)` on monetary/quantity fields
- Server Actions for all mutations (not API routes)
- Serializable transactions with `SELECT FOR UPDATE` for sales (stock race conditions)
