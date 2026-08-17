"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LAST_ACTIVITY_KEY = "ts_last_user_activity";

/**
 * Client component that tracks user inactivity across browser tabs.
 * Automatically logs out any user who has been inactive for 24 hours.
 */
export function InactivityLogout() {
  const { data: session } = useSession();

  useEffect(() => {
    try {
      if (!session?.user) {
        try {
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        } catch {}
        return;
      }

      const now = Date.now();
      let lastActivityStr: string | null = null;
      try {
        lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      } catch {}

      if (!lastActivityStr) {
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
        } catch {}
      } else {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (!isNaN(lastActivity) && now - lastActivity >= INACTIVITY_LIMIT_MS) {
          // User has been inactive for 24+ hours -> Automatically sign out
          try {
            localStorage.removeItem(LAST_ACTIVITY_KEY);
          } catch {}
          signOut({ callbackUrl: "/login?reason=inactivity" });
          return;
        }
      }

      const updateActivity = () => {
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        } catch {}
      };

      let throttleTimeout: NodeJS.Timeout | null = null;
      const handleUserAction = () => {
        if (!throttleTimeout) {
          throttleTimeout = setTimeout(() => {
            updateActivity();
            throttleTimeout = null;
          }, 30000); // Throttle writes to once every 30 seconds
        }
      };

      const events = ["mousedown", "keydown", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, handleUserAction, { passive: true }));

      // Periodic check every 5 minutes while tab remains open
      const checkInterval = setInterval(() => {
        const current = Date.now();
        let last = 0;
        try {
          last = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || "0", 10);
        } catch {}

        if (last > 0 && current - last >= INACTIVITY_LIMIT_MS) {
          try {
            localStorage.removeItem(LAST_ACTIVITY_KEY);
          } catch {}
          signOut({ callbackUrl: "/login?reason=inactivity" });
        }
      }, 5 * 60 * 1000);

      return () => {
        events.forEach((event) => window.removeEventListener(event, handleUserAction));
        clearInterval(checkInterval);
        if (throttleTimeout) clearTimeout(throttleTimeout);
      };
    } catch {
      // Safe fallback for mobile WebViews / restricted browsers
    }
  }, [session]);

  return null;
}
