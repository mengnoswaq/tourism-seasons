"use client";

import { useEffect } from "react";

/**
 * Client-side component that automatically detects and clears stale chunked cookies
 * or bloated cookie headers from the user's browser to prevent HTTP 494 REQUEST_HEADER_TOO_LARGE.
 */
export function AutoCookieCleaner() {
  useEffect(() => {
    try {
      if (typeof document === "undefined") return;

      const rawCookies = document.cookie;
      if (!rawCookies) return;

      const cookieItems = rawCookies.split(";");
      let cleanedAny = false;

      cookieItems.forEach((item) => {
        const name = item.split("=")[0]?.trim();
        if (!name) return;

        // Check for chunked cookies like next-auth.session-token.0, .1, etc.
        const isChunked =
          /^(__Secure-)?next-auth\.session-token\.\d+$/.test(name) ||
          /^(__Host-)?next-auth\.session-token\.\d+$/.test(name) ||
          /^next-auth\.session-token\.\d+$/.test(name);

        if (isChunked) {
          // Expire in client browser for path '/' and domain variations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          cleanedAny = true;
        }
      });

      if (cleanedAny) {
        // Silent cleanup completed
      }
    } catch {
      // Silent error handler
    }
  }, []);

  return null;
}
