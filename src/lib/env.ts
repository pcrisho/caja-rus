const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_URL: process.env.AUTH_URL,
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

export function assertEnv(): void {
  const missing = (Object.keys(env) as (keyof typeof env)[]).filter(
    (key) =>
      (env as Record<string, string | undefined>)[
        key as string
      ] === undefined && (["DATABASE_URL", "AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] as string[]).includes(key as string)
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export default env;
