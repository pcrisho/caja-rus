import { auth } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/enums";
import { getTenantContextBySlug } from "@/lib/tenancy";

export type AuthResult = {
  userId: string;
  isActive: boolean;
};

export type TenantAuthResult = AuthResult & {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantRole: UserRole;
};

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado. Debes iniciar sesión.");
  }
  if (!session.user.isActive) {
    throw new Error("Cuenta desactivada. Contacta al administrador.");
  }
  return {
    userId: session.user.id,
    isActive: session.user.isActive,
  };
}

/**
 * Resuelve y valida la bodega activa para una mutación/lectura de Server
 * Action o Route Handler.
 *
 * IMPORTANTE: `tenantSlug` SIEMPRE debe venir explícito de la URL que el
 * usuario está viendo (`/t/[tenantSlug]/...`), nunca del JWT cacheado. La
 * sesión guarda un `tenantId`/`tenantSlug` "primario" solo como atajo de
 * navegación (a qué bodega redirigir por defecto en `/pos` y `/tenants`),
 * pero un usuario puede pertenecer a varias bodegas y estar operando sobre
 * cualquiera de ellas en un momento dado. Si esta función usara el tenant
 * primario del JWT en vez del de la URL, un usuario con más de una
 * membresía activa podría terminar escribiendo silenciosamente en la
 * bodega equivocada con solo tener la pestaña de otra bodega abierta.
 * Ver docs/audit para el detalle de este hallazgo.
 *
 * La membresía se revalida siempre contra la BD (no contra el JWT
 * cacheado hasta 5 min) precisamente porque esta función se usa para
 * autorizar escrituras, donde la ventana de "sesión zombie" del JWT no es
 * aceptable.
 */
export async function requireTenantAuth(
  tenantSlug: string
): Promise<TenantAuthResult> {
  const authResult = await requireAuth();

  if (!tenantSlug) {
    throw new Error("Falta indicar la bodega activa.");
  }

  const tenantContext = await getTenantContextBySlug(
    authResult.userId,
    tenantSlug
  );

  if (!tenantContext) {
    throw new Error("No tienes acceso a esta bodega.");
  }

  return {
    ...authResult,
    ...tenantContext,
  };
}

export async function requireTenantRole(
  tenantSlug: string,
  ...roles: UserRole[]
): Promise<TenantAuthResult> {
  const authResult = await requireTenantAuth(tenantSlug);
  if (!roles.includes(authResult.tenantRole)) {
    throw new Error(
      `Acción restringida. Se requiere rol de bodega: ${roles.join(" o ")}`
    );
  }
  return authResult;
}
