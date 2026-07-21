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
  "/_next/webpack-hmr",
  "/__nextjs",
  "/icons",
  "/design-system",
];

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

  if (path === "/tenants" || path.startsWith("/tenants?")) {
    return NextResponse.next();
  }

  const memberships = session.user.tenantMemberships ?? [];
  const activeMemberships = memberships.filter((m) => m.isActive);

  if (activeMemberships.length === 0 && !isApiRoute) {
    try {
      const dbMemberships = await getTenantMemberships(session.user.id);
      const dbActive = dbMemberships.filter((m) => m.isActive);
      if (dbActive.length === 0) {
        return NextResponse.redirect(
          new URL("/register?setup=google", nextUrl.origin)
        );
      }
      return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  }

  if (requestedTenantSlug) {
    const requestedMembership = activeMemberships.find(
      (m) => m.tenantSlug === requestedTenantSlug
    );

    if (!requestedMembership) {
      try {
        const ctx = await getTenantContextBySlug(
          session.user.id,
          requestedTenantSlug
        );
        if (!ctx) {
          return NextResponse.redirect(
            new URL(getTenantHubPath("unauthorized"), nextUrl.origin)
          );
        }
      } catch {
        return NextResponse.next();
      }
    }

    const allowedRoles = requestedTenantSubPath
      ? roleRouteMap[requestedTenantSubPath]
      : undefined;
    if (allowedRoles && requestedMembership) {
      if (
        !requestedMembership.tenantRole ||
        !allowedRoles.includes(requestedMembership.tenantRole as string)
      ) {
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
