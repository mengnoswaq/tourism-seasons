"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { changePassword } from "@/actions/profile";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function MainChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [navItems, setNavItems] = useState<{ id: string; label: string; url: string }[]>([]);

  const [hasPassword, setHasPassword] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    fetch("/api/navitems")
      .then((res) => res.json())
      .then((data) => setNavItems(data.navItems || []))
      .catch(() => {});

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setHasPassword(data.user.hasPassword ?? true);
        }
      })
      .catch(() => {});
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar categories={categories} navItems={navItems} />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassMessage(null);

    if (hasPassword && !currentPassword) {
      toast.error("Current password is required.", "Password Error");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.", "Password Error");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.", "Password Error");
      return;
    }

    setIsChangingPass(true);

    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    const res = await changePassword(formData);

    if (res.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasPassword(true);
      setPassMessage({
        text: res.message || "Password updated successfully!",
        isError: false,
      });
      toast.success(res.message || "Password updated successfully!", "Security Updated");
    } else {
      setPassMessage({
        text: res.error || "Failed to update password.",
        isError: true,
      });
      toast.error(res.error || "Failed to update password.", "Password Error");
    }
    setIsChangingPass(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar categories={categories} navItems={navItems} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Back Button */}
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>

        {/* Change Password Card */}
        <Card className="bg-white border border-slate-200 shadow-sm p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                SECURITY & PASSWORD
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {hasPassword ? "Change Password" : "Set Account Password"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasPassword
                ? "Update your account password to enhance security"
                : "Create a password to also log in using your email & password"}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-2xl">
            {!hasPassword && (
              <div className="bg-blue-50 border border-blue-200 text-[#2791F5] p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  You signed in using a Google Account. You can create a password below to use both Google and email/password login for this project.
                </span>
              </div>
            )}

            {passMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                  passMessage.isError
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passMessage.text}</span>
              </div>
            )}

            {hasPassword && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  CURRENT PASSWORD
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="py-2.5 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showCurrentPass ? "Hide Password" : "Show Password"}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {hasPassword ? "NEW PASSWORD *" : "PASSWORD *"}
                </label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    required
                    className="py-2.5 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showNewPass ? "Hide Password" : "Show Password"}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {hasPassword ? "CONFIRM NEW PASSWORD *" : "CONFIRM PASSWORD *"}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    required
                    className="py-2.5 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showConfirmPass ? "Hide Password" : "Show Password"}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                type="submit"
                disabled={isChangingPass}
                className="font-bold py-2.5 px-6 gap-2 border-slate-300 hover:bg-slate-50 text-slate-800"
              >
                <Lock className="w-4 h-4 text-[#2791F5]" />
                {isChangingPass
                  ? "Saving Password..."
                  : hasPassword
                  ? "Update Password"
                  : "Create Account Password"}
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
