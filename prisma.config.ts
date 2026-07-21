// Prisma 7 ya NO carga `.env` automáticamente para los comandos de la CLI
// (generate, migrate, db push, studio) — a diferencia de versiones previas.
// Sin esta línea, `pnpm install` falla en el hook `postinstall` (`prisma generate`)
// en cualquier clone nuevo del repo. Ver docs/audit/informe-auditoria-cajarus.md #9.1.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
  schema: "./prisma/schema.prisma",
});
