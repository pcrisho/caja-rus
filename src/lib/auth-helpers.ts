import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export type AuthResult = {
  userId: string;
  role: UserRole;
  isActive: boolean;
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
    role: session.user.role as UserRole,
    isActive: session.user.isActive,
  };
}

export async function requireRole(...roles: UserRole[]): Promise<AuthResult> {
  const authResult = await requireAuth();
  if (!roles.includes(authResult.role)) {
    throw new Error(
      `Acción restringida. Se requiere rol: ${roles.join(" o ")}`
    );
  }
  return authResult;
}
