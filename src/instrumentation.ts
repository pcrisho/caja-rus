import { assertEnv } from "@/lib/env";

/**
 * Hook de arranque de Next.js (App Router). Antes, `assertEnv()` existía en
 * `src/lib/env.ts` pero nunca se invocaba desde ningún punto de la app — este
 * es el lugar correcto para "fallar rápido" si falta una variable de entorno
 * crítica, en vez de descubrirlo recién cuando un usuario dispara la primera
 * consulta a la BD o a Auth.js. Ver docs/audit/informe-auditoria-cajarus.md #5.6.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    assertEnv();
  }
}
