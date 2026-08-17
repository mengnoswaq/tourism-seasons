"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProfile } from "@/actions/profile";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User, Upload, ShieldCheck, Mail, Trash2, CheckCircle2, UserCircle, Lock, Edit3 } from "lucide-react";
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
                <Input
                  type="password"
                  value="••••••••••••"
                  readOnly
                  disabled
                  className="bg-slate-50 font-mono text-slate-500 py-2.5 px-4 pr-10 cursor-not-allowed select-none"
                />
                <Link
                  href="/admin/profile/change-password"
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#2791F5] p-1 rounded-md transition-colors cursor-pointer"
                  title={t("Change Password", "ប្តូរពាក្យសម្ងាត់")}
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
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
      </div>
    </div>
  );
}
