import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantId) {
          return null;
        }
        const admin = await prisma.adminUser.findFirst({
          where: {
            tenantId: credentials.tenantId,
            email: credentials.email.toLowerCase().trim(),
            isActive: true,
          },
          include: { tenant: { select: { slug: true } } },
        });
        if (!admin) return null;

        const ok = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!ok) return null;

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          tenantId: admin.tenantId,
          tenantSlug: admin.tenant.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name as string,
        email: token.email as string,
        role: token.role,
        tenantId: token.tenantId,
        tenantSlug: token.tenantSlug,
      };
      return session;
    },
  },
};
