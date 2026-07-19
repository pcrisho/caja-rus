import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/api/auth",
  "/_next/static",
  "/manifest.json",
  "/sw.js",
  "/icons",
];

const roleRouteMap: Record<string, string[]> = {
  "/dashboard": ["ADMIN"],
  "/purchases": ["ADMIN"],
  "/admin": ["ADMIN"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

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

  for (const [routePrefix, allowedRoles] of Object.entries(roleRouteMap)) {
    if (path.startsWith(routePrefix)) {
      if (!allowedRoles.includes(session.user.role as string)) {
        return NextResponse.redirect(
          new URL("/pos?error=unauthorized", nextUrl.origin)
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
