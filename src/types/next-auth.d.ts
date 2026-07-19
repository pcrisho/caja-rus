import { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    isActive?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: UserRole;
      isActive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    isActive: boolean;
    id: string;
    /** Epoch ms de la última vez que se releyó role/isActive desde la BD. */
    validatedAt: number;
  }
}
