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
        throw new Error("Email and password are required.");
      }

      const normalizedEmail = credentials.email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password.");
      }

      // Security check: Reject sign in if account status is INACTIVE
      if (user.status === "INACTIVE") {
        throw new Error("Your account has been deactivated. Please contact support.");
      }

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

      if (!isValid) {
        throw new Error("Invalid email or password.");
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const normalizedEmail = user.email.trim().toLowerCase();

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (existingUser) {
            // Security check: Block sign-in if account is deactivated
            if (existingUser.status === "INACTIVE") {
              return false;
            }
            // Sync avatar photo if user has no image
            if (!existingUser.image && user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: user.image },
              });
            }
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
          } else {
            // Auto-register user from verified Google OAuth login
            const newUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || normalizedEmail.split("@")[0],
                image: user.image?.startsWith("data:") ? null : user.image,
                role: "USER",
                status: "ACTIVE",
              },
            });
            user.id = newUser.id;
            (user as any).role = newUser.role;
          }
          return true;
        } catch (error) {
          console.error("Google Sign-In Error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
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
