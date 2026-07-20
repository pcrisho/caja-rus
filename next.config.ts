import type { NextConfig } from "next";

// Permite usar <Image> de next/image con las imágenes de facturas/productos
// alojadas en R2 en cuanto se implemente esa UI (hoy no hay ningún <Image>
// todavía, pero se deja preparado para no olvidarlo — ver
// docs/audit/informe-auditoria-cajarus.md #8.3).
const r2PublicHostname = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.78"],
  images: {
    remotePatterns: r2PublicHostname
      ? [{ protocol: "https", hostname: r2PublicHostname }]
      : [],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(), geolocation=(), payment=()",
        },
        {
          // CSP relativamente permisiva a propósito: el proyecto recién empieza
          // (Server Actions, Google OAuth, Gemini vía API route, R2 público) y
          // aún no hay inline scripts propios que restringir más. Ajustar
          // `connect-src`/`img-src` a medida que se agreguen integraciones
          // (p. ej. dominio real de R2_PUBLIC_URL) en vez de usar comodines.
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "connect-src 'self' https:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
