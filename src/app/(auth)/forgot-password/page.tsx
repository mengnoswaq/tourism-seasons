"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendForgotPasswordCode, resetPasswordWithCode } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const res = await sendForgotPasswordCode(email);

    if (!res.success) {
      setError(res.error || "Failed to send reset code.");
    } else {
      setSuccess(res.message || "Reset code sent to your email!");
      setStep(2);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", code);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    const res = await resetPasswordWithCode(formData);

    if (!res.success) {
      setError(res.error || "Failed to reset password.");
    } else {
      setSuccess("Password reset successfully! Redirecting to login...");
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
          <CardTitle className="text-2xl font-black">
            {step === 1 ? "Forget Password" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter your email address to receive a 6-digit password reset code"
              : `Enter the code sent to ${email} and your new password`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Enter Email */
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="john@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full gap-2 py-2.5 font-bold"
                type="submit"
                disabled={isLoading}
              >
                <Mail className="w-4 h-4" />{" "}
                {isLoading ? "Sending Reset Code..." : "Send Password Reset Code"}
              </Button>
            </form>
          ) : (
            /* STEP 2: Verification Code + New Password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  6-Digit Reset Code
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="text-center font-mono text-xl tracking-[0.5em] py-3 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Min 6 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Min 6 characters..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full gap-2 py-2.5 font-bold"
                type="submit"
                disabled={isLoading || code.length !== 6}
              >
                <Lock className="w-4 h-4" />{" "}
                {isLoading ? "Resetting Password..." : "Reset & Save Password"}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to email
                </button>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="text-[#2791F5] hover:underline font-semibold"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center text-xs text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-[#2791F5] hover:underline ml-1">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
