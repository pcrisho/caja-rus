import { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    isActive?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      isActive: boolean;
      tenantId?: string | null;
      tenantSlug?: string | null;
      tenantName?: string | null;
      tenantRole?: UserRole | null;
      tenantMemberships?: Array<{
        tenantId: string;
        tenantSlug: string;
        tenantName: string;
        tenantRole: UserRole;
        isPrimary: boolean;
        isActive: boolean;
      }>;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isActive: boolean;
    id: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
    tenantRole?: UserRole;
    tenantMemberships?: Array<{
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      tenantRole: UserRole;
      isPrimary: boolean;
      isActive: boolean;
    }>;
    /** Epoch ms de la última vez que se releyó la sesión desde la BD. */
    validatedAt: number;
  }
}
