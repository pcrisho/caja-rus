# SCAFFOLD — CajaRUS Multitenant

## Hecho
- Se convirtió el sistema a multitenant con una sola BD compartida.
- Se agregaron `Tenant` y `TenantMember` al schema Prisma.
- El rol dejó de ser global y pasó a ser por bodega (`TenantMember.role`).
- Se propagó `tenantId` a las tablas operativas principales.
- Se actualizó Auth.js para incluir tenant activo y membresías en sesión/JWT.
- Se creó el selector de bodegas en `/tenants`.
- Se agregó el POS por tenant en `/t/[tenantSlug]/pos`.
- Se dejó `/pos` como alias legacy.
- OCR ahora valida por tenant y bodega activa.
- La PWA ahora arranca en `/tenants`.
- Se regeneró Prisma Client.
- Se reemplazaron las migraciones viejas por una migración base nueva.
- Se actualizó `docs/` para reflejar el nuevo contrato.

## Pendiente
- Conectar `products`, `sales`, `purchases`, `dashboard`, `returns`, `cash closures` y `audit` al `tenantId` real en queries y server actions.
- Revisar cada mutación para que nunca lea o escriba fuera del tenant activo.
- Aplicar la migración base en la BD real y validar contra datos existentes si los hubiera.
- Definir el flujo de alta de nuevas bodegas dentro de la app (no solo bootstrap por env).
- Agregar cambio de tenant explícito en UI si un usuario pertenece a varias bodegas.
- Propagar `tenantId` a cualquier caché offline adicional que se agregue después.
- Revisar reportes/consultas agregadas para que siempre agrupen por tenant.
- Completar la documentación específica de los módulos que todavía no existen en código.

## Orden Recomendado
1. Conectar `products` e inventario al tenant.
2. Conectar `sales` y POS a persistencia por tenant.
3. Conectar `purchases` y OCR a tenant end-to-end.
4. Conectar `dashboard` y NRUS por tenant.
5. Conectar `cash closures`, `returns` y `audit`.
6. Agregar UI para cambio de tenant cuando haya varias membresías.

## Nota
- La base ya está lista para crecer sin mezclar datos entre bodegas, pero el aislamiento real depende de que cada query y cada mutación use `tenantId` de forma explícita.

## Auditoría y correcciones aplicadas (segunda pasada)

Se auditó el estado del scaffold y se encontraron gaps fuera de la lista de
"Pendiente" original. Todos se corrigieron:

1. **`requireTenantAuth`/`requireTenantRole` ahora exigen `tenantSlug` explícito** (`src/lib/auth-helpers.ts`) y resuelven la membresía **siempre contra la BD**, nunca contra el "tenant primario" cacheado en el JWT. Antes, un usuario con más de una bodega podía terminar escribiendo silenciosamente en la bodega equivocada. Cualquier Server Action/Route Handler que se construya de aquí en adelante para `products`/`sales`/`purchases`/etc. **debe** recibir el `tenantSlug` de la URL (`/t/[tenantSlug]/...`) y pasarlo a estos helpers — no hay forma de "olvidarse" porque ya no existe una versión sin ese parámetro.
2. **`src/proxy.ts`**: el `roleRouteMap` protegía rutas top-level (`/dashboard`, `/purchases`, `/admin`) que no existen en la arquitectura real — ahora matchea el segmento dentro de `/t/[tenantSlug]/<segmento>`.
3. **Integridad referencial por tenant a nivel de BD**: se agregaron `@@unique([tenantId, id])` en `Product`/`Sale`/`Purchase`/`SaleItem`/`NrusMonthlySummary`/`SaleReturn`, y las tablas hijas ahora referencian a sus padres con FKs **compuestas** `(tenantId, xId) → padre(tenantId, id)` en vez de FKs simples por `id`. Un `SaleItem` ya no puede apuntar a una `Sale`/`Product` de otra bodega, aunque el código de aplicación tenga un bug.
4. **FKs de "membership"** (agregadas a mano en la migración SQL): `Sale.cashierId`, `Purchase.adminId`, `Expense.adminId`, `CashClosure.cashierId`, `WasteAdjustment.adminId`, `AuditLog.userId`, `SaleReturn.processedById` ahora también tienen una FK compuesta hacia `tenant_members(tenantId, userId)` — garantiza que quien hizo la operación fue (o fue alguna vez) miembro real de esa bodega.
5. **Índice único parcial** `tenant_members_one_primary_per_user` (`WHERE is_primary = true`): evita que un usuario termine con dos bodegas marcadas como primaria a la vez.
6. **`NrusMonthlySummary.userId` eliminado**: era un resabio pre-multitenant que no participaba ni en el `@@unique` (`[tenantId, year, month]`) ni en ninguna lógica real — el NRUS es una obligación de la bodega, no de un usuario.
7. **Nuevo modelo `SaleReturn` / `SaleReturnItem`**: el flujo de devoluciones (`docs/05-flows.md`) no tenía ninguna tabla que lo respaldara — solo `SaleStatus.REFUNDED` a nivel de venta completa. Ahora existe el modelo para devoluciones parciales.
8. **CHECK constraints restaurados** (`products.stock >= 0`, `quantity > 0` en `waste_adjustments`/`sale_items`/`purchase_items`/`sale_return_items`): se habían perdido al colapsar las dos migraciones viejas en la nueva migración base multitenant.
9. **`/api/ocr` ahora valida que la key del objeto en R2 pertenezca al tenant activo** (`${tenantId}/...`), no solo que la URL pertenezca al bucket público en general (el bucket es compartido entre todas las bodegas).
10. **`src/store/db.ts` (Dexie)**: se agregaron helpers tenant-scoped (`getProductsForTenant`, `getPendingSalesForTenant`, `addPendingSaleForTenant`, `clearTenantOfflineData`) para que el código que consuma el store offline nunca tenga la opción de olvidarse del filtro por `tenantId`.
11. **`getPrimaryTenantContext` (código muerto) eliminado** de `src/lib/tenancy.ts`.
12. Migración base regenerada (`prisma/migrations/20260719062807_init_multitenant`), probada contra Postgres local en Docker (constraints validados con inserts que deben fallar/pasar) y aplicada limpia contra la BD de desarrollo real en Neon.

⚠️ **Nota de mantenimiento**: las FKs de membership, el índice único parcial y los CHECK constraints están agregados **a mano** al final del `.sql` de la migración porque Prisma no tiene DSL para representarlos. Si se regenera esa migración desde cero con `prisma migrate dev`, hay que volver a copiar ese bloque — Prisma no lo va a recrear solo, y `prisma migrate diff` va a reportar las FKs de membership como drift porque no existen en `schema.prisma`.
