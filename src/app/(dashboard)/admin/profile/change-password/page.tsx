"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/context/language-context";

export default function AdminChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();

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
      <div className="p-8 text-center text-slate-500 font-medium">
        {t("Loading...", "កំពុងទាញយក...")}
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
      toast.error(
        t("Current password is required.", "ពាក្យសម្ងាត់បច្ចុប្បន្នត្រូវបានទាមទារ។"),
        t("Password Error", "កំហុសពាក្យសម្ងាត់")
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        t("New password must be at least 6 characters long.", "ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។"),
        t("Password Error", "កំហុសពាក្យសម្ងាត់")
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        t("New password and confirm password do not match.", "ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់មិនត្រូវគ្នាទេ។"),
        t("Password Error", "កំហុសពាក្យសម្ងាត់")
      );
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
        text: res.message || t("Password updated successfully!", "បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!"),
        isError: false,
      });
      toast.success(
        res.message || t("Password updated successfully!", "បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!"),
        t("Security Updated", "បានបច្ចុប្បន្នភាពសុវត្ថិភាព")
      );
    } else {
      setPassMessage({
        text: res.error || t("Failed to update password.", "បរាជ័យក្នុងការប្តូរពាក្យសម្ងាត់។"),
        isError: true,
      });
      toast.error(
        res.error || t("Failed to update password.", "បរាជ័យក្នុងការប្តូរពាក្យសម្ងាត់។"),
        t("Password Error", "កំហុសពាក្យសម្ងាត់")
      );
    }
    setIsChangingPass(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <div>
        <Link
          href="/admin/profile"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back to Profile", "ត្រឡប់ទៅប្រវត្តិរូប")}
        </Link>
      </div>

      {/* Change Password Card */}
      <Card className="bg-white border border-slate-200 shadow-sm p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-[#2791F5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
              {t("SECURITY & PASSWORD", "សុវត្ថិភាព & ពាក្យសម្ងាត់")}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {hasPassword
              ? t("Change Password", "ប្តូរពាក្យសម្ងាត់")
              : t("Set Account Password", "បង្កើតពាក្យសម្ងាត់គណនី")}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasPassword
              ? t("Update your account password to enhance security", "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់ដើម្បីរក្សាសុវត្ថិភាពគណនីរបស់អ្នក")
              : t("Create a password to also log in using your email & password", "បង្កើតពាក្យសម្ងាត់ដើម្បីអាចចូលដោយប្រើអ៊ីមែល និងពាក្យសម្ងាត់បាន")}
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-2xl">
          {!hasPassword && (
            <div className="bg-blue-50 border border-blue-200 text-[#2791F5] p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {t(
                  "You signed in using a Google Account. You can create a password below to use both Google and email/password login for this project.",
                  "អ្នកបានចូលដោយប្រើគណនី Google ។ អ្នកអាចបង្កើតពាក្យសម្ងាត់ខាងក្រោមដើម្បីប្រើទាំង Google និងអ៊ីមែល/ពាក្យសម្ងាត់សម្រាប់គម្រោងនេះ។"
                )}
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
                {t("CURRENT PASSWORD", "ពាក្យសម្ងាត់បច្ចុប្បន្ន")}
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
                {hasPassword ? t("NEW PASSWORD *", "ពាក្យសម្ងាត់ថ្មី *") : t("PASSWORD *", "ពាក្យសម្ងាត់ *")}
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
                {hasPassword ? t("CONFIRM NEW PASSWORD *", "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី *") : t("CONFIRM PASSWORD *", "បញ្ជាក់ពាក្យសម្ងាត់ *")}
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
                ? t("Saving Password...", "កំពុងរក្សាទុកពាក្យសម្ងាត់...")
                : hasPassword
                ? t("Update Password", "ប្តូរពាក្យសម្ងាត់")
                : t("Create Account Password", "បង្កើតពាក្យសម្ងាត់គណនី")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
