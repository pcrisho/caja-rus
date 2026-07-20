import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getTenantHubPath,
  getTenantMemberships,
  getTenantContextBySlug,
} from "@/lib/tenancy";

const publicPageRoutes = [
  "/login",
  "/register",
  "/manifest.json",
  "/sw.js",
];

const publicRoutePrefixes = [
  "/api/auth",
  "/_next/static",
  "/icons",
];

// Rutas que requieren rol ADMIN para el segmento `/t/[slug]/[subpath]`
const roleRouteMap: Record<string, string[]> = {
  dashboard: ["ADMIN"],
  purchases: ["ADMIN"],
  admin: ["ADMIN"],
};

export default auth(async (req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isApiRoute = path.startsWith("/api/");
  const tenantRouteMatch = path.match(/^\/t\/([^/]+)(?:\/([^/]+))?(?:\/.*)?$/);
  const requestedTenantSlug = tenantRouteMatch?.[1];
  const requestedTenantSubPath = tenantRouteMatch?.[2];

  const isPublicPage = publicPageRoutes.includes(path);
  const isPublicPrefix = publicRoutePrefixes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (path === "/" || isPublicPage || isPublicPrefix) {
    return NextResponse.next();
  }

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!session.user.isActive) {
    return NextResponse.redirect(
      new URL("/login?error=inactive", nextUrl.origin)
    );
  }

  // Si la ruta es /tenants, dejar pasar siempre — la página se encargará
  // de redirigir a la bodega correcta con datos frescos de la BD.
  if (path === "/tenants" || path.startsWith("/tenants?")) {
    return NextResponse.next();
  }

  // Obtener membresías: primero desde el JWT (rápido), si está vacío consultar BD.
  const cachedMemberships = session.user.tenantMemberships ?? [];
  let activeMemberships = cachedMemberships.filter((m) => m.isActive);

  if (activeMemberships.length === 0) {
    const dbMemberships = await getTenantMemberships(session.user.id);
    activeMemberships = dbMemberships.filter((m) => m.isActive);
  }

  // Usuario sin bodega: redirigir al onboarding solo si no tiene membresía activa en BD.
  if (activeMemberships.length === 0 && !isApiRoute) {
    return NextResponse.redirect(new URL("/register?setup=google", nextUrl.origin));
  }

  // Validar acceso a ruta de tenant específico
  if (requestedTenantSlug) {
    const requestedMembership =
      activeMemberships.find((m) => m.tenantSlug === requestedTenantSlug) ??
      (await getTenantContextBySlug(session.user.id, requestedTenantSlug));

    if (!requestedMembership) {
      return NextResponse.redirect(
        new URL(getTenantHubPath("unauthorized"), nextUrl.origin)
      );
    }

    // Verificar rol si la sub-ruta lo requiere
    const allowedRoles = requestedTenantSubPath
      ? roleRouteMap[requestedTenantSubPath]
      : undefined;
    if (allowedRoles) {
      const routeRole = requestedMembership.tenantRole;
      if (!routeRole || !allowedRoles.includes(routeRole as string)) {
        return NextResponse.redirect(
          new URL(getTenantHubPath("unauthorized"), nextUrl.origin)
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
