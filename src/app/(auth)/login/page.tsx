"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, LogIn, Chrome, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("tourism_remembered_email");
    const savedRemember = localStorage.getItem("tourism_remember_me");

    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedRemember !== null) {
      setRememberMe(savedRemember === "true");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem("tourism_remembered_email", email.trim().toLowerCase());
      localStorage.setItem("tourism_remember_me", "true");
    } else {
      localStorage.removeItem("tourism_remembered_email");
      localStorage.setItem("tourism_remember_me", "false");
    }

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials.");
        } else {
          setError(res.error);
        }
      } else if (res?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="max-w-md w-full shadow-2xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="mx-auto inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Tourism Seasons Logo"
              className="h-16 w-auto object-contain mx-auto"
            />
          </Link>
          <CardTitle className="text-2xl font-black">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your Tourism Seasons account and dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="admin@news.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#2791F5] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2791F5] focus:ring-[#2791F5] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            <Button variant="primary" className="w-full gap-2 py-2.5 font-bold" type="submit" disabled={isLoading}>
              <LogIn className="w-4 h-4" /> {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 absolute">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 py-2 text-xs"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Chrome className="w-4 h-4 text-blue-500" /> Google Account
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:underline ml-1">
            Register now
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
