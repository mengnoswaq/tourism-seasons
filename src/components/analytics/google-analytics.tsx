"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { pageview } from "@/lib/gtag";

function GoogleAnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTrackerInner />
    </Suspense>
  );
}
