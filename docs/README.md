# CajaRUS

**El control de tu negocio, al toque.**

Aplicación web mobile-first para la gestión de inventario, ventas y control financiero de bodegas peruanas bajo el régimen NRUS (SUNAT).

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router + Server Components + Turbopack) |
| Lenguaje | TypeScript |
| ORM | Prisma 7 (driver adapter pattern) |
| Base de Datos | Neon (PostgreSQL Serverless) |
| Autenticación | Auth.js v5 + Google OAuth |
| Almacenamiento | Cloudflare R2 |
| IA | Vercel AI SDK + Google Gemini |
| Despliegue | Vercel (capa gratuita) |
| PWA | @ducanh2912/next-pwa |
| Estado Local | Dexie.js (IndexedDB) + Zustand |

## Documentación

| # | Documento | Descripción |
|---|---|---|
| 01 | [Visión y PRD](./01-vision.md) | Visión del producto, módulos, RBAC, roadmap MVP |
| 02 | [Brandboard](./02-brandboard.md) | Identidad visual, paleta de colores, tipografía, tono |
| 03 | [Arquitectura](./03-architecture.md) | Stack, estructura de directorios, Server Actions |
| 04 | [Schema de Datos](./04-schema.md) | Modelo Prisma, ERD, decisiones de diseño |
| 05 | [Flujos UX](./05-flows.md) | Diagramas de flujo POS, OCR, NRUS, devoluciones, cierre de caja |
| 06 | [IA OCR](./06-ai-ocr.md) | Implementación del agente de IA para facturas |
| 07 | [PWA y Offline](./07-pwa.md) | Configuración PWA, Zustand offline, sync |
| 08 | [Reglas NRUS](./08-nrus-rules.md) | Lógica financiera, topes, alertas SUNAT |

## Estado del Proyecto

- [x] PRD y visión de producto
- [x] Brandboard y diseño visual
- [x] Modelo de datos (Prisma 7) con 15 modelos y 7 enums
- [x] Arquitectura del sistema con Auth.js v5 + Google OAuth
- [x] Inicialización del proyecto Next.js 16 + TypeScript + Tailwind v4
- [x] Configuración Prisma 7 (adapter pattern + prisma-client)
- [x] Configuración PWA (manifest + service worker)
- [x] Variables de entorno documentadas (`.env.example`)
- [x] Autenticación con Google OAuth (Auth.js v5 + proxy + JWT)
- [x] Endpoint OCR protegido con validaciones
- [ ] Módulo POS (escáner + carrito + cobro)
- [ ] Módulo de inventario (CRUD + alertas + categorías)
- [ ] Módulo de compras con OCR + IA
- [ ] Módulo de cierre de caja
- [ ] Módulo de devoluciones / notas de crédito
- [ ] Dashboard financiero y control NRUS
- [ ] Sincronización offline (Dexie.js + cola + idempotency keys)
