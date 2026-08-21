import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";



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
    maxAge: 24 * 60 * 60, // 24 hours (86400 seconds)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours (86400 seconds)
  },
  useSecureCookies: process.env.NODE_ENV === "production",
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
    async jwt({ token, user }) {
      // CRITICAL FIX FOR 494 REQUEST_HEADER_TOO_LARGE:
      // Store ONLY essential identifiers in the JWT cookie payload to ensure cookie stays < 300 bytes (< 2KB limit).
      // Strips name, email, image/picture, bio, and extraneous fields from cookie storage.
      const userId = (user?.id as string) || (token.id as string) || (token.sub as string);
      const userRole = ((user as any)?.role as string) || (token.role as string) || "USER";

      return {
        sub: userId,
        id: userId,
        role: userRole,
      };
    },
    async session({ session, token }) {
      // Dynamic Database Lookup:
      // Keep cookie minimal and retrieve full profile details from DB when session is accessed.
      if (session && token?.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
              status: true,
            },
          });

          if (!dbUser || dbUser.status === "INACTIVE") {
            // Reject session if user was deleted or deactivated
            return null as any;
          }

          // Sanitize avatar image to ensure no raw Base64 string is attached
          const sanitizedImage =
            dbUser.image && (dbUser.image.startsWith("data:") || dbUser.image.length > 500)
              ? null
              : dbUser.image;

          session.user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: sanitizedImage,
            role: dbUser.role,
          } as any;
        } catch (error) {
          console.error("Error fetching user session from database:", error);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function hasPermission(userRole: string, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole.toUpperCase());
}

export async function requireAdminRoleServer(
  allowedRoles: string[] = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"]
) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role?.toUpperCase();

  if (!session?.user || !userRole || !allowedRoles.includes(userRole)) {
    redirect("/");
  }

  return session;
}

