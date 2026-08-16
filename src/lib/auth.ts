import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.passwordHash) {
        throw new Error("No user found with this email");
      }

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

      if (!isValid) {
        throw new Error("Incorrect password");
      }

      // Sanitize avatar image to prevent large Base64 URLs from entering NextAuth JWT token cookies
      const sanitizedImage =
        user.image && (user.image.startsWith("data:") || user.image.length > 500)
          ? null
          : user.image;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: sanitizedImage,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "SUBSCRIBER";
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
      }

      // CRITICAL FIX FOR 494 REQUEST_HEADER_TOO_LARGE:
      // Always strip picture/image from JWT token so cookie is under 200 bytes
      delete token.picture;
      delete token.image;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;

        // Ensure session.user.image is not an oversized Base64 string
        if (typeof session.user.image === "string" && (session.user.image.startsWith("data:") || session.user.image.length > 500)) {
          session.user.image = null;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function hasPermission(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
