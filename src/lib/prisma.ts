import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Tuning explícito para entorno serverless (Vercel + Neon pooler): cada
  // instancia fría crea su propio Pool, así que el default de `pg` (max: 10)
  // puede agotar rápido las conexiones de Neon bajo carga concurrente.
  // Requiere que DATABASE_URL apunte al endpoint "-pooler" de Neon (PgBouncer).
  // Ver docs/audit/informe-auditoria-cajarus.md #2.6.
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
