import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[#2791F5] hover:bg-[#1b73c7] text-white shadow-sm font-medium",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium",
      outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium",
      ghost: "text-slate-700 hover:bg-slate-100 font-medium",
      danger: "bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-md",
      md: "px-4 py-2 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
