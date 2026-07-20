import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getBootstrapAdminEmails } from "@/lib/env";
import bcrypt from "bcryptjs";
import {
  getBootstrapTenantName,
  getBootstrapTenantSlug,
  getTenantMemberships,
} from "@/lib/tenancy";

const SESSION_REVALIDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();

      if (user?.id) {
        token.id = user.id;
      }

      const isInitialSignIn = Boolean(user);
      // Si el usuario aún está en onboarding (isFirstLogin=true), forzar
      // relectura de BD en cada petición para detectar el momento exacto
      // en que completa la configuración de su bodega.
      const pendingOnboarding = token.isFirstLogin === true;
      const isStale =
        pendingOnboarding ||
        now - (typeof token.validatedAt === "number" ? token.validatedAt : 0) >=
        SESSION_REVALIDATE_INTERVAL_MS;

      if ((isInitialSignIn || isStale) && token.id) {
        const [dbUser, tenantMemberships] = await Promise.all([
          prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, isFirstLogin: true },
          }),
          getTenantMemberships(token.id as string),
        ]);
        if (dbUser) {
          const activeMemberships = tenantMemberships.filter(
            (membership) => membership.isActive
          );
          const primaryMembership =
            activeMemberships.find((membership) => membership.isPrimary) ??
            activeMemberships[0] ??
            null;

          token.isActive = dbUser.isActive;
          token.isFirstLogin = dbUser.isFirstLogin;
          token.tenantMemberships = tenantMemberships;
          token.tenantId = primaryMembership?.tenantId;
          token.tenantSlug = primaryMembership?.tenantSlug;
          token.tenantName = primaryMembership?.tenantName;
          token.tenantRole = primaryMembership?.tenantRole;
          token.validatedAt = now;
        } else {
          if (isInitialSignIn) {
            token.isActive = true;
            token.isFirstLogin = true;
            token.tenantMemberships = [];
            token.validatedAt = 0;
          } else {
            token.isActive = false;
            token.isFirstLogin = false;
            token.tenantMemberships = [];
            token.tenantId = undefined;
            token.tenantSlug = undefined;
            token.tenantName = undefined;
            token.tenantRole = undefined;
            token.validatedAt = now;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isActive = !!token.isActive;
        session.user.isFirstLogin = !!token.isFirstLogin;
        session.user.id = token.id as string;
        session.user.tenantId =
          typeof token.tenantId === "string" ? token.tenantId : null;
        session.user.tenantSlug =
          typeof token.tenantSlug === "string" ? token.tenantSlug : null;
        session.user.tenantName =
          typeof token.tenantName === "string" ? token.tenantName : null;
        session.user.tenantRole =
          typeof token.tenantRole === "string"
            ? (token.tenantRole as typeof session.user.tenantRole)
            : null;
        session.user.tenantMemberships = Array.isArray(token.tenantMemberships)
          ? token.tenantMemberships
          : [];
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) {
        return "/login?error=inactive";
      }

      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { isActive: true },
      });

      if (dbUser) {
        return dbUser.isActive ? true : "/login?error=inactive";
      }

      if (!getBootstrapAdminEmails().includes(email)) {
        return "/login?error=inactive";
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const userId = user.id;
      const userEmail = user.email ? user.email.toLowerCase() : "";
      const isBootstrapAdmin = getBootstrapAdminEmails().includes(userEmail);

      if (!isBootstrapAdmin) {
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });
        return;
      }

      const tenantName = getBootstrapTenantName();
      const tenantSlug = getBootstrapTenantSlug();

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { isActive: true, isFirstLogin: false },
        });

        const tenant = await tx.tenant.upsert({
          where: { slug: tenantSlug },
          update: {
            name: tenantName,
            isActive: true,
          },
          create: {
            name: tenantName,
            slug: tenantSlug,
            isActive: true,
          },
        });

        await tx.tenantMember.upsert({
          where: {
            tenantId_userId: {
              tenantId: tenant.id,
              userId,
            },
          },
          update: {
            role: "ADMIN",
            isActive: true,
            isPrimary: true,
          },
          create: {
            tenantId: tenant.id,
            userId,
            role: "ADMIN",
            isActive: true,
            isPrimary: true,
          },
        });
      });
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string || "").trim().toLowerCase();
        const password = (credentials?.password as string || "");

        if (!email || !password) return null;

        const dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser || !dbUser.passwordHash || !dbUser.isActive) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);
        if (!isValidPassword) return null;

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!.trim(),
      clientSecret: process.env.AUTH_GOOGLE_SECRET!.trim(),
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    }),
  ],
});
