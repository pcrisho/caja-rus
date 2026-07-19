import { UserRole } from "@prisma/client";

declare module "next-auth" {
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
  }
}
