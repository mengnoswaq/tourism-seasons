import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Configured Secret Route Path for Admin Area (defaults to /portal-x9k-manage)
const DEFAULT_SECRET_PATH = "/portal-x9k-manage";
const ALLOWED_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"];

function getSecretPath(): string {
  const secretPath =
    process.env.ADMIN_SECRET_PATH ||
    process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH ||
    DEFAULT_SECRET_PATH;
  const normalized = secretPath.trim();
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookies = req.cookies;
  const secretPath = getSecretPath();

  // Extract client IP address for whitelisting and rate-limiting
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "127.0.0.1";

  // 1. Detect and clean stale NextAuth chunked cookies
  const chunkedCookieKeys: string[] = [];
  cookies.getAll().forEach((c) => {
    if (
      c.name.match(/^(__Secure-)?next-auth\.session-token\.\d+$/) ||
      c.name.match(/^(__Host-)?next-auth\.session-token\.\d+$/) ||
      c.name.match(/^next-auth\.session-token\.\d+$/)
    ) {
      chunkedCookieKeys.push(c.name);
    }
  });

  const cleanStaleCookies = (res: NextResponse) => {
    if (chunkedCookieKeys.length > 0) {
      chunkedCookieKeys.forEach((key) => {
        res.cookies.delete(key);
        res.cookies.set(key, "", { maxAge: 0, path: "/" });
      });
    }
  };

  const createRedirectToHomeResponse = () => {
    const res = NextResponse.redirect(new URL("/", req.url));
    cleanStaleCookies(res);
    return res;
  };

  // =========================================================================
  // 2. DEFAULT `/admin` ROUTE HANDLING
  // If anyone types /admin or /admin/*:
  // - Authorized staff -> Redirect to secret route (e.g. /portal-x9k-manage)
  // - Role USER or unauthenticated -> Immediately redirect to home page (/)
  // =========================================================================
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userRole = (token?.role as string)?.toUpperCase();

    if (token && userRole && ALLOWED_ROLES.includes(userRole)) {
      const subPath = pathname.substring(6); // Remove "/admin"
      const targetPath = `${secretPath}${subPath}`;
      const res = NextResponse.redirect(new URL(targetPath, req.url));
      cleanStaleCookies(res);
      return res;
    }

    // Role USER or unauthenticated -> Block immediately and redirect to home page
    return createRedirectToHomeResponse();
  }

  // =========================================================================
  // 3. RATE LIMITING FOR SENSITIVE AUTH & ADMIN ROUTES
  // =========================================================================
  const isAuthApi = pathname.startsWith("/api/auth");
  const isSecretAdminRoute =
    pathname === secretPath || pathname.startsWith(`${secretPath}/`);

  if (isAuthApi || isSecretAdminRoute) {
    const limiterKey = `${clientIp}:${isAuthApi ? "auth-api" : "admin-route"}`;
    const limitResult = rateLimit(limiterKey, { limit: 30, windowMs: 60000 });

    if (!limitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(limitResult.resetMs / 1000).toString(),
          },
        }
      );
    }
  }

  // =========================================================================
  // 4. PROTECTED SECRET ADMIN ROUTE PROCESSING
  // =========================================================================
  if (isSecretAdminRoute) {
    // C1: IP Whitelisting Check (Optional)
    const allowedIpsEnv = process.env.ALLOWED_ADMIN_IPS;
    if (allowedIpsEnv && allowedIpsEnv.trim() !== "") {
      const allowedIps = allowedIpsEnv.split(",").map((ip) => ip.trim());
      if (!allowedIps.includes(clientIp)) {
        return createRedirectToHomeResponse();
      }
    }

    // C2: JWT Token Validation
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return createRedirectToHomeResponse();
    }

    // C3: Strict User Role Authorization Check
    const userRole = (token.role as string)?.toUpperCase();
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      // Role USER or non-staff -> Immediately redirect to home page
      return createRedirectToHomeResponse();
    }

    // C4: Multi-Factor Authentication (MFA) Check (Optional)
    if (process.env.REQUIRE_MFA === "true" && !token.isMfaVerified) {
      const mfaUrl = new URL(`${secretPath}/mfa-verify`, req.url);
      const mfaResponse = NextResponse.rewrite(mfaUrl);
      cleanStaleCookies(mfaResponse);
      return mfaResponse;
    }

    // C5: Rewrite secret route internally to /admin page handler
    const targetSubPath = pathname.substring(secretPath.length);
    const internalAdminPath =
      targetSubPath === "" || targetSubPath === "/"
        ? "/admin"
        : `/admin${targetSubPath}`;

    const internalUrl = new URL(internalAdminPath, req.url);
    const response = NextResponse.rewrite(internalUrl);
    cleanStaleCookies(response);
    return response;
  }

  // Pass through all other public routes with stale cookie cleanup
  const response = NextResponse.next();
  cleanStaleCookies(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
