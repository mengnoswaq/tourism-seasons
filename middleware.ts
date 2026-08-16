import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookies = req.cookies;

  // Detect stale NextAuth chunked cookies (e.g. next-auth.session-token.0, .1, etc.)
  const chunkedCookieKeys: string[] = [];
  cookies.getAll().forEach((c) => {
    if (
      c.name.match(/^(__Secure-)?next-auth\.session-token\.\d+$/) ||
      c.name.match(/^(__Host-)?next-auth\.session-token\.\d+$/)
    ) {
      chunkedCookieKeys.push(c.name);
    }
  });

  let response = NextResponse.next();

  // Protect Admin Dashboard Routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(loginUrl);
    } else {
      const userRole = token.role as string;
      const allowed = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"];

      if (!allowed.includes(userRole)) {
        response = NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  // Automatically delete all stale chunked cookies to ensure header size stays < 1KB
  if (chunkedCookieKeys.length > 0) {
    chunkedCookieKeys.forEach((key) => {
      response.cookies.delete(key);
      response.cookies.set(key, "", { maxAge: 0, path: "/" });
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
