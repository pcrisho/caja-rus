const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  // Correos (separados por coma) que se activan automáticamente como ADMIN
  // en su primer login con Google. Cualquier otro correo se crea como
  // CASHIER con isActive=false hasta que un ADMIN lo active manualmente.
  // Ver src/lib/auth.ts (evento `createUser`).
  BOOTSTRAP_ADMIN_EMAILS: process.env.BOOTSTRAP_ADMIN_EMAILS,
  // Nombre del tenant inicial que se crea junto con el primer ADMIN bootstrap.
  // Si no se define, se usa "Mi bodega".
  BOOTSTRAP_TENANT_NAME: process.env.BOOTSTRAP_TENANT_NAME,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_ENDPOINT: process.env.R2_ENDPOINT,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

type RequiredKey =
  | "DATABASE_URL"
  | "AUTH_SECRET"
  | "AUTH_GOOGLE_ID"
  | "AUTH_GOOGLE_SECRET";

const REQUIRED_KEYS: readonly RequiredKey[] = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
];

export function assertEnv(): void {
  const missing = REQUIRED_KEYS.filter((key) => env[key] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Lista normalizada (lowercase, sin espacios) de correos que se auto-activan
 * como ADMIN en su primer inicio de sesión. Vacía si la variable no está
 * configurada (comportamiento seguro por defecto: nadie se autoactiva).
 */
export function getBootstrapAdminEmails(): string[] {
  return (env.BOOTSTRAP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default env;
