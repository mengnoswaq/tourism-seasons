"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateProfile, changePassword } from "@/actions/profile";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User, Upload, ShieldCheck, Mail, Trash2, CheckCircle2, UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/context/language-context";

export default function AdminProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Password Change States
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
    if (session?.user) {
      setName(session.user.name || "");
      setImageUrl(session.user.image || "");
      setPreviewUrl(session.user.image || "");
    }

    // Fetch latest user profile details
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setBio(data.user.bio || "");
          setImageUrl(data.user.image || "");
          setPreviewUrl(data.user.image || "");
          setHasPassword(data.user.hasPassword ?? true);
        }
      })
      .catch(() => {});
  }, [session]);

  if (status === "loading") {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        {t("Loading profile data...", "កំពុងទាញយកទិន្នន័យប្រវត្តិរូប...")}
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const userRole = (session?.user as any)?.role || "USER";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setImageUrl("");
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    let finalImageUrl = imageUrl;

    // Upload file to cloud/storage if user selected a new image file
    if (selectedFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImage(selectedFile);
        setImageUrl(finalImageUrl);
      } catch (err) {
        toast.error(
          t("Failed to process profile picture.", "បរាជ័យក្នុងការដំណើរការរូបថតប្រវត្តិរូប។"),
          t("Upload Error", "កំហុសនៃការផ្ទុកឡើង")
        );
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("bio", bio);
    formData.set("image", previewUrl ? finalImageUrl : "");
    formData.set("removeImage", previewUrl ? "false" : "true");

    const res = await updateProfile(formData);

    if (res.success) {
      setSelectedFile(null);
      setMessage({
        text: t("Profile details and image saved successfully!", "បានរក្សាទុកព័ត៌មានប្រវត្តិរូប និងរូបថតដោយជោគជ័យ!"),
        isError: false,
      });
      toast.success(
        t("Profile details and image saved successfully!", "បានរក្សាទុកព័ត៌មានប្រវត្តិរូប និងរូបថតដោយជោគជ័យ!"),
        t("Profile Saved", "បានរក្សាទុក")
      );
      await updateSession();
      router.refresh();
    } else {
      setMessage({
        text: res.error || t("Failed to update profile.", "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប។"),
        isError: true,
      });
      toast.error(
        res.error || t("Failed to update profile.", "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប។"),
        t("Update Error", "កំហុស")
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCircle className="w-4 h-4 text-[#2791F5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
              {t("Admin Account Management", "ការគ្រប់គ្រងគណនីអ្នកគ្រប់គ្រង")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t("Edit Admin Profile", "កែប្រែប្រវត្តិរូបអ្នកគ្រប់គ្រង")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("Update your full name, avatar, bio, and account credentials", "ធ្វើបច្ចុប្បន្នភាពឈ្មោះ រូបថត ប្រវត្តិរូប និងព័ត៌មានគណនីរបស់អ្នក")}
          </p>
        </div>

        <Badge
          variant="brand"
          className="w-fit gap-1.5 bg-blue-50 text-[#2791F5] border-blue-200 font-bold px-3 py-1.5 text-xs rounded-xl"
        >
          <ShieldCheck className="w-4 h-4 text-[#2791F5]" />
          {userRole}
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Avatar Card */}
        <Card className="bg-white border border-slate-200 shadow-sm p-6 text-center space-y-4 h-fit rounded-2xl">
          <div className="relative inline-block mx-auto">
            <Avatar
              src={previewUrl || imageUrl}
              fallback={name || "A"}
              className={`w-32 h-32 mx-auto border-4 border-slate-100 shadow-md ring-2 ring-[#2791F5]/20 ${
                isUploading ? "opacity-50 animate-pulse" : ""
              }`}
            />
            <label className="absolute bottom-1 right-1 p-2.5 bg-[#2791F5] hover:bg-blue-600 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
              <Upload className={`w-4 h-4 ${isUploading ? "animate-spin" : ""}`} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={isUploading} />
            </label>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{name || "Admin User"}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{session?.user?.email}</p>
            {isUploading && (
              <p className="text-[11px] text-[#2791F5] font-medium mt-1 animate-pulse">
                {t("Uploading image...", "កំពុងផ្ទុកឡើងរូបថត...")}
              </p>
            )}
            {!isUploading && selectedFile && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {t("Preview ready (click Save below)", "បានមើលជាមុន (ចុច រក្សាទុក ខាងក្រោម)")}
              </p>
            )}
          </div>

          {(previewUrl || imageUrl) && (
            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleRemoveImage}
                className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t("Remove Profile Picture", "លុបរូបថតប្រវត្តិរូប")}
              </Button>
            </div>
          )}

          {bio && (
            <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-3">
              &quot;{bio}&quot;
            </p>
          )}
        </Card>

        {/* Right Side Form */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-sm p-6 sm:p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                  message.isError
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Full Name", "ឈ្មោះពេញ")} *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Enter your full name", "បញ្ចូលឈ្មោះពេញរបស់អ្នក")}
                required
                className="py-2.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Email Address (Read-only)", "អាសយដ្ឋានអ៊ីមែល (អានតែប៉ុណ្ណោះ)")}
              </label>
              <div className="relative">
                <Input
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-slate-50 font-mono text-slate-500 py-2.5 pr-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Password Box directly below Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Password", "ពាក្យសម្ងាត់")}
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("change-password-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="absolute left-3.5 text-xs text-[#2791F5] hover:underline font-bold z-10 flex items-center gap-1 cursor-pointer"
                >
                  {t("Change", "ប្តូរ")}
                </button>
                <Input
                  type="password"
                  value="••••••••••••"
                  readOnly
                  onClick={() => {
                    document.getElementById("change-password-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-slate-50 font-mono text-slate-400 py-2.5 pl-20 pr-10 cursor-pointer hover:bg-slate-100/80 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>



            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Bio / About Me", "ជីវប្រវត្តិសង្ខេប / អំពីខ្ញុំ")}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder={t("Share a brief introduction about yourself...", "ចែករំលែកសេចក្តីណែនាំសង្ខេបអំពីខ្លួនអ្នក...")}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || isUploading}
                className="font-bold py-2.5 px-6 gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? t("Saving Changes...", "កំពុងរក្សាទុក...") : t("Save Profile Details", "រក្សាទុកព័ត៌មានប្រវត្តិរូប")}
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card id="change-password-section" className="lg:col-span-3 bg-white border border-slate-200 shadow-sm p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                {t("Security & Privacy", "សុវត្ថិភាព & ឯកជនភាព")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {hasPassword
                ? t("Change Password", "ប្តូរពាក្យសម្ងាត់")
                : t("Set Account Password", "បង្កើតពាក្យសម្ងាត់គណនី")}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasPassword
                ? t("Update your password to keep your admin account secure", "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់ដើម្បីរក្សាសុវត្ថិភាពគណនីរបស់អ្នក")
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
                  {t("Current Password", "ពាក្យសម្ងាត់បច្ចុប្បន្ន")}
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
                  {hasPassword ? t("New Password", "ពាក្យសម្ងាត់ថ្មី") : t("Password", "ពាក្យសម្ងាត់")} *
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
                  {hasPassword ? t("Confirm New Password", "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី") : t("Confirm Password", "បញ្ជាក់ពាក្យសម្ងាត់")} *
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
    </div>
  );
}
