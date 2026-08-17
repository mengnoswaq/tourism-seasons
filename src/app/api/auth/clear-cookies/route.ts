import { NextResponse } from "next/server";

/**
 * Emergency cookie cleaner API endpoint.
 * Visiting /api/auth/clear-cookies will reset all session and chunked cookies,
 * then redirect the user safely back to the home page or login page.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectTarget = url.searchParams.get("redirect") || "/login";

  const response = NextResponse.redirect(new URL(redirectTarget, req.url));

  const baseCookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
  ];

  // Purge standard base cookies
  baseCookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });
  });

  // Purge all numbered chunks (.0 through .30) across all prefix variants
  for (let i = 0; i <= 30; i++) {
    response.cookies.set(`next-auth.session-token.${i}`, "", { maxAge: 0, path: "/", expires: new Date(0) });
    response.cookies.set(`__Secure-next-auth.session-token.${i}`, "", { maxAge: 0, path: "/", expires: new Date(0) });
    response.cookies.set(`__Host-next-auth.session-token.${i}`, "", { maxAge: 0, path: "/", expires: new Date(0) });
  }

  return response;
}
