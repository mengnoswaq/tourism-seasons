import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, alt = "Avatar", fallback = "U", size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  return (
    <div className={cn("relative inline-block rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0", sizes[size], className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-200">
          {fallback.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
