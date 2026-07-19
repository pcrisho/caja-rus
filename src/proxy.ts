import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getTenantHubPath,
  getTenantMemberships,
  getTenantContextBySlug,
} from "@/lib/tenancy";

const publicRoutes = [
  "/login",
  "/api/auth",
  "/_next/static",
  "/manifest.json",
  "/sw.js",
  "/icons",
];

// Claves = primer segmento de ruta DENTRO de la bodega activa, es decir
// `/t/[tenantSlug]/<segmento>`. Ojo: estas rutas no existen todavía en el
// código (products/sales/purchases/dashboard son trabajo pendiente), pero el
// gating queda listo para cuando se creen bajo `/t/[tenantSlug]/...` — no
// bajo rutas top-level como `/dashboard`, que ya no reflejan la arquitectura
// real y nunca harían match aquí.
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

  if (publicRoutes.some((route) => path.startsWith(route))) {
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

  const cachedMemberships = session.user.tenantMemberships ?? [];
  const activeMemberships = cachedMemberships.length
    ? cachedMemberships.filter((membership) => membership.isActive)
    : (await getTenantMemberships(session.user.id)).filter(
        (membership) => membership.isActive
      );
  const requestedMembership = requestedTenantSlug
    ? activeMemberships.find(
        (membership) => membership.tenantSlug === requestedTenantSlug
      ) ?? (await getTenantContextBySlug(session.user.id, requestedTenantSlug))
    : null;

  if (!activeMemberships.length && !isApiRoute && path !== "/tenants") {
    return NextResponse.redirect(
      new URL(getTenantHubPath("tenant_missing"), nextUrl.origin)
    );
  }

  if (requestedTenantSlug && !requestedMembership) {
    return NextResponse.redirect(
      new URL(getTenantHubPath("unauthorized"), nextUrl.origin)
    );
  }

  const allowedRoles = requestedTenantSubPath
    ? roleRouteMap[requestedTenantSubPath]
    : undefined;
  if (allowedRoles) {
    const routeRole = requestedMembership?.tenantRole;
    if (!routeRole || !allowedRoles.includes(routeRole as string)) {
      return NextResponse.redirect(
        new URL(getTenantHubPath("unauthorized"), nextUrl.origin)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
