import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Configured Secret Route Path for Admin Area (defaults to /portal-x9k-manage)
const DEFAULT_SECRET_PATH = "/portal-x9k-manage";

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

  // 1. Detect stale NextAuth chunked cookies (removes header size overhead)
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

  // Helper to construct a stealth HTTP 404 response (prevents scanners from detecting admin route)
  const createStealthNotFoundResponse = () => {
    const notFoundUrl = new URL("/404", req.url);
    const res = NextResponse.rewrite(notFoundUrl, { status: 404 });
    cleanStaleCookies(res);
    return res;
  };

  const cleanStaleCookies = (res: NextResponse) => {
    if (chunkedCookieKeys.length > 0) {
      chunkedCookieKeys.forEach((key) => {
        res.cookies.delete(key);
        res.cookies.set(key, "", { maxAge: 0, path: "/" });
      });
    }
  };

  // =========================================================================
  // 2. SECURITY LAYER A: OBSCURE & MASK DEFAULT `/admin` ROUTE
  // Any attempt to access default /admin or /admin/* directly returns HTTP 404 Not Found
  // =========================================================================
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return createStealthNotFoundResponse();
  }

  // =========================================================================
  // 3. SECURITY LAYER B: AUTHENTICATION & SENSITIVE ENDPOINT RATE LIMITING
  // =========================================================================
  const isAuthApi = pathname.startsWith("/api/auth");
  const isSecretAdminRoute =
    pathname === secretPath || pathname.startsWith(`${secretPath}/`);

  if (isAuthApi || isSecretAdminRoute) {
    const limiterKey = `${clientIp}:${isAuthApi ? "auth-api" : "admin-route"}`;
    // Strict limit: 20 requests per minute per IP for sensitive routes
    const limitResult = rateLimit(limiterKey, { limit: 20, windowMs: 60000 });

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
  // 4. SECURITY LAYER C: PROTECTED SECRET ADMIN ROUTE PROCESSING
  // =========================================================================
  if (isSecretAdminRoute) {
    // C1: IP Whitelisting Check (Optional configuration via ALLOWED_ADMIN_IPS)
    const allowedIpsEnv = process.env.ALLOWED_ADMIN_IPS;
    if (allowedIpsEnv && allowedIpsEnv.trim() !== "") {
      const allowedIps = allowedIpsEnv.split(",").map((ip) => ip.trim());
      if (!allowedIps.includes(clientIp)) {
        console.warn(`[Admin Security] Blocked unauthorized IP access attempt: ${clientIp}`);
        return createStealthNotFoundResponse();
      }
    }

    // C2: Server-Side HTTP-Only JWT Token Validation
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Return 404 instead of redirecting to login to keep secret route invisible to unauthenticated users
      return createStealthNotFoundResponse();
    }

    // C3: Strict User Role Authorization Check
    const userRole = (token.role as string)?.toUpperCase();
    const allowedRoles = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"];

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(`[Admin Security] Unauthorized role attempt by user ${token.sub}: ${userRole}`);
      return createStealthNotFoundResponse();
    }

    // C4: Multi-Factor Authentication (MFA) Check (Optional configuration via REQUIRE_MFA)
    if (process.env.REQUIRE_MFA === "true" && !token.isMfaVerified) {
      // If MFA is required but not verified, rewrite to MFA verification path
      const mfaUrl = new URL(`${secretPath}/mfa-verify`, req.url);
      const mfaResponse = NextResponse.rewrite(mfaUrl);
      cleanStaleCookies(mfaResponse);
      return mfaResponse;
    }

    // C5: Internal Next.js Route Rewrite
    // Maps secret path (e.g. /portal-x9k-manage/articles) internally to /admin page handlers (/admin/articles)
    const targetSubPath = pathname.substring(secretPath.length);
    const internalAdminPath = targetSubPath === "" || targetSubPath === "/"
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
