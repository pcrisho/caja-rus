import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getBootstrapAdminEmails } from "@/lib/env";

// Cada cuánto se releen role/isActive desde la BD dentro de una sesión JWT ya
// activa. Acota la ventana de "sesión zombie" (un usuario desactivado o cuyo
// rol cambió sigue teniendo acceso) sin pegarle a la BD en cada request.
// Ver docs/audit/informe-auditoria-cajarus.md #1.3.
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

      // Auth.js invoca este callback ANTES de que termine de crearse el
      // usuario en la BD cuando `user` viene del adapter recién creado (ver
      // evento `createUser` más abajo), así que NUNCA confiamos en
      // `user.role`/`user.isActive` en memoria: siempre releemos de la BD,
      // tanto en el login inicial como periódicamente.
      const isInitialSignIn = Boolean(user);
      const isStale =
        now - (typeof token.validatedAt === "number" ? token.validatedAt : 0) >=
        SESSION_REVALIDATE_INTERVAL_MS;

      if ((isInitialSignIn || isStale) && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true },
        });
        // Si el usuario ya no existe (borrado), forzamos isActive=false para
        // que proxy.ts/auth-helpers.ts corten el acceso de inmediato.
        token.role = dbUser?.role ?? token.role ?? "CASHIER";
        token.isActive = dbUser?.isActive ?? false;
        token.validatedAt = now;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.isActive = !!token.isActive;
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      // Si `user` ya trae `isActive` es porque el adapter lo resolvió desde
      // una fila existente en la BD (usuario que vuelve a iniciar sesión).
      // Para un usuario recién creado, este callback corre ANTES de que el
      // adapter cree la fila (ver evento `createUser`), así que `isActive`
      // vendrá `undefined` y se deja pasar; la activación real se decide ahí.
      if (user.isActive === false) {
        return "/login?error=inactive";
      }
      return true;
    },
  },
  events: {
    // Se dispara una única vez, justo después de que el adapter crea la fila
    // en `users` para un login de Google nunca antes visto (ver
    // handleLoginOrRegister en @auth/core). Es el único punto seguro para
    // decidir el rol/estado inicial sin condiciones de carrera con el propio
    // adapter (auditoría #1.1).
    async createUser({ user }) {
      if (!user.id) return;

      const bootstrapAdmins = getBootstrapAdminEmails();
      const isBootstrapAdmin =
        !!user.email && bootstrapAdmins.includes(user.email.toLowerCase());

      await prisma.user.update({
        where: { id: user.id },
        data: isBootstrapAdmin
          ? { role: "ADMIN", isActive: true }
          : // Autoregistro cerrado por defecto: queda CASHIER inactivo hasta
            // que un ADMIN lo active manualmente (Prisma Studio por ahora).
            { role: "CASHIER", isActive: false },
      });
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!.trim(),
      clientSecret: process.env.AUTH_GOOGLE_SECRET!.trim(),
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    }),
  ],
});
