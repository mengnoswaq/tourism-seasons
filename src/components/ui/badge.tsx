import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "outline" | "danger" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    brand: "bg-[#2791F5]/10 text-[#2791F5] border border-[#2791F5]/20",
    outline: "border border-slate-200 text-slate-600",
    danger: "bg-red-50 text-red-600 border border-red-200",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
