"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProfile } from "@/actions/profile";
import { uploadImage } from "@/lib/upload";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User, Upload, ShieldCheck, Mail, Trash2, Lock, CheckCircle2, Edit3 } from "lucide-react";

import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [navItems, setNavItems] = useState<{ id: string; label: string; url: string }[]>([]);

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

    // Fetch Navbar Categories & NavItems
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    fetch("/api/navitems")
      .then((res) => res.json())
      .then((data) => setNavItems(data.navItems || []))
      .catch(() => {});

    // Fetch user profile details
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
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar categories={categories} navItems={navItems} />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading user profile...
        </div>
        <Footer />
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

    if (selectedFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImage(selectedFile);
        setImageUrl(finalImageUrl);
      } catch (err) {
        toast.error("Failed to process profile picture.", "Upload Error");
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
      setMessage({ text: "Profile details and picture saved successfully!", isError: false });
      toast.success("Profile details and picture saved successfully!", "Profile Saved");
      await updateSession();
      router.refresh();
    } else {
      setMessage({ text: res.error || "Failed to update profile.", isError: true });
      toast.error(res.error || "Failed to update profile.", "Update Error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Dynamic Header & Navigation Bar */}
      <Navbar categories={categories} navItems={navItems} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#2791F5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
              Account Governance
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your avatar picture, full name, bio, and account details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Side: Avatar Card */}
          <Card className="bg-white border-slate-200 shadow-sm p-6 text-center space-y-4 h-fit">
            <div className="relative inline-block mx-auto">
              <Avatar
                src={previewUrl || imageUrl}
                fallback={name || "U"}
                className={`w-28 h-28 mx-auto border-4 border-slate-100 shadow-md ${
                  isUploading ? "opacity-50 animate-pulse" : ""
                }`}
              />
              <label className="absolute bottom-0 right-0 p-2 bg-[#2791F5] hover:bg-blue-600 text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-110">
                <Upload className={`w-4 h-4 ${isUploading ? "animate-spin" : ""}`} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={isUploading} />
              </label>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">{name || "Anonymous User"}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{session?.user?.email}</p>
              {isUploading && (
                <p className="text-[11px] text-[#2791F5] font-medium mt-1 animate-pulse">
                  Uploading image...
                </p>
              )}
              {!isUploading && selectedFile && (
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  Preview ready (click Save below)
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <Badge variant="brand" className="gap-1 bg-blue-50 text-[#2791F5] border-blue-200 font-bold px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Role: {userRole}
              </Badge>
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
                  <Trash2 className="w-3.5 h-3.5" /> Remove Profile Picture
                </Button>
              </div>
            )}

            {bio && (
              <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-3">
                &quot;{bio}&quot;
              </p>
            )}
          </Card>

          {/* Right Side: Edit Form */}
          <Card className="md:col-span-2 bg-white border-slate-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {message && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                  message.isError ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Input
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-slate-50 font-mono text-slate-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Password Box directly below Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link href="/profile/change-password" className="relative flex items-center block group">
                  <Input
                    type="password"
                    value="••••••••••••"
                    readOnly
                    className="bg-slate-50 font-mono text-slate-400 py-2.5 px-4 pr-10 cursor-pointer group-hover:bg-slate-100/80 transition-colors"
                  />
                  <div
                    className="absolute right-3 top-2.5 text-slate-400 group-hover:text-[#2791F5] p-1 rounded-md transition-colors"
                    title="Change Password"
                  >
                    <Edit3 className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bio / About Me
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Share a brief introduction about yourself..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button variant="primary" type="submit" disabled={isSubmitting || isUploading} className="font-bold">
                  {isSubmitting ? "Saving Changes..." : "Save Profile Details"}
                </Button>
              </div>

            </form>
          </Card>

        </div>

      </main>

      {/* Website Footer */}
      <Footer />

    </div>
  );
}
