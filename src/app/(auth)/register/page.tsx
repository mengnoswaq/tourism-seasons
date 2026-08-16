"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { UserPlus, Chrome } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await registerUser(formData);

    if (!res.success) {
      setError(res.error || "Registration failed.");
    } else {
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-slate-200">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="mx-auto inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Tourism Seasons Logo"
              className="h-16 w-auto object-contain mx-auto"
            />
          </Link>
          <CardTitle className="text-2xl font-black">Create Account</CardTitle>
          <CardDescription>
            Join Tourism Seasons to read, comment, and engage with top travel guides
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-semibold border border-emerald-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <Input name="name" type="text" placeholder="John Doe" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <Input name="email" type="email" placeholder="john@example.com" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Input name="password" type="password" placeholder="Min 6 characters..." required />
            </div>

            <Button variant="primary" className="w-full gap-2 py-2.5 font-bold" type="submit" disabled={isLoading}>
              <UserPlus className="w-4 h-4" /> {isLoading ? "Creating Account..." : "Register Account"}
            </Button>
          </form>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 absolute">
              Or sign up with
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 py-2 text-xs font-semibold"
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Chrome className="w-4 h-4 text-blue-500" /> Sign Up with Google (Gmail)
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#2791F5] hover:underline ml-1">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
